import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { MOVIE_GENRES } from "@/lib/feed/tags";
import { useParental } from "@/lib/parental";
import { searchAll, searchAnime, searchLiveTvChannels, type SearchResults } from "@/lib/search";
import { searchAddonCatalogs, mergeMetas } from "@/lib/search-addons";
import { fetchInstalledAddons } from "@/lib/addon-store";
import type { Addon } from "@/lib/addons";
import { useSettings } from "@/lib/settings";

type SearchState = {
  open: boolean;
  query: string;
  results: SearchResults | null;
  status: "idle" | "typing" | "loading" | "done";
  recent: string[];
};

type SearchValue = SearchState & {
  setOpen: (open: boolean) => void;
  setQuery: (q: string) => void;
  clear: () => void;
  recordRecent: (q: string) => void;
  removeRecent: (q: string) => void;
};

const Ctx = createContext<SearchValue | null>(null);
const RECENT_KEY = "harbor.search.recent";
const MAX_RECENT = 8;

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string").slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function saveRecent(items: string[]): void {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
  } catch {
    /* noop */
  }
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const { hiddenTabs } = useParental();
  const [open, setOpen] = useState(false);
  const [query, setQueryState] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [status, setStatus] = useState<SearchState["status"]>("idle");
  const [recent, setRecent] = useState<string[]>(() => loadRecent());
  const debounceRef = useRef<number | null>(null);
  const reqIdRef = useRef(0);
  const addonsRef = useRef<Addon[] | null>(null);
  const ensureAddons = useCallback(async (): Promise<Addon[]> => {
    if (addonsRef.current) return addonsRef.current;
    const a = await fetchInstalledAddons().catch(() => [] as Addon[]);
    addonsRef.current = a;
    return a;
  }, []);

  const excludeGenres = useMemo(() => {
    const ids: number[] = [];
    if (hiddenTabs.anime) ids.push(MOVIE_GENRES.Animation);
    return ids;
  }, [hiddenTabs.anime]);

  useEffect(() => {
    const trimmed = query.trim();
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!trimmed) {
      setResults(null);
      setStatus("idle");
      return;
    }
    setStatus("typing");
    const animeAllowed = !hiddenTabs.anime;
    const liveTvAllowed = !hiddenTabs.liveTv && settings.iptvPlaylists.length > 0;
    debounceRef.current = window.setTimeout(() => {
      const id = ++reqIdRef.current;
      setStatus("loading");
      const liveTv = liveTvAllowed ? searchLiveTvChannels(trimmed, settings.iptvPlaylists) : [];
      const tmdbPromise = searchAll(settings.tmdbKey, trimmed, { excludeGenres });
      const animePromise = animeAllowed ? searchAnime(trimmed) : Promise.resolve([]);
      const addonPromise = ensureAddons()
        .then((a) => searchAddonCatalogs(a, trimmed))
        .catch(() => ({ movies: [], series: [] }));
      Promise.all([tmdbPromise, animePromise, addonPromise])
        .then(([r, anime, addon]) => {
          if (id !== reqIdRef.current) return;
          setResults({
            ...r,
            movies: mergeMetas(r.movies, addon.movies),
            series: mergeMetas(r.series, addon.series),
            liveTv,
            anime,
          });
          setStatus("done");
        })
        .catch(() => {
          if (id !== reqIdRef.current) return;
          setStatus("done");
        });
    }, 180);
  }, [query, settings.tmdbKey, settings.iptvPlaylists, excludeGenres, hiddenTabs.anime, hiddenTabs.liveTv]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = (e.key ?? "").toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const setQuery = useCallback((q: string) => setQueryState(q), []);

  const clear = useCallback(() => {
    setQueryState("");
    setResults(null);
    setStatus("idle");
  }, []);

  const recordRecent = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((p) => p.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT);
      saveRecent(next);
      return next;
    });
  }, []);

  const removeRecent = useCallback((q: string) => {
    setRecent((prev) => {
      const next = prev.filter((p) => p !== q);
      saveRecent(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ open, setOpen, query, setQuery, results, status, recent, clear, recordRecent, removeRecent }),
    [open, query, results, status, recent, setQuery, clear, recordRecent, removeRecent],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSearch(): SearchValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSearch outside SearchProvider");
  return v;
}

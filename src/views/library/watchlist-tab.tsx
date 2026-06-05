import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useSettings } from "@/lib/settings";
import { type Meta } from "@/lib/cinemeta";
import { library, type LibraryItem } from "@/lib/stremio";
import { fetchWatchlist } from "@/lib/trakt/watchlist";
import { useTrakt } from "@/lib/trakt/provider";
import { traktItemToMeta } from "@/lib/trakt/to-meta";
import type { TraktItem } from "@/lib/trakt/types";
import { readLocalEntries, setWatchlistAggregate, subscribeWatchlist, type LocalEntry } from "@/lib/watchlist";
import {
  applyFilter,
  countByType,
  EmptyWatchlist,
  FilterBar,
  GroupedGrid,
  groupByDate,
  parseTs,
  type TypeKey,
  type WatchlistMerged,
} from "./shared";

export function WatchlistTab() {
  const { authKey } = useAuth();
  const { settings } = useSettings();
  const { isConnected: traktConnected } = useTrakt();
  const [stremio, setStremio] = useState<LibraryItem[]>([]);
  const [trakt, setTrakt] = useState<TraktItem[]>([]);
  const [localEntries, setLocalEntries] = useState<LocalEntry[]>(() => readLocalEntries());
  const [traktStatus, setTraktStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    const tick = () => setLocalEntries(readLocalEntries());
    window.addEventListener("storage", tick);
    const unsub = subscribeWatchlist(tick);
    return () => {
      window.removeEventListener("storage", tick);
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!authKey) return;
    let cancelled = false;
    library(authKey)
      .then((items) => {
        if (cancelled) return;
        const filtered = items.filter((i) => {
          if (settings.libraryBookmarkedOnly) return !i.removed && !i.temp;
          if (i.removed && !i.temp) return false;
          if (i.state?.flaggedWatched === 1) return false;
          if ((i.state?.timeOffset ?? 0) > 0) return false;
          return true;
        });
        setStremio(filtered);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [authKey, settings.libraryBookmarkedOnly]);

  useEffect(() => {
    if (!traktConnected) {
      setTrakt([]);
      setTraktStatus("idle");
      return;
    }
    let cancelled = false;
    setTraktStatus("loading");
    fetchWatchlist()
      .then((items) => {
        if (!cancelled) {
          setTrakt(items);
          setTraktStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setTraktStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [traktConnected]);

  const merged = useMemo(
    () => mergeWatchlist(localEntries, stremio, trakt),
    [localEntries, stremio, trakt],
  );

  useEffect(() => {
    const ids = new Set<string>();
    for (const it of stremio) ids.add(it._id);
    for (const t of trakt) {
      if (t.ids.imdb) ids.add(t.ids.imdb);
      if (t.ids.tmdb) {
        ids.add(t.type === "movie" ? `tmdb:movie:${t.ids.tmdb}` : `tmdb:tv:${t.ids.tmdb}`);
      }
    }
    for (const e of localEntries) ids.add(e.id);
    setWatchlistAggregate(ids);
  }, [stremio, trakt, localEntries]);

  const [type, setType] = useState<TypeKey>("all");
  const [query, setQuery] = useState("");
  const counts = useMemo(() => countByType(merged), [merged]);
  const visible = useMemo(() => applyFilter(merged, type, query), [merged, type, query]);

  const subtitle = (() => {
    const parts: string[] = [];
    if (traktConnected) parts.push(traktStatus === "loading" ? "Syncing Trakt…" : `${trakt.length} on Trakt`);
    else parts.push("Connect Trakt in Settings to sync");
    parts.push(`${localEntries.length} saved here`);
    if (authKey && stremio.length > 0) parts.push(`${stremio.length} on Stremio`);
    return parts.join(" · ");
  })();

  return (
    <section className="flex flex-col gap-4">
      {merged.length > 0 && (
        <FilterBar type={type} setType={setType} query={query} setQuery={setQuery} counts={counts} />
      )}
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-ink-muted">{subtitle}</span>
      </div>
      {merged.length === 0 ? (
        <EmptyWatchlist connected={traktConnected} />
      ) : visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-edge-soft bg-canvas/30 px-6 py-10 text-center text-[13px] text-ink-muted">
          No matches for these filters.
        </p>
      ) : (
        <GroupedGrid groups={groupByDate(visible)} />
      )}
    </section>
  );
}

function mergeWatchlist(
  localEntries: LocalEntry[],
  stremio: LibraryItem[],
  trakt: TraktItem[],
): WatchlistMerged[] {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
  const byKey = new Map<string, WatchlistMerged>();
  const setOrUpgrade = (key: string, entry: WatchlistMerged) => {
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, entry);
      return;
    }
    const existingTt = existing.meta.id.startsWith("tt");
    const incomingTt = entry.meta.id.startsWith("tt");
    if (incomingTt && !existingTt) {
      byKey.set(key, entry);
    }
  };
  for (const item of stremio) {
    const meta: Meta = {
      id: item._id,
      type: item.type,
      name: item.name,
      poster: item.poster,
      background: item.background,
    };
    const dedupKey = `${item.type}:${norm(item.name ?? "")}`;
    setOrUpgrade(dedupKey, { key: item._id, meta, date: parseTs(item._mtime) });
  }
  for (const t of trakt) {
    const m = traktItemToMeta(t);
    if (!m) continue;
    const dedupKey = `${m.type}:${norm(m.name ?? "")}`;
    if (byKey.has(dedupKey)) continue;
    byKey.set(dedupKey, { key: m.id, meta: m, date: parseTs(t.contextDate) });
  }
  for (const e of localEntries) {
    let dupById = false;
    for (const v of byKey.values()) {
      if (v.meta.id === e.id) { dupById = true; break; }
    }
    if (dupById) continue;
    const nameKey = e.name ? `${e.type}:${norm(e.name)}` : null;
    if (nameKey && byKey.has(nameKey)) continue;
    byKey.set(nameKey ?? `local:${e.id}`, {
      key: e.id,
      meta: { id: e.id, type: e.type, name: e.name || e.id, poster: e.poster },
      date: e.addedAt || null,
    });
  }
  return Array.from(byKey.values());
}

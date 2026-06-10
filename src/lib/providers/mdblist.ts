import { useEffect, useState } from "react";
import { safeFetch } from "@/lib/safe-fetch";

export type MdblistScores = {
  letterboxd: number | null;
  trakt: number | null;
  metacritic: number | null;
};

type RatingRow = { source?: string; value?: number | null };

const cache = new Map<string, MdblistScores | null>();
const inflight = new Map<string, Promise<MdblistScores | null>>();

async function fetchScores(key: string, imdbId: string): Promise<MdblistScores | null> {
  try {
    const res = await safeFetch(
      `https://api.mdblist.com/?apikey=${encodeURIComponent(key)}&i=${encodeURIComponent(imdbId)}`,
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { ratings?: RatingRow[] };
    const rows = json.ratings ?? [];
    const val = (source: string) => {
      const r = rows.find((x) => x.source === source);
      return typeof r?.value === "number" && r.value > 0 ? r.value : null;
    };
    return {
      letterboxd: val("letterboxd"),
      trakt: val("trakt"),
      metacritic: val("metacritic"),
    };
  } catch {
    return null;
  }
}

export function mdblistScores(key: string, imdbId: string): Promise<MdblistScores | null> {
  if (!key || !imdbId.startsWith("tt")) return Promise.resolve(null);
  if (cache.has(imdbId)) return Promise.resolve(cache.get(imdbId) ?? null);
  const pending = inflight.get(imdbId);
  if (pending) return pending;
  const p = fetchScores(key, imdbId).then((r) => {
    inflight.delete(imdbId);
    cache.set(imdbId, r);
    return r;
  });
  inflight.set(imdbId, p);
  return p;
}

export function useMdblistScores(key: string, imdbId: string | null | undefined): MdblistScores | null {
  const [scores, setScores] = useState<MdblistScores | null>(null);
  useEffect(() => {
    setScores(null);
    if (!key || !imdbId) return;
    let cancelled = false;
    void mdblistScores(key, imdbId).then((r) => {
      if (!cancelled) setScores(r);
    });
    return () => {
      cancelled = true;
    };
  }, [key, imdbId]);
  return scores;
}

import type { Meta } from "../../cinemeta";
import { get, IMG } from "./tmdb-client";

export type TmdbCollection = {
  id: number;
  name: string;
  overview: string;
  poster?: string;
  backdrop?: string;
  parts: Meta[];
};

const cache = new Map<number, Promise<TmdbCollection | null>>();

export function tmdbCollection(key: string, id: number): Promise<TmdbCollection | null> {
  if (!key || !Number.isFinite(id)) return Promise.resolve(null);
  const existing = cache.get(id);
  if (existing) return existing;
  const promise = run(key, id);
  cache.set(id, promise);
  return promise;
}

async function run(key: string, id: number): Promise<TmdbCollection | null> {
  const raw = await get<any>(key, `collection/${id}`);
  if (!raw) return null;
  const parts: Meta[] = (raw.parts ?? [])
    .map(
      (p: any): Meta => ({
        id: `tmdb:movie:${p.id}`,
        type: "movie",
        name: p.title ?? p.name ?? "",
        poster: p.poster_path ? `${IMG}/w342${p.poster_path}` : undefined,
        background: p.backdrop_path ? `${IMG}/w780${p.backdrop_path}` : undefined,
        description: p.overview,
        releaseInfo: (p.release_date ?? "").slice(0, 4) || undefined,
        releaseDate: p.release_date || undefined,
        imdbRating: p.vote_average > 0 ? Number(p.vote_average).toFixed(1) : undefined,
      }),
    )
    .sort((a: Meta, b: Meta) => (a.releaseDate ?? "zzz").localeCompare(b.releaseDate ?? "zzz"));
  return {
    id: raw.id,
    name: raw.name ?? "",
    overview: raw.overview ?? "",
    poster: raw.poster_path ? `${IMG}/w342${raw.poster_path}` : undefined,
    backdrop: raw.backdrop_path ? `${IMG}/original${raw.backdrop_path}` : undefined,
    parts,
  };
}

const searchCache = new Map<string, Promise<number | null>>();

function normName(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b(?:collection|trilogy|saga|series|anthology|the|007)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function collectionNameMatches(a: string, b: string): boolean {
  const na = normName(a);
  const nb = normName(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

export function tmdbSearchCollectionId(key: string, query: string): Promise<number | null> {
  if (!key || !query) return Promise.resolve(null);
  const ck = query.toLowerCase();
  const existing = searchCache.get(ck);
  if (existing) return existing;
  const promise = runSearch(key, query);
  searchCache.set(ck, promise);
  return promise;
}

async function runSearch(key: string, query: string): Promise<number | null> {
  const raw = await get<{ results?: Array<{ id: number; name?: string }> }>(
    key,
    "search/collection",
    { query },
  );
  const results = raw?.results ?? [];
  if (results.length === 0) return null;
  const want = normName(query);
  const exact = results.find((r) => normName(r.name ?? "") === want);
  if (exact) return exact.id;
  const contains = results.find((r) => collectionNameMatches(r.name ?? "", query));
  return (contains ?? results[0])?.id ?? null;
}

const KEY = "harbor.manualwatched.v1";

const subs = new Set<() => void>();
let version = 0;
let cache: Set<string> | null = null;

function load(): Set<string> {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function get(): Set<string> {
  if (!cache) cache = load();
  return cache;
}

function persist(set: Set<string>): void {
  cache = set;
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    return;
  }
  version += 1;
  for (const fn of subs) fn();
}

function key(metaId: string, season: number, episode: number): string {
  return `${metaId}|${season}|${episode}`;
}

export function isManuallyWatched(metaId: string, season: number, episode: number): boolean {
  return get().has(key(metaId, season, episode));
}

export function setManualWatched(
  metaId: string,
  season: number,
  episode: number,
  on: boolean,
): void {
  const set = new Set(get());
  const k = key(metaId, season, episode);
  if (on) set.add(k);
  else set.delete(k);
  persist(set);
}

export function setManualWatchedUpTo(
  metaId: string,
  season: number,
  episode: number,
  on: boolean,
): void {
  const set = new Set(get());
  for (let e = 1; e <= episode; e++) {
    const k = key(metaId, season, e);
    if (on) set.add(k);
    else set.delete(k);
  }
  persist(set);
}

export function subscribeManualWatched(fn: () => void): () => void {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

export function manualWatchedVersion(): number {
  return version;
}

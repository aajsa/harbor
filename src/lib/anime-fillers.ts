const CACHE_KEY = "harbor.animefillercache";
const TTL_MS = 14 * 24 * 60 * 60 * 1000;

const SOURCE =
  "https://raw.githubusercontent.com/jordancodez/anime-filler-list/main/data";

type FillerEntry = { fillers: number[]; t: number };
type FillerCache = Record<string, FillerEntry>;

function readCache(): FillerCache {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as FillerCache) : {};
  } catch {
    return {};
  }
}

function writeCache(cache: FillerCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function parseRanges(input: unknown): number[] {
  const out = new Set<number>();
  const push = (n: unknown) => {
    const v = Number(n);
    if (Number.isFinite(v) && v > 0) out.add(v);
  };
  if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === "number") push(item);
      else if (typeof item === "string") {
        const range = item.split("-");
        if (range.length === 2) {
          const a = Number(range[0]);
          const b = Number(range[1]);
          if (Number.isFinite(a) && Number.isFinite(b)) {
            for (let n = a; n <= b; n++) push(n);
          }
        } else push(item);
      }
    }
  }
  return [...out];
}

const inflight = new Map<number, Promise<number[]>>();

export async function fillerEpisodes(malId: number | null): Promise<Set<number>> {
  if (!malId || !Number.isFinite(malId)) return new Set();
  const cache = readCache();
  const hit = cache[malId];
  if (hit && Date.now() - hit.t < TTL_MS) return new Set(hit.fillers);
  const existing = inflight.get(malId);
  if (existing) return new Set(await existing);
  const p = (async (): Promise<number[]> => {
    try {
      const r = await fetch(`${SOURCE}/${malId}.json`);
      if (!r.ok) return hit?.fillers ?? [];
      const json = (await r.json()) as { filler?: unknown; fillers?: unknown };
      const fillers = parseRanges(json?.filler ?? json?.fillers);
      const next = readCache();
      next[malId] = { fillers, t: Date.now() };
      writeCache(next);
      return fillers;
    } catch {
      return hit?.fillers ?? [];
    } finally {
      inflight.delete(malId);
    }
  })();
  inflight.set(malId, p);
  return new Set(await p);
}

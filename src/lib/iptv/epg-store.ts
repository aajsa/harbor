import { fetchAndParseXmltv, indexProgramsByChannel } from "./xmltv";
import type { EpgIndex } from "./types";

const TTL_MS = 60 * 60 * 1000;

const cache = new Map<string, EpgIndex>();
const inflight = new Map<string, Promise<EpgIndex>>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeEpg(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getCachedEpg(playlistId: string): EpgIndex | null {
  return cache.get(playlistId) ?? null;
}

export function clearEpg(playlistId?: string) {
  if (playlistId) cache.delete(playlistId);
  else cache.clear();
  notify();
}

export async function loadEpg(params: {
  playlistId: string;
  urls: string[];
  force?: boolean;
}): Promise<EpgIndex> {
  const { playlistId, urls, force } = params;
  const existing = cache.get(playlistId);
  if (!force && existing && Date.now() - existing.fetchedAt < TTL_MS) {
    return existing;
  }
  const pending = inflight.get(playlistId);
  if (pending && !force) return pending;
  const onProgress = (programs: EpgProgramArr) => {
    if (programs.length === 0) return;
    cache.set(playlistId, {
      byChannel: indexProgramsByChannel(programs),
      fetchedAt: Date.now(),
    });
    notify();
  };
  const promise = doFetchWithFallback(urls, onProgress).then((idx) => {
    cache.set(playlistId, idx);
    notify();
    return idx;
  });
  inflight.set(playlistId, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(playlistId);
  }
}

type EpgProgramArr = Parameters<typeof indexProgramsByChannel>[0];

async function doFetchWithFallback(
  urls: string[],
  onProgress?: (programs: EpgProgramArr) => void,
): Promise<EpgIndex> {
  if (urls.length === 0) throw new Error("No EPG URL available for this playlist");
  let lastErr: unknown = null;
  for (const url of urls) {
    try {
      const programs = await fetchAndParseXmltv(url, onProgress);
      if (programs.length === 0) {
        lastErr = new Error("EPG endpoint returned no programs");
        console.warn(`[epg] empty result from ${url}`);
        continue;
      }
      return {
        byChannel: indexProgramsByChannel(programs),
        fetchedAt: Date.now(),
      };
    } catch (e) {
      lastErr = e;
      console.warn(`[epg] fetch failed for ${url}:`, e);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

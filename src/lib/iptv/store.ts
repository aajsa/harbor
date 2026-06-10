import { filterChannelsForDisplay } from "./divider-filter";
import { parseM3u } from "./m3u";
import type { IptvChannel, IptvPlaylist, IptvPlaylistSource } from "./types";
import { fetchXtreamLiveChannels, parseXtreamUrl, type XtreamCreds } from "./xtream";
import { fetchXtreamVodAndSeries } from "./xtream-vod";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const PARSE_LIMIT_BYTES = 80 * 1024 * 1024;
const CONNECT_TIMEOUT_S = 30;

const cache = new Map<string, IptvPlaylist>();
const inflight = new Map<string, Promise<IptvPlaylist>>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribePlaylists(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getCachedPlaylist(id: string): IptvPlaylist | null {
  return cache.get(id) ?? null;
}

export function clearPlaylistCache(id?: string) {
  if (id) {
    cache.delete(id);
    vodHydrated.delete(id);
  } else {
    cache.clear();
    vodHydrated.clear();
  }
  notify();
}

export async function loadPlaylist(
  src: IptvPlaylistSource,
  opts?: { force?: boolean },
): Promise<IptvPlaylist> {
  const existing = cache.get(src.id);
  if (!opts?.force && existing && Date.now() - existing.fetchedAt < CACHE_TTL_MS) {
    return existing;
  }
  const pending = inflight.get(src.id);
  if (pending && !opts?.force) return pending;
  const promise = fetchAndParse(src);
  inflight.set(src.id, promise);
  try {
    const result = await promise;
    cache.set(src.id, result);
    notify();
    return result;
  } finally {
    inflight.delete(src.id);
  }
}

const vodHydrated = new Set<string>();

async function fetchAndParse(src: IptvPlaylistSource): Promise<IptvPlaylist> {
  const creds = parseXtreamUrl(src.url);
  if (creds) {
    try {
      const live = await fetchXtreamLiveChannels(creds, src.id);
      if (live.length > 0) {
        void hydrateXtreamVod(src, creds, live);
        return shapePlaylist(src, live);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const xtreamFailedSilently = msg.includes("inactive");
      if (xtreamFailedSilently) throw new Error(msg);
    }
  }
  return fetchViaM3u(src);
}

async function hydrateXtreamVod(
  src: IptvPlaylistSource,
  creds: XtreamCreds,
  live: IptvChannel[],
): Promise<void> {
  if (vodHydrated.has(src.id)) return;
  vodHydrated.add(src.id);
  try {
    const vod = await fetchXtreamVodAndSeries(creds, src.id);
    if (vod.length === 0) return;
    cache.set(src.id, shapePlaylist(src, [...live, ...vod]));
    notify();
  } catch {
    vodHydrated.delete(src.id);
  }
}

async function fetchViaM3u(src: IptvPlaylistSource): Promise<IptvPlaylist> {
  let res: Response;
  try {
    res = await iptvFetch(src.url);
  } catch (e) {
    throw new Error(networkErrorMessage(e));
  }
  if (!res.ok) {
    throw new Error(httpErrorMessage(res.status, res.statusText));
  }
  let text: string;
  try {
    text = await res.text();
  } catch (e) {
    throw new Error(`Failed reading playlist body: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (!text) {
    throw new Error("Playlist server returned an empty body");
  }
  if (text.length > PARSE_LIMIT_BYTES) {
    throw new Error(`Playlist is too large (${(text.length / 1024 / 1024).toFixed(1)} MB). 80 MB limit.`);
  }
  return parseAndShape(src, text);
}

async function iptvFetch(url: string): Promise<Response> {
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    const { fetch: tauriFetch } = await import("@tauri-apps/plugin-http");
    try {
      return await tauriFetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "VLC/3.0.20 LibVLC/3.0.20",
          Accept: "audio/x-mpegurl, application/x-mpegURL, application/octet-stream, */*",
        },
        connectTimeout: CONNECT_TIMEOUT_S * 1000,
        maxRedirections: 5,
      } as unknown as RequestInit);
    } catch (e) {
      if (!/scope|not allowed/i.test(String(e))) throw e;
      const { safeFetch } = await import("@/lib/safe-fetch");
      return safeFetch(url);
    }
  }
  return fetch(url, { cache: "no-store" });
}

function httpErrorMessage(status: number, statusText: string): string {
  if (status === 401) {
    return "HTTP 401: bad username or password. Check the URL credentials with your provider.";
  }
  if (status === 403) {
    return "HTTP 403: your IP or device is blocked from this playlist. Some providers geo-restrict or device-limit accounts.";
  }
  if (status === 404) {
    return "HTTP 404: playlist URL not found on this server. Check the URL for typos.";
  }
  if (status === 429) {
    return "HTTP 429: provider is rate-limiting your account. Wait a minute and try again.";
  }
  if (status === 503) {
    return "HTTP 503: provider is refusing service right now. Most common cause: account is at its max-connections limit (other devices/players still logged in). Close other sessions, or contact your provider if the credentials are valid.";
  }
  return `HTTP ${status} ${statusText}`;
}

function networkErrorMessage(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  const lower = raw.toLowerCase();
  if (lower.includes("cancel") || lower.includes("abort")) {
    return `Server did not respond (gave up after ${CONNECT_TIMEOUT_S}s). The provider may be rate-limiting your IP or down.`;
  }
  if (lower.includes("dns") || lower.includes("resolve")) {
    return `Could not resolve playlist hostname. Check the URL for typos.`;
  }
  if (lower.includes("connection refused") || lower.includes("refused")) {
    return `Playlist server refused the connection.`;
  }
  if (lower.includes("reset")) {
    return `Playlist server reset the connection. Some providers reject generic clients; try with their official app to confirm credentials work.`;
  }
  return `Network error: ${raw}`;
}

function parseAndShape(src: IptvPlaylistSource, text: string): IptvPlaylist {
  if (!text || !text.includes("#EXTM3U")) {
    const preview = text.slice(0, 120).replace(/\s+/g, " ");
    throw new Error(`Server response was not an M3U playlist. Got: ${preview || "(empty)"}`);
  }
  const channels = parseM3u(text, src.id);
  if (channels.length === 0) {
    throw new Error("Playlist parsed but contained no channels.");
  }
  return shapePlaylist(src, channels);
}

function shapePlaylist(src: IptvPlaylistSource, channels: IptvChannel[]): IptvPlaylist {
  const cleaned = filterChannelsForDisplay(channels);
  return {
    id: src.id,
    name: src.name,
    url: src.url,
    epgUrl: src.epgUrl ?? null,
    channels: cleaned,
    fetchedAt: Date.now(),
    groups: uniqueGroups(cleaned),
  };
}

function uniqueGroups(channels: { group: string | null }[]): string[] {
  const set = new Set<string>();
  for (const c of channels) {
    if (c.group) set.add(c.group);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

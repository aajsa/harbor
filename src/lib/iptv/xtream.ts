import type { IptvChannel } from "./types";

export type XtreamCreds = {
  base: string;
  username: string;
  password: string;
};

export type XtreamContainer = "ts" | "m3u8";

export class XtreamAuthError extends Error {}
export class XtreamEmptyError extends Error {}

const XTREAM_UA = "IPTVSmartersPro/3.1.5";

export function parseXtreamUrl(url: string): XtreamCreds | null {
  try {
    const u = new URL(url);
    const username = u.searchParams.get("username");
    const password = u.searchParams.get("password");
    if (!username || !password) return null;
    if (!/get\.php$|player_api\.php$/i.test(u.pathname)) return null;
    const base = `${u.protocol}//${u.host}`;
    return { base, username, password };
  } catch {
    return null;
  }
}

export function credsFromServer(server: string, username: string, password: string): XtreamCreds | null {
  const trimmed = server.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(trimmed)) return null;
  if (!username.trim() || !password.trim()) return null;
  try {
    const u = new URL(trimmed);
    return { base: `${u.protocol}//${u.host}`, username: username.trim(), password: password.trim() };
  } catch {
    return null;
  }
}

type CategoryRow = { category_id: string; category_name: string };
type LiveStreamRow = {
  stream_id: number;
  name: string;
  stream_icon?: string;
  epg_channel_id?: string;
  category_id?: string;
  num?: number;
  tv_archive?: number;
  tv_archive_duration?: number | string;
};

type UserInfo = {
  user_info?: { auth?: number; status?: string; message?: string };
  server_info?: unknown;
};

type ShortEpgRow = {
  title?: string;
  description?: string;
  start_timestamp?: number | string;
  stop_timestamp?: number | string;
};

export async function xtreamFetch(url: string): Promise<unknown> {
  const text = await xtreamFetchText(url);
  return parseJsonStrict(text);
}

async function xtreamFetchText(url: string): Promise<string> {
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    const { fetch: tauriFetch } = await import("@tauri-apps/plugin-http");
    let res: Response;
    try {
      res = await tauriFetch(url, {
        method: "GET",
        headers: {
          "User-Agent": XTREAM_UA,
          Accept: "application/json, */*",
        },
        connectTimeout: 30_000,
        maxRedirections: 5,
      } as unknown as RequestInit);
    } catch (e) {
      if (!/scope|not allowed/i.test(String(e))) throw e;
      const { safeFetch } = await import("@/lib/safe-fetch");
      res = await safeFetch(url, {
        headers: { "User-Agent": XTREAM_UA, Accept: "application/json, */*" },
      });
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return res.text();
  }
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.text();
}

function parseJsonStrict(text: string): unknown {
  const head = text.slice(0, 64).trimStart().toLowerCase();
  if (head.startsWith("<!doctype") || head.startsWith("<html") || head.startsWith("<?xml")) {
    throw new XtreamAuthError(
      "Provider returned a webpage instead of data. The account may be expired, or this is not an Xtream server.",
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new XtreamAuthError(
      "Provider returned a non-JSON response. The account may be expired, or this is not an Xtream server.",
    );
  }
}

export function apiUrl(creds: XtreamCreds, action: string, extra: Record<string, string> = {}): string {
  const params = new URLSearchParams({
    username: creds.username,
    password: creds.password,
    action,
    ...extra,
  });
  return `${creds.base}/player_api.php?${params.toString()}`;
}

function userInfoUrl(creds: XtreamCreds): string {
  const params = new URLSearchParams({ username: creds.username, password: creds.password });
  return `${creds.base}/player_api.php?${params.toString()}`;
}

export async function fetchXtreamUserInfo(creds: XtreamCreds): Promise<void> {
  const raw = (await xtreamFetch(userInfoUrl(creds))) as UserInfo;
  const info = raw?.user_info;
  if (!info || typeof info !== "object") {
    throw new XtreamAuthError("Xtream login did not return account info. Check the server URL.");
  }
  if (info.auth === 0) {
    throw new XtreamAuthError(
      "Xtream rejected these credentials (auth failed). Check the server URL, username, and password.",
    );
  }
  const status = (info.status ?? "").toString().toLowerCase();
  if (status === "expired") throw new XtreamAuthError("This Xtream account is expired.");
  if (status === "banned") throw new XtreamAuthError("This Xtream account is banned by the provider.");
  if (status === "disabled") throw new XtreamAuthError("This Xtream account is disabled by the provider.");
}

export async function fetchXtreamLiveChannels(
  creds: XtreamCreds,
  baseId: string,
  container: XtreamContainer = "ts",
): Promise<IptvChannel[]> {
  const [categoriesRaw, streamsRaw] = await Promise.all([
    xtreamFetch(apiUrl(creds, "get_live_categories")),
    xtreamFetch(apiUrl(creds, "get_live_streams")),
  ]);
  const categoryName = new Map<string, string>();
  if (Array.isArray(categoriesRaw)) {
    for (const c of categoriesRaw as CategoryRow[]) {
      if (c && c.category_id) categoryName.set(String(c.category_id), c.category_name ?? "");
    }
  }
  const streams: LiveStreamRow[] = Array.isArray(streamsRaw) ? (streamsRaw as LiveStreamRow[]) : [];
  const out: IptvChannel[] = [];
  for (let i = 0; i < streams.length; i += 1) {
    const s = streams[i];
    if (!s || s.stream_id == null) continue;
    const tvgId = s.epg_channel_id?.trim() || null;
    const group = s.category_id ? categoryName.get(String(s.category_id)) ?? null : null;
    const url = buildLiveStreamUrl(creds, s.stream_id, container);
    const attrs: Record<string, string> = {};
    if (Number(s.tv_archive) > 0) {
      attrs.catchup = "xtream";
      const days = Number(s.tv_archive_duration);
      if (Number.isFinite(days) && days > 0) attrs["catchup-days"] = String(days);
    }
    out.push({
      id: `${baseId}::xt::${s.stream_id}`,
      tvgId,
      name: s.name?.trim() || `Stream ${s.stream_id}`,
      logo: s.stream_icon?.trim() || null,
      group,
      url,
      catchupSource: null,
      durationSec: null,
      attrs,
    });
  }
  return out;
}

export function buildLiveStreamUrl(
  creds: XtreamCreds,
  streamId: number,
  container: XtreamContainer = "ts",
): string {
  return `${creds.base}/live/${encodeURIComponent(creds.username)}/${encodeURIComponent(creds.password)}/${streamId}.${container}`;
}

export async function fetchXtreamShortEpg(
  creds: XtreamCreds,
  streamId: string,
): Promise<Array<{ title: string; description: string | null; startMs: number; endMs: number }>> {
  let raw: unknown;
  try {
    raw = await xtreamFetch(apiUrl(creds, "get_short_epg", { stream_id: streamId, limit: "8" }));
  } catch {
    return [];
  }
  const listings = (raw as { epg_listings?: ShortEpgRow[] })?.epg_listings;
  if (!Array.isArray(listings)) return [];
  const out: Array<{ title: string; description: string | null; startMs: number; endMs: number }> = [];
  for (const row of listings) {
    const startMs = Number(row.start_timestamp) * 1000;
    const endMs = Number(row.stop_timestamp) * 1000;
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) continue;
    out.push({
      title: decodeBase64(row.title) || "Untitled",
      description: decodeBase64(row.description) || null,
      startMs,
      endMs,
    });
  }
  return out;
}

function decodeBase64(s: string | undefined): string {
  if (!s) return "";
  try {
    const bin = atob(s);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes).trim();
  } catch {
    return s.trim();
  }
}

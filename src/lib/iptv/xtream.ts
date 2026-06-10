import type { IptvChannel } from "./types";

export type XtreamCreds = {
  base: string;
  username: string;
  password: string;
};

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

type CategoryRow = { category_id: string; category_name: string };
type LiveStreamRow = {
  stream_id: number;
  name: string;
  stream_icon?: string;
  epg_channel_id?: string;
  category_id?: string;
  num?: number;
};

export async function xtreamFetch(url: string): Promise<unknown> {
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    const { fetch: tauriFetch } = await import("@tauri-apps/plugin-http");
    let res: Response;
    try {
      res = await tauriFetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "IPTVSmartersPro/3.1.5",
          Accept: "application/json, */*",
        },
        connectTimeout: 30_000,
        maxRedirections: 5,
      } as unknown as RequestInit);
    } catch (e) {
      if (!/scope|not allowed/i.test(String(e))) throw e;
      const { safeFetch } = await import("@/lib/safe-fetch");
      res = await safeFetch(url, { headers: { Accept: "application/json, */*" } });
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return res.json();
  }
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
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

export async function fetchXtreamLiveChannels(
  creds: XtreamCreds,
  baseId: string,
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
    const url = buildLiveStreamUrl(creds, s.stream_id);
    out.push({
      id: `${baseId}::xt::${s.stream_id}`,
      tvgId,
      name: s.name?.trim() || `Stream ${s.stream_id}`,
      logo: s.stream_icon?.trim() || null,
      group,
      url,
      catchupSource: null,
      durationSec: null,
      attrs: {},
    });
  }
  return out;
}

function buildLiveStreamUrl(creds: XtreamCreds, streamId: number): string {
  return `${creds.base}/live/${encodeURIComponent(creds.username)}/${encodeURIComponent(creds.password)}/${streamId}.m3u8`;
}

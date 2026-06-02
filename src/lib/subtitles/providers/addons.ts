import { addonAccepts, type Addon } from "@/lib/addons";
import { safeFetch } from "@/lib/safe-fetch";
import type { SubResult, SubSearchQuery } from "../types";
import { normalizeLang } from "../language";

type RawAddonSub = {
  id?: string;
  url: string;
  lang: string;
  m?: string;
  SubFormat?: string;
};

function transportBase(transportUrl: string): string {
  return transportUrl.replace(/\/manifest\.json$/i, "").replace(/\/$/, "");
}

function contentId(q: SubSearchQuery): string | null {
  const base =
    q.stremioId?.trim() ||
    (q.imdbId ? (q.imdbId.startsWith("tt") ? q.imdbId : `tt${q.imdbId}`) : "");
  if (!base) return null;
  const isEpisode = q.season != null && q.episode != null;
  if (isEpisode && !/:\d+:\d+$/.test(base)) {
    return `${base}:${q.season}:${q.episode}`;
  }
  return base;
}

function extraSegment(q: SubSearchQuery): string {
  const parts: string[] = [];
  if (q.videoHash) parts.push(`videoHash=${encodeURIComponent(q.videoHash)}`);
  if (q.videoSize != null) parts.push(`videoSize=${q.videoSize}`);
  if (q.filename) parts.push(`filename=${encodeURIComponent(q.filename)}`);
  return parts.length > 0 ? `/${parts.join("&")}` : "";
}

async function callOne(addon: Addon, type: string, id: string, extra: string): Promise<RawAddonSub[]> {
  const base = transportBase(addon.transportUrl);
  const url = `${base}/subtitles/${type}/${id}${extra}.json`;
  try {
    const res = await safeFetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const data = (await res.json()) as { subtitles?: RawAddonSub[] };
    return Array.isArray(data?.subtitles) ? data.subtitles : [];
  } catch {
    return [];
  }
}

export async function searchAddons(
  addons: Addon[],
  q: SubSearchQuery,
): Promise<SubResult[]> {
  const id = contentId(q);
  if (!id) return [];
  const type = q.type ?? (q.season != null && q.episode != null ? "series" : "movie");
  const subAddons = addons.filter((a) => addonAccepts(a, "subtitles", type, id));
  if (subAddons.length === 0) return [];
  const extra = extraSegment(q);
  const settled = await Promise.all(
    subAddons.map((addon) => callOne(addon, type, id, extra)),
  );
  const out: SubResult[] = [];
  settled.forEach((subs, i) => {
    const addonName = subAddons[i].manifest.name;
    for (const s of subs) {
      if (!s.url) continue;
      out.push({
        id: String(s.id ?? `${addonName}:${s.url}`),
        url: s.url,
        lang: normalizeLang(s.lang),
        title: addonName,
        source: "addon",
        format: (s.SubFormat?.toLowerCase() as SubResult["format"]) || undefined,
      });
    }
  });
  return out;
}

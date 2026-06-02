import type { Addon } from "./addons";
import type { Meta } from "./cinemeta";
import { safeFetch } from "./safe-fetch";

const CAP_PER_CATALOG = 20;
const MAX_CATALOGS = 12;

function addonOrigin(addon: Addon) {
  return { id: addon.manifest.id, name: addon.manifest.name, logo: addon.manifest.logo };
}

export async function searchAddonCatalogs(
  addons: Addon[],
  query: string,
): Promise<{ movies: Meta[]; series: Meta[] }> {
  const q = query.trim();
  if (!q) return { movies: [], series: [] };

  const targets: Array<{ addon: Addon; type: string; id: string }> = [];
  for (const addon of addons) {
    for (const c of addon.manifest.catalogs ?? []) {
      if (!c?.type || !c?.id) continue;
      if (c.type !== "movie" && c.type !== "series") continue;
      if (!c.extra?.some((e) => e.name === "search")) continue;
      targets.push({ addon, type: c.type, id: c.id });
      if (targets.length >= MAX_CATALOGS) break;
    }
    if (targets.length >= MAX_CATALOGS) break;
  }
  if (targets.length === 0) return { movies: [], series: [] };

  const settled = await Promise.allSettled(
    targets.map(async ({ addon, type, id }) => {
      const base = addon.transportUrl.replace(/\/manifest\.json$/, "");
      const url = `${base}/catalog/${type}/${id}/search=${encodeURIComponent(q)}.json`;
      const res = await safeFetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) return { type, metas: [] as Meta[], origin: addonOrigin(addon) };
      const json = (await res.json()) as { metas?: Meta[] };
      return { type, metas: (json.metas ?? []).slice(0, CAP_PER_CATALOG), origin: addonOrigin(addon) };
    }),
  );

  const movies: Meta[] = [];
  const series: Meta[] = [];
  const seen = new Set<string>();
  for (const r of settled) {
    if (r.status !== "fulfilled") continue;
    for (const m of r.value.metas) {
      if (!m?.id || seen.has(m.id)) continue;
      seen.add(m.id);
      const tagged = { ...m, addonOrigin: r.value.origin };
      if (r.value.type === "series" || m.type === "series") series.push(tagged);
      else movies.push(tagged);
    }
  }
  return { movies, series };
}

export function mergeMetas(primary: Meta[], extra: Meta[], cap = 20): Meta[] {
  const seen = new Set(primary.map((m) => m.id));
  const out = [...primary];
  for (const m of extra) {
    if (!m.id || seen.has(m.id)) continue;
    seen.add(m.id);
    out.push(m);
  }
  return out.slice(0, cap);
}

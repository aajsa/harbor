import type { DebridSlug, RankedPicker, ScoredStream, Tier } from "../types";

export function rankAndPick(
  scored: ScoredStream[],
  activeDebrids: DebridSlug[],
  preferAac = false,
): RankedPicker {
  const isCached = (s: ScoredStream) =>
    s.url != null || activeDebrids.some((slug) => s.cached[slug] === true);

  const all = scored.slice().sort((a, b) => b.score - a.score);
  const cachedFirst = all.slice().sort((a, b) => {
    const ac = isCached(a) ? 1 : 0;
    const bc = isCached(b) ? 1 : 0;
    return bc - ac;
  });

  const byTier: Partial<Record<Tier, ScoredStream>> = {};
  for (const s of cachedFirst) {
    if (!byTier[s.tier]) byTier[s.tier] = s;
  }

  let primary = all.find((s) => isCached(s)) ?? null;
  if (preferAac && primary) {
    const aac = all.find((s) => isCached(s) && s.audio?.codec === "AAC");
    if (aac) primary = aac;
  }

  return { primary, byTier, all };
}

import type { Meta } from "@/lib/cinemeta";
import type { FeedItem } from "@/lib/feed";
import { getStore } from "@/lib/discover/store";

function decadeOf(year?: string): string | undefined {
  if (!year) return undefined;
  const y = parseInt(year.slice(0, 4), 10);
  if (!Number.isFinite(y)) return undefined;
  return `${Math.floor(y / 10) * 10}s`;
}

function maxAbs(map: Record<string, number>): number {
  let max = 0;
  for (const v of Object.values(map)) {
    const a = Math.abs(v);
    if (a > max) max = a;
  }
  return max;
}

function scoreItem(item: FeedItem, affinity: ReturnType<typeof getStore>["affinity"]): number {
  if (affinity.totalEvents === 0) return 0;
  let score = 0;
  const genreMax = maxAbs(affinity.genres) || 1;
  for (const g of item.meta.genres ?? []) {
    const w = affinity.genres[g] ?? 0;
    if (w !== 0) score += (w / genreMax) * 4;
  }
  const decade = decadeOf(item.meta.releaseInfo);
  if (decade) {
    const decadeMax = maxAbs(affinity.decades) || 1;
    const w = affinity.decades[decade] ?? 0;
    if (w !== 0) score += (w / decadeMax) * 1.5;
  }
  return score;
}

export function rankByAffinity(items: FeedItem[]): FeedItem[] {
  const { affinity } = getStore();
  if (affinity.totalEvents < 1) return items;
  const scored = items.map((item, idx) => ({
    item,
    score: scoreItem(item, affinity),
    idx,
  }));
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.idx - b.idx;
  });
  return scored.map((s) => s.item);
}

export function rankMetasByAffinity(metas: Meta[]): Meta[] {
  const wrapped: FeedItem[] = metas.map((m) => ({ meta: m, tag: "", category: "" }));
  const ranked = rankByAffinity(wrapped);
  return ranked.map((w) => w.meta);
}

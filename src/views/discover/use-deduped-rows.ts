import { useMemo } from "react";
import type { Meta } from "@/lib/cinemeta";

export function useDedupedRows(
  rails: Record<string, Meta[]>,
  order: string[],
  featuredIds: Set<string>,
  criticsPickId?: string,
): Record<string, Meta[] | null> {
  return useMemo(() => {
    const seen = new Set<string>(featuredIds);
    if (criticsPickId) seen.add(criticsPickId);
    const out: Record<string, Meta[] | null> = {};
    for (const id of order) {
      const raw = rails[id];
      if (raw === undefined) {
        out[id] = null;
        continue;
      }
      const taken: Meta[] = [];
      for (const m of raw) {
        if (!m.poster) continue;
        if (seen.has(m.id)) continue;
        seen.add(m.id);
        taken.push(m);
      }
      out[id] = taken;
    }
    return out;
  }, [rails, order, featuredIds, criticsPickId]);
}

import { useMemo } from "react";
import type { Meta } from "@/lib/cinemeta";

export function useDedupedRows(
  rails: Record<string, Meta[]>,
  order: string[],
  featuredIds: Set<string>,
  criticsPickId?: string,
  priority: string[] = [],
): Record<string, Meta[] | null> {
  return useMemo(() => {
    const seen = new Set<string>(featuredIds);
    if (criticsPickId) seen.add(criticsPickId);
    const prio = priority.filter((id) => order.includes(id));
    const claimOrder = [...prio, ...order.filter((id) => !prio.includes(id))];
    const out: Record<string, Meta[] | null> = {};
    for (const id of claimOrder) {
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
  }, [rails, order, featuredIds, criticsPickId, priority]);
}

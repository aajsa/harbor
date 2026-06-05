import { useEffect, useState } from "react";
import type { Meta } from "@/lib/cinemeta";
import { useAnilist } from "@/lib/anilist/provider";
import { fetchMediaListCollection } from "@/lib/anilist/lists";
import { anilistEntryToMeta } from "@/lib/anilist/to-meta";
import type { MediaListStatus } from "@/lib/anilist/types";

export type AnilistRail = { key: string; title: string; metas: Meta[] };

export const RAIL_ORDER: Array<{ key: string; title: string; statuses: MediaListStatus[] }> = [
  { key: "watching", title: "Watching", statuses: ["CURRENT", "REPEATING"] },
  { key: "planning", title: "Plan to Watch", statuses: ["PLANNING"] },
  { key: "completed", title: "Completed", statuses: ["COMPLETED"] },
  { key: "paused", title: "On Hold", statuses: ["PAUSED"] },
  { key: "dropped", title: "Dropped", statuses: ["DROPPED"] },
];

const MIN_PER_RAIL = 1;

export function useAnilistAnimeRails(): AnilistRail[] {
  const { isConnected, session } = useAnilist();
  const [rails, setRails] = useState<AnilistRail[]>([]);

  useEffect(() => {
    if (!isConnected || !session) {
      setRails([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const groups = await fetchMediaListCollection(session.userId);
      if (cancelled) return;
      const entriesByStatus = new Map(groups.map((g) => [g.status, g.entries]));
      const out: AnilistRail[] = [];
      for (const rail of RAIL_ORDER) {
        const entries = rail.statuses.flatMap((s) => entriesByStatus.get(s) ?? []);
        const metas = entries.map(anilistEntryToMeta).filter((m): m is Meta => m != null);
        if (metas.length >= MIN_PER_RAIL) out.push({ key: rail.key, title: rail.title, metas });
      }
      if (!cancelled) setRails(out);
    })();
    return () => {
      cancelled = true;
    };
  }, [isConnected, session?.userId]);

  return rails;
}

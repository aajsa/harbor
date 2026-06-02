import { useEffect, useMemo, useState } from "react";
import type { Meta } from "../cinemeta";
import type { Chapter } from "../player/bridge";
import type { PlayEpisode } from "../view";
import { fetchAniSkipSegments, kitsuToMal } from "./aniskip";
import { chaptersToSegments } from "./chapters";
import { fetchIntroDbSegments } from "./theintrodb";
import type { SkipSegment } from "./types";

export type { SkipSegment, SkipKind, SkipSource } from "./types";

function parseKitsuId(id: string): number | null {
  if (!id.startsWith("kitsu:")) return null;
  const n = parseInt(id.slice("kitsu:".length).split(":")[0], 10);
  return Number.isFinite(n) ? n : null;
}

export function useSkipSegments(
  meta: Meta,
  episode: PlayEpisode | undefined,
  chapters: Chapter[],
  durationSec: number,
): SkipSegment[] {
  const [aniSkip, setAniSkip] = useState<SkipSegment[]>([]);
  const [introDb, setIntroDb] = useState<SkipSegment[]>([]);
  const kitsuId = parseKitsuId(meta.id);
  const epNum = episode?.episode;
  const epSeason = episode?.season;
  const introDbId = episode?.imdbId && episode.imdbId.startsWith("tt") ? episode.imdbId : meta.id;

  useEffect(() => {
    setAniSkip([]);
    if (kitsuId == null || epNum == null || durationSec <= 0) return;
    let cancelled = false;
    (async () => {
      const malId = await kitsuToMal(kitsuId);
      if (cancelled || malId == null) return;
      const segs = await fetchAniSkipSegments(malId, epNum, durationSec);
      if (cancelled) return;
      setAniSkip(segs);
    })();
    return () => {
      cancelled = true;
    };
  }, [kitsuId, epNum, durationSec]);

  useEffect(() => {
    setIntroDb([]);
    if (durationSec <= 0) return;
    if (!introDbId.startsWith("tmdb:") && !introDbId.startsWith("tt")) return;
    let cancelled = false;
    const ep = epSeason != null && epNum != null ? { season: epSeason, episode: epNum } : undefined;
    fetchIntroDbSegments(introDbId, ep, durationSec).then((segs) => {
      if (!cancelled) setIntroDb(segs);
    });
    return () => {
      cancelled = true;
    };
  }, [introDbId, epSeason, epNum, durationSec]);

  const fromChapters = useMemo(
    () => chaptersToSegments(chapters, durationSec),
    [chapters, durationSec],
  );

  return useMemo(() => {
    if (aniSkip.length > 0) return aniSkip;
    if (introDb.length > 0) return introDb;
    return fromChapters;
  }, [aniSkip, introDb, fromChapters]);
}

export function activeSegment(
  segments: SkipSegment[],
  positionSec: number,
): SkipSegment | null {
  for (const s of segments) {
    if (positionSec >= s.startSec && positionSec < s.endSec - 0.75) return s;
  }
  return null;
}

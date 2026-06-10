import { useEffect, useRef } from "react";
import { libraryGetOne, libraryPut, type LibraryItem } from "@/lib/stremio";
import type { PlayerSnapshot } from "@/lib/player/bridge";
import { getPlaybackPosition } from "@/lib/player/playback-clock";
import type { PlayerSrc } from "@/lib/view";

const TICK_MS = 5000;
const BASE_REFRESH_MS = 30000;
const MIN_POSITION_SEC = 6;

export function useStremioSync(params: {
  src: PlayerSrc;
  snap: PlayerSnapshot;
  authKey: string | null;
  resolvedImdbId: string | null;
  resolvedImdbVerified: boolean;
}) {
  const { src, snap, authKey, resolvedImdbId, resolvedImdbVerified } = params;
  const canonicalId = cloudWriteId(src.meta.id, resolvedImdbId, resolvedImdbVerified);
  const sessionStartRef = useRef<number>(Date.now());
  const lastSyncedRef = useRef(0);
  const baseItemRef = useRef<LibraryItem | null>(null);
  const fetchedRef = useRef<string | null>(null);
  const latestRef = useRef({ src, snap, authKey, canonicalId });
  latestRef.current = { src, snap, authKey, canonicalId };

  useEffect(() => {
    sessionStartRef.current = Date.now();
  }, [canonicalId]);

  useEffect(() => {
    if (!authKey) return;
    if (!canonicalId) return;
    if (fetchedRef.current === canonicalId) return;
    fetchedRef.current = canonicalId;
    let cancelled = false;
    void libraryGetOne(authKey, canonicalId).then((item) => {
      if (cancelled) return;
      baseItemRef.current = item;
    });
    return () => {
      cancelled = true;
    };
  }, [authKey, canonicalId]);

  useEffect(() => {
    if (!authKey || !canonicalId) return;
    const id = window.setInterval(() => {
      void libraryGetOne(authKey, canonicalId).then((item) => {
        if (item) baseItemRef.current = item;
      });
    }, BASE_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [authKey, canonicalId]);

  const writeWithFreshBase = async () => {
    const { src: s, snap: sn, authKey: ak, canonicalId: cid } = latestRef.current;
    if (!ak || !cid) return;
    const pos = getPlaybackPosition();
    if (pos < MIN_POSITION_SEC || sn.durationSec <= 0) return;
    const fresh = await libraryGetOne(ak, cid).catch(() => null);
    if (fresh) baseItemRef.current = fresh;
    const base = fresh ?? baseItemRef.current;
    const remoteMs = (base?.state?.timeOffset ?? 0) as number;
    const remoteMtime = Date.parse((base as { _mtime?: string } | null)?._mtime ?? "");
    const ourMs = Math.floor(pos * 1000);
    if (
      Number.isFinite(remoteMtime) &&
      remoteMtime > sessionStartRef.current &&
      remoteMs > ourMs + 60_000
    ) {
      return;
    }
    lastSyncedRef.current = ourMs;
    void writeLibraryItem(ak, s, sn, base, cid, pos);
  };

  const flush = () => {
    void writeWithFreshBase();
  };

  useEffect(() => {
    if (!authKey) return;
    if (snap.status !== "playing") return;
    const id = window.setInterval(() => {
      const { snap: sn } = latestRef.current;
      const pos = getPlaybackPosition();
      if (pos < MIN_POSITION_SEC || sn.durationSec <= 0) return;
      const ms = pos * 1000;
      if (Math.abs(ms - lastSyncedRef.current) < 4000) return;
      void writeWithFreshBase();
    }, TICK_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authKey, snap.status]);

  useEffect(() => {
    if (snap.status === "paused") flush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap.status]);

  useEffect(() => {
    return () => {
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function cloudWriteId(
  metaId: string,
  resolved: string | null,
  verified: boolean,
): string | null {
  if (metaId.startsWith("tt")) return metaId;
  if (verified && resolved && resolved.startsWith("tt")) return resolved;
  return null;
}

type StremioBehaviorHints = {
  defaultVideoId: string | null;
  featuredVideoId: string | null;
  hasScheduledVideos: boolean;
  [extra: string]: unknown;
};

type StremioLibraryItemState = {
  lastWatched: string | null;
  timeWatched: number;
  timeOffset: number;
  overallTimeWatched: number;
  timesWatched: number;
  flaggedWatched: number;
  duration: number;
  video_id: string | null;
  watched: string | null;
  lastVidReleased: string | null;
  noNotif: boolean;
};

type StremioLibraryItem = {
  _id: string;
  name: string;
  type: string;
  poster: string | null;
  posterShape: "square" | "landscape" | "poster";
  removed: boolean;
  temp: boolean;
  _ctime: string | null;
  _mtime: string;
  state: StremioLibraryItemState;
  behaviorHints: StremioBehaviorHints;
};

function pickPosterShape(value: unknown): "square" | "landscape" | "poster" {
  if (value === "square" || value === "landscape" || value === "poster") return value;
  return "poster";
}

async function writeLibraryItem(
  authKey: string,
  src: PlayerSrc,
  snap: PlayerSnapshot,
  base: LibraryItem | null,
  canonicalId: string,
  positionSec: number,
): Promise<void> {
  if (!canonicalId.startsWith("tt")) return;
  const baseName = typeof base?.name === "string" ? base.name.trim() : "";
  const ourName = (src.meta.name ?? src.title ?? "").trim();
  const name = baseName || ourName;
  if (!base && !name) return;

  const now = new Date().toISOString();
  const baseRecord = base as unknown as Record<string, unknown> | null;
  const baseState = (baseRecord?.state ?? {}) as Record<string, unknown>;
  const offsetMs = Math.max(0, Math.floor(positionSec * 1000));
  const durationMs = Math.max(0, Math.floor(snap.durationSec * 1000));
  const watchedRatio = positionSec / Math.max(1, snap.durationSec);
  const isSeries = src.meta.type === "series" || !!src.episode;
  const videoId = isSeries && src.episode
    ? `${canonicalId}:${src.episode.season}:${src.episode.episode}`
    : canonicalId;
  const prevTimesWatched = typeof baseState.timesWatched === "number" ? baseState.timesWatched : 0;
  const prevOverall = typeof baseState.overallTimeWatched === "number" ? baseState.overallTimeWatched : 0;
  const prevWatched =
    typeof baseState.watched === "string" && baseState.watched.length > 0 ? baseState.watched : null;
  const prevLastVidReleased =
    typeof baseState.lastVidReleased === "string" ? baseState.lastVidReleased : null;
  const prevFlagged = typeof baseState.flaggedWatched === "number" ? baseState.flaggedWatched : 0;
  const nowFlagged = watchedRatio > 0.7;

  const state: StremioLibraryItemState = {
    lastWatched: now,
    timeWatched: offsetMs,
    timeOffset: offsetMs,
    overallTimeWatched: Math.max(prevOverall, offsetMs),
    timesWatched: nowFlagged && prevFlagged === 0 ? prevTimesWatched + 1 : prevTimesWatched,
    flaggedWatched: nowFlagged ? 1 : prevFlagged,
    duration: durationMs,
    video_id: videoId,
    watched: prevWatched,
    lastVidReleased: prevLastVidReleased,
    noNotif: false,
  };

  const baseBehaviorHints =
    (baseRecord?.behaviorHints as StremioBehaviorHints | null | undefined) ?? null;
  const behaviorHints: StremioBehaviorHints = {
    defaultVideoId: baseBehaviorHints?.defaultVideoId ?? null,
    featuredVideoId: baseBehaviorHints?.featuredVideoId ?? null,
    hasScheduledVideos: baseBehaviorHints?.hasScheduledVideos ?? false,
  };

  const baseCtime = typeof baseRecord?._ctime === "string" ? (baseRecord._ctime as string) : null;
  const ctime = baseCtime ?? now;

  const basePoster = typeof base?.poster === "string" && base.poster.length > 0 ? base.poster : null;
  const baseType = base?.type === "series" || base?.type === "movie" ? base.type : null;
  const item: StremioLibraryItem = {
    _id: canonicalId,
    name,
    type: src.episode ? "series" : baseType ?? (isSeries ? "series" : "movie"),
    poster: basePoster ?? src.meta.poster ?? null,
    posterShape: pickPosterShape(baseRecord?.posterShape),
    removed: base?.removed === true,
    temp: base ? base.temp === true : true,
    _ctime: ctime,
    _mtime: now,
    state,
    behaviorHints,
  };

  try {
    await libraryPut(authKey, item as unknown as LibraryItem);
  } catch (e) {
    console.warn("[stremio-sync] put failed", e);
  }
}

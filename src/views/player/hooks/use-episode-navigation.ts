import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayInvite } from "@/lib/together/protocol";
import { buildPlayInvite } from "@/lib/together/build-invite";
import type { PlayerSrc, PlayEpisode } from "@/lib/view";
import type { Meta } from "@/lib/cinemeta";
import type { Settings } from "@/lib/settings";
import type { DebridStore } from "@/lib/debrid/types";
import { fetchAdjacentEpisodes } from "@/lib/series-episodes";
import { buildEpisodePlayerSrc } from "../build-episode-player-src";

type OpenPicker = (
  meta: Meta,
  episode?: PlayEpisode,
  opts?: { autoPlay?: boolean; attempt?: number },
) => void;

export function useEpisodeNavigation(params: {
  src: PlayerSrc;
  settings: Settings;
  debrids: DebridStore[];
  authKey: string | null;
  inRoom: boolean;
  isHost: boolean;
  sendInvite: (invite: PlayInvite) => void;
  claimHost: (fresh: boolean) => void;
  replacePlayerSrc: (src: PlayerSrc) => void;
  openPicker: OpenPicker;
}) {
  const { src, settings, debrids, authKey, inRoom, isHost, sendInvite, claimHost, replacePlayerSrc, openPicker } = params;

  const [adjacent, setAdjacent] = useState<{ prev: PlayEpisode | null; next: PlayEpisode | null }>({
    prev: null,
    next: null,
  });

  useEffect(() => {
    if (src.meta.type !== "series" || !src.episode) {
      setAdjacent({ prev: null, next: null });
      return;
    }
    let cancelled = false;
    const cur = { season: src.episode.season, episode: src.episode.episode };
    fetchAdjacentEpisodes(src.meta, cur, { tmdbKey: settings.tmdbKey }).then((r) => {
      if (!cancelled) setAdjacent(r);
    });
    return () => {
      cancelled = true;
    };
  }, [src.meta.id, src.meta.type, src.episode, settings.tmdbKey]);

  const preloadedRef = useRef<Map<string, Promise<PlayerSrc | null>>>(new Map());
  const [swappingEp, setSwappingEp] = useState(false);

  useEffect(() => {
    preloadedRef.current.clear();
  }, [src.meta.id]);

  const preloadEpisode = useCallback(
    (ep: PlayEpisode | null): Promise<PlayerSrc | null> | null => {
      if (!ep || src.meta.type !== "series") return null;
      const key = `${ep.season}:${ep.episode}`;
      const existing = preloadedRef.current.get(key);
      if (existing) return existing;
      const promise = buildEpisodePlayerSrc(src.meta, ep, settings, debrids, authKey).catch(
        () => null,
      );
      preloadedRef.current.set(key, promise);
      return promise;
    },
    [src.meta, settings, debrids, authKey],
  );

  const goToEpisode = useCallback(
    async (ep: PlayEpisode | null) => {
      if (!ep) return;
      if (inRoom && !isHost) return;
      setSwappingEp(true);
      try {
        const promise = preloadEpisode(ep);
        const built = promise ? await promise : null;
        if (built) {
          if (inRoom && isHost) {
            claimHost(true);
            sendInvite(buildPlayInvite(src.meta, ep));
          }
          replacePlayerSrc(built.imdbId ? built : { ...built, imdbId: src.imdbId });
          return;
        }
        const key = `${ep.season}:${ep.episode}`;
        preloadedRef.current.delete(key);
        openPicker(src.meta, ep, { autoPlay: true });
      } finally {
        setSwappingEp(false);
      }
    },
    [openPicker, replacePlayerSrc, src.meta, inRoom, isHost, sendInvite, claimHost, preloadEpisode],
  );

  useEffect(() => {
    if (!adjacent.next && !adjacent.prev) return;
    void preloadEpisode(adjacent.next);
    void preloadEpisode(adjacent.prev);
  }, [adjacent.next, adjacent.prev, preloadEpisode]);

  return { adjacent, swappingEp, goToEpisode };
}

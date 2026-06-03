import { useEffect, useRef } from "react";
import type { PlayerSnapshot } from "@/lib/player/bridge";
import { getPlaybackPosition } from "@/lib/player/playback-clock";
import type { PlayEpisode, PlayerSrc } from "@/lib/view";

const POST_END_DELAY_MS = 800;

export function useAutoEndExit(params: {
  src: PlayerSrc;
  snap: PlayerSnapshot;
  nextEp: PlayEpisode | null;
  canChangeEpisode: boolean;
  roomGuest: boolean;
  closePlayer: () => void | Promise<void>;
}) {
  const { src, snap, nextEp, canChangeEpisode, roomGuest, closePlayer } = params;
  const firedForRef = useRef<string | null>(null);

  useEffect(() => {
    firedForRef.current = null;
  }, [src.url]);

  useEffect(() => {
    if (snap.durationSec <= 0) return;
    const pos = getPlaybackPosition();
    const naturalEnd = snap.status === "ended";
    const errorAtEnd =
      snap.errorCode != null && pos >= snap.durationSec - 2;
    const reachedEnd =
      snap.status !== "playing" && pos >= snap.durationSec - 1;
    if (!naturalEnd && !errorAtEnd && !reachedEnd) return;
    if ((canChangeEpisode || roomGuest) && nextEp) return;
    if (firedForRef.current === src.url) return;
    firedForRef.current = src.url;
    const t = window.setTimeout(() => {
      void closePlayer();
    }, POST_END_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [snap.status, snap.errorCode, snap.durationSec, nextEp, canChangeEpisode, roomGuest, src.url, closePlayer]);
}

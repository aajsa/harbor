import { useEffect, useRef } from "react";
import type { PlayerSnapshot } from "@/lib/player/bridge";
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
    const naturalEnd = snap.status === "ended";
    const errorAtEnd =
      snap.errorCode != null && snap.positionSec >= snap.durationSec - 2;
    const reachedEnd =
      snap.status !== "playing" && snap.positionSec >= snap.durationSec - 1;
    if (!naturalEnd && !errorAtEnd && !reachedEnd) return;
    if ((canChangeEpisode || roomGuest) && nextEp) return;
    if (firedForRef.current === src.url) return;
    firedForRef.current = src.url;
    const t = window.setTimeout(() => {
      void closePlayer();
    }, POST_END_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [snap.status, snap.errorCode, snap.positionSec, snap.durationSec, nextEp, canChangeEpisode, src.url, closePlayer]);
}

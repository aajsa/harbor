import { useEffect, useRef } from "react";
import type { PlayerSnapshot } from "@/lib/player/bridge";
import type { PlayEpisode, PlayerSrc } from "@/lib/view";

export function useAutoNextEpisode(params: {
  src: PlayerSrc;
  snap: PlayerSnapshot;
  nextEp: PlayEpisode | null;
  canChangeEpisode: boolean;
  cancelled: boolean;
  goToEpisode: (ep: PlayEpisode | null) => void;
}) {
  const { src, snap, nextEp, canChangeEpisode, cancelled, goToEpisode } = params;
  const firedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (cancelled) return;
    if (!nextEp) return;
    if (!canChangeEpisode) return;
    if (snap.durationSec <= 0) return;
    const naturalEnd = snap.status === "ended";
    const errorAtEnd =
      snap.errorCode != null && snap.positionSec >= snap.durationSec - 2;
    const reachedEnd =
      snap.status !== "playing" && snap.positionSec >= snap.durationSec - 1;
    if (!naturalEnd && !errorAtEnd && !reachedEnd) return;
    if (firedForRef.current === src.url) return;
    firedForRef.current = src.url;
    goToEpisode(nextEp);
  }, [snap.status, snap.errorCode, snap.durationSec, snap.positionSec, src.url, nextEp, canChangeEpisode, cancelled, goToEpisode]);
}

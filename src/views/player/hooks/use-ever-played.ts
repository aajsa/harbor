import { useEffect, useRef, useState } from "react";
import type { PlayerStatus } from "@/lib/player/bridge";

export function useEverPlayed(params: {
  url: string;
  status: PlayerStatus;
  durationSec: number;
  positionSec: number;
  swappingEp: boolean;
  swapResolvingKey: string | null;
}) {
  const { url, status, durationSec, positionSec, swappingEp, swapResolvingKey } = params;
  const [everPlayed, setEverPlayed] = useState(false);

  useEffect(() => {
    if (everPlayed) return;
    if (durationSec > 0 && positionSec > 0.3) {
      setEverPlayed(true);
      return;
    }
    if (status === "playing" || status === "paused") {
      setEverPlayed(true);
    }
  }, [everPlayed, durationSec, positionSec, status]);

  const lastUrlRef = useRef(url);
  useEffect(() => {
    if (lastUrlRef.current !== url) {
      lastUrlRef.current = url;
      setEverPlayed(false);
    }
  }, [url]);

  const loaderActive = swappingEp || swapResolvingKey != null || !everPlayed;

  return { everPlayed, loaderActive };
}

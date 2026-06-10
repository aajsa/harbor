import { useEffect, useRef, useState, type RefObject } from "react";
import type { PlayerBridge } from "@/lib/player/bridge";

export function useVideoFill(bridgeRef: RefObject<PlayerBridge | null>, srcKey: string) {
  const [fill, setFill] = useState(false);
  const [pill, setPill] = useState<string | null>(null);
  const fillRef = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    fillRef.current = false;
    setFill(false);
    bridgeRef.current?.setVideoFill(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcKey]);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const toggle = () => {
    const next = !fillRef.current;
    fillRef.current = next;
    setFill(next);
    bridgeRef.current?.setVideoFill(next);
    setPill(next ? "Crop to fill" : "Fit to screen");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPill(null), 1200);
  };

  return { fill, toggle, pill };
}

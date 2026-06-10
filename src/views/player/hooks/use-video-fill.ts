import { useEffect, useRef, useState, type RefObject } from "react";
import type { PlayerBridge } from "@/lib/player/bridge";

export function useVideoFill(bridgeRef: RefObject<PlayerBridge | null>, srcKey: string) {
  const [pill, setPill] = useState<string | null>(null);
  const level = useRef(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    level.current = 0;
    bridgeRef.current?.setPanscan(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcKey]);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const apply = (next: number) => {
    level.current = next;
    bridgeRef.current?.setPanscan(next);
    setPill(next <= 0 ? "Fit to screen" : `Panscan ${Math.round(next * 100)}%`);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPill(null), 1200);
  };

  const toggle = () => apply(level.current > 0 ? 0 : 1);
  const step = (delta: number) =>
    apply(Math.max(0, Math.min(1, Math.round((level.current + delta) * 10) / 10)));

  return { toggle, step, pill };
}

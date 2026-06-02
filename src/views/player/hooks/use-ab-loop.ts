import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { PlayerBridge } from "@/lib/player/bridge";

export type AbLoopState = {
  a: number | null;
  b: number | null;
  setA: () => void;
  setB: () => void;
  clear: () => void;
  active: boolean;
};

export function useAbLoop(params: {
  bridgeRef: RefObject<PlayerBridge | null>;
  positionSec: number;
  durationSec: number;
  enabled: boolean;
  resetKey: string;
}): AbLoopState {
  const { bridgeRef, positionSec, durationSec, enabled, resetKey } = params;
  const [a, setAState] = useState<number | null>(null);
  const [b, setBState] = useState<number | null>(null);
  const positionRef = useRef(positionSec);
  positionRef.current = positionSec;

  useEffect(() => {
    setAState(null);
    setBState(null);
    bridgeRef.current?.setAbLoop(null, null);
  }, [resetKey, bridgeRef]);

  useEffect(() => {
    bridgeRef.current?.setAbLoop(a, b);
  }, [a, b, bridgeRef]);

  useEffect(() => {
    if (a == null || b == null) return;
    if (b <= a) return;
    if (positionSec >= b - 0.05) {
      bridgeRef.current?.seek(a);
    }
  }, [a, b, positionSec, bridgeRef]);

  const setA = useCallback(() => {
    const t = Math.max(0, positionRef.current);
    setAState(t);
    setBState((cur) => (cur != null && cur <= t ? null : cur));
  }, []);

  const setB = useCallback(() => {
    const t = Math.max(0, positionRef.current);
    setBState((cur) => {
      if (a == null) return cur;
      if (t <= a) return cur;
      return t;
    });
  }, [a]);

  const clear = useCallback(() => {
    setAState(null);
    setBState(null);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.key === "i") { e.preventDefault(); setA(); return; }
      if (e.key === "o") { e.preventDefault(); setB(); return; }
      if (e.key === "L") { e.preventDefault(); clear(); return; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, setA, setB, clear]);

  void durationSec;

  return { a, b, setA, setB, clear, active: a != null && b != null && b > a };
}

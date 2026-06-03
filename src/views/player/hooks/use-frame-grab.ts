import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { PlayerBridge } from "@/lib/player/bridge";
import { getPlaybackPosition } from "@/lib/player/playback-clock";
import type { PlayerSrc } from "@/lib/view";

export type FrameGrabToast = {
  id: number;
  kind: "ok" | "error";
  text: string;
  path?: string;
};

function safeName(s: string): string {
  return s.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").slice(0, 80) || "Harbor";
}

function formatStamp(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    "_" +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

function formatPosition(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}m${String(s % 60).padStart(2, "0")}s`;
}

async function defaultDir(): Promise<string | null> {
  if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) return null;
  try {
    const pathMod = await import("@tauri-apps/api/path");
    const pictures = await pathMod.pictureDir();
    return await pathMod.join(pictures, "Harbor");
  } catch {
    return null;
  }
}

async function joinPath(dir: string, name: string): Promise<string> {
  try {
    const pathMod = await import("@tauri-apps/api/path");
    return await pathMod.join(dir, name);
  } catch {
    return `${dir}/${name}`;
  }
}

export function useFrameGrab(params: {
  bridgeRef: RefObject<PlayerBridge | null>;
  src: PlayerSrc;
  enabled: boolean;
}): { toast: FrameGrabToast | null; trigger: () => void } {
  const { bridgeRef, src, enabled } = params;
  const [toast, setToast] = useState<FrameGrabToast | null>(null);
  const busyRef = useRef(false);
  const dismissTimer = useRef<number | null>(null);

  const trigger = useCallback(async () => {
    if (busyRef.current) return;
    const bridge = bridgeRef.current;
    if (!bridge) return;
    busyRef.current = true;
    try {
      const baseTitle =
        src.episode && typeof src.episode.season === "number" && typeof src.episode.episode === "number"
          ? `${src.meta.name} S${String(src.episode.season).padStart(2, "0")}E${String(src.episode.episode).padStart(2, "0")}`
          : src.meta.name;
      const filename = `${safeName(baseTitle)} - ${formatStamp(new Date())} - ${formatPosition(
        getPlaybackPosition(),
      )}.png`;
      const dir = await defaultDir();
      const fullPath = dir ? await joinPath(dir, filename) : filename;
      const result = await bridge.screenshot(fullPath);
      if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
      if (result.ok) {
        setToast({
          id: Date.now(),
          kind: "ok",
          text: `Saved frame to ${dir ? "Pictures/Harbor" : "downloads"}`,
          path: result.path,
        });
      } else {
        setToast({
          id: Date.now(),
          kind: "error",
          text: result.error || "Frame grab failed",
        });
      }
      dismissTimer.current = window.setTimeout(() => setToast(null), 2600);
    } finally {
      busyRef.current = false;
    }
  }, [bridgeRef, src.meta.name, src.episode]);

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        void trigger();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, trigger]);

  useEffect(() => () => {
    if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
  }, []);

  return { toast, trigger };
}

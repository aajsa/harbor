import { useEffect } from "react";
import type { PlayerSnapshot } from "@/lib/player/bridge";
import { modalOverlayClose, modalOverlaySync } from "@/lib/modal-overlay";
import type { Settings } from "@/lib/settings";

export function useMpvEmbed(params: {
  engine: "html5" | "mpv";
  settings: Settings;
  pipMode: boolean;
  chromeVisible: boolean;
  streamPillVariant: "check" | "stalled" | "failed" | null;
  snap: PlayerSnapshot;
  overlayCovers: boolean;
  anyMenuOpen: boolean;
}) {
  const { engine, settings, pipMode, chromeVisible, streamPillVariant, snap, overlayCovers, anyMenuOpen } = params;

  useEffect(() => {
    if (engine !== "mpv" || !settings.playerMpvEmbed || pipMode) return;
    let cancelled = false;
    const apply = async () => {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const dpr = window.devicePixelRatio || 1;
        const fullW = Math.round(window.innerWidth * dpr);
        const fullH = Math.round(window.innerHeight * dpr);
        const px = (n: number) => Math.round(n * dpr);
        const rects: { x: number; y: number; w: number; h: number }[] = [];
        if (overlayCovers) {
          rects.push({ x: 0, y: 0, w: fullW, h: fullH });
        } else {
          if (chromeVisible || streamPillVariant) {
            rects.push({ x: 0, y: 0, w: fullW, h: px(72) });
          }
          if (chromeVisible) {
            const h = px(120);
            rects.push({ x: 0, y: fullH - h, w: fullW, h });
          } else if (snap.subText) {
            const h = px(110);
            rects.push({ x: 0, y: fullH - h, w: fullW, h });
          }
          if (anyMenuOpen) {
            const menuW = px(560);
            const menuH = px(580);
            const menuMarginBottom = px(120);
            rects.push({
              x: fullW - menuW,
              y: fullH - menuMarginBottom - menuH,
              w: menuW,
              h: menuH,
            });
          }
        }
        if (cancelled) return;
        await invoke("mpv_set_clip_rects", { rects });
      } catch {}
    };
    void apply();
    const t1 = window.setTimeout(apply, 500);
    const t2 = window.setTimeout(apply, 1500);
    const onResize = () => {
      void apply();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", onResize);
    };
  }, [
    engine,
    settings.playerMpvEmbed,
    pipMode,
    chromeVisible,
    streamPillVariant,
    snap.subText,
    snap.status,
    overlayCovers,
    anyMenuOpen,
  ]);

  useEffect(() => {
    if (engine !== "mpv" || !settings.playerMpvEmbed) return;
    let unMove: (() => void) | null = null;
    let unResize: (() => void) | null = null;
    void (async () => {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        const win = getCurrentWindow();
        unMove = await win.onMoved(() => void modalOverlaySync());
        unResize = await win.onResized(() => void modalOverlaySync());
      } catch {}
    })();
    return () => {
      unMove?.();
      unResize?.();
      void modalOverlayClose();
    };
  }, [engine, settings.playerMpvEmbed]);

}

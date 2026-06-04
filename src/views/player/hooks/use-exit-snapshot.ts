import { useCallback, useEffect, useRef, type RefObject } from "react";
import { captureFrame, captureMpvFrame, saveSnapshot } from "@/lib/snapshots";
import { trickplayGet } from "@/lib/trickplay";
import { getPlaybackPosition } from "@/lib/player/playback-clock";
import type { PlayerStatus } from "@/lib/player/bridge";
import type { PlayerSrc } from "@/lib/view";
import { canonicalImdbId } from "./use-stremio-sync";

const CACHE_MS = 12000;
const WARM_MS = 4000;
const EXIT_GRAB_MS = 700;
const GRAB_FULL_MS = 3500;
const END_RATIO = 0.92;

type Cached = { img: string; ids: string[] };

function snapshotIds(src: PlayerSrc, resolved: string | null): string[] {
  const id = src.meta.id ?? "";
  if (!id || id.startsWith("iptv:")) return [];
  return [...new Set([id, src.imdbId, resolved, canonicalImdbId(id, resolved)].filter(Boolean))] as string[];
}

function persist(cached: Cached | null): void {
  if (!cached) return;
  for (const id of cached.ids) saveSnapshot(id, cached.img);
}

function nearEnd(cur: number, dur: number, ended: boolean): boolean {
  return ended || (dur > 0 && cur >= dur * END_RATIO);
}

export function useExitSnapshot(params: {
  src: PlayerSrc;
  engine: "html5" | "mpv";
  status: PlayerStatus;
  durationSec: number;
  videoMountRef: RefObject<HTMLDivElement | null>;
  resolvedImdbId: string | null;
  seekPreviewEnabled: boolean;
}) {
  const { src, engine, status, durationSec, videoMountRef, resolvedImdbId, seekPreviewEnabled } = params;
  const latest = useRef({ src, engine, durationSec, resolvedImdbId, seekPreviewEnabled });
  latest.current = { src, engine, durationSec, resolvedImdbId, seekPreviewEnabled };
  const lastGoodRef = useRef<Cached | null>(null);
  const capturedKeyRef = useRef<string | null>(null);

  const grabFrame = useCallback(
    async (allowTrick: boolean): Promise<string | null> => {
      const { engine: eng, seekPreviewEnabled: seek } = latest.current;
      if (eng === "html5") {
        const v = videoMountRef.current?.querySelector("video") as HTMLVideoElement | null;
        return v ? captureFrame(v) : null;
      }
      const mpvImg = await captureMpvFrame();
      if (mpvImg) return mpvImg;
      if (allowTrick && seek) return trickplayGet(getPlaybackPosition());
      return null;
    },
    [videoMountRef],
  );

  const captureExitSnapshot = useCallback(async () => {
    const { src: s, durationSec: dur, resolvedImdbId: resolved } = latest.current;
    const ids = snapshotIds(s, resolved);
    if (ids.length === 0) {
      persist(lastGoodRef.current);
      return;
    }
    const cur = getPlaybackPosition();
    if (!Number.isFinite(cur) || cur <= 0) {
      persist(lastGoodRef.current);
      return;
    }
    const ep = s.episode ? `:${s.episode.season}:${s.episode.episode}` : "";
    const key = `${s.meta.id}${ep}|${cur.toFixed(0)}`;
    if (capturedKeyRef.current === key) return;
    capturedKeyRef.current = key;

    if (nearEnd(cur, dur, false)) {
      persist(lastGoodRef.current);
      return;
    }
    const budget = lastGoodRef.current ? EXIT_GRAB_MS : GRAB_FULL_MS;
    const fresh = await Promise.race([
      grabFrame(true),
      new Promise<null>((r) => setTimeout(() => r(null), budget)),
    ]);
    if (fresh) lastGoodRef.current = { img: fresh, ids };
    persist(lastGoodRef.current);
  }, [grabFrame]);

  useEffect(() => {
    if (status !== "playing") return;
    const tick = async () => {
      const { src: s, durationSec: dur, resolvedImdbId: resolved } = latest.current;
      const ids = snapshotIds(s, resolved);
      if (ids.length === 0) return;
      const cur = getPlaybackPosition();
      if (!Number.isFinite(cur) || cur <= 0 || nearEnd(cur, dur, false)) return;
      const img = await grabFrame(true);
      if (!img) return;
      const cached = { img, ids };
      lastGoodRef.current = cached;
      persist(cached);
    };
    void tick();
    const warm = window.setTimeout(() => void tick(), WARM_MS);
    const id = window.setInterval(() => void tick(), CACHE_MS);
    return () => {
      window.clearTimeout(warm);
      window.clearInterval(id);
    };
  }, [status, grabFrame]);

  useEffect(() => {
    const flush = () => persist(lastGoodRef.current);
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, []);

  return { captureExitSnapshot };
}

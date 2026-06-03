import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { PlayerBridge, PlayerSnapshot } from "@/lib/player/bridge";
import { getPlaybackPosition, usePlaybackFlag } from "@/lib/player/playback-clock";
import { pickerCacheMatches } from "@/lib/picker-cache";
import { resolveStream } from "@/lib/streams/resolve";
import type { ScoredStream } from "@/lib/streams/types";
import { registerStreamProxy } from "@/lib/stream-proxy";
import type { Meta } from "@/lib/cinemeta";
import type { PlayerSrc, PlayEpisode } from "@/lib/view";
import type { DebridStore } from "@/lib/debrid/types";

type OpenPicker = (
  meta: Meta,
  episode?: PlayEpisode,
  opts?: { autoPlay?: boolean; attempt?: number },
) => void;

export function useStreamSwitcher(params: {
  bridgeRef: RefObject<PlayerBridge | null>;
  src: PlayerSrc;
  snap: PlayerSnapshot;
  debrids: DebridStore[];
  openPicker: OpenPicker;
}) {
  const { bridgeRef, src, snap, debrids, openPicker } = params;

  const checkShownRef = useRef(false);
  const [streamCheckOpen, setStreamCheckOpen] = useState(false);
  const isLive = src.meta.id?.startsWith("iptv:") ?? false;
  const startedEnough = usePlaybackFlag(() => getPlaybackPosition() >= 1.5);
  useEffect(() => {
    checkShownRef.current = false;
    setStreamCheckOpen(false);
  }, [src.url]);
  useEffect(() => {
    if (checkShownRef.current) return;
    if (isLive) return;
    if (snap.status !== "playing" || !startedEnough) return;
    checkShownRef.current = true;
    setStreamCheckOpen(true);
  }, [snap.status, startedEnough, src.url, isLive]);
  useEffect(() => {
    if (!streamCheckOpen) return;
    const t = window.setTimeout(() => setStreamCheckOpen(false), 5500);
    return () => window.clearTimeout(t);
  }, [streamCheckOpen]);

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [swapResolvingKey, setSwapResolvingKey] = useState<string | null>(null);
  const [liveUrl, setLiveUrl] = useState(src.url);
  const [liveStreamRef, setLiveStreamRef] = useState(src.streamRef);
  useEffect(() => {
    setLiveUrl(src.url);
    setLiveStreamRef(src.streamRef);
  }, [src.url, src.streamRef]);

  const swapAcRef = useRef<AbortController | null>(null);

  const pickAnother = useCallback(() => {
    if (pickerCacheMatches(src.meta, src.episode)) {
      setSwitcherOpen(true);
      return;
    }
    openPicker(src.meta, src.episode, { autoPlay: false });
  }, [openPicker, src.meta, src.episode]);

  const onSwitchStream = useCallback(
    async (stream: ScoredStream) => {
      const key = stream.infoHash ?? stream.url ?? `${stream.addonId}:${stream.title ?? ""}`;
      setSwapResolvingKey(key);
      swapAcRef.current?.abort();
      const ac = new AbortController();
      swapAcRef.current = ac;
      const r = await resolveStream(stream, debrids, ac.signal);
      if (ac.signal.aborted) return;
      if (!r.ok) {
        console.warn(`[player] stream swap failed: ${r.code}`);
        setSwapResolvingKey(null);
        return;
      }
      let playUrl = r.data.url;
      if (r.data.headers && Object.keys(r.data.headers).length > 0) {
        try {
          const proxied = await registerStreamProxy(r.data.url, r.data.headers);
          playUrl = proxied.url;
        } catch {
          setSwapResolvingKey(null);
          return;
        }
      }
      const b = bridgeRef.current;
      if (!b) {
        setSwapResolvingKey(null);
        return;
      }
      try {
        const resumeAt = getPlaybackPosition();
        await b.load({
          url: playUrl,
          subtitles: r.data.subtitles,
          notWebReady: r.data.notWebReady,
          startAtSec: resumeAt > 5 ? resumeAt : undefined,
        });
        await b.play().catch(() => {});
      } catch (e) {
        console.warn("[player] stream swap failed", e);
      }
      setLiveUrl(playUrl);
      setLiveStreamRef({
        infoHash: stream.infoHash ?? null,
        fileIdx: stream.fileIdx ?? null,
        addonId: stream.addonId ?? null,
        title: stream.title ?? null,
        parsedTitle: stream.parsedTitle ?? null,
        resolution: stream.resolution ?? null,
        source: stream.source ?? null,
        size: stream.size ?? null,
        cachedSlugs: Object.entries(stream.cached ?? {})
          .filter(([, v]) => v === true)
          .map(([k]) => k),
      });
      setSwapResolvingKey(null);
      setSwitcherOpen(false);
      checkShownRef.current = false;
      setStreamCheckOpen(false);
    },
    [debrids],
  );

  useEffect(() => () => swapAcRef.current?.abort(), []);

  return {
    streamCheckOpen,
    setStreamCheckOpen,
    switcherOpen,
    setSwitcherOpen,
    swapResolvingKey,
    liveUrl,
    liveStreamRef,
    pickAnother,
    onSwitchStream,
  };
}

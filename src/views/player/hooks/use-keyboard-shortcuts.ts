import { useEffect, type RefObject } from "react";
import type { PlayerBridge, PlayerSnapshot } from "@/lib/player/bridge";
import { writePlayerPrefs } from "@/lib/player-prefs";
import { writePlayerVolume } from "@/lib/player-volume";
import { effectiveBinding, eventToBinding, isTypingTarget, type HotkeyId } from "@/lib/hotkeys";
import { useSettings } from "@/lib/settings";
import { round2 } from "../player-utils";

export function useKeyboardShortcuts(params: {
  bridgeRef: RefObject<PlayerBridge | null>;
  snap: PlayerSnapshot;
  drawMode: boolean;
  setDrawMode: (v: boolean) => void;
  closePlayer: () => void;
  playPauseToggle: () => void;
  seekStep: (delta: number) => void;
  toggleFullscreen: () => void;
  cycleSubtitles: () => void;
  setShowStats: (updater: (prev: boolean) => boolean) => void;
  metaId: string;
  onNextEp?: () => void;
  onPrevEp?: () => void;
  hasNextEp?: boolean;
  hasPrevEp?: boolean;
  toggleSwitcher?: () => void;
  toggleEpisodePanel?: () => void;
  toggleGuide?: () => void;
  toggleDvr?: () => void;
  toggleSleep?: () => void;
  onScreenshot?: () => void;
  onGifRecord?: () => void;
}) {
  const {
    bridgeRef,
    snap,
    drawMode,
    setDrawMode,
    closePlayer,
    playPauseToggle,
    seekStep,
    toggleFullscreen,
    cycleSubtitles,
    setShowStats,
    metaId,
    onNextEp,
    onPrevEp,
    hasNextEp,
    hasPrevEp,
    toggleSwitcher,
    toggleEpisodePanel,
    toggleGuide,
    toggleDvr,
    toggleSleep,
    onScreenshot,
    onGifRecord,
  } = params;
  const { settings } = useSettings();
  const overrides = settings.hotkeys ?? {};

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e)) return;

      const binding = eventToBinding(e);
      const match = (id: HotkeyId): boolean => effectiveBinding(id, overrides) === binding;

      if (e.key === "MediaPlayPause") {
        e.preventDefault();
        playPauseToggle();
        return;
      }
      if (e.key === "MediaTrackNext" && hasNextEp && onNextEp) {
        e.preventDefault();
        onNextEp();
        return;
      }
      if (e.key === "MediaTrackPrevious" && hasPrevEp && onPrevEp) {
        e.preventDefault();
        onPrevEp();
        return;
      }

      if (match("playerClose")) {
        if (drawMode) setDrawMode(false);
        else closePlayer();
        return;
      }
      if (match("playerPlayPause")) {
        e.preventDefault();
        playPauseToggle();
        return;
      }
      if (match("playerSeekBack10")) {
        e.preventDefault();
        seekStep(-10);
        return;
      }
      if (match("playerSeekForward10")) {
        e.preventDefault();
        seekStep(10);
        return;
      }
      if (match("playerSeekBack30")) {
        e.preventDefault();
        seekStep(-30);
        return;
      }
      if (match("playerSeekForward30")) {
        e.preventDefault();
        seekStep(30);
        return;
      }
      if (match("playerVolumeUp")) {
        e.preventDefault();
        const step = e.shiftKey ? 0.5 : 0.05;
        const next = Math.min(6, Math.max(0, snap.volume + step));
        bridgeRef.current?.setVolume(next);
        writePlayerVolume({ volume: next });
        return;
      }
      if (match("playerVolumeDown")) {
        e.preventDefault();
        const step = e.shiftKey ? 0.5 : 0.05;
        const next = Math.max(0, snap.volume - step);
        bridgeRef.current?.setVolume(next);
        writePlayerVolume({ volume: next });
        return;
      }
      if (match("playerMute")) {
        e.preventDefault();
        bridgeRef.current?.setMuted(!snap.muted);
        return;
      }
      if (match("playerFullscreen")) {
        e.preventDefault();
        toggleFullscreen();
        return;
      }
      if (match("playerSubtitleCycle") || match("playerSubtitleCycleAlt")) {
        e.preventDefault();
        cycleSubtitles();
        return;
      }
      if (match("playerNextEpisode") && hasNextEp && onNextEp) {
        e.preventDefault();
        onNextEp();
        return;
      }
      if (match("playerPrevEpisode") && hasPrevEp && onPrevEp) {
        e.preventDefault();
        onPrevEp();
        return;
      }
      if (match("playerStart")) {
        e.preventDefault();
        bridgeRef.current?.seek(0);
        return;
      }
      if (match("playerEnd")) {
        e.preventDefault();
        if (snap.durationSec > 0) bridgeRef.current?.seek(snap.durationSec - 0.5);
        return;
      }
      if (match("playerStats")) {
        e.preventDefault();
        setShowStats((v) => !v);
        return;
      }
      if (match("playerSpeedDown")) {
        e.preventDefault();
        const r = Math.max(0.25, +(snap.rate - 0.25).toFixed(2));
        bridgeRef.current?.setRate(r);
        writePlayerPrefs(metaId, { rate: r });
        return;
      }
      if (match("playerSpeedUp")) {
        e.preventDefault();
        const r = Math.min(3, +(snap.rate + 0.25).toFixed(2));
        bridgeRef.current?.setRate(r);
        writePlayerPrefs(metaId, { rate: r });
        return;
      }
      if (match("playerSubDelayDown")) {
        e.preventDefault();
        const step = e.shiftKey ? 0.05 : 0.1;
        const delay = round2(snap.subDelaySec - step);
        bridgeRef.current?.setSubDelay(delay);
        writePlayerPrefs(metaId, { subDelaySec: delay });
        return;
      }
      if (match("playerSubDelayUp")) {
        e.preventDefault();
        const step = e.shiftKey ? 0.05 : 0.1;
        const delay = round2(snap.subDelaySec + step);
        bridgeRef.current?.setSubDelay(delay);
        writePlayerPrefs(metaId, { subDelaySec: delay });
        return;
      }
      if (match("playerStreamSwitcher") && toggleSwitcher) {
        e.preventDefault();
        toggleSwitcher();
        return;
      }
      if (match("playerEpisodePanel") && toggleEpisodePanel) {
        e.preventDefault();
        toggleEpisodePanel();
        return;
      }
      if (match("playerTvGuide") && toggleGuide) {
        e.preventDefault();
        toggleGuide();
        return;
      }
      if (match("playerDvr") && toggleDvr) {
        e.preventDefault();
        toggleDvr();
        return;
      }
      if (match("playerSleep") && toggleSleep) {
        e.preventDefault();
        toggleSleep();
        return;
      }
      if (match("playerScreenshot") && onScreenshot) {
        e.preventDefault();
        onScreenshot();
        return;
      }
      if (match("playerGifRecord") && onGifRecord) {
        e.preventDefault();
        onGifRecord();
        return;
      }
      if (e.key === "0") {
        e.preventDefault();
        bridgeRef.current?.seek(0);
        return;
      }
      const digit = parseInt(e.key, 10);
      if (!Number.isNaN(digit) && digit >= 1 && digit <= 9) {
        e.preventDefault();
        if (snap.durationSec > 0) {
          bridgeRef.current?.seek((snap.durationSec * digit) / 10);
        }
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closePlayer, drawMode, snap.muted, snap.volume, snap.rate, snap.durationSec, snap.subDelaySec, overrides, toggleSwitcher, toggleEpisodePanel, toggleGuide, toggleDvr, toggleSleep, onScreenshot, onGifRecord]);
}

import {
  ChevronLeft,
  Info,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  Replace,
  SkipBack,
  SkipForward,
  Tv,
} from "lucide-react";
import type { PlayerCapabilities, PlayerSnapshot } from "@/lib/player/bridge";
import type { Meta } from "@/lib/cinemeta";
import { getCustomIcon, type CustomIconMap, type PlayerControlId, type TimeFormat, type VolumeStyle } from "@/lib/player-chrome";
import type { DownloadStatus } from "@/views/player/hooks/use-video-download";
import { SubtitleMenu } from "../subtitle-menu";
import { AudioMenu } from "../audio-menu";
import { DownloadButton } from "./download-button";
import { Tooltip } from "./tooltip";
import { DvrButton } from "./dvr-button";
import { SpeedMenu } from "./speed-menu";
import { DrawToggle } from "./draw-toggle";
import { CastButton } from "./cast-button";
import { TimeStart } from "./time-display";
import { StremioBtn } from "./stremio-btn";
import { StremioVolume } from "./stremio-volume";
import { renderCustomIconControlStremio } from "./custom-icon-renderer";

export type StremioRenderCtx = {
  snap: PlayerSnapshot;
  capabilities: PlayerCapabilities;
  drawMode: boolean;
  hideOthersDrawings: boolean;
  showDraw: boolean;
  isWatchTogether?: boolean;
  playing: boolean;
  showEpisodeNav: boolean;
  isLiveChannel: boolean;
  showRemaining: boolean;
  active: boolean;
  canPickAnother: boolean;
  hasPrevEp: boolean;
  hasNextEp: boolean;
  engine: "html5" | "mpv";
  useOverlayPopups?: boolean;
  customIcons?: CustomIconMap;
  previewStates?: Partial<Record<PlayerControlId, string>>;
  timeFormat?: TimeFormat;
  volumeStyle?: VolumeStyle;
  fullscreen?: boolean;
  title?: string;
  subtitle?: string;
  titleClickable?: boolean;
  onBack?: () => void;
  onFullscreen?: () => void;
  onTitleClick?: () => void;
  meta?: Meta;
  metaImdbId?: string | null;
  metaTitle?: string | null;
  metaReleaseDate?: string | null;
  season?: number | null;
  episode?: number | null;
  download?: DownloadStatus;
  sleep?: import("@/views/player/hooks/use-sleep-timer").SleepTimerState;
  setShowRemaining: (fn: (r: boolean) => boolean) => void;
  setAudioMenuOpen: (v: boolean) => void;
  setSubtitleMenuOpen: (v: boolean) => void;
  setSpeedMenuOpen: (v: boolean) => void;
  onPlayPause: () => void;
  onMute: () => void;
  onVolume: (v: number) => void;
  onAudio: (id: string) => void;
  onSubtitle: (id: string | null) => void;
  onSubDelay: (sec: number) => void;
  onAudioDelay: (sec: number) => void;
  onAddSubtitle: (url: string, lang?: string, title?: string) => void;
  onRate: (r: number) => void;
  onPiP: () => void;
  onCast: () => void;
  onToggleDraw: () => void;
  onToggleHideOthers: () => void;
  onPickAnother: () => void;
  onPrevEp: () => void;
  onNextEp: () => void;
  onDownloadStart?: () => void;
  onDownloadCancel?: () => void;
  onDownloadReveal?: () => void;
  onDownloadReset?: () => void;
  onOpenDvr?: () => void;
};

function getStremioState(id: PlayerControlId, ctx: StremioRenderCtx): string | undefined {
  const preview = ctx.previewStates?.[id];
  if (preview) return preview;
  switch (id) {
    case "play-pause":
      return ctx.playing ? "playing" : "paused";
    case "fullscreen":
      return ctx.fullscreen ? "fullscreen" : "windowed";
    case "draw-toggle":
      return ctx.drawMode ? "active" : "inactive";
    case "dvr":
      return ctx.isLiveChannel ? "recording" : "idle";
    case "cast":
      return ctx.capabilities.chromecast ? "connected" : "idle";
    case "pip":
      return "inactive";
    case "download":
      return ctx.download?.kind ?? "idle";
  }
  return undefined;
}

export function RenderedStremioControl({
  id,
  ctx,
}: {
  id: PlayerControlId;
  ctx: StremioRenderCtx;
}) {
  const state = getStremioState(id, ctx);
  const iconUrl = getCustomIcon(ctx.customIcons, id, state);
  if (iconUrl) {
    const custom = renderCustomIconControlStremio(id, ctx, iconUrl);
    if (custom !== undefined) return <>{custom}</>;
  }
  switch (id) {
    case "back":
      if (!ctx.onBack) return null;
      return (
        <Tooltip label="Back" side="bottom">
          <StremioBtn onClick={ctx.onBack} ariaLabel="Back">
            <ChevronLeft size={30} strokeWidth={2} />
          </StremioBtn>
        </Tooltip>
      );
    case "title-info": {
      if (!ctx.title) return null;
      if (ctx.titleClickable && ctx.onTitleClick) {
        return (
          <button
            type="button"
            onClick={ctx.onTitleClick}
            className="pointer-events-auto group inline-flex min-w-0 items-center gap-2 truncate rounded-lg px-2 py-1 text-left text-white/90 transition-colors hover:bg-white/[0.05]"
          >
            <h1 className="truncate text-[19px] font-medium leading-tight">{ctx.title}</h1>
            {ctx.subtitle && (
              <span className="shrink-0 text-[13px] font-normal text-white/55">{ctx.subtitle}</span>
            )}
            <Info size={13} strokeWidth={2.1} className="opacity-40 transition-opacity group-hover:opacity-90" />
          </button>
        );
      }
      return (
        <div className="pointer-events-none min-w-0 truncate text-white/90">
          <h1 className="truncate text-[19px] font-medium leading-tight">{ctx.title}</h1>
          {ctx.subtitle && <p className="truncate text-[13px] text-white/55">{ctx.subtitle}</p>}
        </div>
      );
    }
    case "play-pause":
      return (
        <Tooltip label={ctx.playing ? "Pause" : "Play"}>
          <StremioBtn onClick={ctx.onPlayPause} ariaLabel={ctx.playing ? "Pause" : "Play"}>
            {ctx.playing ? (
              <Pause size={32} strokeWidth={2} fill="currentColor" />
            ) : (
              <Play size={32} strokeWidth={2} fill="currentColor" />
            )}
          </StremioBtn>
        </Tooltip>
      );
    case "prev-episode":
      if (!ctx.showEpisodeNav) return null;
      return (
        <Tooltip label="Previous episode">
          <StremioBtn onClick={ctx.onPrevEp} ariaLabel="Previous episode" disabled={!ctx.hasPrevEp}>
            <SkipBack size={26} strokeWidth={2} fill="currentColor" />
          </StremioBtn>
        </Tooltip>
      );
    case "next-episode":
      if (!ctx.showEpisodeNav) return null;
      return (
        <Tooltip label="Next episode">
          <StremioBtn onClick={ctx.onNextEp} ariaLabel="Next episode" disabled={!ctx.hasNextEp}>
            <SkipForward size={26} strokeWidth={2} fill="currentColor" />
          </StremioBtn>
        </Tooltip>
      );
    case "seek-back":
    case "seek-forward":
      return null;
    case "volume":
      return (
        <StremioVolume
          snap={ctx.snap}
          onMute={ctx.onMute}
          onVolume={ctx.onVolume}
          capabilities={ctx.capabilities}
          style={ctx.volumeStyle ?? "slider"}
        />
      );
    case "time-start": {
      return (
        <TimeStart
          stremio
          durationSec={ctx.snap.durationSec}
          timeFormat={ctx.timeFormat}
          isLiveChannel={ctx.isLiveChannel}
          active={ctx.active}
        />
      );
    }
    case "time-end":
      return null;
    case "pick-another":
      if (!ctx.canPickAnother) return null;
      return (
        <Tooltip label={ctx.isLiveChannel ? "TV Guide" : "Switch stream"}>
          <StremioBtn
            onClick={ctx.onPickAnother}
            ariaLabel={ctx.isLiveChannel ? "TV Guide" : "Switch stream"}
          >
            {ctx.isLiveChannel ? <Tv size={26} strokeWidth={1.9} /> : <Replace size={26} strokeWidth={1.9} />}
          </StremioBtn>
        </Tooltip>
      );
    case "dvr":
      if (!ctx.isLiveChannel || !ctx.onOpenDvr) return null;
      return <DvrButton channelName={ctx.meta?.name ?? "Live"} onClick={ctx.onOpenDvr} />;
    case "download":
      if (ctx.isLiveChannel) return null;
      if (!ctx.download || !ctx.onDownloadStart || !ctx.onDownloadCancel || !ctx.onDownloadReveal || !ctx.onDownloadReset) return null;
      return (
        <DownloadButton
          status={ctx.download}
          onStart={ctx.onDownloadStart}
          onCancel={ctx.onDownloadCancel}
          onReveal={ctx.onDownloadReveal}
          onReset={ctx.onDownloadReset}
        />
      );
    case "speed-menu":
      if (ctx.isLiveChannel) return null;
      return (
        <SpeedMenu
          rate={ctx.snap.rate}
          onRate={ctx.onRate}
          sleep={ctx.sleep}
          onOpenChange={ctx.setSpeedMenuOpen}
        />
      );
    case "cast":
      return <CastButton onClick={ctx.onCast} capabilities={ctx.capabilities} />;
    case "subtitle-menu":
      if (ctx.isLiveChannel && ctx.snap.subtitleTracks.length === 0) return null;
      return (
        <SubtitleMenu
          tracks={ctx.snap.subtitleTracks}
          selectedId={ctx.snap.subtitleTracks.find((t) => t.selected)?.id ?? null}
          delaySec={ctx.snap.subDelaySec}
          onSelect={ctx.onSubtitle}
          onDelay={ctx.onSubDelay}
          onAddSubtitle={ctx.onAddSubtitle}
          metaImdbId={ctx.metaImdbId}
          metaTitle={ctx.metaTitle}
          metaReleaseDate={ctx.metaReleaseDate}
          season={ctx.season}
          episode={ctx.episode}
          useOverlayPopup={ctx.useOverlayPopups}
          onOpenChange={ctx.setSubtitleMenuOpen}
        />
      );
    case "audio-menu":
      if (ctx.engine === "html5") return null;
      if (ctx.isLiveChannel && ctx.snap.audioTracks.length < 2) return null;
      return (
        <AudioMenu
          tracks={ctx.snap.audioTracks}
          selectedId={ctx.snap.audioTracks.find((t) => t.selected)?.id ?? null}
          delaySec={ctx.snap.audioDelaySec}
          engine={ctx.engine}
          onSelect={ctx.onAudio}
          onDelay={ctx.onAudioDelay}
          onOpenChange={ctx.setAudioMenuOpen}
          useOverlayPopup={ctx.useOverlayPopups}
        />
      );
    case "draw-toggle":
      if (!ctx.showDraw) return null;
      return (
        <DrawToggle
          active={ctx.drawMode}
          hideOthers={ctx.hideOthersDrawings}
          onToggle={ctx.onToggleDraw}
          onToggleHideOthers={ctx.onToggleHideOthers}
        />
      );
    case "pip":
      if (!ctx.capabilities.pictureInPicture) return null;
      return (
        <Tooltip label="Picture in Picture">
          <StremioBtn onClick={ctx.onPiP} ariaLabel="Picture in Picture">
            <PictureInPicture2 size={26} strokeWidth={1.9} />
          </StremioBtn>
        </Tooltip>
      );
    case "fullscreen":
      if (!ctx.onFullscreen) return null;
      return (
        <Tooltip label={ctx.fullscreen ? "Exit fullscreen" : "Fullscreen"} side="bottom">
          <StremioBtn onClick={ctx.onFullscreen} ariaLabel="Fullscreen">
            {ctx.fullscreen ? <Minimize size={28} strokeWidth={2} /> : <Maximize size={28} strokeWidth={2} />}
          </StremioBtn>
        </Tooltip>
      );
    default:
      return null;
  }
}

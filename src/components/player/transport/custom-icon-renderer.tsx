import { AlertCircle } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { PlayerControlId } from "@/lib/player-chrome";
import type { ControlContext } from "./control-renderer";
import type { StremioRenderCtx } from "./control-renderer-stremio";
import { BigButton } from "./big-button";
import { Tooltip } from "./tooltip";
import { StremioBtn } from "./stremio-btn";

export function CustomIcon({ url, size }: { url: string; size: number }) {
  const [errored, setErrored] = useState(false);
  useEffect(() => {
    setErrored(false);
  }, [url]);
  if (errored) {
    return (
      <AlertCircle
        size={size}
        strokeWidth={1.6}
        className="pointer-events-none select-none text-amber-400/70"
      />
    );
  }
  return (
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      draggable={false}
      onError={() => setErrored(true)}
      className="pointer-events-none select-none object-contain"
      style={{ width: size, height: size }}
    />
  );
}

export function renderCustomIconControl(
  id: PlayerControlId,
  ctx: ControlContext,
  iconUrl: string,
): ReactNode | undefined {
  switch (id) {
    case "back": {
      if (!ctx.onBack) return null;
      return (
        <Tooltip label="Back" side="bottom">
          <button
            onClick={ctx.onBack}
            aria-label="Back"
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-black/80"
          >
            <CustomIcon url={iconUrl} size={24} />
          </button>
        </Tooltip>
      );
    }
    case "play-pause": {
      const iconSize = ctx.tight ? 28 : ctx.compact ? 32 : 36;
      const boxSize = ctx.tight ? "h-12 w-12" : ctx.compact ? "h-14 w-14" : "h-16 w-16";
      return (
        <Tooltip label={ctx.playing ? "Pause" : "Play"}>
          <button
            onClick={ctx.onPlayPause}
            aria-label={ctx.playing ? "Pause" : "Play"}
            className={`flex items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-md transition-[background-color,transform] hover:bg-white/22 active:scale-95 ${boxSize}`}
          >
            <CustomIcon url={iconUrl} size={iconSize} />
          </button>
        </Tooltip>
      );
    }
    case "seek-back": {
      if (ctx.tight || ctx.isLiveChannel) return null;
      return (
        <Tooltip label="Seek back">
          <button
            type="button"
            onClick={() => ctx.onSeekStep(-10)}
            aria-label="Seek back"
            className="flex h-14 w-14 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          >
            <CustomIcon url={iconUrl} size={28} />
          </button>
        </Tooltip>
      );
    }
    case "seek-forward": {
      if (ctx.tight || ctx.isLiveChannel) return null;
      return (
        <Tooltip label="Seek forward">
          <button
            type="button"
            onClick={() => ctx.onSeekStep(10)}
            aria-label="Seek forward"
            className="flex h-14 w-14 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          >
            <CustomIcon url={iconUrl} size={28} />
          </button>
        </Tooltip>
      );
    }
    case "prev-episode": {
      if (ctx.tight || !ctx.showEpisodeNav) return null;
      return (
        <Tooltip label="Previous Episode">
          <button
            onClick={ctx.hasPrevEp ? ctx.onPrevEp : undefined}
            disabled={!ctx.hasPrevEp}
            aria-label="Previous Episode"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-[background-color,color] ${
              ctx.hasPrevEp ? "text-white/90 hover:bg-white/10 hover:text-white" : "cursor-not-allowed text-white/25"
            }`}
          >
            <CustomIcon url={iconUrl} size={22} />
          </button>
        </Tooltip>
      );
    }
    case "next-episode": {
      if (ctx.tight || !ctx.showEpisodeNav) return null;
      return (
        <Tooltip label="Next Episode">
          <button
            onClick={ctx.hasNextEp ? ctx.onNextEp : undefined}
            disabled={!ctx.hasNextEp}
            aria-label="Next Episode"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-[background-color,color] ${
              ctx.hasNextEp ? "text-white/90 hover:bg-white/10 hover:text-white" : "cursor-not-allowed text-white/25"
            }`}
          >
            <CustomIcon url={iconUrl} size={22} />
          </button>
        </Tooltip>
      );
    }
    case "pick-another": {
      if (ctx.tight || !ctx.canPickAnother) return null;
      const label = ctx.isLiveChannel ? "TV Guide" : "Switch stream";
      return (
        <BigButton onClick={ctx.onPickAnother} ariaLabel={label} tooltip={label}>
          <CustomIcon url={iconUrl} size={22} />
        </BigButton>
      );
    }
    case "dvr": {
      if (ctx.tight || !ctx.isLiveChannel || !ctx.onOpenDvr) return null;
      return (
        <BigButton onClick={ctx.onOpenDvr} ariaLabel="Record" tooltip="DVR record">
          <CustomIcon url={iconUrl} size={22} />
        </BigButton>
      );
    }
    case "download": {
      if (ctx.mid || ctx.isLiveChannel || !ctx.onDownloadStart) return null;
      return (
        <BigButton onClick={ctx.onDownloadStart} ariaLabel="Download" tooltip="Download">
          <CustomIcon url={iconUrl} size={22} />
        </BigButton>
      );
    }
    case "draw-toggle": {
      if (ctx.compact || !ctx.showDraw) return null;
      return (
        <BigButton onClick={ctx.onToggleDraw} active={ctx.drawMode} ariaLabel="Draw on video" tooltip="Draw on video">
          <CustomIcon url={iconUrl} size={22} />
        </BigButton>
      );
    }
    case "pip": {
      if (!ctx.capabilities.pictureInPicture) return null;
      return (
        <BigButton onClick={ctx.onPiP} ariaLabel="Picture in Picture" tooltip="Picture in Picture">
          <CustomIcon url={iconUrl} size={22} />
        </BigButton>
      );
    }
    case "cast": {
      if (ctx.tight) return null;
      return (
        <BigButton onClick={ctx.onCast} ariaLabel="Cast" tooltip="Cast">
          <CustomIcon url={iconUrl} size={22} />
        </BigButton>
      );
    }
    case "fullscreen": {
      return (
        <BigButton
          onClick={ctx.onFullscreen}
          ariaLabel="Fullscreen"
          tooltip={ctx.fullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          <CustomIcon url={iconUrl} size={22} />
        </BigButton>
      );
    }
  }
  return undefined;
}

export function renderCustomIconControlStremio(
  id: PlayerControlId,
  ctx: StremioRenderCtx,
  iconUrl: string,
): ReactNode | undefined {
  switch (id) {
    case "back":
      if (!ctx.onBack) return null;
      return (
        <Tooltip label="Back" side="bottom">
          <StremioBtn onClick={ctx.onBack} ariaLabel="Back">
            <CustomIcon url={iconUrl} size={28} />
          </StremioBtn>
        </Tooltip>
      );
    case "play-pause":
      return (
        <Tooltip label={ctx.playing ? "Pause" : "Play"}>
          <StremioBtn onClick={ctx.onPlayPause} ariaLabel={ctx.playing ? "Pause" : "Play"}>
            <CustomIcon url={iconUrl} size={32} />
          </StremioBtn>
        </Tooltip>
      );
    case "prev-episode":
      if (!ctx.showEpisodeNav) return null;
      return (
        <Tooltip label="Previous episode">
          <StremioBtn onClick={ctx.onPrevEp} ariaLabel="Previous episode" disabled={!ctx.hasPrevEp}>
            <CustomIcon url={iconUrl} size={26} />
          </StremioBtn>
        </Tooltip>
      );
    case "next-episode":
      if (!ctx.showEpisodeNav) return null;
      return (
        <Tooltip label="Next episode">
          <StremioBtn onClick={ctx.onNextEp} ariaLabel="Next episode" disabled={!ctx.hasNextEp}>
            <CustomIcon url={iconUrl} size={26} />
          </StremioBtn>
        </Tooltip>
      );
    case "pick-another":
      if (!ctx.canPickAnother) return null;
      return (
        <Tooltip label={ctx.isLiveChannel ? "TV Guide" : "Switch stream"}>
          <StremioBtn
            onClick={ctx.onPickAnother}
            ariaLabel={ctx.isLiveChannel ? "TV Guide" : "Switch stream"}
          >
            <CustomIcon url={iconUrl} size={26} />
          </StremioBtn>
        </Tooltip>
      );
    case "dvr":
      if (!ctx.isLiveChannel || !ctx.onOpenDvr) return null;
      return (
        <Tooltip label="DVR record">
          <StremioBtn onClick={ctx.onOpenDvr} ariaLabel="DVR record">
            <CustomIcon url={iconUrl} size={26} />
          </StremioBtn>
        </Tooltip>
      );
    case "download":
      if (ctx.isLiveChannel || !ctx.onDownloadStart) return null;
      return (
        <Tooltip label="Download">
          <StremioBtn onClick={ctx.onDownloadStart} ariaLabel="Download">
            <CustomIcon url={iconUrl} size={26} />
          </StremioBtn>
        </Tooltip>
      );
    case "cast":
      return (
        <Tooltip label="Cast">
          <StremioBtn onClick={ctx.onCast} ariaLabel="Cast">
            <CustomIcon url={iconUrl} size={26} />
          </StremioBtn>
        </Tooltip>
      );
    case "draw-toggle":
      if (!ctx.showDraw) return null;
      return (
        <Tooltip label="Draw on video">
          <StremioBtn onClick={ctx.onToggleDraw} ariaLabel="Draw on video">
            <CustomIcon url={iconUrl} size={26} />
          </StremioBtn>
        </Tooltip>
      );
    case "pip":
      if (!ctx.capabilities.pictureInPicture) return null;
      return (
        <Tooltip label="Picture in Picture">
          <StremioBtn onClick={ctx.onPiP} ariaLabel="Picture in Picture">
            <CustomIcon url={iconUrl} size={26} />
          </StremioBtn>
        </Tooltip>
      );
    case "seek-back":
    case "seek-forward":
    case "fullscreen":
      return null;
  }
  return undefined;
}

import { ChevronDown, Play } from "lucide-react";
import type { PlayEpisode } from "@/lib/view";

export function EpisodeRow({
  episode,
  expanded,
  onToggle,
  onPlay,
  manualMode,
  isCurrent = false,
}: {
  episode: PlayEpisode;
  expanded: boolean;
  onToggle: () => void;
  onPlay: () => void;
  manualMode: boolean;
  isCurrent?: boolean;
}) {
  const epLabel = `S${episode.season} · E${String(episode.episode).padStart(2, "0")}`;
  const hasStill = !!episode.still;
  return (
    <div
      className={`overflow-hidden rounded-2xl bg-elevated/60 ring-1 ${
        isCurrent ? "ring-2 ring-accent" : "ring-edge-soft"
      }`}
    >
      <div className="flex gap-4 p-3">
        <div className="relative aspect-video h-[88px] shrink-0 overflow-hidden rounded-xl bg-canvas/60 ring-1 ring-edge-soft/60">
          {hasStill && (
            <img
              src={episode.still}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          <span className="absolute bottom-1.5 left-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
            {epLabel}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-[14.5px] font-semibold leading-snug text-ink">
              {episode.name ?? `Episode ${episode.episode}`}
            </p>
            {isCurrent && (
              <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-accent ring-1 ring-accent/30">
                Now Playing
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPlay}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 text-[14px] font-semibold text-canvas shadow-[0_6px_18px_-8px_var(--color-accent)] transition-opacity hover:opacity-90"
            >
              <Play size={16} fill="currentColor" />
              Play
            </button>
            {manualMode && (
              <button
                onClick={onToggle}
                aria-label={expanded ? "Hide streams" : "Show streams"}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-elevated text-ink-muted ring-1 ring-edge-soft transition-colors hover:bg-raised hover:text-ink"
              >
                <ChevronDown
                  size={18}
                  strokeWidth={2.4}
                  className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                />
              </button>
            )}
          </div>
        </div>
      </div>
      {expanded && episode.overview && (
        <p className="mx-3 mb-3 rounded-xl bg-canvas/40 p-3 text-[13px] leading-relaxed text-ink-muted">
          {episode.overview}
        </p>
      )}
    </div>
  );
}

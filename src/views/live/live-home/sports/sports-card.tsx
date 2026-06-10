import { useState } from "react";
import type { SportsGame, SportsSide } from "@/lib/sports/espn";
import { fmtClock } from "../now-format";

function startLabel(ms: number): string {
  if (!ms) return "Upcoming";
  const d = new Date(ms);
  const now = new Date();
  const time = fmtClock(ms);
  if (d.toDateString() === now.toDateString()) return time;
  return `${d.toLocaleDateString(undefined, { weekday: "short" })} ${time}`;
}

export function SportsCard({ game, onSelect }: { game: SportsGame; onSelect: (g: SportsGame) => void }) {
  const finalGame = game.state === "post";
  const live = game.state === "in";
  return (
    <button
      type="button"
      onClick={() => onSelect(game)}
      className="flex h-24 w-[260px] shrink-0 flex-col justify-between rounded-xl border border-edge-soft/55 bg-elevated p-3 text-left transition-colors duration-150 hover:border-edge"
    >
      <div className="flex items-center justify-between">
        <Status game={game} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
          {game.league}
        </span>
      </div>
      <SideRow side={game.away} active={live || finalGame} dim={finalGame && !game.away.winner} />
      <SideRow side={game.home} active={live || finalGame} dim={finalGame && !game.home.winner} />
    </button>
  );
}

function SideRow({ side, active, dim }: { side: SportsSide; active: boolean; dim: boolean }) {
  const [err, setErr] = useState(false);
  return (
    <div className="flex items-center gap-2">
      {side.logo && !err ? (
        <img
          src={side.logo}
          alt=""
          draggable={false}
          loading="lazy"
          onError={() => setErr(true)}
          className="h-5 w-5 shrink-0 object-contain"
        />
      ) : (
        <span className="h-5 w-5 shrink-0 rounded-full bg-canvas/60" />
      )}
      <span className={`flex-1 truncate text-[13px] font-bold uppercase tracking-[0.02em] ${dim ? "text-ink-subtle" : "text-ink"}`}>
        {side.abbr || side.name}
      </span>
      <span
        className={`w-9 shrink-0 text-right text-[20px] font-bold tabular-nums ${
          active ? (dim ? "text-ink-muted" : "text-ink") : "text-ink-subtle"
        }`}
      >
        {side.score}
      </span>
    </div>
  );
}

function Status({ game }: { game: SportsGame }) {
  if (game.state === "in") {
    return (
      <span className="flex h-[18px] items-center gap-1 rounded bg-danger px-1.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-white">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        {game.detail || "Live"}
      </span>
    );
  }
  if (game.state === "post") {
    return (
      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
        {game.detail || "Final"}
      </span>
    );
  }
  return (
    <span className="flex h-[18px] items-center gap-1.5 rounded border border-edge-soft/60 px-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-subtle">
      <span className="h-1.5 w-1.5 rounded-full bg-ink-subtle/60" />
      {startLabel(game.startMs)}
    </span>
  );
}

import { RotateCcw } from "lucide-react";

export function DelayRow({ delay, onDelay }: { delay: number; onDelay: (sec: number) => void }) {
  const round = (v: number) => Math.round(v * 100) / 100;
  return (
    <div className="flex items-center gap-1.5 border-t border-edge-soft bg-canvas/30 px-3 py-2">
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        Sync
      </span>
      <button
        onClick={() => onDelay(round(delay - 0.5))}
        className="rounded bg-raised px-2 py-1 text-[11.5px] font-semibold tabular-nums text-ink transition-colors hover:bg-elevated"
      >
        −0.5
      </button>
      <button
        onClick={() => onDelay(round(delay - 0.1))}
        className="rounded bg-raised px-2 py-1 text-[11.5px] font-semibold tabular-nums text-ink transition-colors hover:bg-elevated"
      >
        −0.1
      </button>
      <span className="flex-1 text-center font-mono text-[12px] tabular-nums text-ink">
        {delay >= 0 ? "+" : ""}
        {delay.toFixed(2)}s
      </span>
      <button
        onClick={() => onDelay(round(delay + 0.1))}
        className="rounded bg-raised px-2 py-1 text-[11.5px] font-semibold tabular-nums text-ink transition-colors hover:bg-elevated"
      >
        +0.1
      </button>
      <button
        onClick={() => onDelay(round(delay + 0.5))}
        className="rounded bg-raised px-2 py-1 text-[11.5px] font-semibold tabular-nums text-ink transition-colors hover:bg-elevated"
      >
        +0.5
      </button>
      {delay !== 0 && (
        <button
          onClick={() => onDelay(0)}
          aria-label="Reset sync"
          className="flex h-6 w-6 items-center justify-center rounded text-ink-subtle transition-colors hover:bg-raised hover:text-ink"
        >
          <RotateCcw size={11} strokeWidth={2.2} />
        </button>
      )}
    </div>
  );
}

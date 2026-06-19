import { RotateCcw, Type } from "lucide-react";
import { useT } from "@/lib/i18n";

const round = (v: number) => Math.round(v * 100) / 100;

export function DelayRow({
  delay,
  onDelay,
  onEnterSync,
  syncAvailable,
}: {
  delay: number;
  onDelay: (sec: number) => void;
  onEnterSync?: () => void;
  syncAvailable?: boolean;
}) {
  const t = useT();
  return (
    <div className="border-t border-edge-soft bg-canvas/30">
      <div className="flex items-center gap-1.5 px-3 py-2">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          {t("Sync")}
        </span>
        <Step label="−0.5" onClick={() => onDelay(round(delay - 0.5))} />
        <Step label="−0.1" onClick={() => onDelay(round(delay - 0.1))} />
        <Step label="−0.05" onClick={() => onDelay(round(delay - 0.05))} />
        <span className="flex-1 text-center font-mono text-[12px] tabular-nums text-ink">
          {delay >= 0 ? "+" : ""}
          {delay.toFixed(2)}s
        </span>
        <Step label="+0.05" onClick={() => onDelay(round(delay + 0.05))} />
        <Step label="+0.1" onClick={() => onDelay(round(delay + 0.1))} />
        <Step label="+0.5" onClick={() => onDelay(round(delay + 0.5))} />
        {delay !== 0 && (
          <button
            onClick={() => onDelay(0)}
            aria-label={t("Reset sync")}
            className="flex h-6 w-6 items-center justify-center rounded text-ink-subtle transition-colors hover:bg-raised hover:text-ink"
          >
            <RotateCcw size={11} strokeWidth={2.2} />
          </button>
        )}
      </div>
      {onEnterSync && (
        <div className="border-t border-edge-soft/50 px-3 py-2">
          <button
            onClick={onEnterSync}
            disabled={!syncAvailable}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-[12px] font-semibold transition-colors ${
              syncAvailable
                ? "bg-accent/15 text-accent hover:bg-accent/25"
                : "bg-raised/50 text-ink-subtle/40"
            }`}
          >
            <Type size={14} strokeWidth={2.2} />
            {syncAvailable
              ? t("Sync subtitles via text")
              : t("Text sync unavailable for embedded tracks")}
          </button>
        </div>
      )}
    </div>
  );
}

function Step({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded bg-raised px-2 py-1 text-[11.5px] font-semibold tabular-nums text-ink transition-colors hover:bg-elevated"
    >
      {label}
    </button>
  );
}

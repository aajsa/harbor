/**
 * SyncTransport — شريط التحكم في وضع المزامنة النصية
 * يظهر في أعلى الـ player عندما يدخل المستخدم وضع "Sync via text"
 */
import { PauseCircle, PlayCircle, RotateCcw, Save, Undo2, X } from "lucide-react";
import { useT } from "@/lib/i18n";

export function SyncTransport({
  playing,
  anchorCount,
  canUndo,
  previewOffset,
  onPlayPause,
  onNudge,
  onUndo,
  onSave,
  onExit,
}: {
  playing: boolean;
  anchorCount: number;
  canUndo: boolean;
  previewOffset: number;
  onPlayPause: () => void;
  onNudge: (deltaSec: number) => void;
  onUndo: () => void;
  onSave: () => void;
  onExit: () => void;
}) {
  const t = useT();
  const saveDisabled = anchorCount === 0;
  const nonZero = previewOffset !== 0;

  return (
    <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/75 px-3 py-2.5 backdrop-blur-xl">
      {/* Exit */}
      <button
        onClick={onExit}
        aria-label={t("Exit sync mode")}
        title={t("Exit sync mode")}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X size={15} strokeWidth={2.2} />
      </button>

      <div className="mx-0.5 h-5 w-px shrink-0 bg-white/15" />

      {/* Play / Pause */}
      <button
        onClick={onPlayPause}
        aria-label={playing ? t("Pause") : t("Play")}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/12 text-white transition-colors hover:bg-white/22 active:scale-95"
      >
        {playing ? (
          <PauseCircle size={18} strokeWidth={1.5} />
        ) : (
          <PlayCircle size={18} strokeWidth={1.5} />
        )}
      </button>

      <div className="mx-0.5 h-5 w-px shrink-0 bg-white/15" />

      {/* Nudge steps */}
      <div className="flex h-9 shrink-0 items-stretch overflow-hidden rounded-[10px] bg-white/8">
        <NudgeBtn label="−0.5s" onClick={() => onNudge(-0.5)} />
        <NudgeBtn label="−0.1s" onClick={() => onNudge(-0.1)} />

        {/* Offset display */}
        <div
          className={`flex min-w-[62px] items-center justify-center border-x border-white/10 px-2 font-mono text-[13px] font-semibold tabular-nums transition-colors ${
            nonZero ? "text-emerald-400" : "text-white/50"
          }`}
        >
          {previewOffset >= 0 ? "+" : ""}
          {previewOffset.toFixed(2)}s
        </div>

        <NudgeBtn label="+0.1s" onClick={() => onNudge(0.1)} />
        <NudgeBtn label="+0.5s" onClick={() => onNudge(0.5)} />
      </div>

      {/* Undo */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        aria-label={t("Undo last anchor")}
        title={t("Undo last anchor")}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-25"
      >
        <Undo2 size={14} strokeWidth={2.2} />
      </button>

      {/* Reset nudge (only when offset ≠ 0) */}
      {nonZero && (
        <button
          onClick={() => onNudge(-previewOffset)}
          aria-label={t("Reset offset")}
          title={t("Reset offset to 0")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <RotateCcw size={13} strokeWidth={2.2} />
        </button>
      )}

      {/* Anchor progress indicator */}
      <div className="mx-1 flex flex-1 items-center gap-2">
        <div className="flex items-center gap-1.5">
          {[0, 1].map((i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                anchorCount > i
                  ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                  : "bg-white/20"
              }`}
            />
          ))}
        </div>
        <span className="text-[11.5px] font-medium text-white/50">
          {anchorCount === 0
            ? t("Click a line when you hear it")
            : anchorCount === 1
              ? t("Click another line near the end")
              : t("Both anchors set")}
        </span>
      </div>

      {/* Save */}
      <button
        onClick={onSave}
        disabled={saveDisabled}
        aria-label={t("Save sync")}
        className={`flex h-9 shrink-0 items-center gap-2 rounded-[10px] px-4 text-[13px] font-semibold transition-all active:scale-95 ${
          saveDisabled
            ? "bg-white/8 text-white/30 cursor-not-allowed"
            : "bg-emerald-500 text-white shadow-[0_0_16px_-2px_rgba(52,211,153,0.4)] hover:bg-emerald-400"
        }`}
      >
        <Save size={13} strokeWidth={2.2} />
        {anchorCount === 1 ? t("Save (1 pt)") : t("Save sync")}
      </button>
    </div>
  );
}

function NudgeBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center px-2.5 font-mono text-[11.5px] font-semibold tabular-nums text-white/70 transition-colors hover:bg-white/12 hover:text-white active:scale-95"
    >
      {label}
    </button>
  );
}

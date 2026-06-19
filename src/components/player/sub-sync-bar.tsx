/**
 * SubSyncBar — شريط مزامنة الترجمة الحي
 * ينزل من أعلى الـ player مثل SubStyleBar
 * يتيح التحكم بتأخير/تقديم الترجمة أثناء تشغيل الفيديو مباشرة
 */
import { Check, Minus, Plus, RotateCcw, Timer, Type, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { closeSyncBar, useSyncBarOpen } from "@/lib/player/sub-sync";

const IDLE_MS = 12000;
const round = (v: number) => Math.round(v * 100) / 100;

type Props = {
  delaySec: number;
  onDelay: (sec: number) => void;
  onEnterSync?: () => void;
  syncAvailable?: boolean;
};

export function SubSyncBar({ delaySec, onDelay, onEnterSync, syncAvailable }: Props) {

  const t = useT();
  const open = useSyncBarOpen();
  const [localDelay, setLocalDelay] = useState(delaySec);
  const savedRef = useRef(delaySec);

  // Sync external delay into local state when bar opens
  useEffect(() => {
    if (open) {
      setLocalDelay(delaySec);
      savedRef.current = delaySec;
    }
  }, [open]);

  // Auto-close after idle
  useEffect(() => {
    if (!open) return;
    let timer = window.setTimeout(closeSyncBar, IDLE_MS);
    const bump = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(closeSyncBar, IDLE_MS);
    };
    window.addEventListener("pointermove", bump);
    window.addEventListener("pointerdown", bump);
    window.addEventListener("keydown", bump);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", bump);
      window.removeEventListener("pointerdown", bump);
      window.removeEventListener("keydown", bump);
    };
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSyncBar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Apply delay to player live
  const applyDelay = (sec: number) => {
    const v = round(sec);
    setLocalDelay(v);
    onDelay(v);
  };

  // Save = just close (delay is already applied live)
  const handleSave = () => {
    savedRef.current = localDelay;
    closeSyncBar();
  };

  // Discard = restore saved value
  const handleDiscard = () => {
    applyDelay(savedRef.current);
    closeSyncBar();
  };

  const isDirty = round(localDelay) !== round(savedRef.current);
  const isNonZero = localDelay !== 0;

  if (!open) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center px-6 pt-[68px] animate-in fade-in slide-in-from-top-2 duration-200">
      <div
        role="toolbar"
        aria-label={t("Subtitle sync")}
        className="pointer-events-auto flex items-stretch gap-1.5 rounded-[14px] border border-edge bg-elevated/96 px-2 py-2 shadow-[0_18px_44px_-22px_rgba(0,0,0,0.85)] backdrop-blur-xl"
      >
        {/* Icon label */}
        <div className="flex h-11 items-center gap-2 rounded-[10px] bg-raised px-3">
          <Timer size={15} strokeWidth={2} className="text-ink-muted" />
          <span className="text-[12.5px] font-semibold text-ink-muted">{t("Subtitle sync")}</span>
        </div>

        <Divider />

        {/* −0.5s */}
        <StepGroup>
          <StepBtn
            label="−0.5s"
            onClick={() => applyDelay(localDelay - 0.5)}
            wide
          />
          <StepBtn
            label="−0.1s"
            onClick={() => applyDelay(localDelay - 0.1)}
          />
          <StepBtn
            label="−0.05s"
            onClick={() => applyDelay(localDelay - 0.05)}
            narrow
          />
        </StepGroup>

        {/* Current value display */}
        <DelayDisplay value={localDelay} nonZero={isNonZero} onReset={() => applyDelay(0)} />

        {/* +steps */}
        <StepGroup>
          <StepBtn
            label="+0.05s"
            onClick={() => applyDelay(localDelay + 0.05)}
            narrow
          />
          <StepBtn
            label="+0.1s"
            onClick={() => applyDelay(localDelay + 0.1)}
          />
          <StepBtn
            label="+0.5s"
            onClick={() => applyDelay(localDelay + 0.5)}
            wide
          />
        </StepGroup>

        <Divider />

        {/* Fine-tune stepper */}
        <FineStepGroup value={localDelay} onChange={applyDelay} />

        <Divider />

        {/* Text sync button */}
        {onEnterSync && (
          <button
            type="button"
            onClick={() => {
              closeSyncBar();
              onEnterSync();
            }}
            disabled={!syncAvailable}
            title={syncAvailable ? t("Sync subtitles via text") : t("Text sync unavailable for embedded tracks")}
            aria-label={t("Sync via text")}
            className={`flex h-11 shrink-0 items-center gap-2 rounded-[10px] px-3.5 text-[13px] font-semibold transition-all ${
              syncAvailable
                ? "bg-raised text-ink-muted hover:bg-elevated hover:text-ink active:scale-95"
                : "bg-raised/40 text-ink-subtle/40 cursor-not-allowed"
            }`}
          >
            <Type size={15} strokeWidth={2} />
            <span className="hidden lg:inline">{t("Sync via text")}</span>
          </button>
        )}

        <Divider />

        {/* Save / Discard */}
        <div className="flex items-center gap-1">
          {/* Save (close keeping current delay) */}
          <button
            type="button"
            onClick={handleSave}
            aria-label={t("Save")}
            className="flex h-11 items-center gap-1.5 rounded-[10px] bg-accent px-3.5 text-[13px] font-semibold text-canvas transition-all hover:brightness-110 active:scale-95"
          >
            <Check size={14} strokeWidth={2.6} />
            {t("Done")}
          </button>

          {/* Discard (restore and close) */}
          {isDirty && (
            <button
              type="button"
              onClick={handleDiscard}
              aria-label={t("Discard changes")}
              title={t("Discard changes")}
              className="flex h-11 w-11 items-center justify-center rounded-[10px] text-ink-muted transition-colors hover:bg-raised hover:text-danger"
            >
              <RotateCcw size={15} strokeWidth={2.2} />
            </button>
          )}

          {/* Close */}
          <button
            type="button"
            onClick={closeSyncBar}
            aria-label={t("Close")}
            className="flex h-11 w-11 items-center justify-center rounded-[10px] text-ink-muted transition-colors hover:bg-raised hover:text-ink"
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Divider() {
  return <span aria-hidden className="my-1 w-px shrink-0 self-stretch bg-edge-soft" />;
}

function StepGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-11 shrink-0 items-stretch gap-px overflow-hidden rounded-[10px] bg-raised">
      {children}
    </div>
  );
}

function StepBtn({
  label,
  onClick,
  wide,
  narrow,
}: {
  label: string;
  onClick: () => void;
  wide?: boolean;
  narrow?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center font-mono text-[12px] font-semibold tabular-nums text-ink-muted transition-colors hover:bg-elevated hover:text-ink active:scale-95 active:bg-elevated ${
        wide ? "px-3" : narrow ? "px-2" : "px-2.5"
      }`}
    >
      {label}
    </button>
  );
}

function DelayDisplay({
  value,
  nonZero,
  onReset,
}: {
  value: number;
  nonZero: boolean;
  onReset: () => void;
}) {
  const t = useT();
  return (
    <div className="flex h-11 shrink-0 items-center rounded-[10px] bg-raised">
      <span
        className={`min-w-[72px] text-center font-mono text-[15px] font-semibold tabular-nums transition-colors ${
          nonZero ? "text-accent" : "text-ink-muted"
        }`}
      >
        {value >= 0 ? "+" : ""}
        {value.toFixed(2)}s
      </span>
      {nonZero && (
        <button
          type="button"
          onClick={onReset}
          aria-label={t("Reset sync")}
          title={t("Reset to 0")}
          className="me-1.5 flex h-7 w-7 items-center justify-center rounded-[7px] text-ink-subtle transition-colors hover:bg-elevated hover:text-danger"
        >
          <RotateCcw size={11} strokeWidth={2.2} />
        </button>
      )}
      {!nonZero && <div className="me-1.5 w-7" />}
    </div>
  );
}

function FineStepGroup({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const t = useT();
  // Draggable stepper for fine control
  const drag = useRef({ active: false, startX: 0, startVal: 0 });
  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { active: true, startX: e.clientX, startVal: value };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const delta = (e.clientX - drag.current.startX) / 60;
    onChange(round(drag.current.startVal + delta));
  };
  const onUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    drag.current.active = false;
  };

  return (
    <div className="flex h-11 shrink-0 items-stretch overflow-hidden rounded-[10px] bg-raised">
      <button
        aria-label={t("Decrease")}
        onClick={() => onChange(round(value - 0.01))}
        className="flex w-8 items-center justify-center text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
      >
        <Minus size={13} />
      </button>
      <button
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="flex w-[52px] cursor-ew-resize touch-none items-center justify-center font-mono text-[12px] tabular-nums text-ink-muted"
        title={t("Drag to fine-tune")}
      >
        ±0.01s
      </button>
      <button
        aria-label={t("Increase")}
        onClick={() => onChange(round(value + 0.01))}
        className="flex w-8 items-center justify-center text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

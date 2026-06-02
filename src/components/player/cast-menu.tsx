import { Cast, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { discoverCastDevices, type CastDeviceInfo } from "@/lib/cast";
import { CastIcon } from "./cast-icon";

export function CastMenu({
  open,
  anchor,
  onClose,
  onPick,
}: {
  open: boolean;
  anchor: { right: number; bottom: number } | null;
  onClose: () => void;
  onPick: (device: CastDeviceInfo) => void;
}) {
  const [devices, setDevices] = useState<CastDeviceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setDevices([]);
    void discoverCastDevices()
      .then((rows) => {
        if (cancelled) return;
        setDevices(rows);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, scanCount]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={wrapRef}
      onMouseDown={(e) => e.stopPropagation()}
      className="animate-popover-in fixed z-[140] w-[320px] rounded-2xl border border-edge bg-elevated/95 p-4 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.7)] backdrop-blur-md"
      style={{
        right: anchor ? window.innerWidth - anchor.right : 24,
        bottom: anchor ? window.innerHeight - anchor.bottom + 12 : 80,
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
          <Cast size={13} strokeWidth={2.4} />
          Cast to TV or speaker
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="flex h-6 w-6 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-raised hover:text-ink"
        >
          <X size={13} />
        </button>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 px-1 py-3 text-[12.5px] text-ink-muted">
          <Loader2 size={13} strokeWidth={2.2} className="animate-spin" />
          Scanning your network…
        </div>
      ) : devices.length === 0 ? (
        <div className="flex flex-col gap-2 px-1 py-3">
          <p className="text-[12.5px] text-ink-muted">
            No Chromecast, DLNA, or Roku devices found. Make sure your TV is on, woken up, and on the same Wi-Fi.
          </p>
          <button
            onClick={() => setScanCount((c) => c + 1)}
            className="self-start rounded-md border border-edge-soft px-2 py-1 text-[11.5px] font-semibold text-ink-muted transition-colors hover:border-edge hover:text-ink"
          >
            Scan again
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {devices.map((d) => (
            <button
              key={d.id}
              onClick={() => onPick(d)}
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-canvas/65"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas/55 p-1">
                <CastIcon device={d} size={28} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-1.5 truncate text-[13px] font-medium text-ink">
                  <span className="truncate">{d.name}</span>
                  {d.audio_only && (
                    <span className="shrink-0 rounded-md bg-accent/20 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.12em] text-accent">
                      Audio
                    </span>
                  )}
                </span>
                <span className="truncate text-[11px] text-ink-subtle">
                  {d.kind === "dlna" ? d.model ?? "DLNA TV" : d.model || `${d.host}:${d.port}`}
                </span>
              </div>
            </button>
          ))}
          <button
            onClick={() => setScanCount((c) => c + 1)}
            className="mt-1 self-start rounded-md px-2 py-1 text-[11px] font-medium text-ink-subtle transition-colors hover:bg-raised hover:text-ink"
          >
            Rescan
          </button>
        </div>
      )}
    </div>
  );
}

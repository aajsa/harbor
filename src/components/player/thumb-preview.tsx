import { useEffect, useRef, useState } from "react";
import { trickplayGet } from "@/lib/trickplay";

const BUCKET_SECONDS = 2;
const DEBOUNCE_MS = 60;
const CARD_WIDTH = 192;
const CARD_HEIGHT = 108;

const cache = new Map<number, string>();

export function ThumbPreview({ time, dur }: { time: number; dur: number }) {
  const bucket = Math.round(time / BUCKET_SECONDS);
  const [src, setSrc] = useState<string | null>(() => cache.get(bucket) ?? null);
  const reqIdRef = useRef(0);
  const lastBucketRef = useRef<number | null>(null);

  useEffect(() => {
    if (lastBucketRef.current === bucket) return;
    lastBucketRef.current = bucket;
    const cached = cache.get(bucket);
    if (cached) {
      setSrc(cached);
      return;
    }
    const myReq = ++reqIdRef.current;
    const timer = window.setTimeout(async () => {
      const url = await trickplayGet(bucket * BUCKET_SECONDS);
      if (myReq !== reqIdRef.current) return;
      if (url) {
        cache.set(bucket, url);
        setSrc(url);
      }
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [bucket]);

  const pct = (time / dur) * 100;
  const label = fmtTime(time);

  return (
    <div
      className="pointer-events-none absolute -translate-x-1/2"
      style={{ left: `${pct}%`, bottom: "calc(100% + 8px)" }}
    >
      <div
        className="overflow-hidden rounded-lg border border-white/10 bg-black/85 shadow-[0_18px_40px_-15px_rgba(0,0,0,0.7)] backdrop-blur-md"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        {src ? (
          <img
            src={src}
            alt=""
            draggable={false}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-white/5 to-transparent" />
        )}
      </div>
      <div className="mt-1 text-center">
        <span className="inline-block rounded-md bg-black/85 px-1.5 py-0.5 font-mono text-[11px] text-white">
          {label}
        </span>
      </div>
    </div>
  );
}

function fmtTime(t: number): string {
  if (!Number.isFinite(t) || t < 0) return "0:00";
  const total = Math.floor(t);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

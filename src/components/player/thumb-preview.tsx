import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { trickplayGet } from "@/lib/trickplay";

const BUCKET_SECONDS = 2;
const CARD_WIDTH = 192;
const CARD_HEIGHT = 108;

const cache = new Map<number, string>();

export function ThumbPreview({ time, dur }: { time: number; dur: number }) {
  const bucket = Math.round(time / BUCKET_SECONDS);
  const liveBucketRef = useRef(bucket);
  liveBucketRef.current = bucket;
  const [src, setSrc] = useState<string | null>(() => cache.get(bucket) ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cached = cache.get(bucket);
    if (cached) {
      setSrc(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    const raf = requestAnimationFrame(async () => {
      if (liveBucketRef.current !== bucket) return;
      const url = await trickplayGet(bucket * BUCKET_SECONDS);
      if (liveBucketRef.current !== bucket) return;
      if (url) {
        cache.set(bucket, url);
        setSrc(url);
      }
      setLoading(false);
    });
    return () => cancelAnimationFrame(raf);
  }, [bucket]);

  const pct = (time / dur) * 100;
  const label = fmtTime(time);

  return (
    <div
      className="pointer-events-none absolute -translate-x-1/2"
      style={{ left: `${pct}%`, bottom: "calc(100% + 8px)" }}
    >
      <div
        className="relative overflow-hidden rounded-lg border border-white/10 bg-black/85 shadow-[0_18px_40px_-15px_rgba(0,0,0,0.7)] backdrop-blur-md"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        {src ? (
          <img
            src={src}
            alt=""
            draggable={false}
            className={`h-full w-full object-cover transition-opacity duration-100 ${
              loading ? "opacity-40" : "opacity-100"
            }`}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-white/5 to-transparent" />
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-white/70" />
          </div>
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

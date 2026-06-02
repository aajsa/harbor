import { useEffect, useState } from "react";

type Ratio = "portrait" | "landscape" | "wide";

const ASPECT: Record<Ratio, string> = {
  portrait: "aspect-[2/3]",
  landscape: "aspect-[16/9]",
  wide: "aspect-[16/7]",
};

export function Poster({
  src,
  seed,
  ratio = "portrait",
  className = "",
  children,
  onError,
}: {
  src?: string;
  seed: string;
  ratio?: Ratio;
  className?: string;
  children?: React.ReactNode;
  onError?: () => void;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);
  const showGradient = !src || failed;
  const hue = hash(seed) % 360;

  return (
    <div
      className={`harbor-poster relative overflow-hidden rounded-xl ${ASPECT[ratio]} ${className}`}
      style={showGradient ? { background: gradient(hue) } : undefined}
    >
      {!showGradient && (
        <img
          key={src}
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => {
            setFailed(true);
            onError?.();
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {children}
    </div>
  );
}

function gradient(hue: number) {
  const a = hue;
  const b = (hue + 140) % 360;
  const c = (hue + 60) % 360;
  return `
    radial-gradient(ellipse at 25% 30%, oklch(0.45 0.14 ${a}) 0%, transparent 55%),
    radial-gradient(ellipse at 75% 75%, oklch(0.32 0.10 ${b}) 0%, transparent 55%),
    linear-gradient(135deg, oklch(0.20 0.05 ${c}), oklch(0.10 0.02 ${b}))
  `;
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

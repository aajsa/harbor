import { useEffect, useState } from "react";

export function TitlePlate({ title, logo, loading }: { title: string; logo?: string; loading: boolean }) {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  useEffect(() => {
    setLogoLoaded(false);
    setLogoFailed(false);
  }, [logo]);
  const logoVisible = !!logo && !logoFailed && logoLoaded;
  if (loading) return <div className="min-h-[120px]" />;
  return (
    <div className="relative flex min-h-[120px] flex-col justify-end">
      <h1
        className="font-display text-[80px] font-medium leading-[0.95] tracking-tight text-ink transition-opacity duration-300"
        style={{ opacity: logoVisible ? 0 : 1 }}
      >
        {title}
      </h1>
      {logo && !logoFailed && (
        <img
          src={logo}
          alt={title}
          decoding="async"
          onLoad={() => setLogoLoaded(true)}
          onError={() => setLogoFailed(true)}
          className="absolute bottom-0 left-0 max-h-[124px] w-auto max-w-[440px] object-contain object-left drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)]"
          style={{
            opacity: logoLoaded ? 1 : 0,
            transition: "opacity 360ms cubic-bezier(0.32, 0.72, 0.24, 1)",
          }}
        />
      )}
    </div>
  );
}

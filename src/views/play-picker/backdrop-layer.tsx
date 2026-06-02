export function BackdropLayer({ src }: { src?: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {src && (
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-50"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-canvas/30 via-canvas/85 to-canvas" />
      <div className="absolute inset-0 bg-gradient-to-r from-canvas/55 via-transparent to-canvas/55" />
    </div>
  );
}

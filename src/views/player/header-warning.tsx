export function HeaderWarning(props: { onPickAnother: () => void }) {
  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-32 z-30 mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-white/15 bg-black/75 px-6 py-5 text-center text-white backdrop-blur-xl">
      <p className="text-[14px] leading-snug">
        This file is flagged as not web-playable. Try the mpv backend in Settings or pick another stream.
      </p>
      <button
        onClick={props.onPickAnother}
        className="rounded-full bg-accent px-4 py-1.5 text-[13px] font-semibold text-canvas transition-colors hover:bg-accent/90"
      >
        Pick another
      </button>
    </div>
  );
}

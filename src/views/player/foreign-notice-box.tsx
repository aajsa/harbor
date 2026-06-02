export function ForeignNoticeBox(props: {
  title: string | null;
  onDismiss: () => void;
}) {
  return (
    <div className="pointer-events-auto absolute right-6 bottom-32 z-30 flex max-w-sm items-center gap-3 rounded-2xl border border-white/15 bg-black/72 px-4 py-3 text-white backdrop-blur-xl">
      <div className="flex flex-col">
        <span className="text-[11px] uppercase tracking-wider text-white/55">Now watching</span>
        <span className="text-[14px] font-medium">{props.title ?? "Something else"}</span>
        <span className="text-[12px] text-white/60">Pick it from the home view to follow.</span>
      </div>
      <button
        onClick={props.onDismiss}
        className="rounded-full bg-white/12 px-3 py-1 text-[12px] hover:bg-white/22"
      >
        Dismiss
      </button>
    </div>
  );
}

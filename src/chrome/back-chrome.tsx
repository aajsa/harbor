import { ArrowLeft } from "lucide-react";
import { useView } from "@/lib/view";

export function BackChrome() {
  const { canGoBack, goBack, topKind, chromeHidden } = useView();
  if (!canGoBack || chromeHidden) return null;
  if (topKind === "picker") return null;
  return (
    <button
      onClick={goBack}
      className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-edge-soft/60 bg-canvas/85 pl-3 pr-5 text-[13.5px] font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
    >
      <ArrowLeft size={15} />
      Back
    </button>
  );
}

import { Pencil, RotateCcw } from "lucide-react";
import type { HomeRowCustomization } from "@/lib/home-customization";

export function CustomizeBar({
  editMode,
  customization,
  onToggleEdit,
  onReset,
}: {
  editMode: boolean;
  customization: HomeRowCustomization;
  onToggleEdit: () => void;
  onReset: () => void;
}) {
  const hasChanges =
    customization.order.length > 0 ||
    customization.hidden.length > 0 ||
    Object.keys(customization.renamed).length > 0;
  return (
    <div className="flex items-center justify-end gap-2">
      {editMode && hasChanges && (
        <button
          onClick={onReset}
          className="flex h-8 items-center gap-1.5 rounded-md border border-edge-soft/40 bg-canvas/80 px-2.5 text-[12px] font-medium text-ink-muted backdrop-blur-md transition-colors hover:bg-canvas hover:text-ink"
        >
          <RotateCcw size={12} strokeWidth={2.2} />
          Reset
        </button>
      )}
      <button
        onClick={onToggleEdit}
        className={`flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[12px] font-medium backdrop-blur-md transition-colors ${
          editMode
            ? "border-ink bg-ink text-canvas hover:opacity-90"
            : "border-edge-soft/40 bg-canvas/80 text-ink-muted hover:bg-canvas hover:text-ink"
        }`}
      >
        <Pencil size={12} strokeWidth={2.4} />
        {editMode ? "Done editing" : "Customize home"}
      </button>
    </div>
  );
}

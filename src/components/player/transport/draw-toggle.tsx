import { Eye, EyeOff, Pencil } from "lucide-react";
import { BigButton } from "./big-button";

export function DrawToggle({
  active,
  hideOthers,
  onToggle,
  onToggleHideOthers,
}: {
  active: boolean;
  hideOthers: boolean;
  onToggle: () => void;
  onToggleHideOthers: () => void;
}) {
  return (
    <div className="flex items-center">
      <BigButton
        onClick={onToggle}
        ariaLabel={active ? "Stop drawing" : "Draw on screen"}
        tooltip={active ? "Stop drawing" : "Draw"}
        active={active}
      >
        <Pencil size={22} strokeWidth={2} />
      </BigButton>
      {active && (
        <BigButton
          onClick={onToggleHideOthers}
          ariaLabel={hideOthers ? "Show others' drawings" : "Hide others' drawings"}
          tooltip={hideOthers ? "Show others' drawings" : "Hide others' drawings"}
          active={hideOthers}
        >
          {hideOthers ? <EyeOff size={22} strokeWidth={2} /> : <Eye size={22} strokeWidth={2} />}
        </BigButton>
      )}
    </div>
  );
}

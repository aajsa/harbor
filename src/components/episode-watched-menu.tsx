import { Check, Eye, EyeOff } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { setManualWatched, setManualWatchedUpTo } from "@/lib/manual-watched";

export type WatchedMenuTarget = {
  x: number;
  y: number;
  season: number;
  episode: number;
  watched: boolean;
};

export function EpisodeWatchedMenu({
  metaId,
  target,
  onClose,
}: {
  metaId: string;
  target: WatchedMenuTarget;
  onClose: () => void;
}) {
  useEffect(() => {
    const onDown = () => onClose();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onClose, true);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onClose, true);
    };
  }, [onClose]);

  const left = Math.min(target.x, window.innerWidth - 232);
  const top = Math.min(target.y, window.innerHeight - 128);

  return createPortal(
    <div
      role="menu"
      style={{ left, top }}
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed z-[320] flex w-[224px] flex-col rounded-xl border border-edge bg-elevated p-1 shadow-[0_18px_50px_-15px_rgba(0,0,0,0.7)] animate-popover-in"
    >
      {target.watched ? (
        <Item
          icon={<EyeOff size={14} strokeWidth={2} />}
          label="Mark as unwatched"
          onClick={() => {
            setManualWatched(metaId, target.season, target.episode, false);
            onClose();
          }}
        />
      ) : (
        <>
          <Item
            icon={<Check size={14} strokeWidth={2} />}
            label="Mark as watched"
            onClick={() => {
              setManualWatched(metaId, target.season, target.episode, true);
              onClose();
            }}
          />
          <Item
            icon={<Eye size={14} strokeWidth={2} />}
            label="Mark watched up to here"
            onClick={() => {
              setManualWatchedUpTo(metaId, target.season, target.episode, true);
              onClose();
            }}
          />
        </>
      )}
    </div>,
    document.body,
  );
}

function Item({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className="flex h-9 items-center gap-2.5 rounded-lg px-3 text-left text-[13px] text-ink transition-colors hover:bg-raised"
    >
      <span className="text-ink-muted">{icon}</span>
      {label}
    </button>
  );
}

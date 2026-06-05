import { useEffect, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

export function AnchoredMenu({
  anchorRef,
  open,
  onClose,
  width,
  children,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  width?: number;
  children: ReactNode;
}) {
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = anchorRef.current?.getBoundingClientRect();
      if (!r) return;
      const w = Math.max(r.width, width ?? 0);
      const left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
      setPos({ top: r.bottom + 6, left, width: w });
    };
    place();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, anchorRef, width, onClose]);

  if (!open || !pos) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[300]" onMouseDown={onClose} />
      <div className="fixed z-[310]" style={{ top: pos.top, left: pos.left, width: pos.width }}>
        {children}
      </div>
    </>,
    document.body,
  );
}

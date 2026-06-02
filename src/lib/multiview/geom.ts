export type ScreenRect = { x: number; y: number; w: number; h: number };

export function screenRectForEl(el: HTMLElement): ScreenRect | null {
  const r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return null;
  const dpr = window.devicePixelRatio || 1;
  return {
    x: Math.round(r.left * dpr),
    y: Math.round(r.top * dpr),
    w: Math.max(1, Math.round(r.width * dpr)),
    h: Math.max(1, Math.round(r.height * dpr)),
  };
}

import { useEffect, useRef, type RefObject } from 'react';
import { SFX } from '@/lib/sfx';
import { isModalOverlayOpen, modalOverlayClose } from '@/lib/modal-overlay';

export type Dir = 'up' | 'down' | 'left' | 'right';

const SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  '[data-focusable="true"]',
].join(', ');

const KEY_TO_DIR: Record<string, Dir> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Up: 'up',
  Down: 'down',
  Left: 'left',
  Right: 'right',
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right',
};

const CODE_TO_DIR: Record<string, Dir> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
};

const KEYCODE_TO_DIR: Record<number, Dir> = {
  38: 'up',
  40: 'down',
  37: 'left',
  39: 'right',
  19: 'up',
  20: 'down',
  21: 'left',
  22: 'right',
  87: 'up',
  83: 'down',
  65: 'left',
  68: 'right',
};

const CENTER_KEYCODES = new Set([13, 23, 32]);
const BACK_KEYCODES = new Set([27, 4, 461, 10009, 166]);
const BACK_KEYS = new Set(['Escape', 'Esc', 'BrowserBack', 'GoBack', 'Back']);

const MODAL_SELECTOR = '[role="dialog"], [aria-modal="true"]';

const LOCAL_KEYBOARD_SELECTOR = [
  '[role="listbox"]',
  '[role="menu"]',
  '[role="grid"]',
  '[role="tree"]',
  '[role="tablist"]',
].join(', ');

const AXIS_TOLERANCE = 24;

let activeSearchEditEl: HTMLElement | null = null;
let lastFocusedEl: HTMLElement | null = null;
let focusStylesInjected = false;

function isEditable(el: HTMLElement | null) {
  if (!el) return false;

  return (
    el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT' ||
    el.isContentEditable
  );
}

/**
 * Fields that use HTPC search-edit mode (Enter arms caret typing).
 * Prefer type/role/inputmode — not translated label text.
 */
export function isSearchLikeField(el: HTMLElement | null) {
  if (!el) return false;

  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
    return false;
  }

  const type = (el.getAttribute('type') || '').toLowerCase();
  const role = (el.getAttribute('role') || '').toLowerCase();
  const inputMode = (el.getAttribute('inputmode') || '').toLowerCase();
  const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
  const placeholder = (el.getAttribute('placeholder') || '').toLowerCase();
  const name = (el.getAttribute('name') || '').toLowerCase();

  return (
    type === 'search' || role === 'searchbox' || inputMode === 'search' ||
    ariaLabel.includes('search') || placeholder.includes('search') ||
    placeholder.includes('بحث') || name.includes('search') || name.includes('query')
  );
}

function isVisible(el: HTMLElement) {
  if (!el.isConnected) return false;
  if (el.closest('[hidden], [inert], [aria-hidden="true"]')) return false;

  const style = window.getComputedStyle(el);

  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    parseFloat(style.opacity) === 0
  ) {
    return false;
  }

  const rect = el.getBoundingClientRect();

  return rect.width > 0 && rect.height > 0 && el.getClientRects().length > 0;
}

function isInSidebar(el: HTMLElement): boolean {
  return !!el.closest('[data-harbor-sidebar]');
}

/** Horizontal top chrome (TopDock / Royal / etc.) — not the left sidebar. */
function isInTopChrome(el: HTMLElement): boolean {
  return !!el.closest("[data-tv-top-chrome]");
}

function isInNav(el: HTMLElement): boolean {
  return !!el.closest('[data-harbor-nav]');
}

function zoneOf(el: HTMLElement): 'nav' | 'chrome' | 'hero' | 'content' {
  if (isInTopChrome(el)) return 'chrome';
  if (isInNav(el)) return 'nav';
  if (el.closest('[data-tv-hero-zone]')) return 'hero';

  return 'content';
}

function getSoundType(el: HTMLElement): 'light' | 'movie' {
  if (isInNav(el)) return 'light';
  if (el.closest('[role="dialog"], [role="menu"], [role="tablist"], [role="switch"], form, .settings-panel')) return 'light';
  
  const isMovieContainer = el.closest('[data-media-card], [data-movie-card], .media-card, [data-tv-hero-zone]');
  if (isMovieContainer && (el.querySelector('img') || el.hasAttribute('data-media-card') || el.classList.contains('media-card'))) {
    return 'movie';
  }
  return 'light';
}

function getFocusable(root: ParentNode = document): HTMLElement[] {
  const all = Array.from(root.querySelectorAll<HTMLElement>(SELECTOR)).filter(isVisible);
  return all.filter((el) => !all.some((other) => other !== el && other.contains(el)));
}

function getFocusableInZone(zone: 'nav' | 'hero' | 'content', root: ParentNode = document): HTMLElement[] {
  return getFocusable(root).filter((el) => zoneOf(el) === zone);
}

function getNavCandidates(root: ParentNode = document): HTMLElement[] {
  return getFocusable(root).filter(isInNav);
}

function getRect(el: HTMLElement) {
  const r = el.getBoundingClientRect();

  return {
    left: r.left,
    right: r.right,
    top: r.top,
    bottom: r.bottom,
    width: r.width,
    height: r.height,
    cx: r.left + r.width / 2,
    cy: r.top + r.height / 2,
  };
}

function overlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
) {
  return Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));
}

function findClosestByY(
  from: HTMLElement,
  candidates: HTMLElement[],
): HTMLElement | null {
  const src = getRect(from);

  let best: HTMLElement | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const el of candidates) {
    if (el === from) continue;

    const dst = getRect(el);
    const score = Math.abs(dst.cy - src.cy) * 10 + Math.abs(dst.cx - src.cx);

    if (score < bestScore) {
      best = el;
      bestScore = score;
    }
  }

  return best;
}

function hasLeftNeighborInRow(active: HTMLElement, root: ParentNode = document): boolean {
  const src = getRect(active);
  const all = getFocusable(root).filter((el) => el !== active && !isInNav(el));

  return all.some((el) => {
    const dst = getRect(el);
    const sameRow = Math.abs(dst.cy - src.cy) < Math.max(24, src.height * 0.6);
    return sameRow && dst.cx < src.cx - 8;
  });
}

function getActiveModal(target: HTMLElement | null) {
  const owned = target?.closest<HTMLElement>(MODAL_SELECTOR);

  if (owned && isVisible(owned)) return owned;

  const modals = Array.from(
    document.querySelectorAll<HTMLElement>(MODAL_SELECTOR),
  ).filter(isVisible);

  return modals[modals.length - 1] ?? null;
}

const NAV_FOCUS_SELECTOR =
  "[data-tv-top-chrome] button, [data-tv-top-chrome] a[href], [data-harbor-nav][data-active], [data-harbor-nav], [data-tv-nav-zone] button, [data-harbor-sidebar] button, [data-tv-nav-zone] a[href], [data-tv-nav-zone] [data-focusable='true']";

function focusNavChrome() {
  const nav = document.querySelector<HTMLElement>(NAV_FOCUS_SELECTOR);
  if (nav) focusElement(nav);
}

/** Focus the page's primary control (Play, etc.) or first content focusable. */
export function focusTvPageDefault(): void {
  ensureFocusStyles();
  const scope = getTopFocusScope();
  if (scope) {
    const scoped = getFocusable(scope);
    const first = getInitialFocus(scoped);
    if (first) focusElement(first);
    return;
  }
  const marked = document.querySelector<HTMLElement>("[data-tv-initial-focus]");
  if (marked && isVisible(marked)) {
    focusElement(marked);
    return;
  }
  const content = getFocusableInZone("content");
  const first = getInitialFocus(content);
  if (first) focusElement(first);
}

const MODAL_CLOSE_SELECTOR = "[data-tv-modal-close]";

/** Close the top TV focus-scoped modal via its close control, if any. */
function closeTopFocusScope(): boolean {
  if (isModalOverlayOpen()) {
    void modalOverlayClose();
    return true;
  }
  // Player root traps focus but is not dismissible — skip it.
  const scopes = Array.from(
    document.querySelectorAll<HTMLElement>("[data-tv-focus-scope]"),
  ).filter((el) => isVisible(el) && !el.hasAttribute("data-harbor-player"));
  const scope = scopes[scopes.length - 1] ?? null;
  if (!scope) return false;
  const closer = scope.querySelector<HTMLElement>(MODAL_CLOSE_SELECTOR);
  if (!closer) return false;
  closer.click();
  return true;
}

function ensureFocusStyles() {
  if (focusStylesInjected || typeof document === 'undefined') return;

  focusStylesInjected = true;

  const style = document.createElement('style');
  style.setAttribute('data-tv-focus-styles', 'true');

  style.textContent = `
    [data-tv-focused="true"]:not([data-search-editing="true"]) {
      outline: none !important;
      box-shadow:
        0 0 0 4px var(--tv-focus-ring, #ff8a00),
        0 0 0 8px rgba(255, 138, 0, 0.30) !important;
      transition: box-shadow 120ms ease;
      z-index: 20;
      position: relative;
    }

    [data-search-editing="true"] {
      outline: none !important;
      border-color: #ffffff !important;
      box-shadow:
        0 0 0 3px #ffffff,
        0 0 0 7px rgba(255, 255, 255, 0.45),
        0 0 18px rgba(255, 255, 255, 0.35) !important;
      background-color: rgba(255, 255, 255, 0.08) !important;
      transition: box-shadow 120ms ease, border-color 120ms ease !important;
    }
  `;

  document.head.appendChild(style);
}

function isLocallyManaged(target: HTMLElement | null) {
  return !!target?.closest(LOCAL_KEYBOARD_SELECTOR);
}

function getDirection(e: KeyboardEvent): Dir | null {
  if (KEY_TO_DIR[e.key]) return KEY_TO_DIR[e.key];
  if (CODE_TO_DIR[e.code]) return CODE_TO_DIR[e.code];

  return KEYCODE_TO_DIR[e.keyCode] ?? null;
}

function isBackKey(e: KeyboardEvent) {
  return BACK_KEYS.has(e.key) || BACK_KEYCODES.has(e.keyCode);
}

function getInitialFocus(list: HTMLElement[]) {
  return (
    list.find((el) => el.hasAttribute('data-tv-initial-focus')) ??
    list[0] ??
    null
  );
}

function enterSearchEditMode(el: HTMLElement) {
  ensureFocusStyles();

  if (activeSearchEditEl && activeSearchEditEl !== el) {
    activeSearchEditEl.removeAttribute('data-search-editing');
  }

  if (lastFocusedEl && lastFocusedEl !== el) {
    lastFocusedEl.removeAttribute('data-tv-focused');
  }

  activeSearchEditEl = el;
  lastFocusedEl = el;

  el.setAttribute('data-tv-focused', 'true');
  el.setAttribute('data-search-editing', 'true');
  el.focus({ preventScroll: true });
}

function focusElement(el: HTMLElement) {
  ensureFocusStyles(); 

  if (lastFocusedEl && lastFocusedEl !== el) {
    lastFocusedEl.removeAttribute('data-tv-focused');
  }

  if (activeSearchEditEl && activeSearchEditEl !== el) {
    activeSearchEditEl.removeAttribute('data-search-editing');
    activeSearchEditEl = null;
  }

  el.setAttribute('data-tv-focused', 'true');
  lastFocusedEl = el;

  el.focus({ preventScroll: true });

  if (isInHero(el)) {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    return;
  }
  el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
}

function enterSearchEditMode(el: HTMLElement) {
  activeSearchEditEl = el;
  el.setAttribute('data-search-editing', 'true');
  el.focus({ preventScroll: true });

  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const len = el.value.length;
    try { el.setSelectionRange(len, len); } catch { }
  }
}

function exitSearchEditMode() {
  if (!activeSearchEditEl) return;

  const el = activeSearchEditEl;
  activeSearchEditEl = null;

  el.removeAttribute('data-search-editing');

  if (isHomeSearch(el)) {
    el.removeAttribute('data-tv-focused');

    if (lastFocusedEl === el) {
      lastFocusedEl = null;
    }

    el.blur();
    return;
  }

  focusElement(el);
}

function exitNavigationMode() {
  if (activeSearchEditEl) {
    activeSearchEditEl.removeAttribute('data-search-editing');
    activeSearchEditEl = null;
  }

  if (lastFocusedEl) {
    lastFocusedEl.removeAttribute('data-tv-focused');
    lastFocusedEl = null;
  }

  const active =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

  active?.blur();
}

function findBest(
  focused: HTMLElement,
  candidates: HTMLElement[],
  dir: Dir,
) {
  const src = getRect(focused);

  let best: HTMLElement | null = null;
  let bestScore = Number.POSITIVE_INFINITY;
  const horizontal = dir === 'left' || dir === 'right';
  const rowSlop = Math.max(24, src.height * 0.6);

  for (const el of candidates) {
    if (el === focused) continue;

    const dst = getRect(el);

    if (dir === 'right' && dst.cx <= src.cx + AXIS_TOLERANCE) continue;
    if (dir === 'left' && dst.cx >= src.cx - AXIS_TOLERANCE) continue;
    if (dir === 'down' && dst.cy <= src.cy + AXIS_TOLERANCE) continue;
    if (dir === 'up' && dst.cy >= src.cy - AXIS_TOLERANCE) continue;

    const horizontal = dir === 'left' || dir === 'right';
    const primary = dir === 'right' ? Math.max(0, dst.left - src.right) :
                    dir === 'left' ? Math.max(0, src.left - dst.right) :
                    dir === 'down' ? Math.max(0, dst.top - src.bottom) : Math.max(0, src.top - dst.bottom);

    const secondary = horizontal
      ? Math.abs(dst.cy - src.cy)
      : Math.abs(dst.cx - src.cx);

    const axisOverlap = horizontal
      ? overlap(src.top, src.bottom, dst.top, dst.bottom)
      : overlap(src.left, src.right, dst.left, dst.right);

    const score =
      primary * 10 +
      secondary * 3 -
      (axisOverlap > 0 ? axisOverlap * 10 : 0);

    if (score < bestScore) {
      best = el;
      bestScore = score;
    }
  }

  return best;
}

function getSpatialOrder(list: HTMLElement[]) {
  return [...list].sort((a, b) => {
    const ra = getRect(a);
    const rb = getRect(b);

    if (Math.abs(ra.top - rb.top) > 8) {
      return ra.top - rb.top;
    }

    return ra.left - rb.left;
  });
}

export function moveFocus(dir: Dir, wrap: boolean = true): void {
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const root = getActiveModal(active) ?? getTopFocusScope() ?? document;
  const scroll = dir === "left" || dir === "right" ? "nearest" : "center";

  if (active && dir === 'left' && !isInSidebar(active)) {
    if (!hasHorizontalNeighborInRow(active, "left", root)) {
      const sidebarItems = getFocusable(root).filter(isInSidebar);
      const targetNav = findClosestByY(active, sidebarItems);
      if (targetNav) {
        SFX.navigate(dir, getSoundType(targetNav));
        focusElement(targetNav, "none");
        return;
      }
      // Start of a content row with no sidebar — stay put.
      return;
    }
  }

  if (active && dir === 'right' && !isInSidebar(active)) {
    // End of a shelf (loaded or still loading) — stay put; Down is how you leave the row.
    if (!hasHorizontalNeighborInRow(active, "right", root)) return;
  }

  if (active && dir === 'right' && isInSidebar(active)) {
    const contentItems = getFocusable(root).filter((el) => !isInSidebar(el));
    const targetContent = findClosestByY(active, contentItems);
    if (targetContent) {
      SFX.navigate(dir, getSoundType(targetContent));
      focusElement(targetContent, "center");
      return;
    }
  }

  // Top chrome is its own nav strip — Down leaves to page content (like sidebar Right).
  if (active && dir === 'down' && isInTopChrome(active)) {
    const contentItems = getFocusableInZone('content', root);
    const first = getInitialFocus(contentItems);
    if (first) {
      SFX.navigate(dir, getSoundType(first));
      focusElement(first, "center");
      return;
    }
  }

  const zone = active ? zoneOf(active) : 'content';
  const all = getFocusableInZone(zone, root);
  if (!all.length) return;

  if (!active || !all.includes(active)) {
    // Prefer page primary CTA over DOM-order (avoids sidebar collapse).
    if (zone === "content") {
      const marked = document.querySelector<HTMLElement>("[data-tv-initial-focus]");
      if (marked && isVisible(marked) && all.includes(marked)) {
        focusElement(marked, "center");
        return;
      }
    }
    const first = getInitialFocus(all);
    if (first) {
      SFX.navigate(dir, getSoundType(first));
      focusElement(first, "center");
    }
    return;
  }

  if (zone === 'hero' && (dir === 'up' || dir === 'down')) {
    if (dir === 'down') {
      const contentItems = getFocusableInZone('content', root);
      const first = getInitialFocus(contentItems);
      if (first) {
        SFX.navigate(dir, getSoundType(first));
        focusElement(first, "center");
      }
    }
    return;
  }

  const best = findBest(active, all, dir);
  if (best) {
    SFX.navigate(dir, getSoundType(best));
    focusElement(best, scroll);
    return;
  }

  // Don't wrap Left/Right onto another shelf when the current row is exhausted.
  if (dir === "left" || dir === "right") return;

  // Content with nowhere above → enter the top chrome strip.
  if (dir === 'up' && zone === 'content') {
    const topItems = getFocusable(root).filter(isInTopChrome);
    const target = findBest(active, topItems, 'up') ?? findClosestByY(active, topItems);
    if (target) {
      SFX.navigate(dir, getSoundType(target));
      focusElement(target, "none");
      return;
    }
  }

  if (wrap) {
    const ordered = getSpatialOrder(all);
    const idx = ordered.indexOf(active);
    if (idx >= 0) {
      const next = dir === 'down' ? ordered[idx + 1] ?? ordered[0] : ordered[idx - 1] ?? ordered[ordered.length - 1];
      if (next) {
        SFX.navigate(dir, getSoundType(next));
        focusElement(next, scroll);
      }
    }
  }
}

type TVNavigationOptions = {
  enabled?: boolean;
  wrap?: boolean;
  arrows?: boolean;
  onBack?: () => boolean;
  onBackToNav?: () => void;
};

type RemoteBackFns = {
  onBack?: () => boolean;
  onBackToNav?: () => void;
  wrap?: boolean;
};

let remoteBackFns: RemoteBackFns = {};
let remoteBackOwner: object | null = null;

/**
 * When a popover/menu opens, move TV focus into its data-tv-focus-scope so
 * arrows stay in the menu instead of jumping to page content underneath.
 */
export function useTvFocusScope(open: boolean, rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      const root = rootRef.current;
      if (!root) return;
      const scope = root.matches("[data-tv-focus-scope]")
        ? root
        : root.querySelector<HTMLElement>("[data-tv-focus-scope]");
      if (!scope || !isVisible(scope)) return;
      const target =
        scope.querySelector<HTMLElement>("[data-tv-initial-focus]") ?? getFocusable(scope)[0] ?? null;
      if (target) focusElement(target);
    });
    return () => window.cancelAnimationFrame(id);
  }, [open, rootRef]);
}

export function useKeyboardNavigation(options: TVNavigationOptions = {}) {
  const { enabled = true, wrap = true, onBack, onBackToNav } = options;

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;

      const target = e.target instanceof HTMLElement ? e.target : null;

      const active =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      const activeModal = getActiveModal(target);
      const activeIsSearch = isSearchLikeField(active);
      const isEditingSearch = !!activeSearchEditEl && activeSearchEditEl === active;

      if (e.key === 'Escape' && isEditingSearch) {
        e.preventDefault();
        e.stopPropagation();

        const root = activeModal ?? document;
        const first = getInitialFocus(getFocusableInZone('content', root));

        if (first) {
          SFX.navigate(dir);
          focusElement(first);
        }

        return;
      }

      if (isBackKey(e)) {
        if (activeModal) return;
        e.preventDefault();
        e.stopPropagation();
        SFX.close();

        const handled = onBack ? onBack() : false;
        if (!handled) {
          if (onBackToNav) {
            onBackToNav();
          } else {
            const nav = document.querySelector<HTMLElement>('[data-harbor-nav] [data-focusable="true"], [data-harbor-nav] a[href], [data-harbor-nav] button');
            if (nav) focusElement(nav);
          }
        }
        return;
      }

      if (isEditable(target) && !isSearchLikeField(target)) return;

      if (dir) {
        if (!arrowsRef.current) return;
        e.preventDefault();
        e.stopPropagation();

        const root = activeModal ?? document;

        if (active && dir === 'left' && !isInNav(active)) {
          if (!hasLeftNeighborInRow(active, root)) {
            const navItems = getNavCandidates(root);
            const targetNav = findClosestByY(active, navItems);
            if (targetNav) {
              SFX.navigate(dir, getSoundType(targetNav));
              focusElement(targetNav);
              return;
            }
          }
        }

        if (active && dir === 'right' && isInNav(active)) {
          const contentItems = getFocusable(root).filter((el) => !isInNav(el));
          const targetContent = findClosestByY(active, contentItems);
          if (targetContent) {
            SFX.navigate(dir, getSoundType(targetContent));
            focusElement(targetContent);
            return;
          }
        }

        const zone = active ? zoneOf(active) : 'content';
        const all = getFocusableInZone(zone, root);
        if (!all.length) return;

        if (!active || !all.includes(active)) {
          const first = getInitialFocus(all);
          if (first) {
            SFX.navigate(dir, getSoundType(first));
            focusElement(first);
          }
          return;
        }

        if (zone === 'hero' && (dir === 'up' || dir === 'down')) {
          if (dir === 'down') {
            const contentItems = getFocusableInZone('content', root);
            const first = getInitialFocus(contentItems);
            if (first) {
              SFX.navigate(dir, getSoundType(first));
              focusElement(first);
            }
          }
          return;
        }

        const best = findBest(active, all, dir);
        if (best) {
          SFX.navigate(dir, getSoundType(best));
          focusElement(best);
          return;
        }

        if (wrap) {
          const ordered = getSpatialOrder(all);
          const idx = ordered.indexOf(active);
          if (idx >= 0) {
            const next = dir === 'down' || dir === 'right' ? ordered[idx + 1] ?? ordered[0] : ordered[idx - 1] ?? ordered[ordered.length - 1];
            if (next) {
              SFX.navigate(dir, getSoundType(next));
              focusElement(next);
            }
          }
        }
        return;
      }

      const isCenter =
        CENTER_KEYCODES.has(e.keyCode) ||
        e.key === 'Enter' ||
        e.code === 'Enter' ||
        e.key === ' ' ||
        e.code === 'Space';

      if (!isCenter) return;

      const currentActive =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      if (!currentActive) return;

      if (isSearchLikeField(currentActive)) {
        e.preventDefault();
        e.stopPropagation();

        SFX.open();
        enterSearchEditMode(currentActive);

        return;
      }

      if (isEditable(currentActive)) return;

      e.preventDefault();
      e.stopPropagation();
      currentActive.click(); 
    };

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('pointerdown', onPointerDown, true);

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      if (activeSearchEditEl) {
        activeSearchEditEl.removeAttribute('data-search-editing');
        activeSearchEditEl = null;
      }
    };
    // onBack/onBackToNav are mirrored into refs — omit from deps so unstable
    // inline callbacks (e.g. player) don't rebind the capture listener every render.
  }, [enabled, wrap, arrows]);
}

/**
 * Phone touchpad entry point.
 * Arrows call moveFocus directly (synthetic keydown fights player hotkeys).
 * Select/back use DOM click / the registered Back handlers (synthetic Enter/Esc are ignored by Chromium).
 */
export function dispatchTvNav(action: Dir | "select" | "back"): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("harbor:user-activity"));
  }
  if (action === "select") {
    const active =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (active && !isEditable(active)) active.click();
    return;
  }

  if (action === "back") {
    const handled = remoteBackFns.onBack?.() ?? false;
    if (handled) return;
    if (remoteBackFns.onBackToNav) remoteBackFns.onBackToNav();
    else focusNavChrome();
    return;
  }

  moveFocus(action, remoteBackFns.wrap ?? true);
}

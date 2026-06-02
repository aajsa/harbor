const EVENT = "harbor:deeplink-install";

type DeepLinkInstallDetail = { rawUrl: string };

let pendingUrl: string | null = null;

export function emitDeepLinkInstall(rawUrl: string): void {
  pendingUrl = rawUrl;
  window.dispatchEvent(new CustomEvent<DeepLinkInstallDetail>(EVENT, { detail: { rawUrl } }));
}

export function consumePendingDeepLink(): string | null {
  const url = pendingUrl;
  pendingUrl = null;
  return url;
}

export function peekPendingDeepLink(): string | null {
  return pendingUrl;
}

export function clearPendingDeepLink(): void {
  pendingUrl = null;
}

export function onDeepLinkInstall(handler: (rawUrl: string) => void): () => void {
  const listener = (e: Event) => {
    const ev = e as CustomEvent<DeepLinkInstallDetail>;
    if (ev.detail?.rawUrl) handler(ev.detail.rawUrl);
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

function shouldForward(url: string): boolean {
  if (url.startsWith("harbor://")) return true;
  if (url.startsWith("stremio://")) {
    if (window.__harborInstallerOpen) return true;
    return !!window.__harborStremioDeeplink;
  }
  return url.includes("manifest.json");
}

export async function startDeepLinkBridge(): Promise<() => void> {
  const isTauri =
    typeof window !== "undefined" &&
    ("__TAURI__" in window || "__TAURI_INTERNALS__" in window);
  if (!isTauri) return () => {};
  try {
    const mod = await import("@tauri-apps/plugin-deep-link");
    const handle = (urls: string[]) => {
      for (const u of urls) {
        if (typeof u === "string" && u.length > 0 && shouldForward(u)) {
          emitDeepLinkInstall(u);
        }
      }
    };
    const unlisten = await mod.onOpenUrl(handle);
    const { listen } = await import("@tauri-apps/api/event");
    const unlistenNative = await listen<string>("harbor:stremio-deeplink", (e) => {
      const u = e.payload;
      if (typeof u === "string" && u && shouldForward(u)) emitDeepLinkInstall(u);
    });
    // Linux: the in-app Harbor Browser can't open stremio://, so browser.rs
    // intercepts the install link and emits it here. This is a trusted capture
    // (the user clicked Install inside our own browser), so it bypasses the
    // shouldForward gate and routes straight into the shared install path.
    let lastCap = "";
    let lastCapAt = 0;
    const unlistenBrowserCap = await listen<string>("harbor://browser-stremio-capture", (e) => {
      const u = e.payload;
      if (typeof u !== "string" || !u) return;
      const now = Date.now();
      if (u === lastCap && now - lastCapAt < 2500) return;
      lastCap = u;
      lastCapAt = now;
      emitDeepLinkInstall(u);
      void import("@tauri-apps/api/core").then(({ invoke }) =>
        invoke("browser_close").catch(() => {}),
      );
    });
    try {
      const initial = await mod.getCurrent();
      if (initial && initial.length > 0) handle(initial);
    } catch {
      /* noop */
    }
    return () => {
      try {
        unlisten();
      } catch {
        /* noop */
      }
      try {
        unlistenNative();
      } catch {
        /* noop */
      }
      try {
        unlistenBrowserCap();
      } catch {
        /* noop */
      }
    };
  } catch (e) {
    console.warn("[harbor] deep-link bridge failed", e);
    return () => {};
  }
}

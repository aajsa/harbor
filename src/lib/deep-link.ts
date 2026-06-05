const EVENT = "harbor:deeplink-install";

type DeepLinkDetail = { rawUrl: string };

let pendingUrl: string | null = null;

export function emitDeepLinkInstall(rawUrl: string): void {
  pendingUrl = rawUrl;
  window.dispatchEvent(new CustomEvent<DeepLinkDetail>(EVENT, { detail: { rawUrl } }));
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
    const ev = e as CustomEvent<DeepLinkDetail>;
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
        if (typeof u !== "string" || u.length === 0) continue;
        if (shouldForward(u)) emitDeepLinkInstall(u);
      }
    };
    const unlisten = await mod.onOpenUrl(handle);
    const { listen } = await import("@tauri-apps/api/event");
    const unlistenNative = await listen<string>("harbor:stremio-deeplink", (e) => {
      const u = e.payload;
      if (typeof u !== "string" || !u) return;
      if (shouldForward(u)) emitDeepLinkInstall(u);
    });
    let lastCap = "";
    let lastCapAt = 0;
    const forwardLinuxBrowserInstall = async (e: { payload: string }) => {
      const u = e.payload;
      if (typeof u !== "string" || !u) return;
      const now = Date.now();
      if (u === lastCap && now - lastCapAt < 2500) return;
      lastCap = u;
      lastCapAt = now;
      emitDeepLinkInstall(u);
      const { invoke } = await import("@tauri-apps/api/core");
      invoke("browser_close").catch(() => {});
    };
    const unlistenBrowserCap = await listen<string>(
      "harbor://browser-stremio-capture",
      forwardLinuxBrowserInstall,
    );
    try {
      const initial = await mod.getCurrent();
      if (initial && initial.length > 0) handle(initial);
    } catch {}
    return () => {
      try {
        unlisten();
      } catch {}
      try {
        unlistenNative();
      } catch {}
      try {
        unlistenBrowserCap();
      } catch {}
    };
  } catch (e) {
    console.warn("[harbor] deep-link bridge failed", e);
    return () => {};
  }
}

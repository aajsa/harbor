import { getCurrentWindow } from "@tauri-apps/api/window";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/App";
import { bootstrapDebugBridge, isDebugBridgeEnabled } from "@/lib/debug-bridge";
import { isLinuxDesktop, isMacDesktop, isWindowsDesktop } from "@/lib/platform";
import { ModalOverlayApp } from "@/views/modal-overlay-app";
import { PipApp } from "@/views/pip";
import "@/index.css";

function detectPipMode(): boolean {
  if (new URLSearchParams(window.location.search).get("pip") === "1") return true;
  try {
    const w = getCurrentWindow();
    if (w.label === "harbor-pip") return true;
  } catch {}
  return false;
}

function detectModalOverlay(): boolean {
  if (new URLSearchParams(window.location.search).get("harbor-modal") === "1") return true;
  try {
    const w = getCurrentWindow();
    if (w.label === "harbor-modal-overlay") return true;
  } catch {}
  return false;
}

const isPip = detectPipMode();
const isModal = detectModalOverlay();
if (isModal) {
  document.documentElement.style.background = "transparent";
  document.body.style.background = "transparent";
  document.body.style.backgroundColor = "transparent";
  const root = document.getElementById("root");
  if (root) {
    root.style.background = "transparent";
    root.style.backgroundColor = "transparent";
  }
}
if (!isPip && !isModal) {
  document.documentElement.dataset.os = isLinuxDesktop()
    ? "linux"
    : isMacDesktop()
      ? "macos"
      : isWindowsDesktop()
        ? "windows"
        : "web";
}
if (import.meta.env.DEV) console.log("[harbor] entry: pip =", isPip, "modal =", isModal, "label =", (() => { try { return getCurrentWindow().label; } catch { return "?"; } })());
if (!isPip && !isModal) {
  void (async () => {
    if (isDebugBridgeEnabled()) {
      bootstrapDebugBridge();
      console.log("[harbor-debug] bridge enabled (localStorage flag)");
      return;
    }
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const enabled = await invoke<boolean>("harbor_debug_is_enabled").catch(() => false);
      if (enabled) {
        const w = window as Window & { __HARBOR_DEBUG__?: boolean };
        w.__HARBOR_DEBUG__ = true;
        const mod = await import("@/lib/debug-bridge");
        mod.bootstrapDebugBridge();
        console.log("[harbor-debug] bridge enabled (HARBOR_DEBUG env)");
      }
    } catch {}
  })();
}
if (import.meta.env.DEV && !isPip && !isModal) {
  void import("./lib/streams/__fixtures__/verify").then((m) => m.logVerificationReport());
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>{isModal ? <ModalOverlayApp /> : isPip ? <PipApp /> : <App />}</StrictMode>,
);

requestAnimationFrame(() => {
  const boot = document.getElementById("harbor-boot");
  if (!boot) return;
  boot.classList.add("gone");
  setTimeout(() => boot.remove(), 260);
});

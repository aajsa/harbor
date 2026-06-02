export type Tab = "discover" | "browse" | "installed";

export type ToastInfo = {
  kind: "ok" | "error";
  text: string;
  addon?: { id: string; name: string; logo?: string | null };
};

export const CATEGORY_LABELS: Record<string, string> = {
  metadata: "Catalogs & metadata",
  streams: "Streams",
  subtitles: "Subtitles",
  anime: "Anime",
  sports: "Sports",
  "live-tv": "Live TV",
  tools: "Tools",
  adult: "Adult",
};

let pendingAddonsTab: Tab | null = null;

export function requestAddonsTab(tab: Tab): void {
  pendingAddonsTab = tab;
}

export function consumeAddonsTab(): Tab | null {
  const v = pendingAddonsTab;
  pendingAddonsTab = null;
  return v;
}

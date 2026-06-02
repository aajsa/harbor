import type { Meta } from "@/lib/cinemeta";
import type { PlayEpisode } from "@/lib/view";

const ILLEGAL = /[<>:"/\\|?*\x00-\x1F]/g;
const TRAILING = /[. ]+$/g;

export function sanitizeName(name: string): string {
  return name.replace(ILLEGAL, "").replace(TRAILING, "").trim().slice(0, 180);
}

export function extensionFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const m = path.match(/\.([a-z0-9]{2,5})(?:$|\?)/i);
    if (m) {
      const ext = m[1].toLowerCase();
      if (["mkv", "mp4", "webm", "avi", "mov", "ts", "m4v"].includes(ext)) {
        return ext;
      }
    }
  } catch {
    return "mkv";
  }
  return "mkv";
}

export function buildDefaultFilename(
  meta: Meta,
  episode: PlayEpisode | undefined,
  url: string,
): string {
  const ext = extensionFromUrl(url);
  const title = sanitizeName(meta.name || "video");
  if (episode) {
    const s = String(episode.season).padStart(2, "0");
    const e = String(episode.episode).padStart(2, "0");
    return `${title} - S${s}E${e}.${ext}`;
  }
  if (meta.releaseInfo) {
    return `${title} (${sanitizeName(meta.releaseInfo)}).${ext}`;
  }
  return `${title}.${ext}`;
}

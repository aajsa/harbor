import type { Meta } from "./cinemeta";
import type { LibraryItem } from "./stremio";

type CinemetaVideo = NonNullable<Meta["videos"]>[number];

export function decodeWatchedEpisodes(
  watchedField: string | null | undefined,
  videos: CinemetaVideo[] | undefined,
): Set<string> {
  const keys = new Set<string>();
  if (!watchedField || !videos || videos.length === 0) return keys;
  const parts = watchedField.split(":");
  if (parts.length < 3) return keys;
  const len = Number.parseInt(parts[1], 10);
  if (!Number.isFinite(len) || len <= 0) return keys;
  const b64 = parts.slice(2).join(":");
  let bytes: Uint8Array;
  try {
    const bin = atob(b64);
    bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  } catch {
    return keys;
  }
  const sortedVideos = videos
    .slice()
    .sort((a, b) => {
      const sa = a.season ?? 0;
      const sb = b.season ?? 0;
      if (sa !== sb) return sa - sb;
      return (a.episode ?? 0) - (b.episode ?? 0);
    });
  const setBits: number[] = [];
  for (let i = 0; i < bytes.length * 8; i++) {
    if ((bytes[i >> 3] & (0x80 >> (i & 7))) !== 0) setBits.push(i);
  }
  const tryMap = (ordered: CinemetaVideo[], label: string) => {
    const out = new Set<string>();
    for (const i of setBits) {
      if (i >= ordered.length) break;
      const v = ordered[i];
      if (v?.season != null && v?.episode != null) out.add(`${v.season}:${v.episode}`);
    }
    console.info(`[stremio-watched] ${label}: ${[...out].sort().join(", ")}`);
    return out;
  };
  console.info("[stremio-watched] raw", {
    header: parts[0],
    len,
    bytes: bytes.length,
    setBitIndices: setBits,
    totalVideos: videos.length,
    firstFewVideos: videos.slice(0, 5).map((v) => ({ id: v.id, s: v.season, e: v.episode })),
  });
  tryMap(videos, "raw-order");
  const sortedKeys = tryMap(sortedVideos, "sorted-by-se");
  return sortedKeys.size > 0 ? sortedKeys : tryMap(videos, "raw-fallback");
}

export function stremioMovieWatched(item: LibraryItem | null | undefined): boolean {
  if (!item) return false;
  return (item.state?.flaggedWatched ?? 0) > 0;
}

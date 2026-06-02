import type { LibraryItem } from "@/lib/stremio";

export function libraryItemWatchedKeys(item: LibraryItem): string[] {
  const id = item._id;
  if (!id) return [];

  if (/^tt\d+$/.test(id)) {
    if (item.type === "movie") return [`imdb:${id}`];
    const s = item.state?.season;
    const e = item.state?.episode;
    if (item.type === "series" && s != null && e != null) {
      return [`imdb:${id}:${s}:${e}`];
    }
    return [];
  }

  if (id.startsWith("tmdb:")) {
    const parts = id.split(":");
    const num = Number(parts[2]);
    if (!Number.isFinite(num)) return [];
    if (parts[1] === "movie") return [`tmdb:${num}`];
    if (parts[1] === "tv") {
      const s = item.state?.season;
      const e = item.state?.episode;
      if (s != null && e != null) return [`tmdb:${num}:${s}:${e}`];
    }
  }

  return [];
}

export function isLibraryItemWatched(
  item: LibraryItem,
  watched: Set<string>,
): boolean {
  if (watched.size === 0) return false;
  const keys = libraryItemWatchedKeys(item);
  for (const k of keys) {
    if (watched.has(k)) return true;
  }
  return false;
}

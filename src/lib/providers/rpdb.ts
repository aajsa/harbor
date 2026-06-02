export function rpdbPoster(key: string, metaId: string, fallback?: string): string | undefined {
  if (!key) return fallback;
  if (metaId.startsWith("tt")) {
    return `https://api.ratingposterdb.com/${key}/imdb/poster-default/${metaId}.jpg?fallback=true`;
  }
  const m = metaId.match(/^tmdb:(movie|tv):(\d+)$/);
  if (m) {
    return `https://api.ratingposterdb.com/${key}/tmdb/poster-default/${m[1]}-${m[2]}.jpg?fallback=true`;
  }
  return fallback;
}

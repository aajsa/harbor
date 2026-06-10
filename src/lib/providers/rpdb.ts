let posterBase = "";

export function setPosterBaseUrl(url: string): void {
  posterBase = url.trim().replace(/\/+$/, "");
}

export function rpdbPoster(key: string, metaId: string, fallback?: string): string | undefined {
  const base = posterBase || "https://api.ratingposterdb.com";
  if (!key && !posterBase) return fallback;
  const keySeg = key || "default";
  if (metaId.startsWith("tt")) {
    return `${base}/${keySeg}/imdb/poster-default/${metaId}.jpg?fallback=true`;
  }
  const m = metaId.match(/^tmdb:(movie|tv):(\d+)$/);
  if (m) {
    return `${base}/${keySeg}/tmdb/poster-default/${m[1]}-${m[2]}.jpg?fallback=true`;
  }
  return fallback;
}

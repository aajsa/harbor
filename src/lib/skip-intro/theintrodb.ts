import { safeFetch as fetch } from "@/lib/safe-fetch";
import type { SkipKind, SkipSegment } from "./types";

type RawSpan = { start_ms: number | null; end_ms: number | null };

type RawResponse = {
  tmdb_id?: number;
  type?: string;
  intro?: RawSpan[];
  recap?: RawSpan[];
  credits?: RawSpan[];
  preview?: RawSpan[];
};

const cache = new Map<string, SkipSegment[]>();

function pickId(metaId: string): { tmdb?: string; imdb?: string } | null {
  if (metaId.startsWith("tmdb:movie:")) return { tmdb: metaId.slice("tmdb:movie:".length) };
  if (metaId.startsWith("tmdb:tv:")) return { tmdb: metaId.slice("tmdb:tv:".length) };
  if (metaId.startsWith("tt")) return { imdb: metaId };
  return null;
}

function spanToSegment(
  span: RawSpan,
  kind: SkipKind,
  durationSec: number,
): SkipSegment | null {
  let startMs = span.start_ms ?? 0;
  let endMs = span.end_ms ?? Math.round(durationSec * 1000);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null;
  if (endMs <= startMs) return null;
  if (durationSec > 0 && startMs >= durationSec * 1000) return null;
  return {
    kind,
    startSec: startMs / 1000,
    endSec: endMs / 1000,
    source: "introdb",
  };
}

export async function fetchIntroDbSegments(
  metaId: string,
  episode: { season: number; episode: number } | undefined,
  durationSec: number,
): Promise<SkipSegment[]> {
  const ids = pickId(metaId);
  if (!ids) return [];

  const params = new URLSearchParams();
  if (ids.tmdb) params.set("tmdb_id", ids.tmdb);
  else if (ids.imdb) params.set("imdb_id", ids.imdb);
  if (episode) {
    params.set("season", String(episode.season));
    params.set("episode", String(episode.episode));
  }

  const cacheKey = params.toString();
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const res = await fetch(`https://api.theintrodb.org/v2/media?${cacheKey}`);
  if (!res.ok) {
    cache.set(cacheKey, []);
    return [];
  }
  const json = (await res.json()) as RawResponse;
  const out: SkipSegment[] = [];
  const collect = (spans: RawSpan[] | undefined, kind: SkipKind) => {
    if (!spans) return;
    for (const s of spans) {
      const seg = spanToSegment(s, kind, durationSec);
      if (seg) out.push(seg);
    }
  };
  collect(json.intro, "intro");
  collect(json.recap, "recap");
  collect(json.credits, "outro");
  collect(json.preview, "outro");
  out.sort((a, b) => a.startSec - b.startSec);
  cache.set(cacheKey, out);
  return out;
}

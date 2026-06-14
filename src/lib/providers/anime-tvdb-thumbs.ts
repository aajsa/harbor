import { tvdbEpisodes } from "@/lib/providers/tvdb";

export type TvdbThumbIndex = {
  bySeasonEpisode: Map<string, string>;
  byAbsolute: Map<number, string>;
};

export async function fetchTvdbThumbs(
  apiKey: string,
  seriesId: number,
  seasons: number[],
): Promise<TvdbThumbIndex> {
  const bySeasonEpisode = new Map<string, string>();
  const byAbsolute = new Map<number, string>();
  const wanted = seasons.length > 0 ? seasons : [1];
  const lists = await Promise.all(
    Array.from(new Set(wanted)).map((s) => tvdbEpisodes(apiKey, seriesId, s).catch(() => [])),
  );
  for (const list of lists) {
    for (const e of list) {
      if (!e.image) continue;
      bySeasonEpisode.set(`${e.seasonNumber}:${e.number}`, e.image);
    }
  }
  const flat = lists.flat().filter((e) => e.image);
  flat.sort((a, b) =>
    a.seasonNumber - b.seasonNumber || a.number - b.number,
  );
  let abs = 0;
  for (const e of flat) {
    abs += 1;
    if (!byAbsolute.has(abs)) byAbsolute.set(abs, e.image!);
  }
  return { bySeasonEpisode, byAbsolute };
}

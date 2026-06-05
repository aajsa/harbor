import type { Meta } from "@/lib/cinemeta";
import { aniZipByKitsu, pickEpisodeTitle } from "@/lib/providers/anizip";
import { animeKitsuMeta } from "@/lib/providers/anime-kitsu-addon";
import { kitsuToTvdb, externalToKitsu } from "@/lib/providers/anime-mapping";
import { fanartMovie, fanartTv } from "@/lib/providers/fanart";
import {
  kitsuAnime,
  kitsuCharacters,
  kitsuEpisodes,
  kitsuRelated,
  kitsuSimilarByGenres,
  kitsuStreamingLinks,
  kitsuStudios,
  parseKitsuId,
  type KitsuEpisode,
  type KitsuStreamer,
} from "@/lib/providers/kitsu";
import { tmdbAnimeLogo, tmdbDetails } from "@/lib/providers/tmdb";
import type { CastEntry, TmdbDetail } from "@/lib/providers/tmdb";
import type { Settings } from "@/lib/settings";

export type FranchiseEntry = {
  meta: Meta;
  year: number;
  startDate?: string;
  episodeCount?: number;
  isCurrent: boolean;
  isUpcoming: boolean;
};

export type AnimeDetailResult = {
  detail: TmdbDetail;
  episodes: KitsuEpisode[];
  streamers: KitsuStreamer[];
  backdrops: string[];
  imdbId?: string;
  franchise: FranchiseEntry[];
  kitsuId: number;
};

function emptyDetail(kind: "movie" | "tv"): TmdbDetail {
  return {
    kind,
    id: 0,
    imdbId: null,
    title: "",
    originalTitle: "",
    tagline: "",
    overview: "",
    voteCount: 0,
    status: "",
    genres: [],
    originalLanguage: "",
    spokenLanguages: [],
    productionCountries: [],
    productionCompanies: [],
    networks: [],
    productionCompaniesRich: [],
    productionCountriesRich: [],
    spokenLanguagesRich: [],
    networksRich: [],
    trailerYtId: null,
    trailerCandidates: [],
    extraVideos: [],
    cast: [],
    crew: [],
    directors: [],
    writers: [],
    creators: [],
    producers: [],
    composer: [],
    cinematography: [],
    editor: [],
    recommendations: [],
    similar: [],
    seasons: [],
    numberOfSeasons: 0,
    numberOfEpisodes: 0,
    keywords: [],
  };
}

const STATUS_LABELS: Record<string, string> = {
  current: "Currently Airing",
  finished: "Finished Airing",
  tba: "TBA",
  unreleased: "Unreleased",
  upcoming: "Upcoming",
};

const STUDIO_ROLE_RANK: Record<string, number> = {
  studio: 0,
  production: 1,
  licensor: 2,
};

const FRANCHISE_ROLES = new Set(["sequel", "prequel", "parent_story"]);
const FRANCHISE_MAX_DEPTH = 6;

function makeFranchiseMeta(id: number, anime: import("./kitsu").KitsuAnimeDetail): Meta {
  return {
    id: `kitsu:${id}`,
    type: anime.subtype === "movie" ? "movie" : "series",
    name: anime.title,
    poster: anime.poster,
    background: anime.backdrop,
    description: anime.synopsis,
    releaseInfo: anime.year,
    imdbRating: anime.rating,
  };
}

function isAnimeUpcoming(anime: import("./kitsu").KitsuAnimeDetail | null, now: number): boolean {
  if (!anime) return false;
  const status = (anime.status ?? "").toLowerCase();
  if (status === "unreleased" || status === "upcoming" || status === "tba") return true;
  if (anime.startDate) {
    const t = new Date(anime.startDate).getTime();
    if (Number.isFinite(t) && t > now) return true;
  }
  return false;
}

async function buildFranchise(
  rootId: number,
  rootAnime: import("./kitsu").KitsuAnimeDetail,
): Promise<FranchiseEntry[]> {
  const now = Date.now();
  const items = new Map<number, FranchiseEntry>();
  items.set(rootId, {
    meta: makeFranchiseMeta(rootId, rootAnime),
    year: parseInt(rootAnime.year ?? "", 10) || 0,
    startDate: rootAnime.startDate,
    episodeCount: rootAnime.episodeCount,
    isCurrent: true,
    isUpcoming: isAnimeUpcoming(rootAnime, now),
  });

  let queue: number[] = [rootId];
  const visited = new Set<number>();
  let depth = 0;

  while (queue.length > 0 && depth < FRANCHISE_MAX_DEPTH) {
    const batch = queue;
    queue = [];
    const relatedLists = await Promise.all(batch.map((id) => kitsuRelated(id)));
    const newIds: number[] = [];
    for (let i = 0; i < batch.length; i++) {
      visited.add(batch[i]);
      for (const r of relatedLists[i]) {
        if (!FRANCHISE_ROLES.has(r.role.toLowerCase())) continue;
        const m = parseKitsuId(r.meta.id);
        if (!m || items.has(m) || visited.has(m)) continue;
        if (!newIds.includes(m)) newIds.push(m);
      }
    }
    if (newIds.length === 0) break;
    const animes = await Promise.all(newIds.map((id) => kitsuAnime(id)));
    for (let i = 0; i < newIds.length; i++) {
      const id = newIds[i];
      const a = animes[i];
      const meta = a ? makeFranchiseMeta(id, a) : null;
      if (!meta) continue;
      items.set(id, {
        meta,
        year: parseInt(a!.year ?? "", 10) || 0,
        startDate: a!.startDate,
        episodeCount: a!.episodeCount,
        isCurrent: false,
        isUpcoming: isAnimeUpcoming(a!, now),
      });
      queue.push(id);
    }
    depth++;
  }

  const score = (e: FranchiseEntry) =>
    (e.isCurrent ? 1000 : 0) +
    (e.startDate ? 2 : 0) +
    ((e.episodeCount ?? 0) > 0 ? 1 : 0);
  const byName = new Map<string, FranchiseEntry>();
  for (const e of items.values()) {
    const key = e.meta.name.trim().toLowerCase();
    const prev = byName.get(key);
    if (!prev || score(e) > score(prev)) byName.set(key, e);
  }
  return Array.from(byName.values()).sort((a, b) => {
    const ad = a.startDate ?? "9999";
    const bd = b.startDate ?? "9999";
    return ad.localeCompare(bd);
  });
}

export type FranchiseTag = { kind: "season" | "movie"; seasonNum: number; short: string };

export function franchiseTags(franchise: FranchiseEntry[]): FranchiseTag[] {
  let s = 0;
  return franchise.map((f) => {
    if (f.meta.type === "movie" || (f.episodeCount ?? 0) === 1) {
      return { kind: "movie", seasonNum: 0, short: "MOV" };
    }
    s += 1;
    return { kind: "season", seasonNum: s, short: `S${s}` };
  });
}

const FRANCHISE_CAST_CACHE = new Map<string, CastEntry[]>();

export async function animeDetails(
  settings: Settings,
  meta: Meta,
): Promise<AnimeDetailResult | null> {
  let kitsuId = parseKitsuId(meta.id);
  if (kitsuId == null) {
    const ext: Array<[string, string]> = [
      ["mal:", "myanimelist"],
      ["anilist:", "anilist"],
      ["anidb:", "anidb"],
    ];
    for (const [prefix, source] of ext) {
      if (meta.id.startsWith(prefix)) {
        const n = parseInt(meta.id.slice(prefix.length), 10);
        if (Number.isFinite(n)) kitsuId = await externalToKitsu(source, n);
        break;
      }
    }
  }
  if (kitsuId == null) return null;

  const [anime, addonMeta] = await Promise.all([
    kitsuAnime(kitsuId),
    animeKitsuMeta(`kitsu:${kitsuId}`).catch(() => null),
  ]);
  if (!anime) return null;

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const effectiveSlugs =
    anime.genreSlugs.length > 0 ? anime.genreSlugs : anime.genres.map(slugify).filter(Boolean);

  const [kitsuRawEpisodes, characters, related, studios, streamers, genreSimilar, aniZip] = await Promise.all([
    kitsuEpisodes(kitsuId, 100),
    kitsuCharacters(kitsuId, 30),
    kitsuRelated(kitsuId),
    kitsuStudios(kitsuId),
    kitsuStreamingLinks(kitsuId),
    effectiveSlugs.length > 0
      ? kitsuSimilarByGenres(effectiveSlugs, kitsuId, 34)
      : Promise.resolve([] as Meta[]),
    aniZipByKitsu(kitsuId).catch(() => null),
  ]);

  let episodes: KitsuEpisode[];
  if (addonMeta?.videos && addonMeta.videos.length > 0) {
    const kitsuById = new Map<number, KitsuEpisode>();
    for (const ep of kitsuRawEpisodes) kitsuById.set(ep.number, ep);
    episodes = addonMeta.videos.map((v): KitsuEpisode => {
      const k = kitsuById.get(v.episode);
      return {
        id: k?.id ?? v.episode,
        number: v.episode,
        seasonNumber: v.season ?? 1,
        title: v.title || k?.title || `Episode ${v.episode}`,
        synopsis: v.overview ?? k?.synopsis ?? "",
        thumbnail: v.thumbnail ?? k?.thumbnail ?? null,
        airdate: v.released ?? k?.airdate ?? null,
        length: k?.length ?? null,
        streamId: v.id,
        imdbId: v.imdb_id,
        imdbSeason: v.imdbSeason,
        imdbEpisode: v.imdbEpisode,
      };
    });
  } else {
    episodes = kitsuRawEpisodes;
  }

  if (aniZip?.episodes) {
    for (const ep of episodes) {
      const az = aniZip.episodes[String(ep.number)];
      if (!az) continue;
      const enrichedTitle = pickEpisodeTitle(az);
      if (enrichedTitle && (!ep.title || ep.title === `Episode ${ep.number}`)) {
        ep.title = enrichedTitle;
      }
      if (az.overview && !ep.synopsis) ep.synopsis = az.overview;
      if (az.image && !ep.thumbnail) ep.thumbnail = az.image;
      if (az.airDate && !ep.airdate) ep.airdate = az.airDate;
      if (az.runtime && !ep.length) ep.length = az.runtime;
      if (az.filler) ep.filler = true;
      if (az.absoluteEpisodeNumber) ep.absoluteNumber = az.absoluteEpisodeNumber;
    }
  }

  const kind: "movie" | "tv" = anime.subtype === "movie" ? "movie" : "tv";

  const toCast = (chars: typeof characters): CastEntry[] =>
    chars.map((c, i) => ({
      id: c.id,
      name: c.name,
      character: c.voiceActor ?? (c.role === "main" ? "Main" : "Supporting"),
      profilePath: c.image ?? null,
      order: i,
    }));
  let cast: CastEntry[] = toCast(characters);

  const franchise = await buildFranchise(kitsuId, anime);
  const castKeys = [meta.id, `kitsu:${kitsuId}`, ...franchise.map((f) => f.meta.id)];

  if (cast.length > 0) {
    for (const k of castKeys) FRANCHISE_CAST_CACHE.set(k, cast);
  } else {
    for (const k of castKeys) {
      const cached = FRANCHISE_CAST_CACHE.get(k);
      if (cached?.length) {
        cast = cached;
        break;
      }
    }
    if (cast.length === 0) {
      for (const f of franchise) {
        if (!f.meta.id.startsWith("kitsu:")) continue;
        const fid = Number(f.meta.id.replace("kitsu:", ""));
        if (!Number.isFinite(fid) || fid === kitsuId) continue;
        const fallback = await kitsuCharacters(fid, 30).catch(() => []);
        if (fallback.length > 0) {
          cast = toCast(fallback);
          for (const k of castKeys) FRANCHISE_CAST_CACHE.set(k, cast);
          break;
        }
      }
    }
    if (cast.length === 0 && settings.tmdbKey && franchise.length > 0) {
      const root = franchise[0];
      const hit = await tmdbAnimeLogo(settings.tmdbKey, root.meta.name, root.meta.releaseInfo, kind).catch(
        () => null,
      );
      if (hit?.tmdbId) {
        const full = await tmdbDetails(settings.tmdbKey, {
          id: `tmdb:${kind === "movie" ? "movie" : "tv"}:${hit.tmdbId}`,
          type: kind === "movie" ? "movie" : "series",
          name: root.meta.name,
        } as Meta).catch(() => null);
        if (full?.cast?.length) {
          cast = full.cast;
          for (const k of castKeys) FRANCHISE_CAST_CACHE.set(k, cast);
        }
      }
    }
  }

  const franchiseIds = new Set<string>([meta.id, `kitsu:${kitsuId}`]);
  for (const r of related) franchiseIds.add(r.meta.id);
  for (const f of franchise) franchiseIds.add(f.meta.id);

  const similarPool: Meta[] = [];
  const poolSeen = new Set<string>();
  for (const m of genreSimilar) {
    if (franchiseIds.has(m.id) || poolSeen.has(m.id)) continue;
    poolSeen.add(m.id);
    similarPool.push(m);
  }
  const moreLikeThis = similarPool.slice(0, 14);
  const youMightLike = similarPool.slice(14, 28);

  const sortedStudios = [...studios].sort((a, b) => {
    const ra = STUDIO_ROLE_RANK[a.role] ?? 9;
    const rb = STUDIO_ROLE_RANK[b.role] ?? 9;
    return ra - rb;
  });
  const productionCompanies = Array.from(new Set(sortedStudios.map((s) => s.name)));
  const networks = Array.from(new Set(streamers.map((s) => s.service)));

  let logo: string | undefined;
  let backdrop = anime.backdrop;
  let poster = anime.poster;
  let backdrops: string[] = backdrop ? [backdrop] : [];

  const [tmdbHit, tvdbId] = await Promise.all([
    settings.tmdbKey
      ? tmdbAnimeLogo(settings.tmdbKey, anime.title, anime.year, kind).catch(() => null)
      : Promise.resolve(null),
    settings.fanartKey && kind === "tv"
      ? kitsuToTvdb(kitsuId).catch(() => null)
      : Promise.resolve(null),
  ]);

  if (tmdbHit) {
    if (tmdbHit.logo) logo = tmdbHit.logo;
    if (tmdbHit.backdrop) {
      backdrop = tmdbHit.backdrop;
      backdrops = [tmdbHit.backdrop];
    }
  }

  if (settings.fanartKey) {
    if (kind === "movie" && tmdbHit?.tmdbId) {
      const fa = await fanartMovie(settings.fanartKey, tmdbHit.tmdbId).catch(() => null);
      if (fa) {
        if (fa.logo) logo = fa.logo;
        if (fa.backdrops.length > 0) {
          backdrop = fa.backdrops[0];
          backdrops = fa.backdrops;
        }
        if (fa.poster) poster = fa.poster;
      }
    } else if (kind === "tv" && tvdbId) {
      const fa = await fanartTv(settings.fanartKey, tvdbId).catch(() => null);
      if (fa) {
        if (fa.logo) logo = fa.logo;
        if (fa.backdrops.length > 0) {
          backdrop = fa.backdrops[0];
          backdrops = fa.backdrops;
        }
        if (fa.poster) poster = fa.poster;
      }
    }
  }

  let tmdbFull: TmdbDetail | null = null;
  if (settings.tmdbKey && tmdbHit?.tmdbId) {
    const tmdbMeta = {
      id: `tmdb:${kind === "movie" ? "movie" : "tv"}:${tmdbHit.tmdbId}`,
      type: kind === "movie" ? "movie" : "series",
      name: anime.title,
    } as Meta;
    const full = await tmdbDetails(settings.tmdbKey, tmdbMeta).catch(() => null);
    if (full) {
      const ay = Number(anime.year);
      const ty = Number(full.year);
      if (!Number.isFinite(ay) || !Number.isFinite(ty) || Math.abs(ty - ay) <= 1) {
        tmdbFull = full;
      }
    }
  }

  const detail: TmdbDetail = {
    ...emptyDetail(kind),
    id: anime.id,
    imdbId: addonMeta?.imdb_id ?? tmdbFull?.imdbId ?? null,
    title: anime.title,
    originalTitle: anime.title,
    overview: anime.synopsis,
    poster,
    backdrop,
    logo,
    year: anime.year,
    rating: meta.imdbRating ?? anime.rating,
    voteCount: anime.popularityRank ?? 0,
    runtime: anime.episodeLength ? `${anime.episodeLength}m` : undefined,
    status: anime.status ? STATUS_LABELS[anime.status] ?? anime.status : "",
    genres: anime.genres,
    originalLanguage: "ja",
    spokenLanguages: ["Japanese"],
    productionCountries: ["Japan"],
    productionCompanies,
    networks,
    trailerYtId: anime.trailerYtId ?? null,
    trailerCandidates: anime.trailerYtId ? [anime.trailerYtId] : [],
    cast: cast.length > 0 ? cast : (tmdbFull?.cast ?? []),
    crew: tmdbFull?.crew ?? [],
    directors: tmdbFull?.directors ?? [],
    writers: tmdbFull?.writers ?? [],
    creators: tmdbFull?.creators ?? [],
    producers: tmdbFull?.producers ?? [],
    composer: tmdbFull?.composer ?? [],
    cinematography: tmdbFull?.cinematography ?? [],
    editor: tmdbFull?.editor ?? [],
    keywords: tmdbFull?.keywords ?? [],
    recommendations: moreLikeThis,
    similar: youMightLike,
    numberOfEpisodes: anime.episodeCount ?? 0,
    numberOfSeasons: kind === "tv" ? 1 : 0,
    firstAirDate: anime.startDate,
    lastAirDate: anime.endDate,
  };

  return { detail, episodes, streamers, backdrops, imdbId: addonMeta?.imdb_id, franchise, kitsuId };
}

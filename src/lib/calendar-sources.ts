import { meta as cinemetaMeta } from "./cinemeta";
import { library, type LibraryItem } from "./stremio";
import {
  fetchAnticipatedMovies,
  fetchAnticipatedShows,
  fetchUpcomingEpisodes,
  fetchUpcomingMovies,
} from "./trakt/calendar";
import type { CalendarItem } from "./calendar";

const LIBRARY_LIMIT = 100;
const TRAKT_MAX_FORWARD_MONTHS = 6;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function inMonth(iso: string, year: number, month: number): boolean {
  if (!iso) return false;
  const [y, m] = iso.split("-").map(Number);
  return y === year && (m ?? 0) - 1 === month;
}

function isAnimationGenre(genres: string[] | undefined): boolean {
  if (!genres) return false;
  const wanted = ["animation", "anime"];
  return genres.some((g) => wanted.includes(g.toLowerCase()));
}

export async function fetchLibraryCalendar(
  authKey: string,
  year: number,
  month: number,
): Promise<CalendarItem[]> {
  const items = await library(authKey).catch(() => [] as LibraryItem[]);
  const eligible = items
    .filter((i) => !i.removed && i._id.startsWith("tt"))
    .sort((a, b) => (b._mtime ?? "").localeCompare(a._mtime ?? ""))
    .slice(0, LIBRARY_LIMIT);
  if (!eligible.length) return [];
  const metas = await Promise.all(
    eligible.map((i) => cinemetaMeta(i.type, i._id).catch(() => null)),
  );
  const out: CalendarItem[] = [];
  for (let idx = 0; idx < eligible.length; idx++) {
    const lib = eligible[idx];
    const m = metas[idx];
    if (!m) continue;
    const anime = isAnimationGenre(m.genres);
    if (lib.type === "movie") {
      const date = (m.releaseDate ?? "").slice(0, 10);
      if (!inMonth(date, year, month)) continue;
      out.push({
        id: m.id,
        imdbId: m.id.startsWith("tt") ? m.id : null,
        type: "movie",
        name: m.name,
        poster: m.poster ?? null,
        background: m.background ?? null,
        releaseDate: date,
        isAnime: anime,
        overview: m.description ?? "",
        voteAverage: parseFloat(m.imdbRating ?? "0") || 0,
      });
      continue;
    }
    for (const v of m.videos ?? []) {
      const date = (v.released ?? v.firstAired ?? "").slice(0, 10);
      if (!inMonth(date, year, month)) continue;
      const season = v.season ?? 0;
      const episode = v.episode ?? v.number ?? 0;
      if (season === 0 && episode === 0) continue;
      const epLabel = `S${pad(season)}E${pad(episode)}`;
      const epTitle = v.name ?? v.title ?? "";
      out.push({
        id: v.id ?? `${m.id}:${season}:${episode}`,
        imdbId: m.id.startsWith("tt") ? m.id : null,
        type: "tv",
        name: epTitle ? `${m.name} ${epLabel}: ${epTitle}` : `${m.name} ${epLabel}`,
        poster: m.poster ?? null,
        background: m.background ?? null,
        releaseDate: date,
        isAnime: anime,
        overview: m.description ?? "",
        voteAverage: parseFloat(m.imdbRating ?? "0") || 0,
      });
    }
  }
  out.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
  return out;
}

export async function fetchTraktCalendar(
  year: number,
  month: number,
): Promise<CalendarItem[]> {
  const today = new Date();
  const cur = new Date(year, month, 1);
  const fwdMonths =
    (cur.getFullYear() - today.getFullYear()) * 12 + (cur.getMonth() - today.getMonth());
  if (fwdMonths < 0 || fwdMonths > TRAKT_MAX_FORWARD_MONTHS) return [];
  const days = Math.max(31, (fwdMonths + 1) * 31);
  const [eps, mvs] = await Promise.all([
    fetchUpcomingEpisodes(days),
    fetchUpcomingMovies(days),
  ]);
  const out: CalendarItem[] = [];
  for (const ep of eps) {
    const date = (ep.airDate ?? "").slice(0, 10);
    if (!inMonth(date, year, month)) continue;
    const baseId = ep.ids.imdb ?? `trakt:${ep.ids.tmdb ?? ep.ids.tvdb ?? ep.title}`;
    const epLabel = `S${pad(ep.season)}E${pad(ep.number)}`;
    out.push({
      id: `${baseId}:${ep.season}:${ep.number}`,
      imdbId: ep.ids.imdb ?? null,
      type: "tv",
      name: ep.episodeTitle
        ? `${ep.title} ${epLabel}: ${ep.episodeTitle}`
        : `${ep.title} ${epLabel}`,
      poster: null,
      background: null,
      releaseDate: date,
      isAnime: false,
      overview: "",
      voteAverage: 0,
    });
  }
  for (const m of mvs) {
    const date = (m.contextDate ?? "").slice(0, 10);
    if (!inMonth(date, year, month)) continue;
    const id = m.ids.imdb ?? `trakt:${m.ids.tmdb ?? m.title}`;
    out.push({
      id,
      imdbId: m.ids.imdb ?? null,
      type: "movie",
      name: m.title,
      poster: null,
      background: null,
      releaseDate: date,
      isAnime: false,
      overview: "",
      voteAverage: 0,
    });
  }
  out.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
  return out;
}

export async function fetchAnticipatedCalendar(
  year: number,
  month: number,
): Promise<CalendarItem[]> {
  const [shows, mvs] = await Promise.all([
    fetchAnticipatedShows(),
    fetchAnticipatedMovies(),
  ]);
  const inMonthShows = shows.filter((s) => inMonth(s.firstAired, year, month));
  const inMonthMovies = mvs.filter((m) => inMonth(m.released, year, month));
  const [showMetas, movieMetas] = await Promise.all([
    Promise.all(
      inMonthShows.map((s) =>
        s.ids.imdb ? cinemetaMeta("series", s.ids.imdb).catch(() => null) : Promise.resolve(null),
      ),
    ),
    Promise.all(
      inMonthMovies.map((m) =>
        m.ids.imdb ? cinemetaMeta("movie", m.ids.imdb).catch(() => null) : Promise.resolve(null),
      ),
    ),
  ]);
  const out: CalendarItem[] = [];
  for (let i = 0; i < inMonthShows.length; i++) {
    const s = inMonthShows[i];
    const meta = showMetas[i];
    const id = s.ids.imdb ?? `trakt:${s.ids.tmdb ?? s.ids.tvdb ?? s.title}`;
    out.push({
      id: `${id}:premiere`,
      imdbId: s.ids.imdb ?? null,
      type: "tv",
      name: `${s.title} (premiere)`,
      poster: meta?.poster ?? s.poster,
      background: meta?.background ?? null,
      releaseDate: s.firstAired,
      isAnime: false,
      overview: meta?.description ?? s.overview,
      voteAverage: parseFloat(meta?.imdbRating ?? "0") || 0,
    });
  }
  for (let i = 0; i < inMonthMovies.length; i++) {
    const m = inMonthMovies[i];
    const meta = movieMetas[i];
    const id = m.ids.imdb ?? `trakt:${m.ids.tmdb ?? m.title}`;
    out.push({
      id,
      imdbId: m.ids.imdb ?? null,
      type: "movie",
      name: m.title,
      poster: meta?.poster ?? m.poster,
      background: meta?.background ?? null,
      releaseDate: m.released,
      isAnime: false,
      overview: meta?.description ?? m.overview,
      voteAverage: parseFloat(meta?.imdbRating ?? "0") || 0,
    });
  }
  out.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
  return out;
}

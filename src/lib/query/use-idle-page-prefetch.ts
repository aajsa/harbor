import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { prefetchCatalogPage, type CatalogRowSpec } from "@/lib/catalog-page";
import { recentlyPlayed } from "@/lib/playback-history";
import { useSettings } from "@/lib/settings";
import { SPECS as ANIME_SPECS } from "@/views/anime/anime-rows";
import { kidsSpecs } from "@/views/kids/kids-specs";
import { buildMovieHero, movieSpecs } from "@/views/movies/movie-specs";
import { buildShowHero } from "@/views/shows/hero-curation";
import { showSpecs } from "@/views/shows/show-specs";

/**
 * After first paint, warm Movies / Shows / Kids / Anime from the same
 * catalog-page pipeline so every route opens from shared cache.
 */
export function useIdlePagePrefetch() {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const tmdbKey = settings.tmdbKey;
  const region = settings.region;

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    const run = () => {
      if (cancelled) return;

      // Anime (Jikan) — always available
      const animeSpecs: CatalogRowSpec[] = ANIME_SPECS.map((s) => ({
        key: s.key,
        title: s.title,
        fetcher: s.fetcher,
      }));
      void prefetchCatalogPage({
        queryClient,
        pageId: "anime",
        scope: "jikan",
        specs: animeSpecs,
        limit: 6,
      }).catch(() => {});

      if (!tmdbKey) return;
      const scope = `tmdb:${tmdbKey}:${region}`;

      void prefetchCatalogPage({
        queryClient,
        pageId: "movies",
        scope,
        specs: movieSpecs(tmdbKey, region),
        heroFetcher: () => buildMovieHero(tmdbKey, recentlyPlayed()),
        limit: 6,
      }).catch(() => {});

      void prefetchCatalogPage({
        queryClient,
        pageId: "shows",
        scope,
        specs: showSpecs(tmdbKey),
        heroFetcher: () => buildShowHero(tmdbKey),
        limit: 6,
      }).catch(() => {});

      void prefetchCatalogPage({
        queryClient,
        pageId: "kids",
        scope: `tmdb:${tmdbKey}`,
        specs: kidsSpecs(tmdbKey),
        limit: 6,
      }).catch(() => {});
    };

    const id =
      typeof win.requestIdleCallback === "function"
        ? win.requestIdleCallback(run, { timeout: 3500 })
        : window.setTimeout(run, 1500);

    return () => {
      cancelled = true;
      if (typeof win.cancelIdleCallback === "function" && typeof id === "number") {
        win.cancelIdleCallback(id);
      } else {
        window.clearTimeout(id);
      }
    };
  }, [tmdbKey, region, queryClient]);
}

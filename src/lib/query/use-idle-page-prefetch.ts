import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { preloadCatalogPage, type CatalogRowSpec } from "@/lib/catalog-page";
import { recentlyPlayed } from "@/lib/playback-history";
import { useSettings } from "@/lib/settings";
import { SPECS as ANIME_SPECS } from "@/views/anime/anime-rows";
import { kidsSpecs } from "@/views/kids/kids-specs";
import { buildMovieHero, movieSpecs } from "@/views/movies/movie-specs";
import { buildShowHero } from "@/views/shows/hero-curation";
import { showSpecs } from "@/views/shows/show-specs";

/**
 * Idle warmup via TanStack Query `prefetchQuery` so Movies/Shows/Kids/Anime
 * paint from cache on first open.
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

      const animeSpecs: CatalogRowSpec[] = ANIME_SPECS.map((s) => ({
        key: s.key,
        title: s.title,
        fetcher: s.fetcher,
      }));
      void preloadCatalogPage(queryClient, {
        pageId: "anime",
        scope: "jikan",
        specs: animeSpecs,
        limit: 8,
      });

      if (!tmdbKey) return;
      const scope = `tmdb:${tmdbKey}:${region}`;

      void preloadCatalogPage(queryClient, {
        pageId: "movies",
        scope,
        specs: movieSpecs(tmdbKey, region),
        heroFetcher: () => buildMovieHero(tmdbKey, recentlyPlayed()),
        limit: 10,
      });
      void preloadCatalogPage(queryClient, {
        pageId: "shows",
        scope,
        specs: showSpecs(tmdbKey),
        heroFetcher: () => buildShowHero(tmdbKey),
        limit: 10,
      });
      void preloadCatalogPage(queryClient, {
        pageId: "kids",
        scope: `tmdb:${tmdbKey}`,
        specs: kidsSpecs(tmdbKey),
        limit: 8,
      });
    };

    const id =
      typeof win.requestIdleCallback === "function"
        ? win.requestIdleCallback(run, { timeout: 2500 })
        : window.setTimeout(run, 900);

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

/** Call from nav hover / focus for true TanStack intent preload. */
export function preloadNavPage(
  queryClient: ReturnType<typeof useQueryClient>,
  view: string,
  tmdbKey: string,
  region: string,
): void {
  if (view === "anime") {
    void preloadCatalogPage(queryClient, {
      pageId: "anime",
      scope: "jikan",
      specs: ANIME_SPECS.map((s) => ({ key: s.key, title: s.title, fetcher: s.fetcher })),
      limit: 10,
    });
    return;
  }
  if (!tmdbKey) return;
  const scope = `tmdb:${tmdbKey}:${region}`;
  if (view === "movies") {
    void preloadCatalogPage(queryClient, {
      pageId: "movies",
      scope,
      specs: movieSpecs(tmdbKey, region),
      heroFetcher: () => buildMovieHero(tmdbKey, recentlyPlayed()),
      limit: 12,
    });
  } else if (view === "shows") {
    void preloadCatalogPage(queryClient, {
      pageId: "shows",
      scope,
      specs: showSpecs(tmdbKey),
      heroFetcher: () => buildShowHero(tmdbKey),
      limit: 12,
    });
  } else if (view === "kids") {
    void preloadCatalogPage(queryClient, {
      pageId: "kids",
      scope: `tmdb:${tmdbKey}`,
      specs: kidsSpecs(tmdbKey),
      limit: 10,
    });
  }
}

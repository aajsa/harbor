import type { QueryClient } from "@tanstack/react-query";
import type { Meta } from "@/lib/cinemeta";
import { CATALOG_REQUEST_TIMEOUT_MS, withTimeout } from "@/lib/progressive-rows";
import { recentlyPlayed } from "@/lib/playback-history";
import { buildMovieHero, movieSpecs, type RowSpec } from "@/views/movies/movie-specs";
import { showSpecs } from "@/views/shows/show-specs";
import { buildShowHero } from "@/views/shows/hero-curation";

const STALE_MS = 5 * 60_000;
/** Match TMDB scheduler concurrency — don't stampede the API. */
export const PAGE_ROW_BATCH = 6;
const PREFETCH_PRIORITY = 6;

export type PageKind = "movies" | "shows";

export function pageRowQueryKey(
  page: PageKind,
  tmdbKey: string,
  region: string,
  rowKey: string,
  pageNum: number,
) {
  return ["harbor", "page", page, tmdbKey, region, rowKey, pageNum] as const;
}

export function pageHeroQueryKey(page: PageKind, tmdbKey: string, region: string) {
  return ["harbor", "page", page, "hero", tmdbKey, region] as const;
}

export async function fetchPageRow(
  queryClient: QueryClient,
  page: PageKind,
  tmdbKey: string,
  region: string,
  rowKey: string,
  pageNum: number,
  fetcher: () => Promise<Meta[]>,
): Promise<Meta[]> {
  return queryClient.fetchQuery({
    queryKey: pageRowQueryKey(page, tmdbKey, region, rowKey, pageNum),
    queryFn: () => withTimeout(fetcher(), CATALOG_REQUEST_TIMEOUT_MS),
    staleTime: STALE_MS,
  });
}

export function peekPageRow(
  queryClient: QueryClient,
  page: PageKind,
  tmdbKey: string,
  region: string,
  rowKey: string,
  pageNum = 1,
): Meta[] | undefined {
  return queryClient.getQueryData<Meta[]>(pageRowQueryKey(page, tmdbKey, region, rowKey, pageNum));
}

export function peekPageHero(
  queryClient: QueryClient,
  page: PageKind,
  tmdbKey: string,
  region: string,
): Meta[] | undefined {
  return queryClient.getQueryData<Meta[]>(pageHeroQueryKey(page, tmdbKey, region));
}

export async function fetchPageHero(
  queryClient: QueryClient,
  page: PageKind,
  tmdbKey: string,
  region: string,
): Promise<Meta[]> {
  return queryClient.fetchQuery({
    queryKey: pageHeroQueryKey(page, tmdbKey, region),
    queryFn: async () => {
      if (page === "movies") {
        return withTimeout(buildMovieHero(tmdbKey, recentlyPlayed()), CATALOG_REQUEST_TIMEOUT_MS);
      }
      return withTimeout(buildShowHero(tmdbKey), CATALOG_REQUEST_TIMEOUT_MS);
    },
    staleTime: STALE_MS,
  });
}

function specsFor(page: PageKind, tmdbKey: string, region: string): RowSpec[] {
  return page === "movies" ? movieSpecs(tmdbKey, region) : showSpecs(tmdbKey);
}

/** Warm the first N rows + hero so Movies/Shows open from cache. */
export async function prefetchPageCatalog(
  queryClient: QueryClient,
  page: PageKind,
  tmdbKey: string,
  region: string,
  limit = PREFETCH_PRIORITY,
): Promise<void> {
  if (!tmdbKey) return;
  const specs = specsFor(page, tmdbKey, region).slice(0, limit);
  void fetchPageHero(queryClient, page, tmdbKey, region).catch(() => {});
  for (let i = 0; i < specs.length; i += PAGE_ROW_BATCH) {
    const batch = specs.slice(i, i + PAGE_ROW_BATCH);
    await Promise.all(
      batch.map((spec) =>
        fetchPageRow(queryClient, page, tmdbKey, region, spec.key, 1, () => spec.fetcher(1)).catch(
          () => [] as Meta[],
        ),
      ),
    );
  }
}

/** Run batches of async work with a small gap (anime-style progressive load). */
export async function runInBatches<T>(
  items: T[],
  batchSize: number,
  gapMs: number,
  worker: (item: T) => Promise<void>,
  isCancelled?: () => boolean,
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    if (isCancelled?.()) return;
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map((item) => worker(item)));
    if (i + batchSize < items.length && gapMs > 0) {
      await new Promise((r) => setTimeout(r, gapMs));
    }
  }
}

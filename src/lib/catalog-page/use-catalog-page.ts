import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";
import type { Meta } from "@/lib/cinemeta";
import { CATALOG_REQUEST_TIMEOUT_MS, withTimeout } from "@/lib/progressive-rows";
import { catalogHeroKey, catalogRowKey, rowFromSpec } from "./load";
import type { CatalogPageId, CatalogPageRow, CatalogRowSpec } from "./types";

const STALE_MS = 5 * 60_000;
const GC_MS = 30 * 60_000;

export type UseCatalogPageOptions = {
  pageId: CatalogPageId;
  /** Cache partition (e.g. tmdbKey+region or "jikan"). */
  scope: string;
  specs: CatalogRowSpec[];
  heroFetcher?: () => Promise<Meta[]>;
  /** When false, queries stay dormant (keep-alive off-screen). Default true. */
  enabled?: boolean;
  maxPerRow?: number;
  mapMetas?: (metas: Meta[], key: string) => Meta[];
};

/**
 * Shared catalog loader for Movies / Shows / Kids / Anime.
 * Uses TanStack Query `useQueries` so rows stay cached, never wipe on
 * remount, and preload via `queryClient.prefetchQuery` / ensureQueryData.
 */
export function useCatalogPage(options: UseCatalogPageOptions) {
  const { pageId, scope, specs, heroFetcher, enabled = true, maxPerRow = 30, mapMetas } = options;
  const queryClient = useQueryClient();
  const mapMetasRef = useRef(mapMetas);
  mapMetasRef.current = mapMetas;
  const loadingKeys = useRef(new Set<string>());
  const specsRef = useRef(specs);
  specsRef.current = specs;

  const live = enabled && !!scope && specs.length > 0;

  const heroQuery = useQuery({
    queryKey: catalogHeroKey(pageId, scope),
    queryFn: async () => {
      if (!heroFetcher) return [] as Meta[];
      return withTimeout(heroFetcher(), CATALOG_REQUEST_TIMEOUT_MS);
    },
    enabled: live && !!heroFetcher,
    staleTime: STALE_MS,
    gcTime: GC_MS,
    retry: 1,
  });

  const rowQueries = useQueries({
    queries: specs.map((spec) => ({
      queryKey: catalogRowKey(pageId, scope, spec.key, 1),
      queryFn: async () => {
        let metas = await withTimeout(spec.fetcher(1), CATALOG_REQUEST_TIMEOUT_MS);
        const map = mapMetasRef.current;
        if (map) metas = map(metas, spec.key);
        return metas;
      },
      enabled: live,
      staleTime: STALE_MS,
      gcTime: GC_MS,
      retry: 1,
    })),
  });

  const hero = heroQuery.data ?? [];

  const rows: CatalogPageRow[] = useMemo(() => {
    const out: CatalogPageRow[] = [];
    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];
      const q = rowQueries[i];
      const metas = q?.data;
      if (!metas || metas.length === 0) continue;
      out.push(rowFromSpec(spec, metas, 1));
    }
    return out;
  }, [specs, rowQueries]);

  const rowsByKey = useMemo(() => {
    const map: Record<string, CatalogPageRow> = {};
    for (const r of rows) map[r.key] = r;
    for (const s of specs) {
      if (!map[s.key]) {
        const idx = specs.findIndex((x) => x.key === s.key);
        const pending = rowQueries[idx]?.isPending || rowQueries[idx]?.isFetching;
        map[s.key] = {
          key: s.key,
          title: s.title,
          metas: [],
          page: 1,
          hasMore: false,
          ready: !pending && (rowQueries[idx]?.isFetched ?? false),
          fetcher: s.noPaginate ? undefined : s.fetcher,
        };
      }
    }
    return map;
  }, [rows, specs, rowQueries]);

  const loading =
    live && (heroQuery.isLoading || rowQueries.some((q) => q.isLoading)) && rows.length === 0;

  const loadMore = useCallback(
    (rowKey: string) => {
      if (loadingKeys.current.has(rowKey)) return;
      const spec = specsRef.current.find((s) => s.key === rowKey);
      const row = rows.find((r) => r.key === rowKey);
      if (!spec || !row?.fetcher || !row.hasMore || row.metas.length >= maxPerRow) return;
      loadingKeys.current.add(rowKey);
      const next = row.page + 1;
      const key = catalogRowKey(pageId, scope, rowKey, next);
      void queryClient
        .fetchQuery({
          queryKey: key,
          queryFn: async () => {
            let more = await withTimeout(spec.fetcher(next), CATALOG_REQUEST_TIMEOUT_MS);
            const map = mapMetasRef.current;
            if (map) more = map(more, rowKey);
            return more;
          },
          staleTime: STALE_MS,
        })
        .then((more) => {
          // Merge page N into the page-1 cache entry that drives the UI.
          const baseKey = catalogRowKey(pageId, scope, rowKey, 1);
          const current = queryClient.getQueryData<Meta[]>(baseKey) ?? row.metas;
          const ids = new Set(current.map((m) => m.id));
          const fresh = more.filter((m) => !ids.has(m.id));
          const combined = [...current, ...fresh];
          const capped = combined.length > maxPerRow ? combined.slice(0, maxPerRow) : combined;
          queryClient.setQueryData(baseKey, capped);
        })
        .catch(() => {})
        .finally(() => {
          loadingKeys.current.delete(rowKey);
        });
    },
    [maxPerRow, pageId, queryClient, rows, scope],
  );

  return {
    hero,
    rows,
    rowsByKey,
    loadMore,
    loading,
    /** True while any row query is in flight (including background). */
    fetching: rowQueries.some((q) => q.isFetching) || heroQuery.isFetching,
  };
}

/** Prefetch helpers used by idle warmup + nav hover (TanStack Query preload). */
export async function preloadCatalogPage(
  queryClient: ReturnType<typeof useQueryClient>,
  opts: {
    pageId: CatalogPageId;
    scope: string;
    specs: CatalogRowSpec[];
    heroFetcher?: () => Promise<Meta[]>;
    limit?: number;
  },
): Promise<void> {
  const { pageId, scope, specs, heroFetcher, limit = 8 } = opts;
  if (!scope) return;
  if (heroFetcher) {
    void queryClient.prefetchQuery({
      queryKey: catalogHeroKey(pageId, scope),
      queryFn: () => withTimeout(heroFetcher(), CATALOG_REQUEST_TIMEOUT_MS),
      staleTime: STALE_MS,
    });
  }
  await Promise.all(
    specs.slice(0, limit).map((spec) =>
      queryClient.prefetchQuery({
        queryKey: catalogRowKey(pageId, scope, spec.key, 1),
        queryFn: () => withTimeout(spec.fetcher(1), CATALOG_REQUEST_TIMEOUT_MS),
        staleTime: STALE_MS,
      }),
    ),
  );
}

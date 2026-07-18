import type { QueryClient } from "@tanstack/react-query";
import type { Meta } from "@/lib/cinemeta";
import { CATALOG_REQUEST_TIMEOUT_MS, upsertOrdered, withTimeout } from "@/lib/progressive-rows";
import type { CatalogPageId, CatalogPageRow, CatalogRowSpec } from "./types";

const STALE_MS = 5 * 60_000;
/** Align with TMDB/Jikan request schedulers. */
export const CATALOG_BATCH = 6;
export const CATALOG_BATCH_GAP_MS = 80;

export function catalogRowKey(
  pageId: CatalogPageId,
  scope: string,
  rowKey: string,
  pageNum: number,
) {
  return ["harbor", "catalog-page", pageId, scope, rowKey, pageNum] as const;
}

export function catalogHeroKey(pageId: CatalogPageId, scope: string) {
  return ["harbor", "catalog-page", pageId, scope, "hero"] as const;
}

export async function fetchCatalogRow(
  queryClient: QueryClient,
  pageId: CatalogPageId,
  scope: string,
  rowKey: string,
  pageNum: number,
  fetcher: () => Promise<Meta[]>,
): Promise<Meta[]> {
  return queryClient.fetchQuery({
    queryKey: catalogRowKey(pageId, scope, rowKey, pageNum),
    queryFn: () => withTimeout(fetcher(), CATALOG_REQUEST_TIMEOUT_MS),
    staleTime: STALE_MS,
  });
}

export function peekCatalogRow(
  queryClient: QueryClient,
  pageId: CatalogPageId,
  scope: string,
  rowKey: string,
  pageNum = 1,
): Meta[] | undefined {
  return queryClient.getQueryData<Meta[]>(catalogRowKey(pageId, scope, rowKey, pageNum));
}

export async function fetchCatalogHero(
  queryClient: QueryClient,
  pageId: CatalogPageId,
  scope: string,
  fetcher: () => Promise<Meta[]>,
): Promise<Meta[]> {
  return queryClient.fetchQuery({
    queryKey: catalogHeroKey(pageId, scope),
    queryFn: () => withTimeout(fetcher(), CATALOG_REQUEST_TIMEOUT_MS),
    staleTime: STALE_MS,
  });
}

export function peekCatalogHero(
  queryClient: QueryClient,
  pageId: CatalogPageId,
  scope: string,
): Meta[] | undefined {
  return queryClient.getQueryData<Meta[]>(catalogHeroKey(pageId, scope));
}

export function rowFromSpec(spec: CatalogRowSpec, metas: Meta[], page = 1): CatalogPageRow {
  const min = spec.minVisible ?? 14;
  return {
    key: spec.key,
    title: spec.title,
    metas,
    page,
    hasMore: !spec.noPaginate && metas.length >= min,
    ready: true,
    fetcher: spec.noPaginate ? undefined : spec.fetcher,
  };
}

export function hydrateRowsFromCache(
  queryClient: QueryClient,
  pageId: CatalogPageId,
  scope: string,
  specs: CatalogRowSpec[],
): CatalogPageRow[] {
  const order = specs.map((s) => s.key);
  let rows: CatalogPageRow[] = [];
  for (const spec of specs) {
    const metas = peekCatalogRow(queryClient, pageId, scope, spec.key, 1);
    if (!metas?.length) continue;
    rows = upsertOrdered(rows, rowFromSpec(spec, metas, 1), order);
  }
  return rows;
}

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

/** Progressive first-page load for any catalog route. */
export async function loadCatalogSpecs(options: {
  queryClient: QueryClient;
  pageId: CatalogPageId;
  scope: string;
  specs: CatalogRowSpec[];
  onRow: (row: CatalogPageRow) => void;
  mapMetas?: (metas: Meta[], key: string) => Meta[];
  batchSize?: number;
  gapMs?: number;
  isCancelled?: () => boolean;
}): Promise<boolean> {
  const {
    queryClient,
    pageId,
    scope,
    specs,
    onRow,
    mapMetas,
    batchSize = CATALOG_BATCH,
    gapMs = CATALOG_BATCH_GAP_MS,
    isCancelled,
  } = options;
  let anyOk = false;
  await runInBatches(
    specs,
    batchSize,
    gapMs,
    async (spec) => {
      try {
        let metas = await fetchCatalogRow(queryClient, pageId, scope, spec.key, 1, () =>
          spec.fetcher(1),
        );
        if (mapMetas) metas = mapMetas(metas, spec.key);
        if (isCancelled?.() || metas.length === 0) return;
        anyOk = true;
        onRow(rowFromSpec(spec, metas, 1));
      } catch {
        /* single-row failure is fine */
      }
    },
    isCancelled,
  );
  return anyOk;
}

/** Prefetch first N rows (+ optional hero) for a page. */
export async function prefetchCatalogPage(options: {
  queryClient: QueryClient;
  pageId: CatalogPageId;
  scope: string;
  specs: CatalogRowSpec[];
  heroFetcher?: () => Promise<Meta[]>;
  limit?: number;
}): Promise<void> {
  const { queryClient, pageId, scope, specs, heroFetcher, limit = CATALOG_BATCH } = options;
  if (heroFetcher) {
    void fetchCatalogHero(queryClient, pageId, scope, heroFetcher).catch(() => {});
  }
  const slice = specs.slice(0, limit);
  await runInBatches(slice, CATALOG_BATCH, CATALOG_BATCH_GAP_MS, async (spec) => {
    await fetchCatalogRow(queryClient, pageId, scope, spec.key, 1, () => spec.fetcher(1)).catch(
      () => [] as Meta[],
    );
  });
}

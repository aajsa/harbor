import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Meta } from "@/lib/cinemeta";
import { upsertOrdered } from "@/lib/progressive-rows";
import {
  fetchCatalogHero,
  hydrateRowsFromCache,
  loadCatalogSpecs,
  peekCatalogHero,
  rowFromSpec,
} from "./load";
import type { CatalogPageId, CatalogPageRow, CatalogRowSpec } from "./types";

export type UseCatalogPageOptions = {
  pageId: CatalogPageId;
  /** Cache partition (e.g. tmdbKey+region or "jikan"). */
  scope: string;
  specs: CatalogRowSpec[];
  heroFetcher?: () => Promise<Meta[]>;
  /** When false, do not load (e.g. inactive tab). Default true. */
  enabled?: boolean;
  maxPerRow?: number;
  mapMetas?: (metas: Meta[], key: string) => Meta[];
  /** Extra dependency token to force reload (addons tick, etc.). */
  reloadToken?: string | number;
};

/**
 * Shared progressive catalog loader for Movies / Shows / Kids / Anime rails.
 * Hydrates from TanStack Query cache, then fills rows in batches.
 */
export function useCatalogPage(options: UseCatalogPageOptions) {
  const {
    pageId,
    scope,
    specs,
    heroFetcher,
    enabled = true,
    maxPerRow = 30,
    mapMetas,
    reloadToken = 0,
  } = options;
  const queryClient = useQueryClient();
  const [hero, setHero] = useState<Meta[]>([]);
  const [rows, setRows] = useState<CatalogPageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const rowsRef = useRef(rows);
  const loadingKeys = useRef(new Set<string>());
  const specsRef = useRef(specs);
  specsRef.current = specs;

  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  const order = useMemo(() => specs.map((s) => s.key), [specs]);
  const orderRef = useRef(order);
  orderRef.current = order;

  useEffect(() => {
    if (!enabled || !scope || specs.length === 0) return;
    let cancelled = false;
    const isCancelled = () => cancelled;

    // Instant paint from cache
    const cachedHero = heroFetcher ? peekCatalogHero(queryClient, pageId, scope) : undefined;
    if (cachedHero?.length) setHero(cachedHero);
    const cachedRows = hydrateRowsFromCache(queryClient, pageId, scope, specs);
    if (cachedRows.length > 0) {
      setRows(cachedRows);
    } else {
      if (!cachedHero?.length) setHero([]);
      setRows([]);
    }

    setLoading(true);
    (async () => {
      if (heroFetcher) {
        void fetchCatalogHero(queryClient, pageId, scope, heroFetcher)
          .then((pool) => {
            if (!cancelled) setHero(pool);
          })
          .catch(() => {});
      }

      await loadCatalogSpecs({
        queryClient,
        pageId,
        scope,
        specs,
        mapMetas,
        isCancelled,
        onRow: (row) => {
          if (cancelled) return;
          setRows((current) => upsertOrdered(current, row, orderRef.current));
        },
      });
      if (!cancelled) setLoading(false);
    })().catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // specs identity: rely on pageId+scope+reloadToken; callers should memoize specs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, pageId, scope, queryClient, reloadToken, heroFetcher, mapMetas]);

  const loadMore = useCallback(
    (rowKey: string) => {
      if (loadingKeys.current.has(rowKey)) return;
      const row = rowsRef.current.find((r) => r.key === rowKey);
      if (!row || !row.fetcher || !row.hasMore || row.metas.length >= maxPerRow) return;
      loadingKeys.current.add(rowKey);
      const next = row.page + 1;
      row
        .fetcher(next)
        .then((more) => {
          let mapped = more;
          if (mapMetas) mapped = mapMetas(more, rowKey);
          setRows((rs) =>
            rs.map((r) => {
              if (r.key !== rowKey) return r;
              const ids = new Set(r.metas.map((m) => m.id));
              const fresh = mapped.filter((m) => !ids.has(m.id));
              const combined = [...r.metas, ...fresh];
              const reachedCap = combined.length >= maxPerRow;
              return {
                ...r,
                metas: reachedCap ? combined.slice(0, maxPerRow) : combined,
                page: next,
                hasMore: !reachedCap && mapped.length > 0,
              };
            }),
          );
        })
        .catch(() => {})
        .finally(() => {
          loadingKeys.current.delete(rowKey);
        });
    },
    [mapMetas, maxPerRow],
  );

  const rowsByKey = useMemo(() => {
    const map: Record<string, CatalogPageRow> = {};
    for (const r of rows) map[r.key] = r;
    // Ensure every spec has a ready=false placeholder for anime-style UI.
    for (const s of specsRef.current) {
      if (!map[s.key]) {
        map[s.key] = {
          key: s.key,
          title: s.title,
          metas: [],
          page: 1,
          hasMore: false,
          ready: false,
          fetcher: s.noPaginate ? undefined : s.fetcher,
        };
      }
    }
    return map;
  }, [rows]);

  return { hero, rows, rowsByKey, loadMore, loading, setHero, setRows };
}

export function specsToPlaceholders(specs: CatalogRowSpec[]): CatalogPageRow[] {
  return specs.map((s) => rowFromSpec(s, [], 1));
}

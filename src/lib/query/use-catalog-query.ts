import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createAddonCatalogFetcher, loadAddonRows, type AddonCatalogCursor } from "@/lib/addons";
import type { Meta } from "@/lib/cinemeta";
import { queryKeys } from "./keys";

/** Home / page catalog rows for the signed-in (or local) addon set. */
export function useCatalogRowsQuery(authKey: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.catalog.rows(authKey),
    queryFn: () => loadAddonRows(authKey),
    enabled,
    staleTime: 3 * 60_000,
  });
}

/** Infinite pages for a single addon catalog (View all / Grid). */
export function useCatalogPagesQuery(cursor: AddonCatalogCursor | null, enabled = true) {
  const base = cursor?.base ?? "";
  const type = cursor?.type ?? "";
  const id = cursor?.id ?? "";

  return useInfiniteQuery({
    queryKey: ["harbor", "catalog", base, type, id, cursor?.extras ?? null] as const,
    queryFn: async ({ pageParam }): Promise<Meta[]> => {
      if (!cursor) return [];
      const fetchPage = createAddonCatalogFetcher(cursor);
      return fetchPage(pageParam);
    },
    initialPageParam: 1,
    getNextPageParam: (last, _all, lastPageParam) => {
      if (!last || last.length === 0) return undefined;
      if (lastPageParam >= 40) return undefined;
      return lastPageParam + 1;
    },
    enabled: enabled && !!cursor,
    staleTime: 5 * 60_000,
  });
}

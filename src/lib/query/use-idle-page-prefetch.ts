import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSettings } from "@/lib/settings";
import { prefetchPageCatalog } from "./page-catalog";

/**
 * After first paint, warm Movies/Shows catalogs so tab switches feel instant.
 * Anime already streams in progressive batches and feels fast without this.
 */
export function useIdlePagePrefetch() {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const tmdbKey = settings.tmdbKey;
  const region = settings.region;

  useEffect(() => {
    if (!tmdbKey || typeof window === "undefined") return;
    let cancelled = false;
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    const run = () => {
      if (cancelled) return;
      void prefetchPageCatalog(queryClient, "movies", tmdbKey, region).catch(() => {});
      void prefetchPageCatalog(queryClient, "shows", tmdbKey, region).catch(() => {});
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

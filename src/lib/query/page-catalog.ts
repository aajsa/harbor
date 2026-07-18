/**
 * @deprecated Use `@/lib/catalog-page` — kept as thin re-exports for older imports.
 */
export {
  CATALOG_BATCH as PAGE_ROW_BATCH,
  fetchCatalogHero as fetchPageHero,
  fetchCatalogRow as fetchPageRow,
  peekCatalogHero as peekPageHero,
  peekCatalogRow as peekPageRow,
  prefetchCatalogPage as prefetchPageCatalog,
  runInBatches,
} from "@/lib/catalog-page";

export type { CatalogPageId as PageKind } from "@/lib/catalog-page";

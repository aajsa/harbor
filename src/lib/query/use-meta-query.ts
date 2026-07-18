import { useQuery } from "@tanstack/react-query";
import type { Meta, MetaType } from "@/lib/cinemeta";
import { resolveMeta } from "@/lib/meta-resource";
import { queryKeys } from "./keys";

export function useMetaQuery(
  type: MetaType | "movie" | "series" | null | undefined,
  id: string | null | undefined,
  authKey: string | null,
  options?: { enabled?: boolean },
) {
  const enabled = (options?.enabled ?? true) && !!type && !!id && id.length > 0;

  return useQuery<Meta | null>({
    queryKey: queryKeys.meta.detail(type ?? "movie", id ?? "", authKey),
    queryFn: () => resolveMeta(authKey, type === "series" ? "series" : "movie", id!),
    enabled,
    staleTime: 10 * 60_000,
  });
}

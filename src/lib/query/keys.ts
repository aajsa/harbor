import type { MetaType } from "@/lib/cinemeta";

/** Stable query-key factory so cache entries stay consistent across views. */
export const queryKeys = {
  all: ["harbor"] as const,

  meta: {
    all: ["harbor", "meta"] as const,
    detail: (type: MetaType | string, id: string, authKey: string | null) =>
      ["harbor", "meta", type, id, authKey ?? "anon"] as const,
  },

  catalog: {
    all: ["harbor", "catalog"] as const,
    page: (transportUrl: string, type: string, id: string, page: number) =>
      ["harbor", "catalog", transportUrl, type, id, page] as const,
    rows: (authKey: string | null) => ["harbor", "catalog", "rows", authKey ?? "anon"] as const,
  },

  streams: {
    all: ["harbor", "streams"] as const,
    for: (type: string, id: string, authKey: string | null) =>
      ["harbor", "streams", type, id, authKey ?? "anon"] as const,
  },

  search: {
    all: ["harbor", "search"] as const,
    query: (q: string, authKey: string | null) =>
      ["harbor", "search", q, authKey ?? "anon"] as const,
  },
} as const;

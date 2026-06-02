import type { Meta } from "@/lib/cinemeta";

export type HomeRow = {
  key: string;
  type: "movie" | "series";
  name: string;
  metas: Meta[];
  page: number;
  hasMore: boolean;
  noDedup?: boolean;
  fetcher?: (page: number) => Promise<Meta[]>;
};

export type RowSpec = {
  key: string;
  type: "movie" | "series";
  name: string;
  noDedup?: boolean;
  fetcher: (page: number) => Promise<Meta[]>;
};

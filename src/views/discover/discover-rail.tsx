import type { Meta } from "@/lib/cinemeta";
import type { RailDef } from "@/lib/feed";
import { FeedShelf } from "@/components/feed-shelf";

export function Rail({
  railId,
  allRails,
  deduped,
  loadMore,
}: {
  railId: string;
  allRails: RailDef[];
  deduped: Record<string, Meta[] | null>;
  loadMore: (id: string) => void;
}) {
  const def = allRails.find((r) => r.id === railId);
  if (!def) return null;
  return (
    <FeedShelf
      shelf={def.shelf}
      items={deduped[railId] ?? null}
      onEndReached={() => loadMore(railId)}
      scrollKey={`discover:${railId}`}
    />
  );
}

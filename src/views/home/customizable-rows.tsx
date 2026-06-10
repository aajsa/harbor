import { ChevronRight } from "lucide-react";
import { LazyMount } from "@/components/lazy-mount";
import { PickCard } from "@/components/pick-card";
import { Row } from "@/components/row";
import type { HomeRowCustomization } from "@/lib/home-customization";
import { useView } from "@/lib/view";
import type { HomeRow } from "./home-types";
import { RowControls } from "./row-controls";

function RowTitle({ row }: { row: HomeRow }) {
  const { openGrid } = useView();
  if (!row.fetcher) return <>{row.name}</>;
  return (
    <button
      onClick={() =>
        openGrid({ title: row.name, fetcher: row.fetcher!, initial: row.metas })
      }
      className="group/see inline-flex items-center gap-1.5 text-ink transition-colors hover:text-ink-muted"
    >
      {row.name}
      <span className="inline-flex items-center gap-0.5 text-[12px] font-medium text-ink-subtle opacity-0 transition-opacity duration-200 group-hover/see:opacity-100">
        See all
        <ChevronRight size={14} strokeWidth={2.4} />
      </span>
    </button>
  );
}

export function CustomizableRows({
  rows,
  editMode,
  customization,
  orderKeys,
  onMove,
  onToggleHidden,
  onRename,
  onLoadMore,
}: {
  rows: HomeRow[];
  editMode: boolean;
  customization: HomeRowCustomization;
  orderKeys: string[];
  onMove: (key: string, delta: -1 | 1) => void;
  onToggleHidden: (key: string) => void;
  onRename: (key: string, label: string) => void;
  onLoadMore: (key: string) => void;
}) {
  return (
    <>
      {rows.map((row, rowIndex) => {
        const hidden = customization.hidden.includes(row.key);
        if (hidden && !editMode) return null;
        const idx = orderKeys.indexOf(row.key);
        const eager = rowIndex < 2;
        return (
          <div
            key={row.key}
            data-scroll-anchor={`row:${row.key}`}
            style={{ contentVisibility: "auto", containIntrinsicSize: "auto 340px" }}
          >
            {editMode && (
              <RowControls
                name={row.name}
                hidden={hidden}
                canMoveUp={idx > 0}
                canMoveDown={idx >= 0 && idx < orderKeys.length - 1}
                onMoveUp={() => onMove(row.key, -1)}
                onMoveDown={() => onMove(row.key, 1)}
                onToggleHidden={() => onToggleHidden(row.key)}
                onRename={(label) => onRename(row.key, label)}
                onResetName={() => onRename(row.key, "")}
                isRenamed={row.key in customization.renamed}
              />
            )}
            {!hidden && (
              eager ? (
                <Row
                  title={<RowTitle row={row} />}
                  scrollKey={`home:${row.key}`}
                  onEndReached={row.hasMore ? () => onLoadMore(row.key) : undefined}
                >
                  {row.metas.map((m, i) => (
                    <PickCard key={`${m.id}-${i}`} meta={m} />
                  ))}
                </Row>
              ) : (
                <LazyMount minHeight={340}>
                  <Row
                    title={row.name}
                    scrollKey={`home:${row.key}`}
                    onEndReached={row.hasMore ? () => onLoadMore(row.key) : undefined}
                  >
                    {row.metas.map((m, i) => (
                      <PickCard key={`${m.id}-${i}`} meta={m} />
                    ))}
                  </Row>
                </LazyMount>
              )
            )}
          </div>
        );
      })}
    </>
  );
}

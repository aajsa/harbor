import type { CalendarItem } from "@/lib/calendar";
import { CalendarChip } from "./calendar-chip";
import type { Cell } from "./types";
import { WEEKDAY_NAMES } from "./utils";

export function MonthGrid({
  cells,
  grouped,
  todayISO,
  onOpenItem,
  onOpenDay,
}: {
  cells: Cell[];
  grouped: Map<string, CalendarItem[]>;
  todayISO: string;
  onOpenItem: (item: CalendarItem) => void;
  onOpenDay: (iso: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-7 gap-2">
        {WEEKDAY_NAMES.map((d) => (
          <div
            key={d}
            className="px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-subtle"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell) => {
          const events = grouped.get(cell.iso) ?? [];
          const isToday = cell.iso === todayISO;
          return (
            <div
              key={cell.iso}
              className={`flex min-h-[112px] flex-col gap-1.5 rounded-xl border p-2 transition-colors ${
                cell.inMonth
                  ? isToday
                    ? "border-ink/60 bg-elevated/40"
                    : "border-edge-soft bg-elevated/15"
                  : "border-edge-soft/40 bg-canvas/30 opacity-50"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span
                  className={`text-[12.5px] font-semibold tabular-nums ${
                    isToday ? "text-ink" : cell.inMonth ? "text-ink-muted" : "text-ink-subtle"
                  }`}
                >
                  {cell.date.getDate()}
                </span>
                {events.length > 0 && (
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                    {events.length}
                  </span>
                )}
              </div>
              <div className="flex min-h-0 flex-col gap-1.5">
                {events.slice(0, 3).map((item) => (
                  <CalendarChip key={item.id} item={item} onOpen={onOpenItem} />
                ))}
                {events.length > 3 && (
                  <button
                    onClick={() => onOpenDay(cell.iso)}
                    className="self-start rounded px-1 text-left text-[11px] text-ink-subtle transition-colors hover:text-ink"
                  >
                    +{events.length - 3} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

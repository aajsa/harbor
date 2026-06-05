import anilistIcon from "@/assets/anilist.png";
import { useSettings } from "@/lib/settings";

const ROWS = [
  { key: "yourLists", label: "Your lists" },
  { key: "trending", label: "Trending" },
  { key: "top100", label: "Top 100" },
] as const;

export function AnilistRowControls() {
  const { settings, update } = useSettings();
  const hidden = settings.animeAnilistRowsHidden;
  const toggle = (key: string) => {
    const next = hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key];
    update({ animeAnilistRowsHidden: next });
  };
  return (
    <div className="flex items-center gap-2 pl-[9px]">
      <span className="mr-1 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
        <img src={anilistIcon} alt="" className="h-[15px] w-[15px] rounded-[3px]" />
        AniList rows
      </span>
      {ROWS.map((r) => {
        const on = !hidden.includes(r.key);
        return (
          <button
            key={r.key}
            type="button"
            onClick={() => toggle(r.key)}
            aria-pressed={on}
            className={`h-9 rounded-full border px-3.5 text-[13px] font-semibold transition-colors ${
              on
                ? "border-accent/50 bg-accent/15 text-accent"
                : "border-edge-soft bg-canvas/40 text-ink-subtle hover:border-edge hover:text-ink-muted"
            }`}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

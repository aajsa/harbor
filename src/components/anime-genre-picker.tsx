import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GENRE } from "@/lib/providers/jikan";

type GenreOption = { id: number; label: string; tagline: string };

const OPTIONS: GenreOption[] = [
  { id: GENRE.Action, label: "Action", tagline: "Fights, chases, kinetic" },
  { id: GENRE.Adventure, label: "Adventure", tagline: "Quests and journeys" },
  { id: GENRE.Comedy, label: "Comedy", tagline: "Light, funny, easy watches" },
  { id: GENRE.Drama, label: "Drama", tagline: "Heavy, emotional arcs" },
  { id: GENRE.Fantasy, label: "Fantasy", tagline: "Magic, kingdoms, isekai" },
  { id: GENRE.SciFi, label: "Sci-Fi", tagline: "Future, tech, space" },
  { id: GENRE.Romance, label: "Romance", tagline: "Love stories" },
  { id: GENRE.SliceOfLife, label: "Slice of Life", tagline: "Everyday, calm" },
  { id: GENRE.Supernatural, label: "Supernatural", tagline: "Spirits, demons, weird" },
  { id: GENRE.Mystery, label: "Mystery", tagline: "Puzzles and reveals" },
  { id: GENRE.Psychological, label: "Psychological", tagline: "Mind games, tension" },
  { id: GENRE.Horror, label: "Horror", tagline: "Dread and fear" },
  { id: GENRE.Thriller, label: "Thriller", tagline: "Edge of seat" },
  { id: GENRE.Mecha, label: "Mecha", tagline: "Giant robots" },
  { id: GENRE.Sports, label: "Sports", tagline: "Teams, training, wins" },
  { id: GENRE.Music, label: "Music", tagline: "Idols and bands" },
];

export function AnimeGenrePicker({
  initial,
  onSave,
  onClose,
}: {
  initial: number[];
  onSave: (genres: number[]) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(() => new Set(initial));

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const toggle = (id: number) => {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = () => {
    onSave(Array.from(selected));
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[210] flex items-center justify-center px-4 py-10">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 -z-10 cursor-default bg-canvas/80 backdrop-blur-xl"
      />
      <div className="relative flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-edge-soft/70 bg-elevated/95 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.85)]">
        <header className="flex items-start gap-4 border-b border-edge-soft/45 px-7 pt-6 pb-5">
          <div className="flex flex-1 flex-col gap-1">
            <h2 className="font-display text-[24px] font-medium leading-tight tracking-tight text-ink">
              Find your next watch
            </h2>
            <p className="text-[13.5px] text-ink-muted">
              Pick the genres you actually want more of. We'll mix them into your Top Picks.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-canvas/60 hover:text-ink"
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-7 py-5">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {OPTIONS.map((opt) => {
              const on = selected.has(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggle(opt.id)}
                  className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors duration-150 ${
                    on
                      ? "border-accent/55 bg-accent/10"
                      : "border-edge-soft/60 bg-canvas/40 hover:border-edge hover:bg-canvas/70"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      on
                        ? "border-accent bg-accent text-canvas"
                        : "border-edge bg-canvas/60 text-transparent group-hover:border-ink-subtle"
                    }`}
                  >
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[14px] font-semibold text-ink">{opt.label}</span>
                    <span className="text-[11.5px] text-ink-subtle">{opt.tagline}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-edge-soft/45 bg-canvas/40 px-7 py-4">
          <span className="text-[12px] text-ink-subtle">
            {selected.size === 0
              ? "Pick at least one or skip for now"
              : `${selected.size} selected`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-[13px] font-medium text-ink-muted transition-colors hover:bg-canvas/60 hover:text-ink"
            >
              Maybe later
            </button>
            <button
              type="button"
              onClick={save}
              disabled={selected.size === 0 && initial.length === 0}
              className="rounded-full bg-ink px-5 py-2 text-[13px] font-semibold text-canvas transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save picks
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

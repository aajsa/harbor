import { useState } from "react";
import { useSettings } from "@/lib/settings";

export function Anime4kShaderList() {
  const { settings, update } = useSettings();
  const [draft, setDraft] = useState("");
  const list = settings.playerAnime4kShaders;
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    update({ playerAnime4kShaders: [...list, t] });
    setDraft("");
  };
  const remove = (i: number) => {
    update({ playerAnime4kShaders: list.filter((_, idx) => idx !== i) });
  };
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-edge-soft bg-canvas/40 px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-[12.5px] font-semibold uppercase tracking-[0.18em] text-ink-subtle">
          Anime4K shaders
        </span>
        <span className="text-[12px] text-ink-subtle/85">
          Absolute paths to .glsl files. Order matters: listed shaders run in sequence. Get them from github.com/bloc97/Anime4K.
        </span>
      </div>
      {list.length > 0 && (
        <ul className="flex flex-col gap-1">
          {list.map((p, i) => (
            <li key={`${p}-${i}`} className="flex items-center gap-2 rounded-lg border border-edge-soft bg-canvas/60 px-2.5 py-1.5">
              <span className="flex-1 truncate font-mono text-[12px] text-ink">{p}</span>
              <button
                onClick={() => remove(i)}
                className="text-[11px] uppercase tracking-[0.16em] text-ink-subtle hover:text-danger"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="C:\Users\you\Anime4K\Anime4K_Restore_CNN_M.glsl"
          className="flex-1 rounded-lg border border-edge-soft bg-canvas/60 px-3 py-1.5 font-mono text-[12.5px] text-ink placeholder:text-ink-subtle/60 focus:border-edge focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
        />
        <button
          onClick={add}
          disabled={!draft.trim()}
          className="rounded-full border border-edge-soft px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-muted hover:border-edge hover:text-ink disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}

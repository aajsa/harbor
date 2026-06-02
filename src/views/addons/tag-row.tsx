import type { ResolvedAddon } from "@/lib/addons-store/store";

export function TagRow({ resolved }: { resolved: ResolvedAddon }) {
  const tags = resolved.curated?.tags ?? [];
  const chips: { label: string; tone: "neutral" | "warn" | "good" }[] = [];
  for (const t of tags) {
    if (t === "official") chips.push({ label: "Official", tone: "good" });
    if (t === "free") chips.push({ label: "Free", tone: "neutral" });
    if (t === "premium") chips.push({ label: "Paid", tone: "warn" });
    if (t === "debrid-required") chips.push({ label: "Debrid required", tone: "warn" });
    if (t === "configurable") chips.push({ label: "Configurable", tone: "neutral" });
    if (t === "usenet") chips.push({ label: "Usenet", tone: "neutral" });
  }
  if (resolved.manifest?.behaviorHints?.adult) chips.push({ label: "Adult", tone: "warn" });
  if (chips.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <span
          key={c.label}
          className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] ${
            c.tone === "good"
              ? "bg-accent/15 text-accent"
              : c.tone === "warn"
                ? "bg-edge text-ink-muted"
                : "bg-edge text-ink-subtle"
          }`}
        >
          {c.label}
        </span>
      ))}
    </div>
  );
}

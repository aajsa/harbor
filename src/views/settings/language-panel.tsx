import { Github } from "lucide-react";
import { useSettings } from "@/lib/settings";
import { openUrl } from "@/lib/window";
import { Section, ToggleRow } from "./shared";
import { LanguagesPicker } from "./streaming-panel";

export function LanguagePanel() {
  const { settings, update } = useSettings();
  return (
    <Section
      title="Preferred languages"
      subtitle="Streams in these languages rank first. Toggle below to drop everything else."
    >
      <LanguagesPicker
        value={settings.preferredLanguages}
        onChange={(langs) => update({ preferredLanguages: langs })}
      />
      <ToggleRow
        label="Only show streams in my languages"
        sub="Hides streams with no detected preferred language. Multi-audio releases count as a match."
        value={settings.requirePreferredLanguage}
        onChange={(v) => update({ requirePreferredLanguage: v })}
      />
      <div className="mt-2 flex flex-col gap-3 rounded-xl border border-edge-soft bg-canvas/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-relaxed text-ink-muted sm:max-w-[480px]">
          Heads up: Harbor was built in English. Multi-language support is partial,
          so your addons usually catch what Harbor's own filters miss. If you speak
          another language and want to help fill the gaps, the source is open.
        </p>
        <button
          onClick={() => openUrl("https://github.com/harborstremio/harbor")}
          className="flex shrink-0 items-center gap-2 self-start rounded-full border border-edge-soft px-4 py-2 text-[12.5px] font-semibold text-ink transition-colors hover:border-edge sm:self-auto"
        >
          <Github size={13} strokeWidth={2.2} />
          Contribute on GitHub
        </button>
      </div>
    </Section>
  );
}

const fs = require('fs');
const path = require('path');

const projectRoot = '/Users/yasser/Downloads/harbor-main newUpdate';

function updateFile(relativePath, replacements) {
  const filePath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Add import if useT is not there
  if (!content.includes('useT')) {
    const importMatch = content.match(/^import .*?;?\n/m);
    if (importMatch) {
      content = content.replace(importMatch[0], `import { useT } from "@/lib/i18n";\n${importMatch[0]}`);
    } else {
      content = `import { useT } from "@/lib/i18n";\n` + content;
    }
  }

  for (const rep of replacements) {
    if (typeof rep.from === 'string') {
      content = content.replace(rep.from, rep.to);
    } else {
      content = content.replace(rep.from, rep.to);
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${relativePath}`);
  } else {
    console.log(`No changes made to ${relativePath}`);
  }
}

// 1. channel-grid.tsx
updateFile('src/views/live/channel-grid.tsx', [
  {
    from: /export function ChannelGrid\(\{\n  channels,/,
    to: `export function ChannelGrid({\n  channels,`
  },
  {
    from: /const \{ visible, sentinelRef, hasMore \} = useLazyVisible\(channels, resetKey\);/,
    to: `const t = useT();\n  const { visible, sentinelRef, hasMore } = useLazyVisible(channels, resetKey);`
  },
  {
    from: /Loading more channels \(\{visible\.length\.toLocaleString\(\)\} of \{channels\.length\.toLocaleString\(\)\}\)/,
    to: `{t("Loading more channels ({n1} of {n2})").replace("{n1}", visible.length.toLocaleString()).replace("{n2}", channels.length.toLocaleString())}`
  },
  {
    from: /Showing first \{visible\.length\.toLocaleString\(\)\} of \{channels\.length\.toLocaleString\(\)\} channels\. Use search or a category to narrow down\./,
    to: `{t("Showing first {n1} of {n2} channels. Use search or a category to narrow down.").replace("{n1}", visible.length.toLocaleString()).replace("{n2}", channels.length.toLocaleString())}`
  },
  {
    from: /All \{channels\.length\.toLocaleString\(\)\} channels loaded/,
    to: `{t("All {n} channels loaded").replace("{n}", channels.length.toLocaleString())}`
  },
  {
    from: /export function ErrorBlock\(\{\n? *message,\n? *onRetry\n? *\} ?: ?\{[^\}]+\}\) \{/,
    to: `export function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {\n  const t = useT();`
  },
  {
    from: /\{classified\.title\}/,
    to: `{t(classified.title)}`
  },
  {
    from: /\{classified\.hint\}/,
    to: `{t(classified.hint)}`
  },
  {
    from: />\n *Try again\n *<\/button>/,
    to: `>\n          {t("Try again")}\n        </button>`
  },
  {
    from: /\{copied \? "Copied" : "Copy error"\}/,
    to: `{copied ? t("Copied") : t("Copy error")}`
  },
  {
    from: /Technical details\n *<\/button>/,
    to: `{t("Technical details")}\n        </button>`
  },
  {
    from: /export function EmptyResult\(\{ onClear \} ?: ?\{ onClear: \(\) => void \}\) \{/,
    to: `export function EmptyResult({ onClear }: { onClear: () => void }) {\n  const t = useT();`
  },
  {
    from: /<h2 className="text-\[16\.5px\] font-semibold text-ink">No channels match<\/h2>/,
    to: `<h2 className="text-[16.5px] font-semibold text-ink">{t("No channels match")}</h2>`
  },
  {
    from: /<p className="text-\[13\.5px\] text-ink-muted">Try a different category or clear your filters\.<\/p>/,
    to: `<p className="text-[13.5px] text-ink-muted">{t("Try a different category or clear your filters.")}</p>`
  },
  {
    from: />\n *Reset filters\n *<\/button>/,
    to: `>\n        {t("Reset filters")}\n      </button>`
  }
]);

// 2. playlist-empty.tsx
updateFile('src/views/live/playlist-empty.tsx', [
  {
    from: /function Intro\(\{ onContinue \} ?: ?\{ onContinue: \(\) => void \}\) \{/,
    to: `function Intro({ onContinue }: { onContinue: () => void }) {\n  const t = useT();`
  },
  {
    from: /Live TV\n *<\/span>/,
    to: `{t("Live TV")}\n          </span>`
  },
  {
    from: />\n *Connect a playlist to get started\.\n *<\/h1>/,
    to: `>\n            {t("Connect a playlist to get started.")}\n          </h1>`
  },
  {
    from: />\n *Connect any IPTV provider\. Channels are sorted by category, EPG is pulled automatically\n *when your provider supplies it, and playback runs through native libmpv\.\n *<\/p>/,
    to: `>\n            {t("Connect any IPTV provider. Channels are sorted by category, EPG is pulled automatically when your provider supplies it, and playback runs through native libmpv.")}\n          </p>`
  },
  {
    from: />\n *Connect a provider\n *<ArrowRight/,
    to: `>\n              {t("Connect a provider")}\n              <ArrowRight`
  },
  {
    from: /title="Multi-view"/,
    to: `title={t("Multi-view")}`
  },
  {
    from: /body="Four channels at once, pre-spawned and swap-ready\."/,
    to: `body={t("Four channels at once, pre-spawned and swap-ready.")}`
  },
  {
    from: /title="Live EPG"/,
    to: `title={t("Live EPG")}`
  },
  {
    from: /body="Now-playing and a seven-day guide when your provider supplies it\."/,
    to: `body={t("Now-playing and a seven-day guide when your provider supplies it.")}`
  },
  {
    from: /title="Native libmpv"/,
    to: `title={t("Native libmpv")}`
  },
  {
    from: /body="HEVC, HDR, TrueHD, plus real subtitle and audio menus\."/,
    to: `body={t("HEVC, HDR, TrueHD, plus real subtitle and audio menus.")}`
  },
  {
    from: /title="Local only"/,
    to: `title={t("Local only")}`
  },
  {
    from: /body="Credentials stored on this device\. Nothing leaves your machine\."/,
    to: `body={t("Credentials stored on this device. Nothing leaves your machine.")}`
  },
  {
    from: /function Form\(\{\n *onBack,\n *onSave,\n\} ?: ?\{[^\}]+\}\) \{/,
    to: `function Form({\n  onBack,\n  onSave,\n}: {\n  onBack: () => void;\n  onSave: (entry: PlaylistFormValue) => void;\n}) {\n  const t = useT();`
  },
  {
    from: />\n *Back\n *<\/button>/,
    to: `>\n          {t("Back")}\n        </button>`
  },
  {
    from: />\n *Connect your provider\.\n *<\/h2>/,
    to: `>\n            {t("Connect your provider.")}\n          </h2>`
  },
  {
    from: />\n *Pick how you authenticate\. Everything is stored locally\.\n *<\/p>/,
    to: `>\n            {t("Pick how you authenticate. Everything is stored locally.")}\n          </p>`
  },
  {
    from: /\{k\.label\}/,
    to: `{t(k.label)}`
  },
  {
    from: /\{k\.blurb\}/,
    to: `{t(k.blurb)}`
  },
  {
    from: /label="Display name"/,
    to: `label={t("Display name")}`
  },
  {
    from: /hint="Optional"/g,
    to: `hint={t("Optional")}`
  },
  {
    from: /label="Playlist URL"/,
    to: `label={t("Playlist URL")}`
  },
  {
    from: /label="EPG URL"/,
    to: `label={t("EPG URL")}`
  },
  {
    from: /label="Server URL"/,
    to: `label={t("Server URL")}`
  },
  {
    from: /label="Username"/,
    to: `label={t("Username")}`
  },
  {
    from: /label="Password"/,
    to: `label={t("Password")}`
  },
  {
    from: /label="EPG \/ XMLTV URL"/,
    to: `label={t("EPG / XMLTV URL")}`
  },
  {
    from: />\n *Cancel\n *<\/button>/,
    to: `>\n              {t("Cancel")}\n            </button>`
  },
  {
    from: />\n *Save and continue\n *<ArrowRight/,
    to: `>\n              {t("Save and continue")}\n              <ArrowRight`
  },
  {
    from: />\n *Stored locally on this device\. Credentials never leave your machine\. If a channel fails to\n *play, your provider may rate-limit shared accounts: refresh the playlist or check with them\.\n *<\/p>/,
    to: `>\n          {t("Stored locally on this device. Credentials never leave your machine. If a channel fails to play, your provider may rate-limit shared accounts: refresh the playlist or check with them.")}\n        </p>`
  }
]);

// 3. live-home.tsx
updateFile('src/views/live/live-home.tsx', [
  {
    from: /export function LiveHome\(\{\n *channels,/,
    to: `export function LiveHome({\n  channels,`
  },
  {
    from: /const countryPrefs = useCountryPrefs\(sourceId\);/,
    to: `const t = useT();\n  const countryPrefs = useCountryPrefs(sourceId);`
  },
  {
    from: />\n *Your TV\n *<\/h1>/,
    to: `>\n            {t("Your TV")}\n          </h1>`
  },
  {
    from: /at \{fmtClock\(nowMs\)\}/,
    to: `{t("at {n}").replace("{n}", fmtClock(nowMs))}`
  },
  {
    from: /title="On now"/,
    to: `title={t("On now")}`
  }
]);

// 4. live.tsx
updateFile('src/views/live.tsx', [
  {
    from: /export function LiveView\(\{ active \} ?: ?\{ active: boolean \}\) \{/,
    to: `export function LiveView({ active }: { active: boolean }) {\n  const t = useT();`
  },
  {
    from: /Pick channels into the grid below\. Audio follows the highlighted tile\./,
    to: `{t("Pick channels into the grid below. Audio follows the highlighted tile.")}`
  },
  {
    from: /placeholder=\{`Search \$\{playlist\?\.channels\.length \?\? 0\} channels`\}/,
    to: `placeholder={t("Search {n} channels").replace("{n}", (playlist?.channels.length ?? 0).toString())}`
  },
  {
    from: />\n *Clear\n *<\/button>/,
    to: `>\n                  {t("Clear")}\n                </button>`
  },
  {
    from: /<span className="font-semibold text-danger">EPG failed:<\/span>/,
    to: `<span className="font-semibold text-danger">{t("EPG failed:")}</span>`
  }
]);

// 5. source-picker.tsx
updateFile('src/views/live/source-picker.tsx', [
  {
    from: /export function SourcePicker\(\{/,
    to: `export function SourcePicker({`
  },
  {
    from: /const \[open, setOpen\] = useState\(false\);/,
    to: `const t = useT();\n  const [open, setOpen] = useState(false);`
  },
  {
    from: /\{active\?\.name \?\? "No playlist"\}/,
    to: `{active?.name ?? t("No playlist")}`
  },
  {
    from: />\n *Add another playlist\n *<\/button>/,
    to: `>\n                    {t("Add another playlist")}\n                  </button>`
  },
  {
    from: /submitLabel="Add"/,
    to: `submitLabel={t("Add")}` // Make sure "Add" translates if in common? Or we can let it fallback
  },
  {
    from: /submitLabel="Save"/,
    to: `submitLabel={t("Save")}`
  },
  {
    from: /function SourceRow\(\{/,
    to: `function SourceRow({`
  },
  {
    from: /const triggerRef = useRef<HTMLButtonElement>\(null\);/,
    to: `const t = useT();\n  const triggerRef = useRef<HTMLButtonElement>(null);`
  },
  {
    from: />\n *Move to top\n *<\/MenuItem>/,
    to: `>\n              {t("Move to top")}\n            </MenuItem>`
  },
  {
    from: />\n *Edit\n *<\/MenuItem>/,
    to: `>\n            {t("Edit")}\n          </MenuItem>`
  },
  {
    from: /\{copied \? "Copied to clipboard" : "Copy URL"\}/,
    to: `{copied ? t("Copied to clipboard") : t("Copy URL")}`
  },
  {
    from: />\n *Export as \.m3u\n *<\/MenuItem>/,
    to: `>\n            {t("Export as .m3u")}\n          </MenuItem>`
  },
  {
    from: />\n *Delete\n *<\/MenuItem>/,
    to: `>\n            {t("Delete")}\n          </MenuItem>`
  },
  {
    from: /\{source\.epgUrl \? "URL \+ EPG saved" : "URL saved"\}/,
    to: `{source.epgUrl ? t("URL + EPG saved") : t("URL saved")}`
  },
  {
    from: /hint=\{!isActive \? "Switch to this playlist first" : undefined\}/,
    to: `hint={!isActive ? t("Switch to this playlist first") : undefined}`
  }
]);

console.log("Done");

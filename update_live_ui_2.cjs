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

  if (relativePath.endsWith('.tsx') && !content.includes('useT')) {
    const importMatch = content.match(/^import .*?;?\n/m);
    if (importMatch) {
      content = content.replace(importMatch[0], `import { useT } from "@/lib/i18n";\n${importMatch[0]}`);
    } else {
      content = `import { useT } from "@/lib/i18n";\n` + content;
    }
  }

  for (const rep of replacements) {
    content = content.replace(rep.from, rep.to);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${relativePath}`);
  } else {
    console.log(`No changes made to ${relativePath}`);
  }
}

// 1. playlist-form.tsx
updateFile('src/views/live/source-picker/playlist-form.tsx', [
  {
    from: /export function PlaylistForm\(\{/,
    to: `export function PlaylistForm({`
  },
  {
    from: /const \[name, setName\] = useState\(initial\.name\);/,
    to: `const t = useT();\n  const [name, setName] = useState(initial.name);`
  },
  {
    from: /<Field label="Type">/,
    to: `<Field label={t("Type")}>`
  },
  {
    from: /\{k\.label\}/,
    to: `{t(k.label)}`
  },
  {
    from: /\{k\.sub\}/,
    to: `{t(k.sub)}`
  },
  {
    from: /<Field label="Name">/,
    to: `<Field label={t("Name")}>`
  },
  {
    from: /<Field label="Playlist URL">/,
    to: `<Field label={t("Playlist URL")}>`
  },
  {
    from: /<Field label="EPG URL \(optional\)">/,
    to: `<Field label={t("EPG URL (optional)")}>`
  },
  {
    from: /<Field label="Server URL">/,
    to: `<Field label={t("Server URL")}>`
  },
  {
    from: /<Field label="Username">/,
    to: `<Field label={t("Username")}>`
  },
  {
    from: /<Field label="Password">/,
    to: `<Field label={t("Password")}>`
  },
  {
    from: /<Field label="EPG \/ XMLTV URL">/,
    to: `<Field label={t("EPG / XMLTV URL")}>`
  },
  {
    from: /Stored as a standalone EPG source\. No channels are loaded for EPG-only entries; they're\n *kept here for future attachment to existing playlists\./,
    to: `{t("Stored as a standalone EPG source. No channels are loaded for EPG-only entries; they're kept here for future attachment to existing playlists.")}`
  },
  {
    from: />\n *Cancel\n *<\/button>/,
    to: `>\n          {t("Cancel")}\n        </button>`
  }
]);

// 2. view-mode-toggle.tsx
updateFile('src/views/live/view-mode-toggle.tsx', [
  {
    from: /export function ViewModeToggle\(\{ mode, onChange \} ?: ?\{ mode: ViewMode; onChange: \(m: ViewMode\) => void \}\) \{/,
    to: `export function ViewModeToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {\n  const t = useT();`
  },
  {
    from: /label="Home"/,
    to: `label={t("Home")}`
  },
  {
    from: /label="Grid"/,
    to: `label={t("Grid")}`
  },
  {
    from: /label="Guide"/,
    to: `label={t("Guide")}`
  },
  {
    from: /label="Multiview"/,
    to: `label={t("Multiview")}`
  }
]);

// 3. live.tsx
updateFile('src/views/live.tsx', [
  {
    from: /<span className="font-semibold text-danger">\{t\("EPG failed:"\)\}<\/span>\n *<span className="min-w-0 flex-1 truncate">\{epgError\}<\/span>/,
    to: `<span className="font-semibold text-danger"></span>\n            <span className="min-w-0 flex-1 truncate">{epgError.replace("EPG fetch failed:", t("EPG fetch failed:"))}</span>`
  }
]);

console.log("Done updates");

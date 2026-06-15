const fs = require('fs');
const tsContent = fs.readFileSync('src/lib/hotkeys.ts', 'utf8');

const regex = /label:\s*"([^"]+)",\s*description:\s*"([^"]+)"/g;
let match;
const additions = {};

while ((match = regex.exec(tsContent)) !== null) {
  additions[match[1]] = match[1];
  additions[match[2]] = match[2];
}

const UI_STRINGS = [
  "Click any binding to rebind it. Press Esc while capturing to cancel. Letters ignore Shift (so K and Shift+K trigger the same action).",
  "Reset all ({count})",
  "Inside the playback view.",
  "Anywhere in Harbor.",
  "Other",
  "Navigation",
  "Playback",
  "Seeking",
  "Volume",
  "Tracks",
  "Speed",
  "Panels",
  "Global",
  "Player",
  "Custom",
  "Conflict",
  "Press a key…",
  "Reset to default",
  "Show your operating system's own title bar with its minimize, maximize, and close buttons. They stay reachable everywhere, including while a video is playing. Turn this off to use Harbor's built-in window buttons.",
];

for (const str of UI_STRINGS) {
  additions[str] = str;
}

const file = 'src/lib/i18n/locales/ar/settings.ts';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const dictEndIdx = lines.findIndex(line => line.trim() === '};');

if (dictEndIdx !== -1) {
  let newLines = [];
  for (const [k, v] of Object.entries(additions)) {
    const safeK = k.replace(/"/g, '\\"');
    const safeV = v.replace(/"/g, '\\"');
    if (!content.includes(`"${safeK}"`)) {
      newLines.push(`  "${safeK}": "${safeV}"`);
    }
  }

  if (newLines.length > 0) {
    if (!lines[dictEndIdx - 1].trim().endsWith(',')) {
      lines[dictEndIdx - 1] = lines[dictEndIdx - 1] + ',';
    }
    lines.splice(dictEndIdx, 0, newLines.join(',\n'));
  }
}

fs.writeFileSync(file, lines.join('\n'));

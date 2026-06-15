const fs = require('fs');

// 1. Fix duplicate t identifiers (anilist-panel and trakt-panel)
// These have sessionAge(t: ...) AND const t = useT() — need to rename the useT one or remove it
function fixDuplicateT(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    // If sessionAge has t as param and next line is const t = useT(), remove it
    if (lines[i].match(/function sessionAge\([^)]*\bt\b/) && lines[i+1]?.match(/const t = useT\(\)/)) {
      lines.splice(i + 1, 1);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`Fixed duplicate t in ${filePath.split('/').pop()}`);
  }
}

// 2. Remove unused const t = useT() from files where the script added it but it's not used
function removeUnusedT(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Check if file has const t = useT() but no t() calls
  // We need to check each function individually  
  // Simpler: check if t is only declared but never called as t("...")
  const tCalls = (content.match(/[^a-zA-Z]t\(["`']/g) || []).length;
  
  if (tCalls === 0) {
    // Remove all const t = useT() lines
    content = content.replace(/\n\s*const t = useT\(\);\n/g, '\n');
    // Remove useT import if it's the only thing imported
    content = content.replace(/^import \{ useT \} from "@\/lib\/i18n";\n/m, '');
    content = content.replace(/,\s*useT\s*\}/g, ' }');
    content = content.replace(/\{\s*useT\s*,/g, '{');
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Removed unused t from ${filePath.split('/').pop()}`);
      return true;
    }
  }
  return false;
}

// Fix duplicates first
fixDuplicateT('/Users/yasser/Downloads/harbor-main newUpdate/src/views/settings/anilist-panel.tsx');
fixDuplicateT('/Users/yasser/Downloads/harbor-main newUpdate/src/views/settings/trakt-panel.tsx');

// Fix unused useT imports/declarations
const filesToCheck = [
  'src/views/settings/player-layout-panel/editor-chrome.tsx',
  'src/views/settings/player-layout-panel/editor-panels.tsx',
  'src/views/settings/player-layout-panel/index.tsx',
  'src/views/settings/player-layout-panel/panel-bars.tsx',
  'src/views/settings/player-panel/bandwidth-section.tsx',
  'src/views/settings/player-panel/custom-code-section.tsx',
  'src/views/settings/player-panel/downloads-section.tsx',
  'src/views/settings/player-panel/internals.tsx',
  'src/views/settings/player-panel/local-engine-section.tsx',
  'src/views/settings/player-panel/play-mode-section.tsx',
  'src/views/settings/player-panel/shell-section.tsx',
  'src/views/settings/player-panel/speed-test.tsx',
  'src/views/settings/relay-panel.tsx',
];

for (const rel of filesToCheck) {
  const full = '/Users/yasser/Downloads/harbor-main newUpdate/' + rel;
  removeUnusedT(full);
}

// Fix control-renderer: useT is imported but translate is used instead
const crPath = '/Users/yasser/Downloads/harbor-main newUpdate/src/components/player/transport/control-renderer.tsx';
let crContent = fs.readFileSync(crPath, 'utf8');
crContent = crContent.replace('import { t as translate, useT } from "@/lib/i18n";', 'import { t as translate } from "@/lib/i18n";');
fs.writeFileSync(crPath, crContent, 'utf8');
console.log('Fixed control-renderer import');

console.log('\nDone!');

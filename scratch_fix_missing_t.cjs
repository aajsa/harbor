const fs = require('fs');

const fixes = {
  'src/views/settings/advanced-panel.tsx': ['BetaChannelRow', 'DiscordPresenceRow', 'OmdbBudgetRow', 'OnboardingRow', 'AboutRow', 'LibraryRepairRow'],
  'src/views/settings/player-layout-panel/editor-panels.tsx': ['AvatarDockBody'],
  'src/views/settings/player-layout-panel/icon-upload.tsx': ['MultiStateUpload', 'PickButton', 'ResetButton'],
  'src/views/settings/player-panel/seek-image-upload.tsx': ['SeekImageUpload'],
  'src/views/settings/region-cascade.tsx': ['LocaleConfirm'],
  'src/views/settings/trakt-panel.tsx': ['sessionAge'],
  'src/views/settings/anilist-panel.tsx': ['sessionAge'],
  'src/components/player/transport/control-renderer.tsx': ['renderControl'],
};

for (const [relPath, funcs] of Object.entries(fixes)) {
  const fullPath = '/Users/yasser/Downloads/harbor-main newUpdate/' + relPath;
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  // Make sure useT is imported
  if (!content.includes('useT') && !content.includes('@/lib/i18n')) {
    // Add import at the top
    content = content.replace(/^(import .+\n)+/, (match) => match + 'import { useT } from "@/lib/i18n";\n');
    changed = true;
  } else if (content.includes('@/lib/i18n') && !content.includes('useT')) {
    content = content.replace(/(from "@\/lib\/i18n")/, '{ useT } from "@/lib/i18n"');
    // This is a simplistic fix, let's just add import
    content = 'import { useT } from "@/lib/i18n";\n' + content;
    changed = true;
  }

  for (const fn of funcs) {
    // Match the function and add useT() after opening brace if not present
    const funcPattern = new RegExp(
      `((?:export\\s+)?(?:async\\s+)?function\\s+${fn}\\s*\\([^)]*\\)[^{]*\\{)([^]*?)\\n`,
      'm'
    );
    
    if (content.includes(`function ${fn}`) && !content.match(new RegExp(`function ${fn}[\\s\\S]{0,200}const t = useT\\(\\)`))) {
      // Insert after the opening { of the function
      const singleLinePattern = new RegExp(
        `(function ${fn}\\b[^{]*\\{)(\n)`,
        'm'
      );
      if (singleLinePattern.test(content)) {
        content = content.replace(singleLinePattern, `$1\n  const t = useT();\n`);
        changed = true;
        console.log(`  Fixed ${fn} in ${relPath}`);
      }
    }
  }

  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated ${relPath}`);
  }
}

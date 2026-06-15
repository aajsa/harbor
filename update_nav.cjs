const fs = require('fs');
const path = require('path');

const files = [
  'siderail.tsx',
  'stremio-rail.tsx',
  'minui-dock.tsx',
  'royal-topbar.tsx',
  'topdock.tsx'
];

const labelMap = {
  '"Home"': '"nav.home"',
  '"Discover"': '"nav.discover"',
  '"Movies"': '"nav.movies"',
  '"Shows"': '"nav.shows"',
  '"Anime"': '"nav.anime"',
  '"Live TV"': '"nav.live"',
  '"Playlists"': '"nav.playlists"',
  '"Calendar"': '"nav.calendar"',
  '"Library"': '"nav.library"',
  '"My Library"': '"nav.library"',
  '"Downloads"': '"nav.downloads"',
  '"Addons"': '"nav.addons"',
  '"Settings"': '"nav.settings"'
};

for (const file of files) {
  const p = path.join('/Users/yasser/Downloads/harbor-main newUpdate/src/chrome', file);
  let content = fs.readFileSync(p, 'utf8');

  // Replace type definition
  content = content.replace(/label: string;/g, 'labelKey: string;');

  // Replace object definitions
  content = content.replace(/label:\s*("[^"]+")/g, (match, p1) => {
    if (labelMap[p1]) {
      return `labelKey: ${labelMap[p1]}`;
    }
    return match;
  });

  // Replace usages in components
  // In siderail.tsx
  content = content.replace(/function RailItem\(\{\n\s*label,\n/g, 'function RailItem({\n  labelKey,\n');
  content = content.replace(/const translated = t\(label\);/g, 'const translated = t(labelKey);');
  content = content.replace(/label=\{tab\.label\}/g, 'labelKey={tab.labelKey}');
  content = content.replace(/label="Settings"/g, 'labelKey="nav.settings"');
  
  // In minui-dock.tsx, topdock.tsx
  content = content.replace(/const label = t\(tab\.label\);/g, 'const label = t(tab.labelKey);');
  content = content.replace(/label,\n\s*active/g, 'labelKey,\n  active'); // usage in NavItem
  content = content.replace(/label: string,\n\s*active/g, 'labelKey: string,\n  active');
  content = content.replace(/function NavItem\(\{[\s\S]*?labelKey/g, match => match); // handle generic replacements
  
  // Actually, minui-dock.tsx NavItem uses `label: string;`
  content = content.replace(/label: string;\n\s*active: boolean;/g, 'labelKey: string;\n  active: boolean;');
  content = content.replace(/label=\{item\.label\}/g, 'labelKey={item.labelKey}');
  content = content.replace(/label=\{t\("nav\.settings"\)\}/g, 'labelKey="nav.settings"'); // for Settings if hardcoded
  
  // In royal-topbar.tsx
  content = content.replace(/const label = t\(item\.label\);/g, 'const label = t(item.labelKey);');
  content = content.replace(/key=\{item\.label\}/g, 'key={item.labelKey}');

  // In stremio-rail.tsx
  content = content.replace(/const label = t\(tab\.label\);/g, 'const label = t(tab.labelKey);');
  content = content.replace(/label=\{tab\.label\}/g, 'labelKey={tab.labelKey}');
  content = content.replace(/key=\{item\.label\}/g, 'key={item.labelKey}');

  // In siderail / topdock / minui-dock: NavItem or RailItem props definitions
  // e.g. function NavItem({ label, active ... }) -> function NavItem({ labelKey, active ... })
  content = content.replace(/function NavItem\(\{\n\s*onClick,\n\s*label,/g, 'function NavItem({\n  onClick,\n  labelKey,');
  content = content.replace(/function NavItem\(\{\n\s*label,/g, 'function NavItem({\n  labelKey,');
  content = content.replace(/label: string;\n\s*children:/g, 'labelKey: string;\n  children:');
  
  // For the actual translated label in those components:
  // we need `const translated = t(labelKey);` or similar. But some of them don't have it.
  // Instead of doing regex spaghetti for component internals, it's safer to just replace `label` with `labelKey` in the destructuring and add `const label = t(labelKey);` if needed, or just let typescript error and I fix it with multi_replace.
  
  fs.writeFileSync(p, content, 'utf8');
}
console.log("Updated files");

const fs = require('fs');
const path = require('path');

const dir = '/Users/yasser/Downloads/harbor-main newUpdate/src/chrome';

// Fix royal-topbar.tsx
let p = path.join(dir, 'royal-topbar.tsx');
let c = fs.readFileSync(p, 'utf8');
// Fix NavEntry
c = c.replace(/type NavEntry = \{[\s\S]*?\};/, match => match.replace(/label: string;/, 'label: string;')); // NavEntry keeps label because we pass translated string
// Fix navEntries map: we have `const label = t(item.labelKey); return { key: item.view, labelKey, ...` -> wait, `labelKey` shorthand?
c = c.replace(/labelKey,\n\s*active,/, 'label,\n      active,');
// Fix WinBtn
c = c.replace(/function WinBtn\(\{\n\s*onClick,\n\s*labelKey,/g, 'function WinBtn({\n  onClick,\n  label,');
c = c.replace(/labelKey: string;\n\s*danger\?: boolean;/g, 'label: string;\n  danger?: boolean;');
c = c.replace(/aria-label=\{labelKey\}/g, 'aria-label={label}');
c = c.replace(/title=\{labelKey\}/g, 'title={label}');
fs.writeFileSync(p, c, 'utf8');

// Fix siderail.tsx
p = path.join(dir, 'siderail.tsx');
c = fs.readFileSync(p, 'utf8');
c = c.replace(/function WinBtn\(\{\n\s*onClick,\n\s*labelKey,/g, 'function WinBtn({\n  onClick,\n  label,');
c = c.replace(/labelKey: string;\n\s*children:/g, 'label: string;\n  children:');
c = c.replace(/aria-label=\{labelKey\}/g, 'aria-label={label}');
c = c.replace(/title=\{labelKey\}/g, 'title={label}');
fs.writeFileSync(p, c, 'utf8');

// Fix topdock.tsx
p = path.join(dir, 'topdock.tsx');
c = fs.readFileSync(p, 'utf8');
// NavEntry keeps label
c = c.replace(/type NavEntry = \{[\s\S]*?\};/, match => match.replace(/label: string;/, 'label: string;'));
c = c.replace(/labelKey,\n\s*active,/g, 'label,\n      active,');
c = c.replace(/function WinBtn\(\{\n\s*onClick,\n\s*labelKey,/g, 'function WinBtn({\n  onClick,\n  label,');
c = c.replace(/labelKey: string;\n\s*children:/g, 'label: string;\n  children:');
// Fix NavItem 
// Oh, NavItem should take labelKey. But search pill passes `label={t("common.search")}`.
// Let's just pass `labelKey` but search uses hardcoded string? Wait, for Search, it's just passing `label={t("common.search")}` to NavItem?
// NavItem takes `labelKey` so Search should pass `labelKey="common.search"`
c = c.replace(/label=\{t\("common\.search"\)\}/, 'labelKey="common.search"');
// WinBtn
c = c.replace(/aria-label=\{labelKey\}/g, 'aria-label={label}');
c = c.replace(/title=\{labelKey\}/g, 'title={label}');
fs.writeFileSync(p, c, 'utf8');

// Fix minui-dock.tsx
p = path.join(dir, 'minui-dock.tsx');
c = fs.readFileSync(p, 'utf8');
c = c.replace(/type DockItem = \{[\s\S]*?\};/, match => match.replace(/label: string;/, 'labelKey: string;'));
c = c.replace(/label=\{item\.label\}/g, 'labelKey={item.labelKey}');
fs.writeFileSync(p, c, 'utf8');

// Fix stremio-rail.tsx
p = path.join(dir, 'stremio-rail.tsx');
c = fs.readFileSync(p, 'utf8');
c = c.replace(/\{ render: \(a\) => <HomeIcon active=\{a\} \/>, label: "Home", view: "home" \},/, '{ render: (a) => <HomeIcon active={a} />, labelKey: "nav.home", view: "home" },');
c = c.replace(/\{ render: \(a\) => <LibraryIcon active=\{a\} \/>, label: "Library", view: "library", parentalKey: "library" \},/, '{ render: (a) => <LibraryIcon active={a} />, labelKey: "nav.library", view: "library", parentalKey: "library" },');
fs.writeFileSync(p, c, 'utf8');

console.log('Fixed TS errors in nav files');

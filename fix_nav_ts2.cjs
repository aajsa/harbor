const fs = require('fs');
const path = require('path');

const dir = '/Users/yasser/Downloads/harbor-main newUpdate/src/chrome';

// Fix minui-dock.tsx
let p = path.join(dir, 'minui-dock.tsx');
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/label: item.label/g, 'labelKey: item.labelKey');
fs.writeFileSync(p, c, 'utf8');

// Fix stremio-rail.tsx
p = path.join(dir, 'stremio-rail.tsx');
c = fs.readFileSync(p, 'utf8');
// The script previously replaced only two labels, let's replace all
c = c.replace(/label: "([^"]+)"/g, (match, p1) => {
  const map = {
    'Home': 'nav.home',
    'Discover': 'nav.discover',
    'Movies': 'nav.movies',
    'Shows': 'nav.shows',
    'Anime': 'nav.anime',
    'Live TV': 'nav.live',
    'Playlists': 'nav.playlists',
    'Calendar': 'nav.calendar',
    'Library': 'nav.library',
    'My Library': 'nav.library',
    'Downloads': 'nav.downloads',
    'Addons': 'nav.addons',
    'Settings': 'nav.settings'
  };
  return map[p1] ? `labelKey: "${map[p1]}"` : match;
});
fs.writeFileSync(p, c, 'utf8');

// Fix topdock.tsx
p = path.join(dir, 'topdock.tsx');
c = fs.readFileSync(p, 'utf8');
c = c.replace(/function NavItem\(\{\n\s*onClick,\n\s*label,/g, 'function NavItem({\n  onClick,\n  labelKey,');
fs.writeFileSync(p, c, 'utf8');

console.log('Fixed remaining TS errors');

const fs = require('fs');
const p = '/Users/yasser/Downloads/harbor-main newUpdate/src/chrome/minui-dock/dock-button.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/background: active \? "var\(--color-accent\)" : "var\(--color-surface\)",/, 'background: active ? "var(--color-elevated)" : "var(--color-surface)",');
c = c.replace(/color: active \? "var\(--color-accent-fg, #fff\)" : "var\(--color-ink-muted\)",/, 'color: active ? "var(--color-accent)" : "var(--color-ink-muted)",');
c = c.replace(/borderColor: active \? "transparent" : "var\(--color-edge-soft\)",/, 'borderColor: active ? "var(--color-edge)" : "var(--color-edge-soft)",');

fs.writeFileSync(p, c, 'utf8');

const fs = require('fs');

const f1 = '/Users/yasser/Downloads/harbor-main newUpdate/src/components/player/transport/seek-bar.tsx';
let c1 = fs.readFileSync(f1, 'utf8');

c1 = c1.replace(
  /const fromEvent = \(clientX: number\): number => \{[\s\S]*?return x \* dur;\n  \};/,
  `const fromEvent = (clientX: number): number => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return 0;
    const isRtl = document.documentElement.dir === "rtl";
    const x = isRtl
      ? Math.max(0, Math.min(1, (r.right - clientX) / r.width))
      : Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    return x * dur;
  };`
);

c1 = c1.replace(
  /className="pointer-events-none absolute -top-9 -translate-x-1\/2 (.*?)"\s*style=\{\{ left: \`\$\{\(hover \/ dur\) \* 100\}%\` \}\}/,
  `className="pointer-events-none absolute -top-9 -translate-x-1/2 rtl:translate-x-1/2 $1"
              style={{ insetInlineStart: \`\${(hover / dur) * 100}%\` }}`
);

fs.writeFileSync(f1, c1, 'utf8');

const f2 = '/Users/yasser/Downloads/harbor-main newUpdate/src/components/player/transport/seek-bar-visual.tsx';
let c2 = fs.readFileSync(f2, 'utf8');

c2 = c2.replace(
  /left: \`\$\{s\.startPct\}%\`,/,
  `insetInlineStart: \`\${s.startPct}%\`,`
);

c2 = c2.replace(
  /className="absolute top-1\/2 -translate-x-1\/2 -translate-y-1\/2 select-none(.*)"\s*style=\{\{ left: \`\$\{leftPct\}%\`, (.*) \}\}/,
  `className="absolute top-1/2 -translate-x-1/2 rtl:translate-x-1/2 -translate-y-1/2 select-none$1"
        style={{ insetInlineStart: \`\${leftPct}%\`, $2 }}`
);

c2 = c2.replace(
  /className="absolute top-1\/2 -translate-x-1\/2 -translate-y-1\/2 shadow-\[0_0_0_4px_rgba\(0,0,0,0\.45\)\](.*)"\s*style=\{\{\s*left: \`\$\{leftPct\}%\`,([\s\S]*?)\}\}/,
  `className="absolute top-1/2 -translate-x-1/2 rtl:translate-x-1/2 -translate-y-1/2 shadow-[0_0_0_4px_rgba(0,0,0,0.45)]$1"
      style={{
        insetInlineStart: \`\${leftPct}%\`,$2}}`
);

fs.writeFileSync(f2, c2, 'utf8');

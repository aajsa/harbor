const fs = require('fs');
const path = require('path');

const BASE = '/Users/yasser/Downloads/harbor-main newUpdate';

// ── 1. Count keys in each AR file ─────────────────────────────────────────
const arDir = `${BASE}/src/lib/i18n/locales/ar`;
const arFiles = fs.readdirSync(arDir).filter(f => f.endsWith('.ts'));

console.log('═══════════════════════════════════════════════════');
console.log('  📦 Arabic Translation Files');
console.log('═══════════════════════════════════════════════════');
let totalKeys = 0;
for (const file of arFiles) {
  const content = fs.readFileSync(path.join(arDir, file), 'utf8');
  const keys = (content.match(/^\s+"[^"]+"\s*:/gm) || []).length;
  totalKeys += keys;
  const status = keys > 0 ? '✅' : '⚠️';
  console.log(`  ${status} ${file.padEnd(22)} ${keys} keys`);
}
console.log(`\n  Total: ${totalKeys} Arabic translation keys\n`);

// ── 2. Check all AR files are imported in ar.ts ───────────────────────────
const arIndexContent = fs.readFileSync(`${BASE}/src/lib/i18n/locales/ar.ts`, 'utf8');
console.log('═══════════════════════════════════════════════════');
console.log('  📋 Import Check (ar.ts)');
console.log('═══════════════════════════════════════════════════');
for (const file of arFiles) {
  const name = file.replace('.ts', '');
  const imported = arIndexContent.includes(`from "./ar/${name}"`);
  const spread = arIndexContent.includes(`...${name}`);
  const ok = imported && spread;
  console.log(`  ${ok ? '✅' : '❌'} ${name.padEnd(18)} import:${imported?'✓':'✗'}  spread:${spread?'✓':'✗'}`);
}

// ── 3. Spot-check critical strings from each section ─────────────────────
const checks = [
  // [file, string_to_check]
  ['settings', 'Display language'],
  ['settings', 'Discord webhook URL'],
  ['settings', 'Backup & restore'],
  ['settings', 'Player engine'],
  ['settings', 'Relay'],
  ['settings', 'System tray'],
  ['settings', 'Privacy'],
  ['settings', 'Get beta updates'],
  ['settings', 'Translate series and movie posters to Arabic if available on TMDB'],
  ['chrome', 'nav.home'],
  ['chrome', 'common.back'],
  ['chrome', 'chrome.watchTogether'],
  ['common', 'Cancel'],
  ['common', 'Search'],
  ['common', 'Loading'],
  ['player', 'Play'],
  ['player', 'Pause'],
  ['player', 'Next Episode'],
  ['player', 'Previous Episode'],
  ['player', 'Fullscreen'],
  ['live', 'Live TV'],
  ['library', 'History'],
  ['addons', 'Discover'],
  ['together', 'Watch Together'],
  ['misc', 'Top 10'],
];

console.log('\n═══════════════════════════════════════════════════');
console.log('  🔍 Spot-Check Critical Strings');
console.log('═══════════════════════════════════════════════════');
let passed = 0, failed = 0;
for (const [file, key] of checks) {
  const content = fs.readFileSync(path.join(arDir, `${file}.ts`), 'utf8');
  const found = content.includes(`"${key}"`);
  if (found) {
    passed++;
    // Extract the Arabic translation
    const match = content.match(new RegExp(`"${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*:\\s*"([^"]+)"`));
    if (match) {
      console.log(`  ✅ ${key.padEnd(45)} → "${match[1].slice(0, 30)}${match[1].length > 30 ? '…' : ''}"`);
    } else {
      console.log(`  ✅ ${key.padEnd(45)} (found, empty value)`);
    }
  } else {
    failed++;
    console.log(`  ❌ ${key.padEnd(45)} MISSING in ${file}.ts`);
  }
}

console.log(`\n  Result: ${passed}/${checks.length} spot-checks passed, ${failed} missing\n`);
console.log('═══════════════════════════════════════════════════');
console.log('  📊 Summary');
console.log('═══════════════════════════════════════════════════');
console.log(`  Total AR keys:    ${totalKeys}`);
console.log(`  Spot checks:      ${passed}/${checks.length} ✅`);
console.log(`  Status:           ${failed === 0 ? '🟢 All Good' : '🔴 Some missing'}`);
console.log('═══════════════════════════════════════════════════');

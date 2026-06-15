const fs = require('fs');
const content = fs.readFileSync('src/lib/i18n/locales/ar/settings.ts', 'utf8');

const prefixMatch = content.match(/^(const settings: Record<string, string> = {)([\s\S]*?)(^};)$/m);
if (!prefixMatch) {
  console.log("Could not find settings object");
  process.exit(1);
}

const prefix = content.slice(0, content.indexOf(prefixMatch[1]) + prefixMatch[1].length);
const suffix = content.slice(content.indexOf(prefixMatch[3]));

const dictContent = prefixMatch[2];
const lines = dictContent.split('\n');
const result = [];
const seenKeys = new Set();

// parse from bottom to top so we keep the newest entries
for (let i = lines.length - 1; i >= 0; i--) {
  const line = lines[i];
  if (!line.trim()) continue;
  
  const match = line.match(/^\s*"((?:[^"\\]|\\.)*)":\s*"(.*)"(,?)\s*$/);
  if (match) {
    const key = match[1];
    if (seenKeys.has(key)) {
      continue;
    }
    seenKeys.add(key);
    result.unshift(line);
  } else {
    // maybe a comment or something
    result.unshift(line);
  }
}

// ensure proper commas
for (let i = 0; i < result.length; i++) {
  if (i === result.length - 1) {
    result[i] = result[i].replace(/,\s*$/, '');
  } else {
    if (!result[i].endsWith(',') && result[i].trim().startsWith('"')) {
      result[i] = result[i] + ',';
    }
  }
}

fs.writeFileSync('src/lib/i18n/locales/ar/settings.ts', prefix + '\n' + result.join('\n') + '\n' + suffix);

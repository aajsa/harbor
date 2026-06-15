const fs = require('fs');
const file = 'src/lib/i18n/locales/ar/settings.ts';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const seenKeys = new Set();
const newLines = [];

for (const line of lines) {
  const match = line.match(/^\s*"([^"]+)"\s*:/);
  if (match) {
    const key = match[1];
    if (seenKeys.has(key)) {
      console.log('Removing duplicate key:', key);
      continue;
    }
    seenKeys.add(key);
  }
  newLines.push(line);
}

fs.writeFileSync(file, newLines.join('\n'));

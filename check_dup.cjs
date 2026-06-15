const fs = require('fs');

const content = fs.readFileSync('/Users/yasser/Downloads/harbor-main newUpdate/src/lib/i18n/locales/ar/live.ts', 'utf8');

const keys = [];
const lines = content.split('\n');
lines.forEach((line, i) => {
  const match = line.match(/^\s*(["']?)(.*?)\1\s*:/);
  if (match) {
    const key = match[2];
    if (keys.includes(key)) {
      console.log(`Duplicate key "${key}" on line ${i + 1}`);
    }
    keys.push(key);
  }
});

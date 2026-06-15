const fs = require('fs');
const content = fs.readFileSync('src/lib/i18n/locales/ar/settings.ts', 'utf8');
const lines = content.split('\n');
const result = [];
const seenKeys = new Set();

let inDict = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('const settings: Record<string, string> = {')) {
    inDict = true;
    result.push(line);
    continue;
  }
  
  if (inDict && line.trim() === '};') {
    inDict = false;
    // ensure previous line doesn't have a trailing comma
    if (result.length > 0 && result[result.length - 1].endsWith(',')) {
      result[result.length - 1] = result[result.length - 1].slice(0, -1);
    }
    result.push(line);
    continue;
  }
  
  if (inDict) {
    const match = line.match(/^\s*"([^"]+)":\s*".*",?$/);
    if (match) {
      const key = match[1];
      if (seenKeys.has(key)) {
        continue;
      }
      seenKeys.add(key);
      
      // if this is the last item and it doesn't have a comma, add it because we might add more
      if (!line.endsWith(',')) {
        result.push(line + ',');
      } else {
        result.push(line);
      }
    } else {
      result.push(line);
    }
  } else {
    result.push(line);
  }
}

fs.writeFileSync('src/lib/i18n/locales/ar/settings.ts', result.join('\n'));

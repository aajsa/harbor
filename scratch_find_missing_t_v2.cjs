const fs = require('fs');
const path = require('path');

function walk(dir, results = []) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, results);
    else if (f.endsWith('.tsx') || f.endsWith('.ts')) results.push(full);
  }
  return results;
}

const files = walk('src/views/settings').concat(walk('src/components/player'));
const problems = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Look for const t = useT() placed inside function params (the bad pattern)
  const badPattern = /function\s+\w+\s*\(\s*\{[^}]*const t = useT\(\)/s;
  if (badPattern.test(content)) {
    problems.push(file.replace('/Users/yasser/Downloads/harbor-main newUpdate/', ''));
  }
}

if (problems.length === 0) {
  console.log('✅ No misplaced useT() found in function params!');
} else {
  console.log(`❌ Found ${problems.length} file(s) with misplaced const t = useT() inside function params:\n`);
  for (const p of problems) {
    console.log(`  📄 ${p}`);
  }
}

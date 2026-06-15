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
  
  // Check if file uses t() calls
  const tCalls = content.match(/[^a-zA-Z]t\(["`']/g);
  if (!tCalls) continue;
  
  // Count function bodies that use t() but don't define it
  // Split into function-like blocks
  const lines = content.split('\n');
  let braceDepth = 0;
  let funcStart = -1;
  let funcHasT = false;
  let funcDefinesT = false;
  let funcName = '';
  const badFunctions = new Set();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // detect function start
    const funcMatch = line.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)/);
    if (funcMatch && braceDepth === 0) {
      funcName = funcMatch[1];
      funcStart = i;
      funcHasT = false;
      funcDefinesT = false;
    }
    
    // count braces
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      else if (ch === '}') braceDepth--;
    }
    
    // detect t() usage (not import/type lines)
    if (!line.trim().startsWith('import') && !line.trim().startsWith('//')) {
      if (/[^a-zA-Z]t\(["`']|^t\(["`']/.test(line)) funcHasT = true;
      if (/const t = useT\(\)/.test(line)) funcDefinesT = true;
    }
    
    // function ended
    if (braceDepth === 0 && funcStart >= 0) {
      if (funcHasT && !funcDefinesT && funcName) {
        badFunctions.add(funcName);
      }
      funcStart = -1;
      funcHasT = false;
      funcDefinesT = false;
      funcName = '';
    }
  }

  if (badFunctions.size > 0) {
    problems.push({ file: file.replace('/Users/yasser/Downloads/harbor-main newUpdate/', ''), functions: [...badFunctions] });
  }
}

if (problems.length === 0) {
  console.log('✅ No problems found!');
} else {
  console.log(`❌ Found ${problems.length} file(s) with missing t():\n`);
  for (const p of problems) {
    console.log(`📄 ${p.file}`);
    for (const fn of p.functions) {
      console.log(`   ↳ function ${fn}() — missing const t = useT()`);
    }
    console.log('');
  }
}

const fs = require('fs');
const BASE = '/Users/yasser/Downloads/harbor-main newUpdate/src/lib/i18n/locales/ar';

// The "missing" keys are actually stored differently (unquoted or in different files)
// Let's check the actual t() call key format vs. what's stored

// Fix 1: settings.ts - add the Translate toggles strings  
const settingsPath = `${BASE}/settings.ts`;
let settings = fs.readFileSync(settingsPath, 'utf8');
const settingsToAdd = {
  "Translate series and movie posters to Arabic if available on TMDB": "ترجمة أغلفة المسلسلات والأفلام إلى العربية إذا كانت متاحة على TMDB",
  "If enabled, posters will display the Arabic title. Disable this to keep the original English poster.": "إذا كان مفعلاً، ستعرض الأغلفة العنوان بالعربية. عطّله للإبقاء على الغلاف الإنجليزي الأصلي.",
  "Translate descriptions and synopsis to Arabic": "ترجمة الأوصاف والملخصات إلى العربية",
  "Enable this to fetch Arabic descriptions for series and movies when available on TMDB.": "فعّل هذا لجلب الأوصاف بالعربية للمسلسلات والأفلام عند توفرها على TMDB.",
};
let settingsToAppend = '';
for (const [k, v] of Object.entries(settingsToAdd)) {
  if (!settings.includes(`"${k}"`)) {
    settingsToAppend += `  "${k}": "${v}",\n`;
  }
}
if (settingsToAppend) {
  settings = settings.replace(/};\s*\nexport default settings;/, `${settingsToAppend}};\n\nexport default settings;`);
  fs.writeFileSync(settingsPath, settings, 'utf8');
  console.log('✅ Added missing strings to settings.ts');
}

// Fix 2: player.ts - add missing player strings
const playerPath = `${BASE}/player.ts`;
let player = fs.readFileSync(playerPath, 'utf8');
const playerToAdd = {
  "Play": "تشغيل",
  "Pause": "إيقاف مؤقت",
  "Next Episode": "الحلقة التالية",
  "Previous Episode": "الحلقة السابقة",
  "Fullscreen": "ملء الشاشة",
  "Exit fullscreen": "الخروج من ملء الشاشة",
  "Picture in Picture": "صورة داخل صورة",
  "Switch stream": "تغيير المصدر",
  "TV Guide": "دليل القنوات",
  "Back": "رجوع",
  "Live": "مباشر",
  "Title info": "معلومات العنوان",
  "Mute": "كتم الصوت",
  "Unmute": "إلغاء كتم الصوت",
  "Subtitles": "ترجمات",
  "Audio": "الصوت",
  "Speed": "السرعة",
};
let playerToAppend = '';
for (const [k, v] of Object.entries(playerToAdd)) {
  if (!player.includes(`"${k}"`)) {
    playerToAppend += `  "${k}": "${v}",\n`;
  }
}
if (playerToAppend) {
  player = player.replace(/};\s*\nexport default player;/, `${playerToAppend}};\n\nexport default player;`);
  fs.writeFileSync(playerPath, player, 'utf8');
  console.log('✅ Added missing strings to player.ts');
}

// Fix 3: library.ts - check History
const libraryPath = `${BASE}/library.ts`;
let library = fs.readFileSync(libraryPath, 'utf8');
if (!library.includes('"History"')) {
  library = library.replace(/};\s*\nexport default library;/, `  "History": "السجل",\n};\n\nexport default library;`);
  fs.writeFileSync(libraryPath, library, 'utf8');
  console.log('✅ Added History to library.ts');
}

// Fix 4: together.ts - check Watch Together
const togetherPath = `${BASE}/together.ts`;
let together = fs.readFileSync(togetherPath, 'utf8');
if (!together.includes('"Watch Together"')) {
  together = together.replace(/};\s*\nexport default together;/, `  "Watch Together": "المشاهدة معاً",\n};\n\nexport default together;`);
  fs.writeFileSync(togetherPath, together, 'utf8');
  console.log('✅ Added Watch Together to together.ts');
}

// Fix 5: misc.ts - check Top 10
const miscPath = `${BASE}/misc.ts`;
let misc = fs.readFileSync(miscPath, 'utf8');
if (!misc.includes('"Top 10"')) {
  misc = misc.replace(/};\s*\nexport default misc;/, `  "Top 10": "أفضل 10",\n};\n\nexport default misc;`);
  fs.writeFileSync(miscPath, misc, 'utf8');
  console.log('✅ Added Top 10 to misc.ts');
}

// addons.ts - Discover
const addonsPath = `${BASE}/addons.ts`;
let addons = fs.readFileSync(addonsPath, 'utf8');
if (!addons.includes('"Discover"')) {
  addons = addons.replace(/};\s*\nexport default addons;/, `  "Discover": "اكتشف",\n};\n\nexport default addons;`);
  fs.writeFileSync(addonsPath, addons, 'utf8');
  console.log('✅ Added Discover to addons.ts');
}

console.log('\nDone! Re-run audit to verify.');

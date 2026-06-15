const fs = require('fs');

const filePath = '/Users/yasser/Downloads/harbor-main newUpdate/src/lib/i18n/locales/ar/live.ts';
let content = fs.readFileSync(filePath, 'utf8');

const additions = `
  "Type": "النوع",
  "M3U URL": "رابط M3U",
  "Direct .m3u link": "رابط .m3u مباشر",
  "Xtream": "Xtream",
  "Server + login": "الخادم + تسجيل الدخول",
  "EPG": "EPG",
  "XMLTV only": "XMLTV فقط",
  "Name": "الاسم",
  "Playlist URL": "رابط قائمة التشغيل",
  "EPG URL (optional)": "رابط EPG (اختياري)",
  "EPG fetch failed:": "فشل جلب EPG:",
  "Home": "الرئيسية",
  "Grid": "شبكة",
  "Guide": "دليل",
  "Multiview": "متعدد",
  "Server URL": "رابط الخادم",
  "Username": "اسم المستخدم",
  "Password": "كلمة المرور",
  "EPG / XMLTV URL": "رابط EPG / XMLTV",
  "Stored as a standalone EPG source. No channels are loaded for EPG-only entries; they're kept here for future attachment to existing playlists.": "يتم حفظه كمصدر EPG مستقل. لا يتم تحميل أي قنوات لإدخالات EPG فقط؛ بل يتم الاحتفاظ بها هنا لربطها مستقبلاً بقوائم التشغيل الحالية."
`;

content = content.replace(/};/, additions + '\n};\n');
fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated live.ts");

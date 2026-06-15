const fs = require('fs');
const path = '/Users/yasser/Downloads/harbor-main newUpdate/src/lib/i18n/locales/ar/settings.ts';
let content = fs.readFileSync(path, 'utf8');

const translations = {
  // Advanced panel
  "Updates": "التحديثات",
  "Harbor checks harbor.site for new versions and installs them in place. Nothing installs until you choose to, and a dismissed update never nags you again.": "يتحقق Harbor من harbor.site للبحث عن إصدارات جديدة ويثبتها. لا يتم تثبيت أي شيء حتى تختار ذلك.",
  "API budget": "ميزانية API",
  "Daily call counter for OMDb rating lookups. Reset if it stops returning fresh scores.": "عداد الاستدعاءات اليومية للتقييمات من OMDb. أعد التعيين إذا توقف عن إرجاع نتائج.",
  "Onboarding": "الإعداد الأولي",
  "Replay the walkthrough or unhide every dismissed tip in the app.": "أعد تشغيل الجولة التعريفية أو أظهر جميع التلميحات المخفية.",
  "Stremio library repair": "إصلاح مكتبة Stremio",
  "Scans your Stremio library and rewrites any item whose shape doesn't match Stremio's exact schema. Safe to run anytime; only items that need fixing get touched.": "يفحص مكتبة Stremio ويعيد كتابة أي عنصر لا يطابق المخطط الدقيق. آمن التشغيل في أي وقت.",
  "About": "حول",
  "Build identity. Useful when filing a bug report at bugs@harbor.site.": "معرّف الإصدار. مفيد عند تقديم تقرير خطأ على bugs@harbor.site.",
};

let toAppend = '';
for (const [en, ar] of Object.entries(translations)) {
  if (!content.includes(`"${en}":`)) {
    toAppend += `  "${en}": "${ar}",\n`;
  }
}
if (toAppend) {
  content = content.replace(/};\s*\nexport default settings;/, `${toAppend}};\n\nexport default settings;`);
  fs.writeFileSync(path, content, 'utf8');
  console.log("Added advanced panel translations.");
} else {
  console.log("All already exist.");
}

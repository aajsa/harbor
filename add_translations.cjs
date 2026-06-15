const fs = require('fs');
const p = '/Users/yasser/Downloads/harbor-main newUpdate/src/lib/i18n/locales/ar/misc.ts';
let c = fs.readFileSync(p, 'utf8');

const newTranslations = `  "update.ready": "التحديث جاهز للتثبيت",
  "update.installing": "جارٍ تثبيت التحديث",
  "update.downloading": "جارٍ تنزيل التحديث",
  "update.failed": "فشل التحديث",
  "update.available": "تحديث متاح",
  "update.harborVersion": "Harbor {version}",
  "update.downloadComplete": "اكتمل التنزيل",
  "update.fetching": "جلب أحدث إصدار",
  "update.errorServer": "حدث خطأ أثناء الاتصال بخادم التحديث.",
  "update.later": "لاحقاً",
  "update.download": "تنزيل",
  "update.installRestart": "تثبيت وإعادة تشغيل",
  "update.restartAuto": "سيعاد تشغيل Harbor تلقائياً.",
  "update.tryAgain": "المحاولة مرة أخرى",
  "update.keepUsing": "استمر في استخدام Harbor أثناء التنزيل",
  "update.of": "{downloaded} من {total}",
};`;

c = c.replace(/};\s*export default misc;/, newTranslations + '\n\nexport default misc;');

fs.writeFileSync(p, c, 'utf8');

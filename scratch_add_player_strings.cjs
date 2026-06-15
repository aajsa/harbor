const fs = require('fs');
const path = '/Users/yasser/Downloads/harbor-main newUpdate/src/lib/i18n/locales/ar/settings.ts';
let content = fs.readFileSync(path, 'utf8');

const translations = {
  // Player & Quality
  "Player engine": "محرك التشغيل",
  "MPV (native, recommended)": "MPV (أصلي، موصى به)",
  "HTML5 (browser-based)": "HTML5 (مستند للمتصفح)",
  "Player shell": "واجهة المشغل",
  "Seek bar style": "نمط شريط التقدم",
  "Playback speed": "سرعة التشغيل",
  "Subtitle appearance": "مظهر الترجمة",
  "Subtitle font size": "حجم خط الترجمة",
  "Subtitle background": "خلفية الترجمة",
  "Play mode": "وضع التشغيل",
  "Auto next episode": "التالية تلقائياً",
  "Automatically play the next episode when the current one ends.": "تشغيل الحلقة التالية تلقائياً عند انتهاء الحالية.",
  "Local engine address": "عنوان المحرك المحلي",
  "Remote server": "الخادم البعيد",
  "Custom MPV code": "كود MPV مخصص",
  "Anime4K shaders": "تظليلات Anime4K",
  "Server address": "عنوان الخادم",
  "Connection": "الاتصال",
  "Downloading to": "التنزيل إلى",
  "Downloads folder": "مجلد التنزيلات",
  "Speed test": "اختبار السرعة",
  "Run speed test": "تشغيل اختبار السرعة",
  "Test": "اختبار",
  "Internals": "إعدادات داخلية",
  // Player layout
  "Player layout": "تخطيط المشغل",
  "Layouts": "التخطيطات",
  "New layout": "تخطيط جديد",
  "Save layout": "حفظ التخطيط",
  "Delete layout": "حذف التخطيط",
  "Layout name": "اسم التخطيط",
  "Upload icon": "رفع أيقونة",
  "Add element": "إضافة عنصر",
  "Top bar": "الشريط العلوي",
  "Bottom bar": "الشريط السفلي",
  "Inspector": "المفتش",
  "Options": "خيارات",
  "Controls": "أدوات التحكم",
  "Reset layout": "إعادة تعيين التخطيط",
  // Relay
  "Relay": "المرحّل",
  "Deploy relay": "نشر المرحّل",
  "Relay URL": "رابط المرحّل",
  "Test relay": "اختبار المرحّل",
  "Relay status": "حالة المرحّل",
  "Relay docs": "وثائق المرحّل",
  "Redeploy": "إعادة النشر",
  "Your relay": "مرحّلك",
  "Relay panel": "لوحة المرحّل",
  "Set up a Cloudflare relay for Watch Together": "إعداد مرحّل Cloudflare للمشاهدة المشتركة",
  "Copy relay URL": "نسخ رابط المرحّل",
  "Relay is up to date": "المرحّل محدّث",
  "Relay needs update": "المرحّل يحتاج تحديث",
  "Relay not reachable": "المرحّل غير متاح",
  "Checking…": "جارٍ التحقق…",
  "Check relay": "فحص المرحّل",
  "Relay test passed": "نجح اختبار المرحّل",
  "Relay test failed": "فشل اختبار المرحّل",
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
  console.log("Added player/relay translations.");
} else {
  console.log("All already exist.");
}

const fs = require('fs');
const path = '/Users/yasser/Downloads/harbor-main newUpdate/src/lib/i18n/locales/ar/settings.ts';
let content = fs.readFileSync(path, 'utf8');

const translations = {
  "Discord webhook URL": "رابط Webhook الخاص بـ Discord",
  "Sending…": "جارٍ الإرسال…",
  "Sent. Check your channel.": "تم الإرسال. تحقق من قناتك.",
  "Failed": "فشل",
  "Sources": "المصادر",
  "Pick which calendars feed your webhook. Items are deduped across sources before sending.": "اختر التقويمات التي تُغذّي الـ Webhook. يتم إزالة التكرار من المصادر قبل الإرسال.",
  "Types": "الأنواع",
  "Filter by media type after the sources merge. Leave them all on to send everything.": "فلترة حسب نوع الوسائط بعد دمج المصادر. اتركها جميعاً مفعلة لإرسال كل شيء.",
  "Movies": "أفلام",
  "TV": "مسلسلات",
  "Anime": "أنمي",
  "My library": "مكتبتي",
  "Episodes and movies from shows you've saved on Stremio.": "حلقات وأفلام من المسلسلات التي حفظتها على Stremio.",
  "All upcoming": "كل القادم",
  "Everything releasing in the current month from TMDB.": "كل ما يصدر خلال الشهر الحالي من TMDB.",
  "My Trakt": "قائمة Trakt",
  "Upcoming episodes and movies from your Trakt watchlist.": "الحلقات والأفلام القادمة من قائمة مشاهدتك على Trakt.",
  "Anticipated": "المُترقَّبة",
  "The most anticipated upcoming releases on Trakt. No login needed.": "أكثر الإصدارات القادمة ترقباً على Trakt. لا يلزم تسجيل الدخول.",
  "Custom calendar": "تقويم مخصص",
  "Anything matching your Custom calendar: tracked people, genres, providers, countries.": "كل ما يتطابق مع تقويمك المخصص: أشخاص متابَعون، أنواع، مزوّدون، دول.",
  "Sign in to Stremio first.": "سجّل الدخول إلى Stremio أولاً.",
  "Add a TMDB key in Library settings.": "أضف مفتاح TMDB في إعدادات المكتبة.",
  "Connect Trakt first.": "اربط Trakt أولاً.",
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
  console.log("Added webhook translations.");
} else {
  console.log("All already exist.");
}

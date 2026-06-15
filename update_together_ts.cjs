const fs = require('fs');

const filePath = '/Users/yasser/Downloads/harbor-main newUpdate/src/lib/i18n/locales/ar/together.ts';
let content = fs.readFileSync(filePath, 'utf8');

const additions = `
  "Invite via link": "دعوة عبر رابط",
  "Watch together": "المشاهدة معاً",
  "Back": "رجوع",
  "Invite": "دعوة",
  "Paste invite link": "لصق رابط الدعوة",
  "Join": "انضمام",
  "Open Settings": "فتح الإعدادات",
  "Your name": "اسمك",
  "Starting…": "جاري البدء…",
  "Start a new room": "بدء غرفة جديدة",
  "or join": "أو انضمام",
  "or paste an invite link": "أو الصق رابط دعوة",
  "Try again": "حاول مرة أخرى",
  "Room code": "رمز الغرفة",
  "{n} watching": "{n} يشاهدون",
  "Show cursors": "إظهار المؤشرات",
  "Leave room": "مغادرة الغرفة",
  "Watch Together needs a relay.": "المشاهدة معاً تتطلب اتصالاً وسيطاً (Relay).",
  "A relay is a tiny Cloudflare Worker that passes play/pause/seek messages between you and your friends. No video data ever touches it. Deploy your own in one click (free tier is plenty), or paste a friend's invite link to use theirs.": "الوسيط هو عبارة عن أداة Cloudflare Worker صغيرة تقوم بتمرير رسائل التشغيل/الإيقاف/التقديم بينك وبين أصدقائك. لا تمر أي بيانات فيديو من خلاله أبداً. قم بنشر الوسيط الخاص بك بنقرة واحدة (الخطة المجانية كافية)، أو الصق رابط دعوة من صديق لاستخدام الوسيط الخاص به."
`;

content = content.replace(/};/, additions + '\n};\n');
fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated together.ts");

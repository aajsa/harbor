const fs = require('fs');

const file = 'src/lib/i18n/locales/ar/settings.ts';
let content = fs.readFileSync(file, 'utf8');

const translations = {
  "Local engine": "المحرك المحلي",
  "Built-in peer-to-peer streaming, served from your own machine.": "بث مدمج من نظير إلى نظير، يُقدم من جهازك الخاص.",
  "RUNNING": "قيد التشغيل",
  "Port": "المنفذ",
  "Active torrents": "التورنت النشطة",
  "Run self-test": "تشغيل الفحص الذاتي",
  "Restart engine": "إعادة تشغيل المحرك",
  "Your streaming server address": "عنوان خادم البث الخاص بك",
  "Harbor runs a small streaming server right on this computer. This is where it lives. To stream from this machine on another device, copy the Wi-Fi address and paste it into Remote streaming server in Harbor over there.": "يقوم Harbor بتشغيل خادم بث صغير على هذا الكمبيوتر. هذا هو مكانه. للبث من هذا الجهاز على جهاز آخر، انسخ عنوان Wi-Fi والصقه في 'خادم البث عن بُعد' في Harbor هناك.",
  "NOT RUNNING": "لا يعمل",
  "ON THIS COMPUTER": "على هذا الكمبيوتر",
  "FROM OTHER DEVICES ON YOUR WI-FI": "من أجهزة أخرى على نفس الـ WI-FI",
  "Start server": "بدء الخادم",
  "Harbor in your browser": "Harbor في متصفحك",
  "Serves this exact install of Harbor as a web app on your network. Open it on a phone, laptop, or TV browser, sign in there, and it streams through this computer.": "يقدم نفس نسخة Harbor هذه كتطبيق ويب على شبكتك. افتحه على متصفح هاتف أو كمبيوتر محمول أو تلفاز، وسجل الدخول هناك، وسيتم البث من خلال هذا الكمبيوتر.",
  "Remote streaming server": "خادم البث عن بُعد",
  "Point Harbor at a streaming server on another machine, like the Stremio service on a home server. Torrents download and stream from that machine instead of this one.": "وجّه Harbor إلى خادم بث على جهاز آخر، مثل خدمة Stremio على خادم منزلي. سيتم تنزيل وبث التورنت من ذلك الجهاز بدلاً من هذا.",
  "OFF": "إيقاف",
  "Custom code": "أكواد مخصصة",
  "Checking": "جاري التحقق",
  "Running": "قيد التشغيل",
  "Starting": "جاري البدء",
  "Not running": "لا يعمل",
  "On this computer": "على هذا الكمبيوتر",
  "From other devices on your Wi-Fi": "من أجهزة أخرى على نفس الـ Wi-Fi",
  "Stop": "إيقاف",
  "Restart": "إعادة تشغيل",
  "From any browser on your Wi-Fi": "من أي متصفح على نفس الـ Wi-Fi",
  "Couldn't start on port {WEB_PORT}. Another app may be using it; toggle off and on to retry.": "تعذر البدء على المنفذ {WEB_PORT}. قد يكون هناك تطبيق آخر يستخدمه؛ قم بإيقاف التشغيل ثم إعادة التشغبل للمحاولة مرة أخرى.",
  "Time format": "تنسيق الوقت",
  "What the clock labels show on the seek bar.": "ما تظهره تسميات الساعة على شريط التمرير.",
  "Elapsed and remaining": "المنقضي والمتبقي",
  "00:23 on the left, -1:12 on the right.": "00:23 على اليسار، -1:12 على اليمين.",
  "Remaining only": "المتبقي فقط",
  "Single -1:12 label, both ends collapse.": "تسمية واحدة -1:12، ينهار كلا الطرفين.",
  "Elapsed only": "المنقضي فقط",
  "Single 00:23 label, both ends collapse.": "تسمية واحدة 00:23، ينهار كلا الطرفين.",
  "Volume control": "التحكم في مستوى الصوت",
  "How the volume widget behaves on click and hover.": "كيف يتصرف أداة الصوت عند النقر والتمرير.",
  "Slider": "شريط التمرير",
  "Hover the speaker to reveal a horizontal slider.": "مرر فوق مكبر الصوت لإظهار شريط تمرير أفقي.",
  "Stepper": "متدرج",
  "Click to cycle 100 / 75 / 50 / 25 / 0.": "انقر للتنقل بين 100 / 75 / 50 / 25 / 0.",
  "Icon only": "أيقونة فقط",
  "Click toggles mute. Wheel scrolls volume.": "النقر يبدل الكتم. العجلة تمرر مستوى الصوت."
};

const lines = content.split('\n');
const dictEndIdx = lines.findIndex(line => line.trim() === '};');

if (dictEndIdx !== -1) {
  let additions = [];
  for (const [k, v] of Object.entries(translations)) {
    // Escape string values for TS
    const safeK = k.replace(/"/g, '\\"');
    const safeV = v.replace(/"/g, '\\"');
    if (!content.includes(`"${safeK}"`)) {
      additions.push(`  "${safeK}": "${safeV}"`);
    }
  }

  if (additions.length > 0) {
    if (!lines[dictEndIdx - 1].trim().endsWith(',')) {
      lines[dictEndIdx - 1] = lines[dictEndIdx - 1] + ',';
    }
    lines.splice(dictEndIdx, 0, additions.join(',\n'));
  }
}

fs.writeFileSync(file, lines.join('\n'));

const fs = require('fs');

const path = '/Users/yasser/Downloads/harbor-main newUpdate/src/lib/i18n/locales/ar/settings.ts';
let content = fs.readFileSync(path, 'utf8');

const translations = {
  "Harbor checks harbor.site for new versions and installs them in place. Nothing installs until you choose to, and a dismissed update never nags you again.": "يتحقق Harbor من harbor.site للبحث عن إصدارات جديدة ويثبتها في مكانها. لا يتم تثبيت أي شيء حتى تختار ذلك، ولن يزعجك إشعار التحديث المرفوض مرة أخرى.",
  "Backup & restore": "النسخ الاحتياطي والاستعادة",
  "Export your entire Harbor setup to a single file, then restore it on a new computer or keep it as a backup. Everything is included except your Stremio sign-in.": "قم بتصدير إعدادات Harbor بالكامل إلى ملف واحد، ثم استعدها على جهاز كمبيوتر جديد أو احتفظ بها كنسخة احتياطية. كل شيء متضمن باستثناء تسجيل الدخول إلى Stremio الخاص بك.",
  "Privacy": "الخصوصية",
  "Harbor sends no telemetry. This also drops outbound ad, analytics, and tracker requests that addons or metadata providers try to make, before they leave your machine.": "لا يرسل Harbor أي بيانات تتبع (telemetry). وهذا يوقف أيضًا طلبات الإعلانات، التحليلات، ومتتبعات البيانات الصادرة التي تحاول الإضافات أو مزودو البيانات الوصفية إجراؤها، قبل أن تغادر جهازك.",
  "System tray": "شريط النظام",
  "Keep Harbor a click away. Close it to the system tray instead of quitting, and control it from the tray menu. These also mirror into the tray menu live.": "أبقِ Harbor على بُعد نقرة. أغلقه ليتجه إلى شريط النظام بدلاً من إنهائه، وتحكم فيه من قائمة الشريط. وتنعكس هذه التغييرات أيضًا في قائمة الشريط مباشرةً.",
  "Stremio install links": "روابط تثبيت Stremio",
  "Harbor catches stremio:// install links so the configure-and-install flow stays inside the app. Every install also syncs to your Stremio account, so the official app remains the canonical home for your library.": "يلتقط Harbor روابط التثبيت stremio:// بحيث تبقى عملية الإعداد والتثبيت داخل التطبيق. تتم مزامنة كل تثبيت مع حسابك في Stremio أيضًا، بحيث يظل التطبيق الرسمي هو المرجع الأساسي لمكتبتك.",
  "Discord Rich Presence": "Discord Rich Presence",
  "Let your Discord friends see what you are watching, with the show poster and a live progress bar. Desktop only, and only your own Discord client is involved (nothing touches a Harbor server).": "دع أصدقاءك على Discord يرون ما تشاهده، مع بوستر العرض وشريط تقدم مباشر. متوفر للديسكتوب فقط، ولا يتطلب سوى برنامج Discord الخاص بك (لا شيء يمر عبر خوادم Harbor).",
  "Export everything": "تصدير كل شيء",
  "Saves your whole Harbor setup to one file: theme, home layout, settings, addons, profiles, watchlist, player layouts, watch progress, and more. Your Stremio sign-in is left out on purpose.": "يحفظ كل إعدادات Harbor الخاصة بك في ملف واحد: المظهر، تخطيط الشاشة الرئيسية، الإعدادات، الإضافات، الملفات الشخصية، قائمة المشاهدة، تخطيطات المشغل، تقدم المشاهدة والمزيد. يُستثنى تسجيل الدخول الخاص بك في Stremio عمداً.",
  "Export": "تصدير",
  "Restore from a backup": "استعادة من نسخة احتياطية",
  "Loads a backup file and replaces your current setup with it. Perfect for a new computer. Your Stremio sign-in on this device stays as is.": "يقوم بتحميل ملف النسخة الاحتياطية واستبدال الإعداد الحالي به. مثالي لجهاز كمبيوتر جديد. تسجيل الدخول إلى Stremio الخاص بك على هذا الجهاز يبقى كما هو.",
  "Restore": "استعادة",
  "Could not build the backup file.": "تعذر إنشاء ملف النسخة الاحتياطية.",
  "Could not read that file.": "تعذر قراءة هذا الملف.",
  "Restore this backup?": "هل تريد استعادة هذه النسخة الاحتياطية؟",
  "This replaces your current Harbor setup (theme, home layout, settings, addons, profiles, and more) with the {n} saved entries in this file. Your Stremio sign-in stays as is. Harbor reloads when it finishes.": "سيؤدي هذا إلى استبدال إعداد Harbor الحالي (المظهر، تخطيط الشاشة الرئيسية، الإعدادات، الإضافات، الملفات الشخصية، والمزيد) بالإدخالات الـ {n} المحفوظة في هذا الملف. سيبقى تسجيل دخولك إلى Stremio كما هو. سيعاد تحميل Harbor عند الانتهاء.",
  "Saved {d} from Harbor {a}.": "تم الحفظ {d} من Harbor {a}.",
  "an unknown date": "تاريخ غير معروف",
  "Restoring...": "جاري الاستعادة...",
  "Restore and reload": "استعادة وإعادة تحميل",
  "Block ads & trackers": "حظر الإعلانات وأدوات التتبع",
  "Watching for ad, analytics, and tracking requests. Harbor itself sends zero telemetry.": "مراقبة طلبات الإعلانات، التحليلات، وأدوات التتبع. لا يرسل Harbor نفسه أي بيانات تتبع.",
  "{n} tracker request blocked this session. Harbor itself sends zero telemetry.": "تم حظر طلب تتبع واحد في هذه الجلسة. لا يرسل Harbor نفسه أي بيانات تتبع.",
  "{n} tracker requests blocked this session. Harbor itself sends zero telemetry.": "تم حظر {n} طلبات تتبع في هذه الجلسة. لا يرسل Harbor نفسه أي بيانات تتبع.",
  "Ad, analytics, and tracking requests pass through untouched.": "تمر طلبات الإعلانات، التحليلات، وأدوات التتبع دون مساس.",
  "Close to the system tray": "الإغلاق إلى شريط النظام",
  "Closing the window tucks Harbor into the tray instead of quitting, so it reopens instantly. Right-click the tray icon for quick controls, or pick Quit to exit fully.": "إغلاق النافذة يُخفي Harbor في شريط النظام بدلاً من إنهائه، لذلك يفتح مجدداً على الفور. انقر بزر الماوس الأيمن على أيقونة الشريط للوصول للتحكم السريع، أو اختر خروج للإغلاق نهائياً.",
  "Always on top": "دائماً في المقدمة",
  "Keep the Harbor window above other windows.": "احتفظ بنافذة Harbor فوق النوافذ الأخرى.",
  "Pause when minimized": "إيقاف مؤقت عند التصغير",
  "Stop playback when you minimize Harbor or send it to the tray.": "إيقاف التشغيل عند تصغير Harbor أو إرساله إلى شريط النظام.",
  "Pause when unfocused": "إيقاف مؤقت عند فقدان التركيز",
  "Stop playback whenever another window takes focus.": "إيقاف التشغيل كلما أخذت نافذة أخرى التركيز.",
  "Catch stremio:// install links inside Harbor": "التقاط روابط تثبيت stremio:// داخل Harbor",
  "Harbor's in-app installer animates the manifest install and keeps you in context. Anything Harbor installs is also synced to your Stremio account, so the official app stays the canonical library. Turn this off and Stremio becomes the only handler for stremio:// links; Harbor still installs anything you trigger from inside the app (Configure & install, paste, drag-and-drop).": "يقوم مثبت Harbor الداخلي بعرض حركات تثبيت المانيفست ويبقيك في سياق التطبيق. كل ما يثبته Harbor يتزامن أيضاً مع حساب Stremio الخاص بك، لذلك يبقى التطبيق الرسمي هو المكتبة الأساسية. أوقف تشغيل هذا الخيار وسيصبح Stremio المعالج الوحيد لروابط stremio://؛ بينما سيستمر Harbor بتثبيت أي شيء تطلبه من داخل التطبيق (إعداد وتثبيت، لصق، سحب وإفلات).",
  "Heads up: if Stremio is also installed, Windows may ask which app to use the first time a stremio:// link fires. Pick Harbor to make it stick.": "تنبيه: إذا كان تطبيق Stremio مثبتًا أيضًا، فقد يسأل Windows عن التطبيق الذي تريد استخدامه في المرة الأولى التي يتم فيها تشغيل رابط stremio://. اختر Harbor لجعله الخيار الافتراضي.",
  "stremio:// links now open in the Stremio app. Harbor will only install when you trigger it from inside Harbor.": "تفتح روابط stremio:// الآن في تطبيق Stremio. سيثبت Harbor الإضافات فقط عند طلبك من داخل Harbor.",
  "Show on Discord": "إظهار في Discord",
  "Display what you are watching on your Discord profile, with the show poster and a live progress bar. Requires the Discord desktop app to be running.": "أظهر ما تشاهده في ملفك الشخصي على Discord، مع بوستر العرض وشريط تقدم مباشر. يتطلب تشغيل تطبيق Discord على الديسكتوب.",
  "Hide the title": "إخفاء العنوان",
  "Show 'Watching something' with no show name or poster.": "عرض 'يشاهد شيئاً ما' بدون اسم العرض أو البوستر.",
  "Show while paused": "إظهار عند الإيقاف المؤقت",
  "Keep the presence visible when playback is paused.": "إبقاء الحالة مرئية عندما يكون التشغيل موقوفاً مؤقتاً.",
  "Show while browsing": "إظهار أثناء التصفح",
  "Display 'Browsing Harbor' when nothing is playing.": "عرض 'يتصفح Harbor' عندما لا يتم تشغيل أي شيء.",
  "Show poster": "إظهار البوستر",
  "Reveal the show or movie artwork. Off keeps the title but hides the poster.": "إظهار صورة العرض أو الفيلم. الإيقاف يُبقي العنوان ويُخفي البوستر.",
  "Show elapsed time": "إظهار الوقت المنقضي",
  "Display the live progress bar showing how far into the title you are.": "عرض شريط تقدم مباشر يوضح مدى تقدمك في العنوان.",
  "Watch party join button": "زر الانضمام إلى حفلة المشاهدة (Watch party)",
  "Add a Join button with your room link while you're in a watch party.": "أضف زر انضمام (Join) مع رابط غرفتك أثناء تواجدك في حفلة المشاهدة.",
  "And for the naughty ones: browsing or rating an adult addon never shows on Discord.": "ولمن يهمهم الأمر: تصفح أو تقييم الإضافات للبالغين لا يظهر أبدًا على Discord."
};

let toAppend = '';
for (const [en, ar] of Object.entries(translations)) {
  if (!content.includes(`"${en}":`)) {
    toAppend += `  "${en}": "${ar}",\n`;
  }
}

if (toAppend) {
  content = content.replace(/};\s*export default settings;\s*$/, `${toAppend}};\n\nexport default settings;\n`);
  fs.writeFileSync(path, content, 'utf8');
  console.log("Added advanced panel translations.");
} else {
  console.log("All advanced panel translations already exist.");
}

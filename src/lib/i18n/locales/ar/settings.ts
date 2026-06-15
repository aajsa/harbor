const settings: Record<string, string> = {
  "Display language": "لغة العرض",
  "Interface language": "لغة الواجهة",
  "Metadata language": "لغة البيانات الوصفية",
  Language: "اللغة",
  "Region": "المنطقة",
  "Region & language": "المنطقة واللغة",
  "English (default)": "الإنجليزية (افتراضي)",
  "Apply {language}": "تطبيق {language}",
  "Switch Harbor to {language}?": "تبديل Harbor إلى {language}؟",
  "Just change region": "تغيير المنطقة فقط",
  "Metadata providers": "مزوّدو البيانات الوصفية",
  "Content filters": "مرشّحات المحتوى",
  "Custom poster service": "خدمة ملصقات مخصّصة",
  "Badge position": "موضع الشارة",

  "Sets the language of Harbor's own interface: menus, buttons, and labels. Arabic switches the layout to right to left. This is separate from subtitle and metadata languages below.":
    "يحدّد لغة واجهة Harbor نفسها: القوائم والأزرار والتسميات. تبدّل العربية التخطيط من اليمين إلى اليسار. وهذا منفصل عن لغتي الترجمة والبيانات الوصفية أدناه.",
  "Switch the menus and buttons to your language. Arabic flips the layout to right to left.":
    "بدّل القوائم والأزرار إلى لغتك. تقلب العربية التخطيط من اليمين إلى اليسار.",
  "This sets the interface, metadata, subtitle, and audio languages to match.":
    "يضبط هذا لغات الواجهة والبيانات الوصفية والترجمة والصوت لتتطابق.",
  "Titles, overviews, and taglines from TMDB display in this language when a translation exists. Needs a TMDB key.":
    "تُعرض العناوين والملخصات والشعارات من TMDB بهذه اللغة عند توفّر ترجمة. يتطلب مفتاح TMDB.",
  "Used for streaming availability and the Now Playing release window. Pick a country and Harbor can match the interface, metadata, and subtitle languages to it.":
    "يُستخدم لتوفّر البث ونافذة إصدار \"يُعرض الآن\". اختر دولة ليتمكّن Harbor من مطابقة لغات الواجهة والبيانات الوصفية والترجمة معها.",

  "A free TMDB key is highly recommended. It unlocks the full Harbor experience. The rest are optional, and Cinemeta works out of the box without any.":
    "يُنصح بشدة بمفتاح TMDB المجاني. فهو يفتح تجربة Harbor الكاملة. والبقية اختيارية، وتعمل Cinemeta مباشرةً بدون أي مفتاح.",
  "TMDB asks for an app URL when you create the key. Put any URL at all, like https://harbor.app. The only thing you need back is the API key.":
    "تطلب TMDB رابط تطبيق عند إنشاء المفتاح. ضع أي رابط على الإطلاق، مثل https://harbor.app. كل ما تحتاجه في المقابل هو مفتاح الـ API.",

  "TMDB · catalogs and rails": "TMDB · الكتالوجات والصفوف",
  "RPDB · scores baked into posters": "RPDB · تقييمات مدمجة في الملصقات",
  "OMDb · Rotten Tomatoes scores": "OMDb · تقييمات Rotten Tomatoes",
  "MDBList · Letterboxd and Trakt scores": "MDBList · تقييمات Letterboxd وTrakt",
  "Fanart.tv · logos and backdrops": "Fanart.tv · الشعارات والخلفيات",
  "TheTVDB · episode data": "TheTVDB · بيانات الحلقات",

  "RPDB already paints scores onto the poster. Toggle to override.":
    "يرسم RPDB التقييمات على الملصق بالفعل. بدّل للتجاوز.",
  "MyAnimeList scores for anime titles. RPDB doesn't cover anime, so this stays optional.":
    "تقييمات MyAnimeList لعناوين الأنمي. لا يغطّي RPDB الأنمي، لذا يبقى هذا اختياريًا.",

  "v3 API key": "مفتاح API الإصدار 3",
  "8-character key": "مفتاح من 8 أحرف",
  "personal key": "مفتاح شخصي",
  "subscriber API key": "مفتاح API للمشتركين",
  "mdblist api key": "مفتاح MDBList API",
  "rpdb key": "مفتاح RPDB",
  "https://posters.example.com or a pattern with {id}":
    "https://posters.example.com أو نمط يحتوي على {id}",
  "The yellow chip in the poster corner.": "الشارة الصفراء في زاوية الملصق.",

  "Hide adult content": "إخفاء المحتوى للبالغين",
  "Filters out streams from adult catalogs and addons. On by default.":
    "يستبعد البثوث من كتالوجات وإضافات البالغين. مفعّل افتراضيًا.",
  "Hide anime": "إخفاء الأنمي",
  "Removes the Anime tab and any Trending/Popular/Upcoming/New anime rows from Home.":
    "يزيل علامة تبويب الأنمي وأي صفوف أنمي رائجة/شائعة/قادمة/جديدة من الرئيسية.",
  "Hide Live TV": "إخفاء البث المباشر",
  "Removes the Live TV tab from the sidebar.": "يزيل علامة تبويب البث المباشر من الشريط الجانبي.",
  "Hide entire categories. Toggling these also removes the matching sidebar entries and rails.":
    "إخفاء فئات بأكملها. يؤدي تبديل هذه أيضًا إلى إزالة مدخلات الشريط الجانبي والصفوف المطابقة.",
  "Show Playlists tab": "إظهار علامة تبويب قوائم التشغيل",
  "Adds a Playlists item to the navigation for browsing movies and shows from your M3U or Xtream playlists (the same ones you add for Live TV). Off by default to keep the nav tidy.":
    "يضيف عنصر قوائم التشغيل إلى شريط التنقل لتصفّح الأفلام والمسلسلات من قوائم M3U أو Xtream (نفسها التي تضيفها للبث المباشر). معطّل افتراضيًا للحفاظ على ترتيب التنقل.",

  "Show IMDb score on cards": "إظهار تقييم IMDb على البطاقات",
  "Show MAL score on cards": "إظهار تقييم MAL على البطاقات",
  "Show Rotten Tomatoes score on cards": "إظهار تقييم Rotten Tomatoes على البطاقات",

  "Use mpv engine": "استخدام محرك mpv",
  "Show sources hidden by the trust filter": "إظهار المصادر المخفية بواسطة مرشّح الثقة",

  "Blur spoilers": "تمويه الحرق",
  "Blur thumbnails": "تمويه الصور المصغّرة",
  "Blur titles": "تمويه العناوين",
  "Blur descriptions": "تمويه الأوصاف",
  "Spoilers": "الحرق",
  "Hides spoiler-prone episode details in episode lists until you have watched them.":
    "يخفي تفاصيل الحلقات المعرّضة للحرق في قوائم الحلقات حتى تشاهدها.",
  "Blur episode artwork, titles, and descriptions for episodes you have not watched yet, on both shows and anime. Hover an episode to peek.":
    "تمويه صور الحلقات وعناوينها وأوصافها للحلقات التي لم تشاهدها بعد، في المسلسلات والأنمي معًا. مرّر فوق حلقة لإلقاء نظرة.",
  "Leave the episode you are up to clear and only blur the ones after it.":
    "اترك الحلقة التي وصلت إليها واضحة وموّه فقط ما بعدها.",
  "Keep the next episode visible": "إبقاء الحلقة التالية ظاهرة",

  "Hides anime from the Home Continue Watching row. It still appears in the Anime tab's own Continue Watching.":
    "يخفي الأنمي من صف متابعة المشاهدة في الرئيسية. ويظل يظهر في متابعة المشاهدة الخاصة بعلامة تبويب الأنمي.",
  "Keep anime in the Anime room only": "إبقاء الأنمي في غرفة الأنمي فقط",

  "Start with subtitles off": "البدء مع إيقاف الترجمة",
  "Harbor still finds and loads subtitles so they're one click away in the player, it just won't turn them on automatically.":
    "يظل Harbor يبحث عن الترجمات ويحمّلها لتكون على بُعد نقرة واحدة في المشغّل، لكنه لن يفعّلها تلقائيًا.",
  "Prefer embedded subtitles": "تفضيل الترجمات المدمجة",
  "When the file ships its own subtitle track, keep it selected instead of switching to a downloaded one. Embedded tracks are usually the best synced.":
    "عندما يأتي الملف بمسار ترجمة خاص به، أبقِه محدّدًا بدلًا من التبديل إلى ترجمة مُنزّلة. المسارات المدمجة عادةً أفضل من حيث التزامن.",
  "Forced subs with native audio": "ترجمة إجبارية مع الصوت الأصلي",
  "When the audio already matches your subtitle language, pick a forced track (foreign dialogue and signs only) instead of full subtitles. If the file has no forced track, subtitles stay off.":
    "عندما يطابق الصوت لغة ترجمتك بالفعل، اختر مسارًا إجباريًا (الحوار الأجنبي واللافتات فقط) بدلًا من الترجمة الكاملة. وإن لم يكن للملف مسار إجباري، تبقى الترجمة معطّلة.",

  "Preferred languages": "اللغات المفضّلة",
  "Only show streams in my languages": "إظهار البثوث بلغاتي فقط",
  "Show {langs} only": "إظهار {langs} فقط",
  "{langs} only · {n} hidden": "{langs} فقط · {n} مخفي",
  "Hides streams with no detected preferred language. Multi-audio releases count as a match.":
    "يخفي البثوث التي لا توجد بها لغة مفضّلة مكتشفة. وتُحتسب الإصدارات متعددة الصوت كمطابقة.",
  "Streams in these languages rank first. Toggle below to drop everything else.":
    "تأتي البثوث بهذه اللغات أولًا. بدّل أدناه لإسقاط كل ما عداها.",
  "When playback starts, Harbor automatically finds and loads a subtitle in one of these languages, so you never have to search by hand. The first available match wins, so put your main language first.":
    "عند بدء التشغيل، يجد Harbor تلقائيًا ترجمة بإحدى هذه اللغات ويحمّلها، فلا تضطر للبحث يدويًا أبدًا. تفوز أول مطابقة متاحة، لذا ضع لغتك الأساسية أولًا.",

  "Never auto-select tracks containing": "عدم اختيار المسارات تلقائيًا التي تحتوي على",
  "commentary, descriptive": "تعليق صوتي، وصفي",
  "Comma-separated words. Audio or subtitle tracks whose name matches any of these are skipped during automatic selection. You can still pick them by hand in the player.":
    "كلمات مفصولة بفواصل. تُتخطّى مسارات الصوت أو الترجمة التي يطابق اسمها أيًا منها أثناء الاختيار التلقائي. وما زال بإمكانك اختيارها يدويًا في المشغّل.",
  "When a release ships multiple audio tracks, Harbor selects the first match from this list.":
    "عندما يأتي إصدار بمسارات صوت متعددة، يختار Harbor أول مطابقة من هذه القائمة.",

  "By default, addon rails that duplicate the built-in ones (Trending, Popular, Top Rated, etc.) are merged so you don't see the same row twice. Turn this on to show every one, duplicates and all.":
    "افتراضيًا، تُدمج صفوف الإضافات التي تكرّر الصفوف المدمجة (الرائج، الشائع، الأعلى تقييمًا، إلخ) حتى لا ترى الصف نفسه مرتين. فعّل هذا لإظهار كل صف، بما في ذلك التكرارات.",
  "When you back out of a title, Harbor saves a frame so the Continue Watching card looks like the spot you left. Tune how long they stick around, or wipe them all.":
    "عند خروجك من عنوان، يحفظ Harbor لقطة لتبدو بطاقة متابعة المشاهدة مثل المكان الذي تركته. اضبط مدة بقائها، أو امسحها جميعًا.",
  "When you finish an episode, the Home Continue Watching card moves on to the next episode instead of sitting at 0 minutes left.":
    "عند انتهائك من حلقة، تنتقل بطاقة متابعة المشاهدة في الرئيسية إلى الحلقة التالية بدلًا من البقاء عند 0 دقيقة متبقية.",
  "Keep the Library Watchlist tab limited to titles you added in Stremio. Turn this off to also include anything Stremio auto-added when you pressed play.":
    "أبقِ علامة تبويب قائمة المشاهدة في المكتبة مقتصرة على العناوين التي أضفتها في Stremio. عطّل هذا لتضمين أي شيء أضافه Stremio تلقائيًا عند الضغط على تشغيل.",

  "Heads up: Harbor was built in English. Multi-language support is partial, so your addons usually catch what Harbor's own filters miss. If you speak another language and want to help fill the gaps, the source is open.":
    "تنبيه: بُني Harbor بالإنجليزية. دعم تعدد اللغات جزئي، لذا تلتقط إضافاتك عادةً ما تفوّته مرشّحات Harbor نفسها. إن كنت تتحدث لغة أخرى وتريد المساعدة في سدّ الثغرات، فالمصدر مفتوح.",
  "Contribute on GitHub": "ساهم على GitHub",

  "Search settings": "ابحث في الإعدادات",
  "{n} tab": "علامة تبويب واحدة",
  "{n} tabs": "{n} علامات تبويب",
  "{n} option": "خيار واحد",
  "{n} options": "{n} خيارات",

  Account: "الحساب",
  "Your Stremio sign-in. Library, watch progress, and addons sync from here.":
    "تسجيل دخولك إلى Stremio. تتزامن المكتبة وتقدّم المشاهدة والإضافات من هنا.",
  "Library & metadata": "المكتبة والبيانات الوصفية",
  "Optional keys that unlock TMDB rails, baked-in poster ratings, fanart, and TVDB episode data.":
    "مفاتيح اختيارية تفتح صفوف TMDB وتقييمات الملصقات المدمجة والصور الفنية وبيانات حلقات TVDB.",
  "Connect your Trakt account to scrobble playback, sync your watchlist, and pull personalized recommendations.":
    "اربط حساب Trakt لتسجيل التشغيل ومزامنة قائمة المشاهدة وجلب توصيات مخصّصة.",
  "Connect your AniList account to show your anime lists as rails on the Anime page.":
    "اربط حساب AniList لعرض قوائم الأنمي الخاصة بك كصفوف في صفحة الأنمي.",
  "Connect your Simkl account to mark what you finish as watched and sync your plan-to-watch list across apps.":
    "اربط حساب Simkl لتمييز ما تنهيه كمُشاهد ومزامنة قائمة \"أنوي مشاهدته\" عبر التطبيقات.",
  "Harbor Relay": "مُرحّل Harbor",
  "Watch Together rooms are routed through Harbor's hosted relay.":
    "تُوجّه غرف المشاهدة الجماعية عبر المُرحّل المستضاف من Harbor.",
  "A Cloudflare Worker on your own account that hosts your Watch Together rooms.":
    "عامل Cloudflare على حسابك الخاص يستضيف غرف المشاهدة الجماعية.",
  "Streaming sources": "مصادر البث",
  "How Harbor finds and resolves playable streams. Debrid keys and addon installs live here.":
    "كيف يجد Harbor البثوث القابلة للتشغيل ويحلّها. مفاتيح Debrid وتثبيت الإضافات هنا.",
  Languages: "اللغات",
  "Which audio and subtitle languages rank first in stream lists.":
    "أي لغات الصوت والترجمة تأتي أولًا في قوائم البث.",
  "Player & quality": "المشغّل والجودة",
  "Pick the playback engine and which quality chips show up on cards.":
    "اختر محرك التشغيل وأي شارات جودة تظهر على البطاقات.",
  "Player layout": "تخطيط المشغّل",
  "Pick a theme, then rearrange every button in the player chrome. Hide what you never use, promote what you do.":
    "اختر سمة، ثم أعد ترتيب كل زر في واجهة المشغّل. أخفِ ما لا تستخدمه، وقدّم ما تستخدمه.",
  Hotkeys: "اختصارات لوحة المفاتيح",
  "Every shortcut Harbor responds to. Click a binding to rebind it.":
    "كل اختصار يستجيب له Harbor. انقر على ارتباط لإعادة تعيينه.",
  "Theme & appearance": "السمة والمظهر",
  "Color presets, custom backgrounds, and the font pair Harbor renders in.":
    "إعدادات الألوان المسبقة والخلفيات المخصّصة وزوج الخطوط الذي يعرض به Harbor.",
  Webhooks: "خطافات الويب",
  "Push upcoming releases to Discord or Telegram. Pick which calendars feed the notifications.":
    "ادفع الإصدارات القادمة إلى Discord أو Telegram. اختر أي تقاويم تغذّي الإشعارات.",
  "Report a bug": "الإبلاغ عن خلل",
  "Send a bug report straight to the Harbor team. Screenshots and screen recordings welcome.":
    "أرسل بلاغ خلل مباشرةً إلى فريق Harbor. لقطات الشاشة وتسجيلات الشاشة مرحّب بها.",
  Advanced: "متقدّم",
  "Diagnostics, manual overrides, things most users never need.":
    "التشخيصات والتجاوزات اليدوية وأشياء لا يحتاجها معظم المستخدمين أبدًا.",
  Streaming: "البث",
  Playback: "التشغيل",
  Appearance: "المظهر",
  Notifications: "الإشعارات",
  Help: "مساعدة",
  System: "النظام",

  "Harbor identity": "هوية Harbor",
  "Your face in Watch Together rooms, sessions, and chat. Sits on top of your Stremio account.":
    "وجهك في غرف المشاهدة الجماعية والجلسات والدردشة. يوضع فوق حساب Stremio الخاص بك.",
  "Stremio account": "حساب Stremio",
  "Library, watch progress, and addon collection sync from this account.":
    "تتزامن المكتبة وتقدّم المشاهدة ومجموعة الإضافات من هذا الحساب.",
  "Synced addons": "الإضافات المتزامنة",
  "Harbor pulls your addon collection from Stremio. Manage individual addons in Streaming sources.":
    "يسحب Harbor مجموعة إضافاتك من Stremio. أدِر الإضافات الفردية في مصادر البث.",
  "Upload photo": "رفع صورة",
  "Reset to Stremio avatar": "الإعادة إلى صورة Stremio",
  Email: "البريد الإلكتروني",
  "Stremio ID": "معرّف Stremio",
  Reveal: "إظهار",
  "Re-authenticate": "إعادة المصادقة",
  "Not signed in": "غير مسجّل الدخول",
  "Sign in to sync your library, watch progress, and addons.":
    "سجّل الدخول لمزامنة مكتبتك وتقدّم المشاهدة والإضافات.",
  "Sign in to Stremio first. Your installed addons sync from there.":
    "سجّل الدخول إلى Stremio أولًا. تتزامن إضافاتك المثبّتة من هناك.",
  "addon synced": "إضافة متزامنة",
  "addons synced": "إضافات متزامنة",
  "Syncing…": "جارٍ المزامنة…",
  "Sync now": "المزامنة الآن",
  "Last synced {n}s ago.": "آخر مزامنة قبل {n} ثانية.",
  "Show {n} more addons": "إظهار {n} إضافة أخرى",
  "All addons ({n})": "كل الإضافات ({n})",

  "Authorize Harbor on Trakt": "تفويض Harbor على Trakt",
  "We opened {url} in your browser. Enter the code below.":
    "فتحنا {url} في متصفّحك. أدخل الرمز أدناه.",
  Copied: "تم النسخ",
  Copy: "نسخ",
  "I authorized it": "لقد فوّضته",
  "Waiting for Trakt…": "بانتظار Trakt…",
  "Connected as @{user}": "متصل باسم ‎@{user}‎",
  "Connect Trakt": "ربط Trakt",
  "Plays + ratings sync from Harbor to Trakt.tv.":
    "تتزامن المشاهدات والتقييمات من Harbor إلى Trakt.tv.",
  "Mirror plays + ratings to Trakt.tv. Uses Trakt's device flow: enter a short code in your browser.":
    "انسخ المشاهدات والتقييمات إلى Trakt.tv. يستخدم تدفّق الأجهزة من Trakt: أدخل رمزًا قصيرًا في متصفّحك.",
  Starting: "جارٍ البدء",
  "Starting…": "جارٍ البدء…",
  Connect: "ربط",
  "Set up": "إعداد",
  "Client ID": "معرّف العميل",
  "Client secret": "السرّ السرّي للعميل",
  "Save credentials": "حفظ بيانات الاعتماد",

  "Connect your AniList account": "اربط حساب AniList",
  "Show your AniList lists as rails on the Anime page, keep your watch progress in sync as you finish episodes, and use your AniList avatar as your Harbor photo. Free at anilist.co.":
    "اعرض قوائم AniList الخاصة بك كصفوف في صفحة الأنمي، وحافظ على مزامنة تقدّم مشاهدتك مع إنهاء الحلقات، واستخدم صورة AniList كصورة Harbor. مجانًا على anilist.co.",
  "Connect AniList": "ربط AniList",
  "About AniList": "عن AniList",
  "Harbor shows your AniList lists on the Anime page and keeps your progress in sync.":
    "يعرض Harbor قوائم AniList الخاصة بك في صفحة الأنمي ويحافظ على مزامنة تقدّمك.",
  Connected: "متصل",
  Disconnect: "قطع الاتصال",
  "Authorized {when}": "تم التفويض {when}",
  "Open profile": "فتح الملف الشخصي",
  "Sync watch progress": "مزامنة تقدّم المشاهدة",
  "Finishing an anime episode updates your AniList progress. Forward only: it never lowers a count you already have.":
    "إنهاء حلقة أنمي يحدّث تقدّمك في AniList. للأمام فقط: لا يخفض أبدًا عددًا لديك بالفعل.",
  "Use my AniList avatar as my Harbor avatar": "استخدام صورة AniList كصورة Harbor",
  "Show your AniList profile picture as your Harbor avatar.":
    "اعرض صورة ملفّك الشخصي في AniList كصورة Harbor.",
  "Disconnect from AniList": "قطع الاتصال عن AniList",
  "Disconnect AniList? Your lists will stop showing on the Anime page until you reconnect.":
    "قطع الاتصال عن AniList؟ ستتوقّف قوائمك عن الظهور في صفحة الأنمي حتى تعيد الاتصال.",

  "Connect your Simkl account": "اربط حساب Simkl",
  "Sync and track movies, shows, and anime across everything you use. Harbor marks what you finish as watched on Simkl and keeps your plan-to-watch list in step. Free at simkl.com.":
    "زامِن وتابِع الأفلام والمسلسلات والأنمي عبر كل ما تستخدمه. يميّز Harbor ما تنهيه كمُشاهد على Simkl ويبقي قائمة \"أنوي مشاهدته\" متوافقة. مجانًا على simkl.com.",
  "Connect Simkl": "ربط Simkl",
  "About Simkl": "عن Simkl",
  "Harbor will mark what you finish as watched on Simkl and sync your plan-to-watch list.":
    "سيميّز Harbor ما تنهيه كمُشاهد على Simkl ويزامن قائمة \"أنوي مشاهدته\".",
  "Authorized on this device": "تم التفويض على هذا الجهاز",
  "Use my Simkl avatar as my Harbor avatar": "استخدام صورة Simkl كصورة Harbor",
  "Wear your Simkl profile picture across Harbor instead of the default.":
    "استخدم صورة ملفّك الشخصي في Simkl عبر Harbor بدلًا من الافتراضية.",
  "Disconnect from Simkl": "قطع الاتصال عن Simkl",
  "Disconnect Simkl? Syncing will stop until you reconnect.":
    "قطع الاتصال عن Simkl؟ ستتوقّف المزامنة حتى تعيد الاتصال.",

  "Connect your Trakt account": "اربط حساب Trakt",
  "Track everything you watch, see your watchlist, and get personalized recommendations on Harbor's home page. Free at trakt.tv.":
    "تابِع كل ما تشاهده، واطّلع على قائمة مشاهدتك، واحصل على توصيات مخصّصة في الصفحة الرئيسية لـ Harbor. مجانًا على trakt.tv.",
  "About Trakt": "عن Trakt",
  "Harbor will scrobble your playback to Trakt and sync your watchlist.":
    "سيسجّل Harbor تشغيلك إلى Trakt ويزامن قائمة مشاهدتك.",
  "Use my Trakt avatar as my Harbor avatar": "استخدام صورة Trakt كصورة Harbor",
  "Wear your Trakt profile picture across Harbor instead of the default.":
    "استخدم صورة ملفّك الشخصي في Trakt عبر Harbor بدلًا من الافتراضية.",
  "Disconnect from Trakt": "قطع الاتصال عن Trakt",
  "Disconnect Trakt? Scrobbles and syncs will stop until you reconnect.":
    "قطع الاتصال عن Trakt؟ ستتوقّف عمليات التسجيل والمزامنة حتى تعيد الاتصال.",

  today: "اليوم",
  "{n} day ago": "قبل يوم واحد",
  "{n} days ago": "قبل {n} أيام",
  "{n} month ago": "قبل شهر واحد",
  "{n} months ago": "قبل {n} أشهر",

  "Play button behavior": "سلوك زر التشغيل",
  "Choose what happens when you hit Play on a title. Manual gives you full control over quality and source.":
    "اختر ما يحدث عند الضغط على تشغيل في عنوان. يمنحك الوضع اليدوي تحكّمًا كاملًا في الجودة والمصدر.",
  "Player engine": "محرك المشغّل",
  "HTML5 plays everything WebView2 supports. mpv handles TrueHD, DTS-HD, AV1, weird containers, and HDR. Auto picks based on the source.":
    "يشغّل HTML5 كل ما يدعمه WebView2. يتعامل mpv مع TrueHD وDTS-HD وAV1 والحاويات الغريبة وHDR. يختار التلقائي بناءً على المصدر.",
  "Seek bar": "شريط التقديم",
  "Style the timeline at the bottom of the player. Swap the dot for a sticker, change the bar height, recolor it. Settings live-preview right here.":
    "نسّق الخط الزمني أسفل المشغّل. استبدل النقطة بملصق، وغيّر ارتفاع الشريط، وأعد تلوينه. تُعرض الإعدادات مباشرةً هنا.",
  "Subtitle style": "نمط الترجمة",
  "How subtitles look during playback. Live preview below.":
    "كيف تبدو الترجمات أثناء التشغيل. معاينة مباشرة أدناه.",
  "Stream format chips": "شارات صيغة البث",
  "The little 4K · HDR · codec · audio chips that ride along each stream in the play picker.":
    "الشارات الصغيرة 4K · HDR · الترميز · الصوت التي ترافق كل بث في أداة اختيار التشغيل.",
  "Show format chips on stream rows": "إظهار شارات الصيغة في صفوف البث",
  "The picker tags each stream with resolution, HDR flavor, codec, and audio format. Off hides them all.":
    "تضع الأداة على كل بث وسمًا بالدقة ونوع HDR والترميز وصيغة الصوت. الإيقاف يخفيها جميعًا.",
  "Poster size": "حجم الملصق",
  "Scale every poster and card across Home, Discover, and your library. Bump it up on a 4K or large display where the defaults feel small, or shrink it for a denser grid.":
    "قِس كل ملصق وبطاقة عبر الرئيسية والاكتشاف ومكتبتك. كبّره على شاشة 4K أو كبيرة حيث تبدو الأحجام الافتراضية صغيرة، أو صغّره لشبكة أكثر كثافة.",
  Accessibility: "إمكانية الوصول",
  "Make everything bigger and easier to read: sidebar, menus, popups, every page. The whole interface scales live as you drag, so you can see the change right here. Great on 4K and ultrawide monitors, or whenever the text feels small.":
    "اجعل كل شيء أكبر وأسهل قراءةً: الشريط الجانبي والقوائم والنوافذ المنبثقة وكل صفحة. تتغيّر الواجهة بأكملها مباشرةً أثناء السحب، لترى التغيير هنا. رائع على شاشات 4K والعريضة جدًا، أو متى بدا النص صغيرًا.",
  "Interface scale": "مقياس الواجهة",
  "Trailer quality": "جودة الإعلان",
  "How sharp the trailer is when you hit the preview button. Auto picks from your connection speed. 1080p and Best merge separate video and audio with the bundled ffmpeg, so they take a beat longer to start.":
    "مدى وضوح الإعلان عند الضغط على زر المعاينة. يختار التلقائي حسب سرعة اتصالك. يدمج 1080p و«الأفضل» الفيديو والصوت المنفصلين عبر ffmpeg المضمّن، لذا يستغرقان لحظة أطول للبدء.",
  Audio: "الصوت",
  "Shape the sound without touching your system EQ. Applies on the mpv engine; the HTML5 engine plays audio untouched.":
    "شكّل الصوت دون لمس مُعادِل نظامك. ينطبق على محرك mpv؛ يشغّل محرك HTML5 الصوت دون تغيير.",
  "Normalize loudness": "تسوية مستوى الصوت",
  "Evens out quiet dialogue and loud action scenes with a dynamic normalizer.":
    "يوازن بين الحوار الهادئ ومشاهد الأكشن الصاخبة عبر مُسوٍّ ديناميكي.",
  "Night mode gently compresses loud moments for late-night watching. Profiles take effect when the next track loads and stack with the normalizer.":
    "يضغط الوضع الليلي اللحظات الصاخبة بلطف للمشاهدة في وقت متأخّر. تسري الأنماط عند تحميل المسار التالي وتتراكم مع المُسوّي.",
  "Skip intros": "تخطّي المقدّمات",
  "Harbor finds intro and credits timing from AniSkip, TheIntroDB, and the file's own chapters, then shows a Skip button at the right moment.":
    "يجد Harbor توقيت المقدّمة والشارة من AniSkip وTheIntroDB وفصول الملف نفسه، ثم يعرض زر تخطٍّ في اللحظة المناسبة.",
  "Auto-skip intros": "تخطّي المقدّمات تلقائيًا",
  "Jump past openings automatically the moment one starts. The Skip button still shows either way, and seeking back into an intro replays it without skipping again.":
    "تجاوز المقدّمات تلقائيًا لحظة بدء واحدة. يظل زر التخطّي يظهر في الحالتين، والعودة إلى مقدّمة تعيد تشغيلها دون تخطٍّ مجددًا.",
  "Next episode prompt": "تنبيه الحلقة التالية",
  "When the Up Next pill appears before an episode ends. Auto scales to the episode length, so short episodes stop prompting so early. Off hides it.":
    "متى تظهر شارة «التالي» قبل انتهاء الحلقة. يتكيّف التلقائي مع طول الحلقة، لتتوقّف الحلقات القصيرة عن التنبيه مبكرًا. الإيقاف يخفيها.",
  "Where Harbor saves videos when you hit Download in the player. Pick any folder, including one on a different drive.":
    "أين يحفظ Harbor الفيديوهات عند الضغط على تنزيل في المشغّل. اختر أي مجلد، بما في ذلك واحد على قرص مختلف.",
  Compact: "مدمج",
  Default: "افتراضي",
  Large: "كبير",
  Huge: "ضخم",
  Auto: "تلقائي",
  Off: "إيقاف",
  Flat: "مسطّح",
  "Bass boost": "تعزيز الجهير",
  "Vocal clarity": "وضوح الصوت",
  "Less bass": "جهير أقل",
  "Night mode": "الوضع الليلي",
  "1 min": "دقيقة واحدة",
  "1.5 min": "دقيقة ونصف",
  "2 min": "دقيقتان",

  "How aggressively Harbor rejects shady or mismatched streams before showing them in the picker.":
    "مدى صرامة Harbor في رفض البثوث المشبوهة أو غير المتطابقة قبل عرضها في الأداة.",
  "Condensed shows a top pick, quality tiles, and a drawer. Stremio is a flat list grouped by addon, no scoring.":
    "يعرض الوضع المكثّف اختيارًا أبرز وبلاطات جودة ودرجًا. Stremio قائمة مسطّحة مجمّعة حسب الإضافة، بلا تسجيل نقاط.",
  "Harbor ranking puts the best-scoring sources first. Addon order follows your addon priority (organize it in Addons, Installed tab, Reorder) and keeps each addon's results in the order it returned them, like the Stremio and Vidi apps.":
    "يضع ترتيب Harbor المصادر الأعلى تقييمًا أولًا. يتبع ترتيب الإضافات أولويتها (نظّمها في الإضافات، علامة المثبّتة، إعادة الترتيب) ويبقي نتائج كل إضافة بالترتيب الذي أعادتها به، مثل تطبيقي Stremio وVidi.",
  "Using AIOStreams or another aggregator addon? Its own sorting and filtering happen inside the addon before Harbor ever sees the results, then Harbor applies the stream filter and result order above on top. If results look thinner than expected, keep one side permissive: either relax the addon's internal filters or set Harbor's stream filter to Balanced or Off.":
    "تستخدم AIOStreams أو إضافة تجميع أخرى؟ يحدث فرزها وتصفيتها داخل الإضافة قبل أن يرى Harbor النتائج، ثم يطبّق Harbor مرشّح البث وترتيب النتائج أعلاه فوق ذلك. إن بدت النتائج أقل من المتوقّع، أبقِ جانبًا واحدًا متساهلًا: إمّا أن ترخي مرشّحات الإضافة الداخلية أو تضبط مرشّح بث Harbor على متوازن أو إيقاف.",
  "Debrid services": "خدمات Debrid",
  "Real-Debrid, TorBox, AllDebrid, Premiumize, Debrid-Link. Cached streams play direct. Keys stay local.":
    "Real-Debrid وTorBox وAllDebrid وPremiumize وDebrid-Link. تُشغّل البثوث المخزّنة مباشرةً. تبقى المفاتيح محليّة.",
  "Real-Debrid API token": "رمز Real-Debrid API",
  "API token": "رمز API",
  "API key": "مفتاح API",
  "TorBox API key": "مفتاح TorBox API",
  "AllDebrid API key": "مفتاح AllDebrid API",
  "Premiumize API key": "مفتاح Premiumize API",
  "Debrid-Link API key": "مفتاح Debrid-Link API",
  "Faster and quieter than torrents if you already pay for Usenet. Configure on the addon page, paste the manifest URL it returns.":
    "أسرع وأهدأ من التورنت إن كنت تدفع بالفعل مقابل Usenet. اضبطه في صفحة الإضافة، والصق رابط البيان الذي يعيده.",
  "Searches and streams directly off Easynews. No debrid needed. Just your Easynews login.":
    "يبحث ويبثّ مباشرةً من Easynews. لا حاجة إلى Debrid. فقط تسجيل دخول Easynews الخاص بك.",
  "Streaming catalogs": "كتالوجات البث",
  "Top titles per service. Toggle off the ones you don't pay for.":
    "أبرز العناوين لكل خدمة. عطّل ما لا تدفع مقابله.",
  "Save a TMDB key in Library & metadata to turn on streaming catalogs.":
    "احفظ مفتاح TMDB في المكتبة والبيانات الوصفية لتشغيل كتالوجات البث.",
  Strict: "صارم",
  "Default. Rejects size outliers, suspicious extensions, year/episode mismatches, season packs (for episode requests), trailers, and likely cams.":
    "افتراضي. يرفض الأحجام الشاذة والامتدادات المشبوهة وعدم تطابق السنة/الحلقة وحزم المواسم (لطلبات الحلقات) والإعلانات والنسخ المصوّرة المحتملة.",
  Balanced: "متوازن",
  "Keeps the malware/year/episode-mismatch checks but allows season packs and oversized files. Same as hitting Search wider in the picker.":
    "يبقي فحوص البرمجيات الخبيثة وعدم تطابق السنة/الحلقة لكنه يسمح بحزم المواسم والملفات كبيرة الحجم. مثل الضغط على «بحث أوسع» في الأداة.",
  "No filtering. Every stream every addon returns shows up, including obvious junk. You'll be on your own.":
    "بلا تصفية. يظهر كل بث تعيده كل إضافة، بما في ذلك النفايات الواضحة. ستكون وحدك.",
  Condensed: "مكثّف",
  "Default. Top pick at the top, quality tiles, and an All-Sources drawer. Harbor scores and ranks results.":
    "افتراضي. الاختيار الأبرز في الأعلى وبلاطات جودة ودرج «كل المصادر». يسجّل Harbor النتائج ويرتّبها.",
  "Flat list of sources grouped by addon, with a filter dropdown. No re-ranking. Closest match to the Stremio app's stream picker.":
    "قائمة مسطّحة من المصادر مجمّعة حسب الإضافة، مع قائمة تصفية منسدلة. بلا إعادة ترتيب. الأقرب لأداة اختيار البث في تطبيق Stremio.",
  "Harbor ranking": "ترتيب Harbor",
  "Default. Harbor parses and scores every source and surfaces the best quality first.":
    "افتراضي. يحلّل Harbor كل مصدر ويسجّله ويُظهر أفضل جودة أولًا.",
  "Addon order": "ترتيب الإضافات",
  "Show each addon's results in the order it returned them, grouped by your addon list. Matches the Stremio and Vidi apps.":
    "اعرض نتائج كل إضافة بالترتيب الذي أعادتها به، مجمّعة حسب قائمة إضافاتك. يطابق تطبيقي Stremio وVidi.",
  "{n} service needs attention": "خدمة واحدة تحتاج إلى انتباه",
  "{n} services need attention": "{n} خدمات تحتاج إلى انتباه",
  "Health for {n} service below": "حالة خدمة واحدة أدناه",
  "Health for {n} services below": "حالة {n} خدمات أدناه",
  Expired: "منتهي الصلاحية",
  "{n}d left": "بقي {n} يوم",

  Theme: "السمة",
  "Pick a look. Every color and surface updates instantly.":
    "اختر مظهرًا. يتحدّث كل لون وسطح فورًا.",
  "Background image": "صورة الخلفية",
  "Drop a wallpaper behind the app. The dim slider keeps text readable.":
    "ضع خلفية وراء التطبيق. يبقي شريط التعتيم النص قابلًا للقراءة.",
  Typography: "الطباعة",
  "Pick a display and body pairing, or upload your own font to use across Harbor.":
    "اختر زوجًا للعرض والمتن، أو ارفع خطّك الخاص لاستخدامه عبر Harbor.",
  "Your themes": "سماتك",
  "Make your own in the Theme Studio, or import one a friend shared.":
    "أنشئ سمتك في استوديو السمات، أو استورد واحدة شاركها صديق.",
  "Window title bar": "شريط عنوان النافذة",
  "Use your operating system's native title bar and window buttons instead of Harbor's built-in ones. Handy if the in-app buttons ever feel out of reach, like during playback.":
    "استخدم شريط العنوان وأزرار النافذة الأصلية لنظام تشغيلك بدلًا من المدمجة في Harbor. مفيد إن بدت الأزرار داخل التطبيق بعيدة المنال، كما أثناء التشغيل.",
  "Use the native window title bar": "استخدام شريط عنوان النافذة الأصلي",
  "Show your operating system's own title bar with its minimize, maximize, and close buttons. They stay reachable everywhere, including while a video is playing. Turn this off to use Harbor's built-in window buttons.":
    "اعرض شريط العنوان الخاص بنظام تشغيلك مع أزرار التصغير والتكبير والإغلاق. تبقى في المتناول في كل مكان، بما في ذلك أثناء تشغيل فيديو. عطّل هذا لاستخدام أزرار النافذة المدمجة في Harbor.",
  Background: "الخلفية",
  Surface: "السطح",
  Elevated: "مرتفع",
  Raised: "بارز",
  Text: "النص",
  "Muted text": "نص خافت",
  "Subtle text": "نص خفيّ",
  Border: "الحدّ",
  Accent: "لون التمييز",
  Danger: "الخطر",
  Surfaces: "الأسطح",
  Lines: "الخطوط",
  Accents: "ألوان التمييز",
  "Live preview is on. Done and Save both keep what you've picked as your Custom theme. Reset reverts the editor to the saved palette.":
    "المعاينة المباشرة مفعّلة. يحتفظ «تم» و«حفظ» بما اخترته كسمتك المخصّصة. تعيد «إعادة التعيين» المحرّر إلى اللوحة المحفوظة.",
  "Build your own palette": "أنشئ لوحتك الخاصة",
  "Apply custom theme": "تطبيق السمة المخصّصة",
  "Edit custom theme": "تعديل السمة المخصّصة",

  Updates: "التحديثات",
  "Harbor checks harbor.site for new versions and installs them in place. Nothing installs until you choose to, and a dismissed update never nags you again.":
    "يتحقّق Harbor من harbor.site بحثًا عن إصدارات جديدة ويثبّتها في مكانها. لا يُثبّت شيء حتى تختار، والتحديث المرفوض لا يزعجك مجددًا.",
  "Backup & restore": "النسخ الاحتياطي والاستعادة",
  "Export your entire Harbor setup to a single file, then restore it on a new computer or keep it as a backup. Everything is included except your Stremio sign-in.":
    "صدّر إعداد Harbor بالكامل إلى ملف واحد، ثم استعِده على حاسوب جديد أو احتفظ به كنسخة احتياطية. كل شيء مضمّن باستثناء تسجيل دخولك إلى Stremio.",
  Privacy: "الخصوصية",
  "Harbor sends no telemetry. This also drops outbound ad, analytics, and tracker requests that addons or metadata providers try to make, before they leave your machine.":
    "لا يرسل Harbor أي قياسات. كما يسقط طلبات الإعلانات والتحليلات والتتبّع الصادرة التي تحاول الإضافات أو مزوّدو البيانات الوصفية إجراءها، قبل مغادرتها جهازك.",
  "System tray": "علبة النظام",
  "Keep Harbor a click away. Close it to the system tray instead of quitting, and control it from the tray menu. These also mirror into the tray menu live.":
    "أبقِ Harbor على بُعد نقرة. أغلقه إلى علبة النظام بدلًا من الإنهاء، وتحكّم به من قائمة العلبة. تنعكس هذه أيضًا في قائمة العلبة مباشرةً.",
  "Stremio install links": "روابط تثبيت Stremio",
  "Harbor catches stremio:// install links so the configure-and-install flow stays inside the app. Every install also syncs to your Stremio account, so the official app remains the canonical home for your library.":
    "يلتقط Harbor روابط التثبيت ‎stremio://‎ ليبقى تدفّق الإعداد والتثبيت داخل التطبيق. يتزامن كل تثبيت أيضًا مع حساب Stremio الخاص بك، ليبقى التطبيق الرسمي الموطن المعتمد لمكتبتك.",
  "Discord Rich Presence": "حضور Discord الغني",
  "Let your Discord friends see what you are watching, with the show poster and a live progress bar. Desktop only, and only your own Discord client is involved (nothing touches a Harbor server).":
    "دع أصدقاءك على Discord يرون ما تشاهده، مع ملصق العمل وشريط تقدّم مباشر. سطح المكتب فقط، ولا يتدخّل سوى عميل Discord الخاص بك (لا شيء يمسّ خادم Harbor).",
  "API budget": "ميزانية API",
  "Daily call counter for OMDb rating lookups. Reset if it stops returning fresh scores.":
    "عدّاد الطلبات اليومي لعمليات بحث تقييمات OMDb. أعد التعيين إن توقّف عن إعادة تقييمات جديدة.",
  Onboarding: "التهيئة",
  "Replay the walkthrough or unhide every dismissed tip in the app.":
    "أعد تشغيل الجولة التعريفية أو أظهر كل تلميح مرفوض في التطبيق.",
  "Stremio library repair": "إصلاح مكتبة Stremio",
  "Scans your Stremio library and rewrites any item whose shape doesn't match Stremio's exact schema. Safe to run anytime; only items that need fixing get touched.":
    "يفحص مكتبة Stremio الخاصة بك ويعيد كتابة أي عنصر لا يطابق شكله مخطط Stremio الدقيق. آمن للتشغيل في أي وقت؛ يُمسّ فقط العناصر التي تحتاج إصلاحًا.",
  About: "حول",
  "Build identity. Useful when filing a bug report at bugs@harbor.site.":
    "هوية الإصدار. مفيدة عند تقديم بلاغ خلل على bugs@harbor.site.",

  "Click any binding to rebind it. Press Esc while capturing to cancel. Letters ignore Shift (so K and Shift+K trigger the same action).":
    "انقر على أي ارتباط لإعادة تعيينه. اضغط Esc أثناء الالتقاط للإلغاء. تتجاهل الأحرف Shift (فيؤدّي K وShift+K الإجراء نفسه).",
  "Reset all ({n})": "إعادة تعيين الكل ({n})",
  Global: "عام",
  Player: "المشغّل",
  "Inside the playback view.": "داخل واجهة التشغيل.",
  "Anywhere in Harbor.": "في أي مكان في Harbor.",
  Custom: "مخصّص",
  Conflict: "تعارض",
  "Press a key…": "اضغط مفتاحًا…",

  "What broke?": "ما الذي تعطّل؟",
  "A specific summary lands faster than a long paragraph. Steps to reproduce help most of all.":
    "الملخّص المحدّد أسرع وصولًا من فقرة طويلة. خطوات إعادة الإنتاج تساعد أكثر من أي شيء.",
  Summary: "ملخّص",
  "Player freezes after the second episode autoplays":
    "يتجمّد المشغّل بعد التشغيل التلقائي للحلقة الثانية",
  Severity: "الخطورة",
  "Steps to reproduce": "خطوات إعادة الإنتاج",
  "What you expected": "ما توقّعته",
  "Stream should start playing within a few seconds.":
    "ينبغي أن يبدأ البث خلال بضع ثوانٍ.",
  "What actually happened": "ما حدث فعليًا",
  "Spinner stays forever and nothing in the player loads.":
    "تبقى أداة التحميل إلى الأبد ولا يُحمّل شيء في المشغّل.",
  "Screenshots and recordings": "لقطات وتسجيلات الشاشة",
  "Drop a clip of the bug if you can. A 5-second screen recording usually says more than five paragraphs.":
    "ضع مقطعًا للخلل إن أمكن. تسجيل شاشة مدته 5 ثوانٍ يقول عادةً أكثر من خمس فقرات.",
  "Credit (optional)": "الإسناد (اختياري)",
  "Bug reporters get listed in the release notes when their report leads to a shipped fix. Leave blank to stay anonymous.":
    "يُدرج مبلّغو الأخطاء في ملاحظات الإصدار عندما يؤدّي بلاغهم إلى إصلاح مشحون. اتركه فارغًا لتبقى مجهولًا.",
  "Display name": "الاسم المعروض",
  "GitHub username": "اسم مستخدم GitHub",
  "Email or Discord": "البريد الإلكتروني أو Discord",
  "Credit me in the release notes if this report leads to a fix.":
    "أسنِد إليّ في ملاحظات الإصدار إن أدّى هذا البلاغ إلى إصلاح.",
  "Could not send: {error}": "تعذّر الإرسال: {error}",
  "Ready to send": "جاهز للإرسال",
  "Summary needs at least 6 characters": "يحتاج الملخّص إلى 6 أحرف على الأقل",
  "Preparing…": "جارٍ التحضير…",
  "Sending…": "جارٍ الإرسال…",
  "Submit bug report": "إرسال بلاغ الخلل",

  Slot: "الموضع",
  Order: "الترتيب",
  "Move to previous slot": "النقل إلى الموضع السابق",
  "Move to next slot": "النقل إلى الموضع التالي",
  "Move up": "تحريك لأعلى",
  "Move down": "تحريك لأسفل",
  "Preview state": "حالة المعاينة",
  Size: "الحجم",
  Icon: "أيقونة",
  Hidden: "مخفي",
  Visible: "ظاهر",
  "Show this control": "إظهار هذا العنصر",
  "Hide this control": "إخفاء هذا العنصر",
  Deselect: "إلغاء التحديد",
  "Slot is getting crowded ({n}/{limit}). May overflow on narrow screens.":
    "الموضع يزدحم ({n}/{limit}). قد يفيض على الشاشات الضيّقة.",
  "Series tab": "علامة المسلسل",
  "Watch Together panel": "لوحة المشاهدة الجماعية",
  Side: "الجانب",
  Corner: "الزاوية",
  "Show this panel": "إظهار هذه اللوحة",
  "Hide this panel": "إخفاء هذه اللوحة",
  Host: "المضيف",
};

export default settings;

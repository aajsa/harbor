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
};

export default settings;

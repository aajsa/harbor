# PROJECT_MAP — Harbor (Fork: 3-pr/harbor)

> آخر تحديث: 2026-06-18 | الفرق عن upstream: +16 commit | الإصدار: v0.9.9

---

## TECH_STACK

| الطبقة | التقنية | الإصدار الحالي | آخر إصدار مستقر | ملاحظات |
|--------|---------|---------------|-----------------|---------|
| **Framework** | Tauri v2 (CLI) | ^2 | 2.11.2 | متوافق |
| **Framework Core** | tauri crate | 2.x | 2.11.3 | متوافق |
| **Frontend** | React | ^19.1.0 | **19.2.7** | ⬆️ متاح تحديث |
| **Language (JS)** | TypeScript | ~5.8.3 | **6.0.3** | ⬆️ تحديث كبير (v6) |
| **Bundler** | Vite | ^7.0.4 | **8.0.16** | ⬆️ تحديث major |
| **CSS** | Tailwind CSS v4 | ^4 | 4.3.1 | متوافق |
| **Icons** | lucide-react | ^0.460.0 | **1.20.0** | ⬆️ تحديث major |
| **API Bridge** | @tauri-apps/api | ^2 | 2.11.1 | متوافق |
| **Backend** | Rust (edition 2021) | - | - | - |
| **Media Engine** | libmpv2 | 4.x | 4.x | مستقر |
| **P2P** | librqbit | =8.1.1 | **9.0.0-rc.0** | ⚠️ RC فقط |
| **Stream Server** | axum | 0.8 | 0.8.x | متوافق |
| **HTTP Client** | reqwest | 0.12 | 0.12.x | متوافق |
| **WASM Core** | harbor-core | path | - | محلّل ثقة/تقييم |
| **Video (JS)** | hls.js | ^1.6.16 | 1.x | مستقر |
| **Video (JS)** | mpegts.js | ^1.8.0 | 1.x | مستقر |
| **Auth/Debrid** | مدمج يدوياً | - | - | Real-Debrid, AllDebrid, Premiumize |
| **Sync** | Trakt / Anilist / Simkl | مدمج | - | - |

### ملاحظات الترقية (Protocol 1)
- **عاجل**: librqbit 9.0.0-rc.0 — لا يرقي إلا بعد الإصدار المستقر
- **ممكن**: React 19.2.7, TypeScript 6.0.3, Vite 8.0.16
- **تحذير**: lucide-react 1.x — تغييرات breaking، يتطلب اختبار
- **محظور**: لا توجد تبعيات Deprecated حالياً

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TAURI WEBVIEW (WebKit)                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    React SPA (src/)                           │  │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │  │
│  │  │ Chrome   │ │ Views    │ │Components│ │ Lib (Services) │  │  │
│  │  │(Shell UI)│ │(Pages)   │ │ (Shared) │ │ (State/Utils)  │  │  │
│  │  └─────────┘ └──────────┘ └──────────┘ └────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ @tauri-apps/api (invoke/events)
┌─────────────────────────▼───────────────────────────────────────────┐
│                    TAURI CORE (Rust / src-tauri/)                   │
│  ┌──────────┐ ┌───────────┐ ┌───────────┐ ┌────────────────────┐  │
│  │ Commands │ │ Media     │ │ Network   │ │ Platform           │  │
│  │ (IPC)    │ │ (libmpv)  │ │ (axum)    │ │ (Win/Mac/Linux)    │  │
│  └──────────┘ └───────────┘ └───────────┘ └────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ harbor-core (WASM) — Stream Parsing / Trust Scoring         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Torrent Engine (librqbit) | Cast (rust_cast) | DLNA/Roku    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### طبقات المشروع

1. **Frontend SPA** (`src/`)
   - `src/chrome/` — واجهة التطبيق الأساسية (Sidebar, Topbar, Dock, Rail)
   - `src/views/` — كل View عبارة عن صفحة كاملة (~20 lazy-loaded view)
   - `src/components/` — مكونات مشتركة (~97 ملف)
   - `src/lib/` — خدمات ومنطق الأعمال (~136 ملف) — **أكبر مشكلة: تفتت مفرط**

2. **Backend IPC** (`src-tauri/src/`)
   - `lib.rs` — تسجيل Tauri commands والـ plugins
   - `main.rs` — نقطة الدخول
   - `mpv.rs` / `mpv_render_*.rs` — مشغل mpv (نظامي + macOS)
   - `torrent_engine.rs` / `torrent_engine/` — محرك التورنت
   - `cast*.rs` — Chromecast
   - `stream_proxy.rs` — بروكسي البث
   - `web_server.rs` — خادم axum للبث المحلي

3. **Core WASM** (`harbor-core/`)
   - `parser.rs` — تحليل مسارات البث
   - `trust.rs` — نظام الثقة للمصادر
   - `scoring.rs` — تقييم البث

---

## SYSTEM_FLOW

### رحلة المستخدم: تشغيل媒体的

```
[فتح التطبيق] → Home (الرئيسية)
    ↓ اختيار media
[Detail View] → يعرض التفاصيل، التقييمات، الحلقات
    ↓ اختيار مصدر
[Play Picker] → يبحث عن روابط البث، يقيّمها (harbor-core)، يعرض الخيارات
    ↓ اختيار رابط
[Player View] → libmpv أو hls.js أو mpegts.js حسب النوع
    ↓
[Backend] → stream_proxy (HTTP → libmpv) أو torrent_engine (P2P → libmpv)
```

### تدفق البيانات: البث

```
Stream URL
  ↓
reqwest (fetch stream metadata)
  ↓
harbor-core (parse + trust + score)
  ↓
axum web_server (proxy if needed) OR direct libmpv feed
  ↓
libmpv (native playback)
```

### الخدمات المتزامنة (Background)

- `maintenance.ts` — تنظيف دوري، تحديثات مخبأة
- `deep-link.ts` — معالجة روابط `harbor://` و `stremio://`
- `discord_rp.rs` — Rich Presence
- `stremio-server.ts` — خادم Stremio addons
- `webhook-engine.ts` — Webhooks
- `torrent_engine.rs` — تنزيل/بث تورنت

---

## LOGGING STRATEGY (Protocol 4)

| مستوى | وصف | مثال |
|-------|------|------|
| `ERROR` | خطأ غير متوقع | `playback failure: mpv crashed with signal 11` |
| `WARN` | تحذير لا يمنع التشغيل | `stream proxy timeout, retrying...` |
| `INFO` | حدث مهم | `player started: {meta_id}` |
| `DEBUG` | تفصيل للتطوير (مشروط) | `mpv event: property-change volume 80` |

**التنفيذ**: Rust backend → `tracing` crate (غير حظر، هيكلي). Frontend → `console` مع `__DEV__` flag. لا تكتب سجلات للمستخدم النهائي. لا يوجد نظام ملفات للسجلات (يتعارض مع مبدأ Simplicity First — إلا إذا طُلب صراحةً).

---

## ORPHANS & PENDING

| العنصر | الحالة | ملاحظات |
|--------|--------|---------|
| Arabic i18n localization | ⚠️ موجود لكن غير كامل | ~30% من الترجمة منتهية |
| Settings panel rebuild | 🔄 قيد العمل | relay panel, webhooks panel, player layout |
| Sports/ESPN module | 🆕 ميزة جديدة | غير موجودة في upstream |
| Together (watch party) | 🆕 ميزة جديدة | غير موجودة في upstream |
| Auto-updater | ❌ معطل حالياً | `createUpdaterArtifacts: false` |
| Memory leak (MPV) | 🐛 موجود | موثق في MEMORY_LEAK_FIX.md |
| Subtitle limit | 🐛 موجود | موثق في SUBTITLE_FIX.md |
| Pinia/MobX/Zustand | ⬜ غير موجود | يستخدم Context API المفرط |
| React Router | ⬜ غير موجود | ViewProvider مخصص |
| Tests | ⬜ غير موجود | بدون إطار اختبار |
| CI/CD | ⬜ ضعيف | GitHub Actions موجود لكن غير مُفعّل كاملاً |

---

## MILESTONES (قابلة للتحقق)

### M0 — تثبيت التبعيات (قبل البدء)
- [ ] ترقية React → 19.2.7
- [ ] ترقية TypeScript → 6.0.3
- [ ] ترقية Vite → 8.0.16
- [ ] الإبقاء على librqbit =8.1.1 (انتظار v9 stable)
- [ ] فحص `pnpm install` و `cargo build` بدون errors
- [ ] `pnpm tauri dev` يعمل على النظام الحالي

### M1 — توافق مع upstream
- [ ] دمج HEAD إلى upstream/main بدون تعارضات
- [ ] `git rebase upstream/main` ناجح
- [ ] كل الميزات المضافة (i18n ar, sports, together) لا تزال تعمل

### M2 — تنظيف المعمارية (Surgical)
- [ ] دمج الملفات المتفرقة في `src/lib/` (136 ← ~80 ملف)
- [ ] نقل المكونات غير المستخدمة لـ `_deprecated/`
- [ ] إزالة `@/chrome/` المكررة (dracula-sidebar, nord-sidebar, royal-topbar → unified pattern)
- [ ] توثيق واجهات Tauri commands في types موحدة

### M3 — نظام logging
- [ ] إضافة `tracing` في Rust backend (already in Cargo.lock? verify)
- [ ] إنشاء `src/lib/log.ts` — واجهة موحدة مع مستويات 4
- [ ] فتح logging في `DEBUG` فقط عند enable

### M4 — الاختبارات
- [ ] إضافة Vitest
- [ ] اختبار `harbor-core` WASM (parser, trust, scoring)
- [ ] اختبار view logic في `src/lib/`

---

## قواعد الـ Fork (Framework Agreement)

1. **لا تكسر upstream** — أي تغيير في `src-tauri/tauri.conf.json` أو `Cargo.toml` أو `package.json` يجب أن يكون متوافقاً مع upstream
2. **Feature flags** — الميزات الخاصة بالفورك (Arabic, Sports, Together) تحمل علامة واضحة `// @fork`
3. **PR-ready** — الكود يكتب كأنه سيرفع PR للمستودع الأصلي
4. **أقل تعديل** — في ملفات upstream، نغير فقط ما هو ضروري، لا إعادة تنسيق

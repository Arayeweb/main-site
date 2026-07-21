# Design System — آرایه AI

مستند مرجع برای طراحی و توسعه رابط کاربری **آرایه AI** (`/ai/*`).

منبع حقیقت در کد: `app/ai/tokens.css` و فایل‌های CSS زیرمجموعه `app/ai/`.

---

## ۱. اصول طراحی

| اصل | توضیح |
|-----|--------|
| **Premium Light SaaS** | پس‌زمینه روشن، کارت سفید، سایه‌های نرم — بدون کرم/زرد |
| **RTL-first** | `direction: rtl` روی `.ar-root`؛ متن فارسی، نام مدل‌ها `direction: ltr` |
| **Mobile-first** | breakpoint اصلی `900px`؛ چت و composer برای موبایل بهینه |
| **ChatGPT / arena.ai** | shell سایدبار، home workspace، composer docked |
| **بدون emoji** | فقط SVG خطی از `app/ai/icons.tsx` |
| **توکن‌محور** | همه رنگ‌ها از `--ar-*`؛ hardcode فقط در fallback پورتال |

### حس بصری

- تمیز، حرفه‌ای، کم‌نویز
- accent بنفش (`#635BFF`) — نه آبی generic
- تایپوگرافی Vazirmatn با letter-spacing منفی روی تیترها
- انیمیشن‌های کوتاه (۱۲–۲۲۰ms) با `cubic-bezier(0.22, 1, 0.36, 1)` برای تعامل لمسی

---

## ۲. ساختار فایل‌ها

```
app/ai/
├── ai.css              # entry — import همه ماژول‌ها
├── tokens.css          # design tokens (منبع حقیقت رنگ‌ها)
├── layout.css          # shell، nav، composer، home، pricing، sidebar
├── components.css      # chat، compare، markdown، persona
├── studios.css         # code / image / video / audio / music studio
├── icons.tsx           # سیستم آیکون SVG
├── features/features.css   # لندینگ /ai/features (پrefix جدا: feat-*)
├── compare/compare.css
├── content-sales/content-sales.css
└── intent/intent-landing.css
```

**قانون:** هر صفحه جدید داخل `/ai` باید زیر `.ar-root` باشد و کلاس‌های `ar-*` را reuse کند.

---

## ۳. Design Tokens

تعریف در `tokens.css`. scope:

```css
.ar-root,
.ar-mselect-sheet-backdrop,
.ar-sheet-backdrop,
.ar-mselect-pop--floating { /* --ar-* */ }
```

پورتال‌ها (sheet، popover) باید همان توکن‌ها را داشته باشند تا بیرون از `.ar-root` هم درست رندر شوند.

### ۳.۱ رنگ‌ها

#### پس‌زمینه و سطح

| Token | مقدار | کاربرد |
|-------|-------|--------|
| `--ar-bg` | `#F6F7F9` | پس‌زمینه اصلی اپ |
| `--ar-bg2` | `#F1F3F6` | سایدبار، سطح ثانویه |
| `--ar-card` | `#FFFFFF` | کارت، composer، popover |
| `--ar-surface` | `#FFFFFF` | alias کارت |
| `--ar-surface2` | `#F1F3F6` | bundle pricing، panel |

#### متن

| Token | مقدار | کاربرد |
|-------|-------|--------|
| `--ar-text` | `#111318` | متن اصلی |
| `--ar-text2` | `#667085` | متن ثانویه، placeholder |
| `--ar-text3` | `#98A2B3` | hint، label کم‌اهمیت |
| `--ar-ink` | `#111318` | دکمه send، آواتار کاربر |
| `--ar-ink-hover` | `#1D2939` | hover روی ink |
| `--ar-on-ink` | `#FFFFFF` | متن روی accent/ink |

#### border

| Token | مقدار |
|-------|-------|
| `--ar-border` | `#E3E7EE` |
| `--ar-border2` | `#D0D5DD` |

#### Accent (برند)

| Token | مقدار | کاربرد |
|-------|-------|--------|
| `--ar-accent` | `#635BFF` | CTA، active، لینک |
| `--ar-accent-hover` | `#5147E8` | hover |
| `--ar-accent-soft` | `#EEF0FF` | پس‌زمینه انتخاب، focus ring |
| `--ar-accent-ink` | `#4A3FE0` | متن روی soft |
| `--ar-focus-ring` | `var(--ar-accent)` | focus-visible |

#### Semantic

| Token | مقدار | Soft |
|-------|-------|------|
| `--ar-success` | `#12B76A` | `--ar-success-soft: #E7F9F0` |
| `--ar-error` | `#D92D20` | `--ar-error-soft: #FEECEB` |

#### Pill / Mode (استودیوها)

| Token | پس‌زمینه | متن |
|-------|----------|-----|
| image | `--ar-pill-image-bg: #FDF2E3` | `--ar-pill-image-fg: #B76E00` |
| video | `--ar-pill-video-bg: #FCE8EF` | `--ar-pill-video-fg: #BE3A6A` |
| persona | — | `--ar-pill-persona-fg: #4A3FE0` |
| music | `--ar-pill-music-bg: #EDE9FE` | `--ar-pill-music-fg: #5B21B6` |
| battle | `--ar-pill-battle-bg: #F1F3F6` | — |

#### Tier مدل

| سطح | پس‌زمینه | متن |
|-----|----------|-----|
| economy | `--ar-bg2` | `--ar-text2` |
| mid | `#E8F0FA` | `#3B6EA5` |
| premium | `--ar-accent-soft` | `--ar-accent-ink` |

### ۳.۲ شعاع گوشه

| Token / کلاس | مقدار | کاربرد |
|--------------|-------|--------|
| `--ar-radius` | `14px` | کارت battle، panel |
| `.ar-btn` | `11px` | دکمه |
| `.ar-composer-box` | `18–22px` | composer |
| pill/chip | `999px` | mode، credit، tier |
| sheet موبایل | `18px 18px 0 0` | bottom sheet |

### ۳.۳ سایه‌ها (الگو)

```css
/* کارت معمولی */
box-shadow: 0 1px 2px rgba(17, 19, 24, 0.04), 0 8px 28px rgba(17, 19, 24, 0.05);

/* popover */
box-shadow: 0 10px 34px rgba(17, 19, 24, 0.14);

/* composer focus */
box-shadow: 0 0 0 3px var(--ar-accent-soft), 0 8px 28px rgba(17, 19, 24, 0.05);
```

### ۳.۴ تایپوگرافی

**فونت:** Vazirmatn (۴۰۰، ۵۰۰، ۷۰۰، ۸۰۰) — self-hosted در `/assets/fonts/`

| نقش | size | weight | line-height |
|-----|------|--------|-------------|
| Hero H1 | `clamp(30px, 6vw, 46px)` | 800 | 1.35 |
| Home prompt | `clamp(1.65rem, 4vw, 2.35rem)` | 600 | 1.35 |
| Body | 14–15.5px | 400–500 | 1.75–1.9 |
| Label / chip | 11–13px | 600–700 | 1.35 |
| Markdown AI | 15px | 400 | 1.85–2.05 |
| Sidebar item | 12.5px | 500–600 | — |

**نکته iOS:** در composer موبایل `font-size: 16px` برای جلوگیری از zoom خودکار.

### ۳.۵ فاصله‌گذاری

| الگو | مقدار |
|------|-------|
| Container padding | `0 20px` |
| `.ar-container` max-width | `880px` |
| `.ar-container-wide` | `1180px` |
| Chat max-width | `768px` |
| Composer max-width | `720px` |
| Sidebar width | `280px` |
| Nav height | `58px` |
| Safe area | `env(safe-area-inset-bottom)` |

---

## ۴. نام‌گذاری کلاس‌ها

**پیشوند:** `ar-` (Arena / Araaye)

```
ar-{component}
ar-{component}-{element}
ar-{component}--{modifier}
```

مثال‌ها:

| کلاس | معنی |
|------|------|
| `.ar-btn-primary` | دکمه اصلی |
| `.ar-composer--dock` | composer چسبیده به پایین |
| `.ar-mselect--bar` | انتخاب مدل full-width |
| `.ar-home-stack--empty` | home بدون تاریخچه |
| `.ar-sheet--auth` | sheet ورود سبک‌تر |

**زیرسیستم‌های جدا** (فقط لندینگ/marketing):

- `feat-*` → `/ai/features`
- لندینگ‌های intent/compare/content-sales توکن جدا دارند؛ در اپ اصلی reuse نکنید.

---

## ۵. Layout و Shell

### ۵.۱ درخت DOM

```
.ar-root
└── .ar-shell
    ├── .ar-sidebar          (دسکتاپ ≥901px)
    ├── .ar-mobilebar        (موبایل ≤900px)
    └── .ar-main
        └── children (page)
```

### ۵.۲ Breakpoints

| px | رفتار |
|----|--------|
| `520` | vote bar، upsell wrap |
| `600` | chat padding، tool btn |
| `720` | compare grid تک‌ستونه، model bar scroll |
| `760` | battle grid |
| `900` | **اصلی** — sidebar → drawer، home mobile layout |
| `901+` | desktop home ordering، sidebar visible |

### ۵.۳ حالت‌های full-viewport

این layoutها `height: 100dvh` + `overflow: hidden` می‌گیرند:

- `.ar-main--chat` — گفتگو
- `.ar-home-workspace` — home لاگین
- `.ar-code-studio` — استودیو کد

### ۵.۴ PWA

- `themeColor: #F6F7F9`
- `html[data-ar-pwa="1"]` — غیرفعال کردن pinch zoom
- splash و install sheet جدا (`PWA*.tsx`)

---

## ۶. کامپوننت‌ها

### ۶.۱ دکمه‌ها (`.ar-btn`)

| Variant | کلاس | توضیح |
|---------|------|--------|
| Primary | `.ar-btn-primary` | accent، متن سفید |
| Ghost | `.ar-btn-ghost` | کارت + border |
| Small | `.ar-btn-sm` | padding کمتر |
| Block | `.ar-btn-block` | عرض کامل |

```html
<button class="ar-btn ar-btn-primary">شروع</button>
<button class="ar-btn ar-btn-ghost ar-btn-sm">انصراف</button>
```

**Send:** `.ar-send-btn` — مربع/دایره؛ `.ar-send-btn--ready` وقتی متن دارد accent می‌شود.

### ۶.۲ Composer (`.ar-composer`)

قلب UX اپ. اجزا:

- `.ar-composer-box` — کارت textarea
- `.ar-composer-foot` / `.ar-composer-bar` — toolbar
- `.ar-composer-tool-btn` — دکمه ابزار (۳۲×۳۲)
- `.ar-mode-chip` — chip حالت فعلی
- `.ar-mselect` — انتخاب مدل

Modifiers:

| Modifier | کاربرد |
|----------|--------|
| `--dock` | home workspace |
| `--compact-home` | home خالی موبایل |
| `--flash` | انیمیشن highlight |

### ۶.۳ Model Select (`.ar-mselect`)

- **Pill:** `.ar-mselect-btn` — داخل composer
- **Bar:** `.ar-mselect--bar` + `.ar-mselect-bar-btn` — header
- **Popover:** `.ar-mselect-pop` (desktop) / `.ar-mselect-sheet` (mobile)
- **Floating:** `.ar-mselect-pop--floating` — portal با `position: fixed`

### ۶.۴ Mode Selector

| نوع | کلاس | UI |
|-----|------|-----|
| Segmented | `.ar-mode-segmented` + `.ar-mode-seg` | ChatGPT-style ۳تایی |
| Pills | `.ar-mode-pills` + `.ar-mode-pill` | موبایل |
| Popover | `.ar-mode-pop` + `.ar-mode-item` | لیست کامل |

### ۶.۵ Chat Thread

```
.ar-chat-wrap
├── .ar-chat-scroll
│   └── .ar-turn
│       ├── .ar-msg-user-row → .ar-msg-user-bubble
│       └── .ar-msg-ai-block → .ar-md
└── .ar-chat-composer
```

- پاسخ AI **بدون bubble** — متن plain + markdown
- کاربر: bubble خاکستری روشن، `border-radius: 20px`
- Streaming cursor: `▋` با `ar-cursor-blink`
- Actions: `.ar-msg-actions` + `.ar-msg-action-btn`

### ۶.۶ Markdown (`.ar-md`)

استایل‌های داخلی: `h1–h4`، `code`/`pre`، `blockquote`، `table`، `a` (accent).

### ۶.۷ Sheet / Modal

| کلاس | کاربرد |
|------|--------|
| `.ar-sheet-backdrop` | overlay blur |
| `.ar-sheet` | پنل (موبایل bottom / دسکتاپ center) |
| `.ar-sheet--auth` | ورود compact |
| `.ar-mselect-sheet-backdrop` | sheet انتخاب مدل |

انیمیشن: `ar-fade-in` (۱۵۰ms)، `ar-sheet-up` (۲۲۰–۲۵۰ms).

### ۶.۸ Sidebar (`.ar-side-*`)

- `.ar-newchat` — دکمه گفتگوی جدید
- `.ar-side-item` — آیتم تاریخچه
- `.ar-side-nav-item` — لینک ابزارها
- `.ar-side-credits` — نمایش اعتبار
- `.ar-side-profile-pop` — منوی پروفایل

موبایل: `.ar-drawer` + `.ar-drawer-backdrop`

### ۶.۹ Cards و Chips

| کلاس | کاربرد |
|------|--------|
| `.ar-feature-card` | grid ۲×۲ home |
| `.ar-suggest-card` | پیشنهاد prompt |
| `.ar-chat-chip` | shortcut گرد |
| `.ar-model-card` | انتخاب مدل premium |
| `.ar-credits-chip` | نمایش اعتبار header |
| `.ar-hero-badge` | micro-benefit |

### ۶.۱۰ Upsell (`.ar-upsell`)

**نه error** — gate پلن با پس‌زمینه accent-soft.

### ۶.۱۱ Battle / Compare

- `.ar-battle-grid` — ۲ ستونه (۱ در موبایل)
- `.ar-answer-card.winner` — border accent + soft ring
- `.ar-compare-wrap` — inline در shell چت
- `.ar-vote-bar` — sticky bottom

### ۶.۱۲ Pricing

- `.ar-plans-grid` + `.ar-plan-card.featured`
- `.ar-plan-badge` — «پیشنهادی»
- `.ar-plan-credits` — pill اعتبار

### ۶.۱۳ Banner

`.ar-banner.success` / `.ar-banner.error` — نتیجه پرداخت

### ۶.۱۴ Loading

- `.ar-spinner` — چرخش border
- `.ar-skeleton-line` — `ar-pulse` ۱.۴s

---

## ۷. استودیوها (`studios.css`)

پrefix همان `ar-` با namespace اختصاصی:

| استودیو | root class | نکته |
|---------|------------|------|
| Code | `.ar-code-studio` | `direction: ltr` روی body؛ chat RTL |
| Image | `.ar-image-studio` | progress stages |
| Video | `.ar-video-studio` | |
| Audio | `.ar-audio-studio` | |
| Music | `.ar-music-studio` | |

موبایل code studio: `.ar-code-mobile-tabs` برای switch بین chat/editor/preview.

---

## ۸. آیکون‌ها

فایل: `app/ai/icons.tsx`

- SVG stroke-based، `strokeWidth` معمولاً `1.75`
- `viewBox="0 0 24 24"`
- `currentColor` — رنگ از parent
- **هیچ emoji در UI**

دسته‌ها: UI chrome (`IconSend`, `IconMenu`…)، برند مدل (`IconOpenAI`…)، استودیو (`IconImage`, `IconCode`…).

```tsx
import { IconSend } from "@/app/ai/icons";
<IconSend size={20} />
```

---

## ۹. انیمیشن و Motion

| نام | مدت | easing |
|-----|-----|--------|
| `ar-fade-in` | 150ms | ease |
| `ar-sheet-up` | 220–250ms | ease |
| `ar-drawer-in` | 200ms | ease |
| `ar-composer-flash` | 550ms | ease |
| `ar-pulse` | 1400ms | ease-in-out |
| `ar-spin` | 700ms | linear |
| home action | 180–200ms | cubic-bezier(0.22, 1, 0.36, 1) |

```css
@media (prefers-reduced-motion: reduce) {
  /* در features.css الگو موجود — در اپ اصلی هم رعایت شود */
}
```

---

## ۱۰. دسترسی‌پذیری

- `focus-visible`: outline `2px solid var(--ar-accent)` + `outline-offset: 2px`
- `-webkit-tap-highlight-color: transparent` روی action rows
- `touch-action: manipulation` در PWA
- contrast متن اصلی روی `#F6F7F9` و `#FFFFFF` کافی است
- skip link در لندینگ features (`feat-skip`)

---

## ۱۱. الگوهای RTL

| عنصر | direction |
|------|-----------|
| `.ar-root` | `rtl` |
| نام مدل AI | `ltr` + `text-align: right` |
| input ایمیل/رمز auth | `ltr` + `text-align: left` |
| code studio body | `ltr` (چیدمان ادیتور) |
| `.ar-code-chat` | `rtl` (متن چت) |
| `powered-by` tagline | `ltr` |

از logical properties استفاده شده: `padding-inline`, `margin-inline-start`, `inset-inline-end`.

---

## ۱۲. چک‌لیست صفحه/کامپوننت جدید

- [ ] زیر `.ar-root` رندر می‌شود
- [ ] رنگ از `--ar-*` — نه hex پراکنده
- [ ] کلاس `ar-` با الگوی موجود
- [ ] موبایل ≤900px تست شده
- [ ] composer/sheet در portal توکن دارد
- [ ] فونت Vazirmatn inherit می‌شود
- [ ] آیکون از `icons.tsx` — بدون emoji
- [ ] `safe-area-inset-bottom` برای docked UI
- [ ] حالت disabled/loading/error با semantic tokens

---

## ۱۳. Anti-patterns

| ❌ نکنید | ✅ بکنید |
|---------|---------|
| رنگ hardcode `#2563eb` در workspace | `--ar-accent` |
| emoji در دکمه/منو | SVG icon |
| کلاس `btn-primary` generic | `.ar-btn.ar-btn-primary` |
| کپی توکن `feat-*` به اپ | extend `--ar-*` |
| `100vh` روی موبایل | `100dvh` |
| sidebar جدید بدون drawer موبایل | الگوی `.ar-drawer` |
| bubble برای پاسخ AI | `.ar-md` plain |

---

## ۱۴. مرجع سریع توکن

```css
/* کپی برای playground — مقادیر از tokens.css */
.ar-root {
  --ar-bg: #F6F7F9;
  --ar-card: #FFFFFF;
  --ar-text: #111318;
  --ar-text2: #667085;
  --ar-border: #E3E7EE;
  --ar-accent: #635BFF;
  --ar-accent-soft: #EEF0FF;
  --ar-radius: 14px;
}
```

---

## ۱۵. فایل‌های مرتبط

| فایل | نقش |
|------|-----|
| `app/ai/layout.tsx` | root `.ar-root`، metadata، PWA |
| `app/ai/ArenaShell.tsx` | sidebar، drawer، navigation |
| `app/ai/ArenaComposer.tsx` | composer اصلی |
| `app/ai/ModelSelect.tsx` | انتخاب مدل |
| `app/ai/ModeSelector.tsx` | segmented mode |
| `app/ai/MarkdownMessage.tsx` | رندر `.ar-md` |
| `lib/aiModels.ts` | داده مدل‌ها و tier |

---

*آخرین همگام‌سازی با کد: بر اساس `app/ai/tokens.css` و ماژول‌های CSS workspace.*

import { definePrompt, standardFaq } from "../definePrompt";
import type { AraayePrompt } from "../promptTypes";

/** New high-intent seed prompts (~25) for SEO taxonomy gaps. */
export const SEED_PROMPTS: AraayePrompt[] = [
  // ── Writing ──────────────────────────────────────────────────
  definePrompt({
    slug: "persian-edit",
    title: "پرامپت برای اصلاح متن فارسی",
    category: "writing",
    tags: ["persian", "edit"],
    intentPhrase: "پرامپت برای اصلاح متن فارسی",
    shortDescription: "متن فارسی را از نظر املا، دستور زبان، وضوح و لحن حرفه‌ای اصلاح کن.",
    searchIntent: "پرامپت اصلاح متن فارسی",
    targetUser: "نویسنده، دانشجو، کارشناس محتوا و کسب‌وکارها",
    basePrompt: `تو ویراستار ارشد فارسی هستی. متن زیر را اصلاح کن.

خروجی را دقیقاً با این ساختار بده:
1) نسخه اصلاح‌شده (آماده انتشار)
2) فهرست تغییرات مهم (گلوله‌ای)
3) پیشنهاد لحن جایگزین (رسمی / نیمه‌رسمی / دوستانه) در یک پاراگراف کوتاه

قوانین:
- معنی را عوض نکن مگر برای رفع ابهام
- از واژه‌های ثقیل غیرضروری پرهیز کن
- علائم نگارشی را استاندارد کن

متن:
{{TEXT}}

لحن هدف (اختیاری):
{{TONE}}`,
    gptVersion: `Edit the Persian text for spelling, grammar, clarity, and tone. Return: (1) corrected text, (2) key changes, (3) one alternate tone paragraph.
Text:
{{TEXT}}
Target tone:
{{TONE}}`,
    claudeVersion: `You are a careful Persian copy editor. Preserve meaning. Improve clarity and punctuation. Structure: Corrected version → Changes → Alternate tone.
{{TEXT}}
{{TONE}}`,
    geminiVersion: `ویرایش متن فارسی با تمرکز روی خوانایی. خروجی ساخت‌یافته: متن اصلاح‌شده، تغییرات، لحن جایگزین.
{{TEXT}}
{{TONE}}`,
    exampleInput: "ما تونستیم پروژه رو با موفقیت تموم کنیم و مشتری خیلی راضی بودن.",
    exampleOutput: `نسخه اصلاح‌شده:
ما توانستیم پروژه را با موفقیت به پایان برسانیم و مشتری بسیار راضی بود.

تغییرات:
- تصحیح املا/دستور
- یکدست‌سازی زمان فعل`,
    useCases: [
      "آماده‌سازی پست وبلاگ قبل از انتشار",
      "ویرایش ایمیل و پروپوزال",
      "یکدست‌سازی لحن تیم محتوا",
      "اصلاح متن ترجمه ماشینی",
    ],
    commonMistakes: [
      "ندادن لحن هدف",
      "چسباندن متن خیلی بلند بدون بخش‌بندی",
      "درخواست بازنویسی کامل به‌جای ویرایش",
      "فراموش کردن مخاطب نهایی",
    ],
    relatedPrompts: ["rewrite", "email", "summarize"],
    faq: standardFaq("اصلاح متن فارسی"),
    metaTitle: "پرامپت برای اصلاح متن فارسی | Araaye AI",
    metaDescription:
      "پرامپت ویرایش و اصلاح متن فارسی با املا، دستور زبان و لحن حرفه‌ای. آماده کپی یا اجرا در Araaye AI.",
  }),

  definePrompt({
    slug: "instagram-bio",
    title: "پرامپت برای نوشتن بیو اینستاگرام",
    category: "writing",
    tags: ["instagram", "bio"],
    intentPhrase: "پرامپت برای نوشتن بیو اینستاگرام",
    shortDescription: "چند بیو کوتاه، جذاب و تبدیل‌محور برای پروفایل اینستاگرام بساز.",
    searchIntent: "پرامپت بیو اینستاگرام",
    targetUser: "برند شخصی، کسب‌وکار محلی و فروشگاه آنلاین",
    basePrompt: `تو کپی‌رایتر شبکه‌های اجتماعی هستی. برای پروفایل اینستاگرام ۵ بیو بنویس.

هر بیو حداکثر ۱۵۰ کاراکتر، فارسی، واضح و با CTA کوتاه.

اطلاعات برند:
{{BRAND}}

مخاطب:
{{AUDIENCE}}

پیشنهاد ارزش:
{{VALUE}}

خروجی:
1) ۵ بیو شماره‌گذاری‌شده
2) ۳ ایده هایلایت کاور
3) یک پیشنهاد نام کاربری اگر لازم است`,
    gptVersion: `Write 5 Instagram bios (≤150 chars, Persian) + 3 highlight ideas. Brand: {{BRAND}}. Audience: {{AUDIENCE}}. Value: {{VALUE}}.`,
    claudeVersion: `Craft 5 conversion-focused Persian Instagram bios. Keep each under 150 characters. Include highlight ideas.
{{BRAND}} | {{AUDIENCE}} | {{VALUE}}`,
    geminiVersion: `۵ بیو اینستاگرام فارسی کوتاه با CTA + ایده هایلایت.
{{BRAND}} / {{AUDIENCE}} / {{VALUE}}`,
    exampleInput: "باشگاه آنلاین یوگا برای زنان شاغل",
    exampleOutput: "۱) یوگای ۱۵ دقیقه‌ای برای روزهای شلوغ | کلاس آنلاین | لینک ثبت‌نام 👇",
    useCases: [
      "راه‌اندازی پروفایل جدید",
      "ریبرندینگ پیج",
      "افزایش کلیک لینک بیو",
      "A/B تست بیو",
    ],
    commonMistakes: [
      "پر کردن بیو با ایموجی بی‌هدف",
      "ندادن مخاطب و پیشنهاد ارزش",
      "نوشتن بیو خیلی طولانی",
      "فراموش کردن CTA",
    ],
    relatedPrompts: ["instagram-caption", "linkedin-bio", "hashtag-pack"],
    faq: standardFaq("بیو اینستاگرام"),
    metaTitle: "پرامپت برای نوشتن بیو اینستاگرام | Araaye AI",
    metaDescription:
      "پرامپت ساخت بیو اینستاگرام جذاب و کوتاه با CTA. مناسب برند شخصی و کسب‌وکار — Araaye AI.",
  }),

  // ── Programming ──────────────────────────────────────────────
  definePrompt({
    slug: "react-component",
    title: "پرامپت برای ساخت کامپوننت React",
    category: "programming",
    tags: ["react", "frontend"],
    intentPhrase: "پرامپت برای React",
    shortDescription: "کامپوننت React تمیز با TypeScript، props و حالت‌های UI تولید کن.",
    searchIntent: "پرامپت React / ساخت کامپوننت",
    targetUser: "فرانت‌اند دولوپر و فریلنسر",
    basePrompt: `تو Senior React + TypeScript engineer هستی. یک کامپوننت بساز.

نیازمندی:
{{REQUIREMENT}}

خروجی:
1) کد کامل کامپوننت (TypeScript)
2) تعریف Props با توضیح کوتاه
3) مثال استفاده
4) نکات دسترسی‌پذیری (a11y)
5) تست ساده با React Testing Library (اختیاری کوتاه)

قوانین:
- بدون کتابخانه اضافه مگر اینکه لازم باشد
- نام‌گذاری واضح و قابل نگهداری
- حالت‌های loading / empty / error را در نظر بگیر اگر مرتبط است`,
    gptVersion: `Build a React+TS component for: {{REQUIREMENT}}. Return code, props, usage example, a11y notes.`,
    claudeVersion: `Implement a maintainable React TypeScript component. Prefer composition. Include props types and usage.
Requirement: {{REQUIREMENT}}`,
    geminiVersion: `کامپوننت React با TypeScript برای: {{REQUIREMENT}}. کد + Props + مثال استفاده.`,
    exampleInput: "کارت قیمت‌گذاری با دکمه انتخاب پلن",
    exampleOutput: "کامپوننت PricingCard با props: title, price, features, onSelect …",
    useCases: [
      "ساخت UI سریع در پروژه Next.js",
      "استانداردسازی کامپوننت‌های تیمی",
      "نمونه برای Code Review",
      "پروتوتایپ فیچر",
    ],
    commonMistakes: [
      "ندادن نیازمندی و استیت‌ها",
      "درخواست چند کامپوننت در یک پرامپت بدون اولویت",
      "فراموش کردن TypeScript",
      "مشخص نکردن استایل (Tailwind/CSS)",
    ],
    relatedPrompts: ["code-review", "unit-test", "javascript-function"],
    faq: standardFaq("ساخت کامپوننت React"),
    metaTitle: "پرامپت برای React | ساخت کامپوننت | Araaye AI",
    metaDescription:
      "پرامپت ساخت کامپوننت React با TypeScript، Props و مثال استفاده. آماده اجرا در Araaye AI.",
  }),

  definePrompt({
    slug: "python-script",
    title: "پرامپت برای نوشتن اسکریپت Python",
    category: "programming",
    tags: ["python", "script"],
    intentPhrase: "پرامپت برای Python",
    shortDescription: "اسکریپت پایتون کاربردی با ورودی/خروجی واضح و مدیریت خطا بنویس.",
    searchIntent: "پرامپت Python / اسکریپت پایتون",
    targetUser: "برنامه‌نویس پایتون، دیتا و اتوماسیون",
    basePrompt: `تو مهندس پایتون هستی. یک اسکریپت کاربردی بنویس.

هدف اسکریپت:
{{GOAL}}

ورودی‌ها:
{{INPUTS}}

خروجی مورد انتظار:
{{OUTPUT}}

ساختار پاسخ:
1) کد کامل قابل اجرا
2) نحوه اجرا (دستور)
3) وابستگی‌ها (اگر دارد)
4) محدودیت‌ها و نکات امنیتی کوتاه`,
    gptVersion: `Write a practical Python script. Goal: {{GOAL}}. Inputs: {{INPUTS}}. Output: {{OUTPUT}}. Include run command and deps.`,
    claudeVersion: `Produce a clean Python script with error handling. Goal/Inputs/Output provided. Prefer stdlib when possible.
{{GOAL}} | {{INPUTS}} | {{OUTPUT}}`,
    geminiVersion: `اسکریپت Python برای {{GOAL}}. ورودی: {{INPUTS}}. خروجی: {{OUTPUT}}.`,
    exampleInput: "تبدیل پوشه CSV به یک Excel",
    exampleOutput: "اسکریپت merge_csv.py با argparse و pandas …",
    useCases: ["اتوماسیون کارهای تکراری", "پردازش فایل", "اسکریپت CLI داخلی", "نمونه آموزشی"],
    commonMistakes: [
      "مشخص نکردن فرمت ورودی",
      "درخواست کتابخانه مبهم",
      "نادیده گرفتن encoding فارسی",
      "بدون مثال اجرا",
    ],
    relatedPrompts: ["python-debug", "csv-extract", "unit-test"],
    faq: standardFaq("اسکریپت پایتون"),
    metaTitle: "پرامپت برای Python | اسکریپت پایتون | Araaye AI",
    metaDescription:
      "پرامپت نوشتن اسکریپت Python با مدیریت خطا و دستور اجرا. مناسب اتوماسیون و دیتا — Araaye AI.",
  }),

  definePrompt({
    slug: "api-design",
    title: "پرامپت برای طراحی API",
    category: "programming",
    tags: ["api", "backend"],
    intentPhrase: "پرامپت برای ساخت API",
    shortDescription: "Endpointها، مدل داده و قرارداد REST/JSON را طراحی کن.",
    searchIntent: "پرامپت ساخت API",
    targetUser: "بک‌اند دولوپر و لید فنی",
    basePrompt: `تو معمار API هستی. برای این محصول یک API طراحی کن.

محصول / دامنه:
{{DOMAIN}}

قابلیت‌های اصلی:
{{FEATURES}}

خروجی:
1) لیست Endpointها (method + path + توضیح)
2) نمونه Request/Response JSON برای ۲ endpoint مهم
3) کدهای وضعیت و خطای استاندارد
4) نکات احراز هویت و محدودیت نرخ
5) پیشنهاد نسخه‌بندی (versioning)`,
    gptVersion: `Design a REST API for {{DOMAIN}} with features {{FEATURES}}. Include endpoints, sample JSON, errors, auth.`,
    claudeVersion: `Propose a pragmatic REST API contract. Be specific about resources and error shapes.
Domain: {{DOMAIN}}
Features: {{FEATURES}}`,
    geminiVersion: `طراحی API برای {{DOMAIN}}. قابلیت‌ها: {{FEATURES}}. Endpoint + نمونه JSON + خطاها.`,
    exampleInput: "اپ رزرو نوبت کلینیک",
    exampleOutput: "POST /appointments … پاسخ ۲۰۱ با id و status …",
    useCases: ["شروع بک‌اند جدید", "هم‌ترازی فرانت و بک", "مستندسازی قرارداد API", "بازبینی فنی"],
    commonMistakes: [
      "ندادن دامنه و نقش کاربران",
      "مخلوط کردن GraphQL و REST بدون تصمیم",
      "فراموش کردن خطاها",
      "بدون نمونه JSON",
    ],
    relatedPrompts: ["sql-query", "code-review", "unit-test"],
    faq: standardFaq("طراحی API"),
    metaTitle: "پرامپت برای ساخت API | طراحی REST | Araaye AI",
    metaDescription:
      "پرامپت طراحی API با Endpoint، JSON نمونه و احراز هویت. مناسب بک‌اند و مستندسازی — Araaye AI.",
  }),

  definePrompt({
    slug: "unit-test",
    title: "پرامپت برای تولید تست واحد",
    category: "programming",
    tags: ["testing"],
    intentPhrase: "پرامپت برای تولید تست",
    shortDescription: "تست‌های واحد معنادار برای کد داده‌شده بنویس.",
    searchIntent: "پرامپت تست واحد / unit test",
    targetUser: "دولوپر و تیم QA",
    basePrompt: `تو مهندس کیفیت نرم‌افزار هستی. برای کد زیر تست واحد بنویس.

زبان / فریمورک تست:
{{STACK}}

کد:
{{CODE}}

خروجی:
1) موارد تست (happy path + edge + failure)
2) کد تست کامل
3) چه چیزی عمداً تست نشده و چرا`,
    gptVersion: `Write unit tests for the code. Stack: {{STACK}}. Code: {{CODE}}. Include cases and full test code.`,
    claudeVersion: `Generate focused unit tests. Prefer clear arrange-act-assert. Stack {{STACK}}.
{{CODE}}`,
    geminiVersion: `تست واحد برای کد زیر با {{STACK}}. کیس‌ها + کد تست.
{{CODE}}`,
    exampleInput: "تابع calculateDiscount(price, percent)",
    exampleOutput: "تست‌های درصد صفر، منفی، بیش از ۱۰۰، قیمت صفر …",
    useCases: ["افزایش پوشش تست", "ریفکتور امن", "آنبوردینگ تست به پروژه", "باگ‌فیکس با رگرسیون"],
    commonMistakes: [
      "ندادن فریمورک تست",
      "کد ناقص بدون وابستگی‌ها",
      "درخواست E2E به‌جای واحد",
      "بدون مشخص کردن رفتار مورد انتظار",
    ],
    relatedPrompts: ["code-review", "react-component", "python-debug"],
    faq: standardFaq("تولید تست واحد"),
    metaTitle: "پرامپت برای تولید تست واحد | Araaye AI",
    metaDescription:
      "پرامپت نوشتن Unit Test با کیس‌های لبه و کد کامل. مناسب Jest، pytest و RTL — Araaye AI.",
  }),

  definePrompt({
    slug: "code-convert",
    title: "پرامپت برای تبدیل کد",
    category: "programming",
    tags: ["convert"],
    intentPhrase: "پرامپت برای تبدیل کد",
    shortDescription: "کد را از یک زبان/فریمورک به دیگری با حفظ رفتار تبدیل کن.",
    searchIntent: "پرامپت تبدیل کد",
    targetUser: "دولوپر در مهاجرت فنی",
    basePrompt: `کد را از {{FROM}} به {{TO}} تبدیل کن و رفتار را حفظ کن.

کد مبدأ:
{{CODE}}

خروجی:
1) کد تبدیل‌شده
2) تفاوت‌های مهم idiomatic
3) ریسک‌ها و موارد نیاز به بازبینی دستی
4) تست دود کوتاه برای تأیید`,
    gptVersion: `Convert code from {{FROM}} to {{TO}}. Preserve behavior. Provide converted code, idioms, risks, smoke test.
{{CODE}}`,
    claudeVersion: `Faithfully port code {{FROM}} → {{TO}}. Call out semantic pitfalls.
{{CODE}}`,
    geminiVersion: `تبدیل کد از {{FROM}} به {{TO}}. کد جدید + ریسک‌ها.
{{CODE}}`,
    exampleInput: "تابع JS به Python",
    exampleOutput: "نسخه Python با type hints و تست assert …",
    useCases: ["مهاجرت فریمورک", "آموزش مقایسه زبان‌ها", "بازنویسی ماژول قدیمی", "پورت اسکریپت"],
    commonMistakes: [
      "مشخص نکردن زبان مقصد",
      "انتظار تبدیل ۱۰۰٪ بدون بازبینی",
      "کد خیلی بزرگ در یک پیام",
      "نادیده گرفتن وابستگی‌ها",
    ],
    relatedPrompts: ["javascript-function", "python-script", "code-review"],
    faq: standardFaq("تبدیل کد"),
    metaTitle: "پرامپت برای تبدیل کد بین زبان‌ها | Araaye AI",
    metaDescription:
      "پرامپت تبدیل کد از یک زبان به دیگری با حفظ رفتار و هشدار ریسک‌ها — Araaye AI.",
  }),

  // ── Marketing ────────────────────────────────────────────────
  definePrompt({
    slug: "keyword-research",
    title: "پرامپت برای تحقیق کلمات کلیدی",
    category: "marketing",
    tags: ["seo", "keywords"],
    intentPhrase: "پرامپت برای تحقیق کلمات کلیدی",
    shortDescription: "خوشه کلمات کلیدی فارسی با نیت جستجو و اولویت‌بندی پیشنهاد بده.",
    searchIntent: "پرامپت تحقیق کلمات کلیدی سئو",
    targetUser: "سئوکار، بازاریاب محتوا و صاحب کسب‌وکار",
    basePrompt: `تو متخصص SEO ایران هستی. برای موضوع زیر تحقیق کلمه کلیدی انجام بده.

موضوع / محصول:
{{TOPIC}}

شهر یا محدوده (اختیاری):
{{LOCATION}}

خروجی:
1) ۱۰ کلمه اصلی با نیت (informational / commercial / transactional)
2) ۵ خوشه محتوایی پیشنهادی
3) ۳ صفحه اولویت‌دار برای ساخت/بهینه‌سازی
4) ایده‌های FAQ برای اسکیما`,
    gptVersion: `Persian SEO keyword research for {{TOPIC}} in {{LOCATION}}. Intent labels, clusters, priority pages, FAQs.`,
    claudeVersion: `Do practical Iranian-market keyword clustering for {{TOPIC}}. Be specific and actionable.
Location: {{LOCATION}}`,
    geminiVersion: `تحقیق کلمات کلیدی فارسی برای {{TOPIC}} ({{LOCATION}}). نیت + خوشه + اولویت صفحات.`,
    exampleInput: "کلینیک پوست در تهران",
    exampleOutput: "کلمات: تزریق فیلر تهران (commercial)، مراقبت پوست خشک (informational) …",
    useCases: ["برنامه‌ریزی تقویم محتوا", "بهینه‌سازی لندینگ", "پیدا کردن فرصت long-tail", "بریف نویسنده"],
    commonMistakes: [
      "موضوع خیلی کلی بدون niche",
      "نادیده گرفتن نیت جستجو",
      "کپی کلمات انگلیسی بدون بومی‌سازی",
      "بدون اولویت‌بندی",
    ],
    relatedPrompts: ["seo-article", "meta-title-description", "competitor-analysis"],
    faq: standardFaq("تحقیق کلمات کلیدی"),
    metaTitle: "پرامپت برای تحقیق کلمات کلیدی سئو | Araaye AI",
    metaDescription:
      "پرامپت تحقیق کلمات کلیدی فارسی با نیت جستجو و خوشه‌بندی محتوا — مناسب سئو ایران.",
  }),

  definePrompt({
    slug: "meta-title-description",
    title: "پرامپت برای Meta Title و Description",
    category: "marketing",
    tags: ["seo", "meta"],
    intentPhrase: "پرامپت برای Meta Title",
    shortDescription: "چند نسخه Meta Title و Meta Description سئو‌شده برای صفحه بساز.",
    searchIntent: "پرامپت متا تایتل و دیسکریپشن",
    targetUser: "سئوکار و وبمستر",
    basePrompt: `برای صفحه زیر Meta Title و Meta Description بنویس.

موضوع صفحه:
{{PAGE}}

کلمه کلیدی اصلی:
{{KEYWORD}}

خروجی:
- ۵ Meta Title (حداکثر حدود ۶۰ کاراکتر)
- ۵ Meta Description (حداکثر حدود ۱۵۵ کاراکتر)
- برای هر کدام یک نکته کوتاه چرا کار می‌کند`,
    gptVersion: `Create 5 SEO meta titles (~60) and 5 descriptions (~155) for {{PAGE}} targeting {{KEYWORD}}. Explain briefly.`,
    claudeVersion: `Write click-worthy but honest meta titles/descriptions for {{PAGE}} / {{KEYWORD}}.`,
    geminiVersion: `۵ متا تایتل و ۵ دیسکریپشن برای {{PAGE}} با کلمه {{KEYWORD}}.`,
    exampleInput: "صفحه قیمت‌گذاری Araaye AI",
    exampleOutput: "عنوان: قیمت Araaye AI | پلن‌ها و اعتبار …",
    useCases: ["راه‌اندازی صفحه جدید", "بهبود CTR سرچ", "ریرایت متاهای ضعیف", "A/B تست عنوان"],
    commonMistakes: [
      "کلمه کلیدی را ندادن",
      "عنوان گمراه‌کننده",
      "تکرار عین عنوان H1 بدون ارزش افزوده",
      "دیسکریپشن بدون CTA",
    ],
    relatedPrompts: ["seo-article", "landing-copy", "keyword-research"],
    faq: standardFaq("Meta Title و Description"),
    metaTitle: "پرامپت Meta Title و Meta Description | Araaye AI",
    metaDescription:
      "پرامپت ساخت Meta Title و Description سئو‌شده برای افزایش CTR — Araaye AI.",
  }),

  definePrompt({
    slug: "competitor-analysis",
    title: "پرامپت برای تحلیل رقبا",
    category: "marketing",
    tags: ["seo", "strategy"],
    intentPhrase: "پرامپت برای تحلیل رقبا",
    shortDescription: "تحلیل رقابتی ساختارمند برای سایت، محصول یا کمپین انجام بده.",
    searchIntent: "پرامپت تحلیل رقبا",
    targetUser: "مارکتر، فاوندر و سئوکار",
    basePrompt: `رقبای زیر را تحلیل کن و فرصت‌های تمایز بده.

کسب‌وکار ما:
{{OUR_BUSINESS}}

رقبا (نام یا URL):
{{COMPETITORS}}

خروجی:
1) جدول مقایسه (موقعیت، قوت، ضعف)
2) شکاف‌های محتوا/محصول
3) ۳ حرکت پیشنهادی ۹۰ روزه
4) ریسک‌ها`,
    gptVersion: `Competitor analysis for {{OUR_BUSINESS}} vs {{COMPETITORS}}. Comparison, gaps, 90-day moves, risks.`,
    claudeVersion: `Structured competitive teardown. Be concrete. Business: {{OUR_BUSINESS}}. Competitors: {{COMPETITORS}}.`,
    geminiVersion: `تحلیل رقبا برای {{OUR_BUSINESS}} در برابر {{COMPETITORS}}.`,
    exampleInput: "باشگاه آنلاین زبان در برابر دو رقیب اصلی",
    exampleOutput: "شکاف: مسیر یادگیری موبایل‌فرست … حرکت: لندینگ intent محور …",
    useCases: ["برنامه‌ریزی محتوا", "قیمت‌گذاری", "پیام‌گذاری برند", "اولویت بک‌لاگ محصول"],
    commonMistakes: [
      "رقبا را مبهم گذاشتن",
      "فقط کپی ویژگی‌ها بدون تمایز",
      "نادیده گرفتن مخاطب هدف",
      "تحلیل بدون اقدام",
    ],
    relatedPrompts: ["keyword-research", "landing-copy", "swot"],
    faq: standardFaq("تحلیل رقبا"),
    metaTitle: "پرامپت برای تحلیل رقبا | Araaye AI",
    metaDescription:
      "پرامپت تحلیل رقبا با جدول مقایسه، شکاف فرصت و برنامه ۹۰ روزه — Araaye AI.",
  }),

  definePrompt({
    slug: "landing-copy",
    title: "پرامپت برای کپی لندینگ پیج",
    category: "marketing",
    tags: ["landing", "copy"],
    intentPhrase: "پرامپت برای Landing Page",
    shortDescription: "ساختار و متن لندینگ تبدیل‌محور با هیرو، مزایا و CTA بنویس.",
    searchIntent: "پرامپت لندینگ پیج",
    targetUser: "مارکتر، فاوندر و طراح محصول",
    basePrompt: `برای لندینگ زیر کپی بنویس.

محصول:
{{PRODUCT}}

مخاطب:
{{AUDIENCE}}

پیشنهاد اصلی:
{{OFFER}}

خروجی بخش‌ها:
1) Headline + subheadline
2) ۳ مزیت با توضیح کوتاه
3) Social proof پیشنهادی
4) FAQ سه سؤالی
5) CTAهای اصلی و ثانویه`,
    gptVersion: `Write landing copy for {{PRODUCT}} to {{AUDIENCE}} with offer {{OFFER}}. Include hero, benefits, proof, FAQ, CTAs.`,
    claudeVersion: `Conversion-focused landing sections. Clear and specific. {{PRODUCT}} / {{AUDIENCE}} / {{OFFER}}.`,
    geminiVersion: `کپی لندینگ برای {{PRODUCT}}. مخاطب {{AUDIENCE}}. پیشنهاد {{OFFER}}.`,
    exampleInput: "ابزار ساخت سایت فوری برای پزشکان",
    exampleOutput: "Headline: سایت مطب را امروز بالا بیاور …",
    useCases: ["لانچ محصول", "کمپین تبلیغاتی", "ریرایت لندینگ ضعیف", "هم‌ترازی دیزاین و کپی"],
    commonMistakes: [
      "بدون مخاطب و offer",
      "شعار کلی بدون مدرک",
      "CTA مبهم",
      "پر کردن با jargon",
    ],
    relatedPrompts: ["cta-generator", "meta-title-description", "ad-copy"],
    faq: standardFaq("کپی لندینگ پیج"),
    metaTitle: "پرامپت برای Landing Page | کپی لندینگ | Araaye AI",
    metaDescription:
      "پرامپت نوشتن کپی لندینگ پیج با هیرو، مزایا، FAQ و CTA — آماده اجرا در Araaye AI.",
  }),

  definePrompt({
    slug: "cta-generator",
    title: "پرامپت برای ساخت CTA",
    category: "marketing",
    tags: ["cta", "conversion"],
    intentPhrase: "پرامپت برای CTA Generator",
    shortDescription: "۱۰ CTA قوی برای دکمه، بنر و ایمیل پیشنهاد بده.",
    searchIntent: "پرامپت CTA",
    targetUser: "مارکتر رشد و طراح محصول",
    basePrompt: `برای این صفحه/کمپین ۱۰ CTA بنویس.

زمینه:
{{CONTEXT}}

اقدام مطلوب:
{{ACTION}}

خروجی گروه‌بندی‌شده:
- مستقیم
- کم‌ریسک (مثل «مشاهده نمونه»)
- اضطراری ملایم
برای هر CTA یک جمله توضیح کوتاه چرا کار می‌کند.`,
    gptVersion: `Generate 10 CTAs for {{CONTEXT}} aiming for {{ACTION}}. Group direct / low-risk / soft-urgency with reasons.`,
    claudeVersion: `Create varied CTAs. Avoid hype. Context: {{CONTEXT}}. Desired action: {{ACTION}}.`,
    geminiVersion: `۱۰ CTA برای {{CONTEXT}} با هدف {{ACTION}}.`,
    exampleInput: "ثبت‌نام رایگان در Araaye AI",
    exampleOutput:
      "شروع رایگان — بدون کارت بانکی | نمونه رایگان را ببین | همین حالا ثبت‌نام کن",
    useCases: ["بهینه‌سازی دکمه هیرو", "ایمیل مارکتینگ", "بنر تبلیغاتی", "A/B تست"],
    commonMistakes: [
      "CTA عمومی مثل «کلیک کنید»",
      "وعده گمراه‌کننده",
      "ندادن اقدام مطلوب",
      "یکی بودن همه گزینه‌ها",
    ],
    relatedPrompts: ["landing-copy", "ad-copy", "email"],
    faq: standardFaq("ساخت CTA"),
    metaTitle: "پرامپت CTA Generator | Araaye AI",
    metaDescription:
      "پرامپت تولید CTAهای تبدیل‌محور برای دکمه، بنر و ایمیل — Araaye AI.",
  }),

  // ── Business ─────────────────────────────────────────────────
  definePrompt({
    slug: "swot",
    title: "پرامپت برای تحلیل SWOT",
    category: "business",
    tags: ["strategy"],
    intentPhrase: "پرامپت برای SWOT",
    shortDescription: "تحلیل SWOT کاربردی با اقدام‌های بعدی برای کسب‌وکار بساز.",
    searchIntent: "پرامپت SWOT",
    targetUser: "فاوندر و مدیر محصول",
    basePrompt: `برای کسب‌وکار زیر SWOT بنویس و به اقدام وصل کن.

کسب‌وکار:
{{BUSINESS}}

بازار / رقبا (اختیاری):
{{CONTEXT}}

خروجی:
- Strengths / Weaknesses / Opportunities / Threats (هر کدام ۴ مورد)
- ۵ اقدام اولویت‌دار ۳۰ روزه
- ۲ فرضیه که باید با داده تست شود`,
    gptVersion: `Create an actionable SWOT for {{BUSINESS}} given {{CONTEXT}}. Include 30-day actions and testable hypotheses.`,
    claudeVersion: `Practical SWOT, not generic. Business: {{BUSINESS}}. Context: {{CONTEXT}}.`,
    geminiVersion: `تحلیل SWOT برای {{BUSINESS}}. زمینه: {{CONTEXT}}.`,
    exampleInput: "استارتاپ ابزار AI برای تولید محتوا",
    exampleOutput: "S: سرعت تولید … W: اعتماد برند … O: سئو intent …",
    useCases: ["جلسه استراتژی", "آماده‌سازی پیچ", "بازبینی فصلی", "اولویت‌بندی محصول"],
    commonMistakes: ["توضیح خیلی کلی کسب‌وکار", "SWOT بدون اقدام", "مخلوط فرصت و قوت", "نادیده گرفتن تهدیدها"],
    relatedPrompts: ["business-plan", "okr", "competitor-analysis"],
    faq: standardFaq("تحلیل SWOT"),
    metaTitle: "پرامپت برای تحلیل SWOT | Araaye AI",
    metaDescription: "پرامپت SWOT کاربردی با اقدامات ۳۰ روزه و فرضیه‌های قابل تست — Araaye AI.",
  }),

  definePrompt({
    slug: "okr",
    title: "پرامپت برای نوشتن OKR",
    category: "business",
    tags: ["okr", "kpi"],
    intentPhrase: "پرامپت برای OKR",
    shortDescription: "Objective و Key Results قابل اندازه‌گیری برای تیم تعریف کن.",
    searchIntent: "پرامپت OKR",
    targetUser: "مدیر محصول، فاوندر و لید تیم",
    basePrompt: `برای تیم/شرکت زیر OKR فصلی بنویس.

زمینه و هدف کلان:
{{GOAL}}

محدودیت‌ها:
{{CONSTRAINTS}}

خروجی:
1) ۳ Objective
2) برای هر کدام ۳ Key Result عددی
3) شاخص‌های پیشرو (leading) پیشنهادی
4) ریسک‌های رایج و نحوه اجتناب`,
    gptVersion: `Draft quarterly OKRs for {{GOAL}} with constraints {{CONSTRAINTS}}. 3 objectives × 3 KRs + leading indicators.`,
    claudeVersion: `Write measurable OKRs. Avoid vanity metrics. Goal: {{GOAL}}. Constraints: {{CONSTRAINTS}}.`,
    geminiVersion: `OKR فصلی برای {{GOAL}}. محدودیت‌ها: {{CONSTRAINTS}}.`,
    exampleInput: "رشد فعال‌سازی کاربران رایگان Araaye AI",
    exampleOutput: "O1: فعال‌سازی هفته اول … KR: نرخ اولین پیام ≥ ۴۰٪ …",
    useCases: ["برنامه‌ریزی فصلی", "هم‌راستایی تیم", "اتصال KPI به هدف", "بازبینی ماهانه"],
    commonMistakes: ["KR غیرقابل اندازه‌گیری", "Objective بیش از حد زیاد", "نادیده گرفتن محدودیت منابع", "KPI vanity"],
    relatedPrompts: ["swot", "business-plan", "weekly-plan"],
    faq: standardFaq("نوشتن OKR"),
    metaTitle: "پرامپت برای OKR و KPI | Araaye AI",
    metaDescription: "پرامپت نوشتن OKR فصلی با Key Results عددی و شاخص‌های پیشرو — Araaye AI.",
  }),

  definePrompt({
    slug: "pricing-strategy",
    title: "پرامپت برای استراتژی قیمت‌گذاری",
    category: "business",
    tags: ["pricing"],
    intentPhrase: "پرامپت برای Pricing",
    shortDescription: "مدل قیمت‌گذاری، پلن‌ها و پیام ارزش را پیشنهاد بده.",
    searchIntent: "پرامپت قیمت‌گذاری محصول",
    targetUser: "فاوندر SaaS و مدیر محصول",
    basePrompt: `استراتژی قیمت‌گذاری پیشنهاد بده.

محصول:
{{PRODUCT}}

هزینه/ارزش درک‌شده:
{{VALUE}}

مخاطب و توان پرداخت:
{{AUDIENCE}}

خروجی:
1) ۳ پلن پیشنهادی (نام، قیمت نسبی، چه چیزی شامل می‌شود)
2) منطق ارزش در برابر قیمت
3) آزمایش‌های قیمتی پیشنهادی
4) اعتراض‌های رایج خریدار و پاسخ`,
    gptVersion: `Propose pricing for {{PRODUCT}} given value {{VALUE}} and audience {{AUDIENCE}}. 3 tiers, tests, objection handling.`,
    claudeVersion: `Practical SaaS/product pricing options with packaging rationale. {{PRODUCT}} / {{VALUE}} / {{AUDIENCE}}.`,
    geminiVersion: `استراتژی قیمت برای {{PRODUCT}}. ارزش {{VALUE}}. مخاطب {{AUDIENCE}}.`,
    exampleInput: "ابزار AI با مدل اعتباری",
    exampleOutput:
      "پلن رایگان محدود + رشد + حرفه‌ای با سقف اعتبار ماهانه و پشتیبانی اولویت‌دار",
    useCases: ["لانچ پلن جدید", "بازبینی پکیجینگ", "آماده‌سازی صفحه قیمت", "پاسخ به اعتراض قیمت"],
    commonMistakes: ["بدون شناخت مخاطب", "کپی کور قیمت رقیب", "پلن‌های نامتمایز", "نادیده گرفتن هزینه‌های متغیر"],
    relatedPrompts: ["business-plan", "pitch-deck", "customer-persona"],
    faq: standardFaq("استراتژی قیمت‌گذاری"),
    metaTitle: "پرامپت برای استراتژی قیمت‌گذاری | Araaye AI",
    metaDescription: "پرامپت طراحی پلن‌های قیمت‌گذاری و پیام ارزش محصول — Araaye AI.",
  }),

  definePrompt({
    slug: "customer-persona",
    title: "پرامپت برای ساخت Customer Persona",
    category: "business",
    tags: ["persona"],
    intentPhrase: "پرامپت برای Customer Persona",
    shortDescription: "پرسونای مشتری با انگیزه، درد و کانال‌های خرید بساز.",
    searchIntent: "پرامپت پرسونای مشتری",
    targetUser: "مارکتر، محصول و فروش",
    basePrompt: `۲ پرسونای مشتری دقیق بساز.

محصول/خدمت:
{{PRODUCT}}

بازار هدف:
{{MARKET}}

برای هر پرسونا:
- نام مستعار و نقش
- اهداف و دردها
- اعتراض‌ها
- کانال‌های کشف و خرید
- پیام‌هایی که با او کار می‌کند`,
    gptVersion: `Create 2 detailed customer personas for {{PRODUCT}} in {{MARKET}} including pains, objections, channels, messages.`,
    claudeVersion: `Evidence-minded personas (state assumptions). Product: {{PRODUCT}}. Market: {{MARKET}}.`,
    geminiVersion: `۲ پرسونای مشتری برای {{PRODUCT}} در بازار {{MARKET}}.`,
    exampleInput: "نرم‌افزار نوبت‌دهی برای کلینیک‌های زیبایی",
    exampleOutput: "پرسونا: مدیر کلینیک ۳۰–۴۵ … درد: no-show …",
    useCases: ["بریف تبلیغات", "طراحی لندینگ", "اولویت فیچر", "اسکریپت فروش"],
    commonMistakes: ["پرسونای خیالی بدون فرضیات شفاف", "فقط دموگرافی بدون انگیزه", "یک پرسونا برای همه", "نادیده گرفتن کانال خرید"],
    relatedPrompts: ["landing-copy", "pitch-deck", "ad-copy"],
    faq: standardFaq("ساخت Customer Persona"),
    metaTitle: "پرامپت برای Customer Persona | Araaye AI",
    metaDescription: "پرامپت ساخت پرسونای مشتری با درد، اعتراض و پیام مناسب — Araaye AI.",
  }),

  definePrompt({
    slug: "pitch-deck",
    title: "پرامپت برای Pitch Deck",
    category: "business",
    tags: ["pitch", "investor"],
    intentPhrase: "پرامپت برای Pitch Deck",
    shortDescription: "ساختار و متن اسلایدهای پیچ دک سرمایه‌گذاری را بنویس.",
    searchIntent: "پرامپت پیچ دک / investor pitch",
    targetUser: "فاوندر استارتاپ",
    basePrompt: `برای استارتاپ زیر Outline پیچ دک ۱۰–۱۲ اسلایدی بنویس و برای هر اسلاید بولت‌های سخنرانی بده.

استارتاپ:
{{STARTUP}}

traction / اعداد (اگر هست):
{{TRACTION}}

خروجی اسلایدها:
Problem, Solution, Market, Product, Business Model, Go-to-Market, Competition, Traction, Team, Ask`,
    gptVersion: `Draft a 10-12 slide investor pitch outline for {{STARTUP}} with traction {{TRACTION}}. Bullets per slide.`,
    claudeVersion: `Investor-ready pitch narrative. Be crisp. Startup: {{STARTUP}}. Traction: {{TRACTION}}.`,
    geminiVersion: `پیچ دک برای {{STARTUP}}. اعداد: {{TRACTION}}.`,
    exampleInput: "پلتفرم AI محتوا برای کسب‌وکارهای ایرانی",
    exampleOutput: "اسلاید Problem: هزینه تولید محتوا و پراکندگی ابزارها …",
    useCases: ["آماده‌سازی جلسه سرمایه‌گذار", "دموی شتاب‌دهنده", "هم‌ترازی تیم مؤسسان", "خلاصه یک‌صفحه‌ای"],
    commonMistakes: ["بدون Ask مشخص", "بازار کل غیرواقعی", "نادیده گرفتن رقابت", "متن پاراگرافی به‌جای بولت"],
    relatedPrompts: ["business-plan", "pricing-strategy", "swot"],
    faq: standardFaq("Pitch Deck"),
    metaTitle: "پرامپت برای Pitch Deck و Investor Pitch | Araaye AI",
    metaDescription: "پرامپت ساخت ساختار و متن پیچ دک سرمایه‌گذاری ۱۰–۱۲ اسلایدی — Araaye AI.",
  }),

  // ── Social ───────────────────────────────────────────────────
  definePrompt({
    slug: "content-calendar",
    title: "پرامپت برای تقویم محتوا",
    category: "social",
    tags: ["calendar", "content"],
    intentPhrase: "پرامپت برای تقویم محتوا",
    shortDescription: "تقویم محتوای ۳۰ روزه برای شبکه‌های اجتماعی بساز.",
    searchIntent: "پرامپت تقویم محتوا اینستاگرام",
    targetUser: "ادمین پیج و تیم محتوا",
    basePrompt: `تقویم محتوای ۳۰ روزه بساز.

برند:
{{BRAND}}

پلتفرم‌ها:
{{PLATFORMS}}

هدف:
{{GOAL}}

برای هر روز: موضوع، فرمت (پست/ریل/استوری)، هوک یک‌خطی، CTA.`,
    gptVersion: `Build a 30-day content calendar for {{BRAND}} on {{PLATFORMS}} targeting {{GOAL}}. Daily topic/format/hook/CTA.`,
    claudeVersion: `Practical 30-day social calendar. Mix formats. Brand {{BRAND}}, platforms {{PLATFORMS}}, goal {{GOAL}}.`,
    geminiVersion: `تقویم ۳۰ روزه برای {{BRAND}} روی {{PLATFORMS}} با هدف {{GOAL}}.`,
    exampleInput: "پیج آموزش زبان برای کنکور",
    exampleOutput: "روز ۱: ریلز اشتباهات رایج listening + CTA ذخیره …",
    useCases: ["برنامه‌ریزی ماهانه پیج", "هماهنگی طراح و نویسنده", "کمپین لانچ", "پر کردن خلا محتوا"],
    commonMistakes: ["هدف مبهم", "فقط یک فرمت تکراری", "بدون CTA", "نادیده گرفتن مناسبت‌ها"],
    relatedPrompts: ["instagram-caption", "reels-script", "hashtag-pack"],
    faq: standardFaq("تقویم محتوا"),
    metaTitle: "پرامپت برای تقویم محتوا شبکه‌های اجتماعی | Araaye AI",
    metaDescription: "پرامپت ساخت تقویم محتوای ۳۰ روزه با هوک و CTA روزانه — Araaye AI.",
  }),

  definePrompt({
    slug: "linkedin-post",
    title: "پرامپت برای پست لینکدین",
    category: "social",
    tags: ["linkedin"],
    intentPhrase: "پرامپت برای پست لینکدین",
    shortDescription: "پست لینکدین حرفه‌ای با هوک قوی و ساختار خوانا بنویس.",
    searchIntent: "پرامپت پست لینکدین",
    targetUser: "برند شخصی B2B و فاوندر",
    basePrompt: `۳ نسخه پست لینکدین بنویس.

موضوع:
{{TOPIC}}

زاویه / تجربه شخصی (اختیاری):
{{ANGLE}}

هر نسخه: هوک خط اول، بدنه کوتاه، CTA پایانی. لحن حرفه‌ای و انسانی.`,
    gptVersion: `Write 3 LinkedIn posts about {{TOPIC}} with angle {{ANGLE}}. Strong first line + CTA.`,
    claudeVersion: `LinkedIn posts that sound human, not corporate fluff. Topic: {{TOPIC}}. Angle: {{ANGLE}}.`,
    geminiVersion: `۳ پست لینکدین درباره {{TOPIC}}. زاویه: {{ANGLE}}.`,
    exampleInput: "اشتباه رایج در استخدام اولین مارکتر",
    exampleOutput: "هوک: اولین مارکتر را مثل فروشنده استخدام کردم؛ این نتیجه بود …",
    useCases: ["رشد برند شخصی", "لید B2B", "اعلام فیچر محصول", "به اشتراک‌گذاری درس شغلی"],
    commonMistakes: ["شروع ضعیف", "پاراگراف‌های بلند", "هشتگ زیاد", "فروش مستقیم بدون ارزش"],
    relatedPrompts: ["linkedin-bio", "content-calendar", "idea-generation"],
    faq: standardFaq("پست لینکدین"),
    metaTitle: "پرامپت برای پست لینکدین | Araaye AI",
    metaDescription: "پرامپت نوشتن پست لینکدین با هوک قوی و CTA — مناسب برند شخصی و B2B.",
  }),

  definePrompt({
    slug: "reels-script",
    title: "پرامپت برای سناریوی ریلز اینستاگرام",
    category: "social",
    tags: ["reels", "instagram", "video"],
    intentPhrase: "پرامپت برای ریلز اینستاگرام",
    shortDescription: "سناریوی ریلز کوتاه با هوک، دیالوگ و متن روی تصویر بنویس.",
    searchIntent: "پرامپت سناریو ریلز",
    targetUser: "کرییتور و ادمین پیج",
    basePrompt: `۳ سناریوی ریلز ۳۰–۴۵ ثانیه‌ای بنویس.

موضوع:
{{TOPIC}}

مخاطب:
{{AUDIENCE}}

برای هر سناریو:
- هوک ۳ ثانیه اول
- شات‌به‌شات
- متن روی تصویر
- جمله پایانی + CTA`,
    gptVersion: `Create 3 Instagram Reels scripts (30-45s) for {{TOPIC}} / {{AUDIENCE}} with hook, shots, on-screen text, CTA.`,
    claudeVersion: `Reels scripts optimized for retention. Topic {{TOPIC}}. Audience {{AUDIENCE}}.`,
    geminiVersion: `۳ سناریوی ریلز برای {{TOPIC}} مخاطب {{AUDIENCE}}.`,
    exampleInput: "۳ نکته سرعت سایت فروشگاهی",
    exampleOutput: "هوک: سایتت کند است چون این یک فایل را فراموش کردی …",
    useCases: ["تولید ریلز آموزشی", "پرومو محصول", "رشد ریچ ارگانیک", "ریپوریس وبینار"],
    commonMistakes: ["هوک دیر", "متن زیاد روی تصویر", "بدون CTA", "سناریوی طولانی‌تر از ۳۰–۴۵ث"],
    relatedPrompts: ["youtube-script", "instagram-caption", "content-calendar"],
    faq: standardFaq("سناریوی ریلز"),
    metaTitle: "پرامپت برای ریلز اینستاگرام | سناریو | Araaye AI",
    metaDescription: "پرامپت سناریوی ریلز با هوک، شات‌به‌شات و CTA — Araaye AI.",
  }),

  definePrompt({
    slug: "youtube-script",
    title: "پرامپت برای اسکریپت یوتیوب",
    category: "social",
    tags: ["youtube", "video"],
    intentPhrase: "پرامپت برای YouTube Script",
    shortDescription: "اسکریپت ویدیوی یوتیوب با عنوان، هوک و بخش‌بندی بنویس.",
    searchIntent: "پرامپت اسکریپت یوتیوب",
    targetUser: "یوتیوبر و تیم محتوا",
    basePrompt: `اسکریپت یوتیوب ۸–۱۲ دقیقه‌ای بنویس.

موضوع:
{{TOPIC}}

سطح مخاطب:
{{LEVEL}}

خروجی:
1) ۵ عنوان پیشنهادی
2) هوک ۳۰ ثانیه
3) بدنه بخش‌بندی‌شده
4) CTA میانی و پایانی
5) ایده thumbnail متن`,
    gptVersion: `Write an 8-12 min YouTube script for {{TOPIC}} at level {{LEVEL}}. Titles, hook, sections, CTAs, thumbnail text.`,
    claudeVersion: `Retention-aware YouTube script. Topic: {{TOPIC}}. Audience level: {{LEVEL}}.`,
    geminiVersion: `اسکریپت یوتیوب برای {{TOPIC}} سطح {{LEVEL}}.`,
    exampleInput: "آموزش شروع با ChatGPT برای کسب‌وکار",
    exampleOutput: "عنوان: چطور با ChatGPT هفته‌ای ۱۰ ساعت صرفه‌جویی کنیم …",
    useCases: ["ویدیوی آموزشی", "ریویو محصول", "لیست‌ویدیو", "ویدیوی سئو محور"],
    commonMistakes: ["بدون هوک", "مقدمه طولانی", "CTA فقط در انتها", "عنوان کلیک‌بیت گمراه‌کننده"],
    relatedPrompts: ["reels-script", "seo-article", "content-calendar"],
    faq: standardFaq("اسکریپت یوتیوب"),
    metaTitle: "پرامپت برای YouTube Script | Araaye AI",
    metaDescription: "پرامپت نوشتن اسکریپت یوتیوب با عنوان، هوک و CTA — Araaye AI.",
  }),

  definePrompt({
    slug: "hashtag-pack",
    title: "پرامپت برای ساخت هشتگ",
    category: "social",
    tags: ["hashtag", "instagram"],
    intentPhrase: "پرامپت برای هشتگ",
    shortDescription: "پک هشتگ لایه‌بندی‌شده برای پست و ریلز پیشنهاد بده.",
    searchIntent: "پرامپت هشتگ اینستاگرام",
    targetUser: "ادمین اینستاگرام",
    basePrompt: `برای پست زیر پک هشتگ بساز.

موضوع پست:
{{TOPIC}}

نیچ:
{{NICHE}}

خروجی:
- ۱۰ هشتگ بزرگ
- ۱۰ هشتگ متوسط
- ۱۰ هشتگ کوچک/نیچ
- ۳ کپشن کوتاه مکمل
هشدار بده اگر هشتگ اسپم/نامرتبط است.`,
    gptVersion: `Build layered hashtag packs for {{TOPIC}} in {{NICHE}}: big/medium/niche + 3 caption ideas.`,
    claudeVersion: `Relevant hashtags only; avoid spammy tags. Topic {{TOPIC}}, niche {{NICHE}}.`,
    geminiVersion: `پک هشتگ برای {{TOPIC}} در نیچ {{NICHE}}.`,
    exampleInput: "آموزش کیک خانگی",
    exampleOutput:
      "#آشپزی #شیرینی‌پزی خانگی #کیکخانگی #دسررژیمی #آموزش‌آشپزی — پک نیچ ۲۰تایی",
    useCases: ["انتشار پست", "آزمایش ریچ", "کمپین محصول", "ریبرندینگ پیج"],
    commonMistakes: ["هشتگ نامرتبط", "فقط هشتگ‌های خیلی بزرگ", "تکرار یک پک برای همه پست‌ها", "هشتگ ممنوع/اسپم"],
    relatedPrompts: ["instagram-caption", "reels-script", "content-calendar"],
    faq: standardFaq("ساخت هشتگ"),
    metaTitle: "پرامپت برای هشتگ اینستاگرام | Araaye AI",
    metaDescription: "پرامپت پک هشتگ لایه‌بندی‌شده برای پست و ریلز — Araaye AI.",
  }),

  // ── Design ───────────────────────────────────────────────────
  definePrompt({
    slug: "ui-audit",
    title: "پرامپت برای UI Audit",
    category: "design",
    tags: ["ui", "audit"],
    intentPhrase: "پرامپت برای UI Audit",
    shortDescription: "رابط کاربری را از نظر سلسله‌مراتب، فاصله و وضوح بررسی کن.",
    searchIntent: "پرامپت UI Audit",
    targetUser: "طراح محصول و فرانت‌اند",
    basePrompt: `یک UI Audit ساخت‌یافته انجام بده.

توضیح صفحه / فلوی فعلی:
{{UI_DESCRIPTION}}

اهداف کاربر:
{{GOALS}}

خروجی:
1) یافته‌ها بر اساس شدت (بالا/متوسط/پایین)
2) مشکلات سلسله‌مراتب بصری و CTA
3) پیشنهاد اصلاح سریع (quick wins)
4) چک‌لیست قبل از انتشار`,
    gptVersion: `UI audit for {{UI_DESCRIPTION}} with goals {{GOALS}}. Severity-ranked findings, CTA issues, quick wins, checklist.`,
    claudeVersion: `Be specific and actionable in the UI audit. {{UI_DESCRIPTION}} / {{GOALS}}.`,
    geminiVersion: `UI Audit برای {{UI_DESCRIPTION}} با اهداف {{GOALS}}.`,
    exampleInput: "صفحه قیمت‌گذاری با ۳ کارت پلن",
    exampleOutput: "شدت بالا: CTA ثانویه پررنگ‌تر از اصلی است …",
    useCases: ["بازبینی قبل از لانچ", "بهبود تبدیل", "هم‌ترازی دیزاین سیستم", "نقد طراحی تیمی"],
    commonMistakes: ["ندادن هدف کاربر", "اسکرین‌شات بدون توضیح فلو", "یافته‌های کلی مثل «زیبا نیست»", "بدون اولویت"],
    relatedPrompts: ["ux-review", "design-system", "landing-copy"],
    faq: standardFaq("UI Audit"),
    metaTitle: "پرامپت برای UI Audit | Araaye AI",
    metaDescription: "پرامپت بررسی رابط کاربری با یافته‌های اولویت‌دار و quick wins — Araaye AI.",
  }),

  definePrompt({
    slug: "ux-review",
    title: "پرامپت برای UX Review",
    category: "design",
    tags: ["ux"],
    intentPhrase: "پرامپت برای UX Review",
    shortDescription: "مسیر کاربر را از نظر اصطکاک، وضوح و تکمیل وظیفه بررسی کن.",
    searchIntent: "پرامپت UX Review",
    targetUser: "طراح UX و مدیر محصول",
    basePrompt: `UX Review مبتنی بر وظیفه انجام بده.

وظیفه کاربر:
{{TASK}}

مراحل فعلی:
{{STEPS}}

خروجی:
1) نقاط اصطکاک
2) فرضیات کاربر که ممکن است غلط باشد
3) نسخه ساده‌شده فلو
4) معیار موفقیت قابل اندازه‌گیری`,
    gptVersion: `UX review for task {{TASK}} with steps {{STEPS}}. Friction, assumptions, simplified flow, success metrics.`,
    claudeVersion: `Task-centered UX critique. Task: {{TASK}}. Steps: {{STEPS}}.`,
    geminiVersion: `بررسی UX برای وظیفه {{TASK}}. مراحل: {{STEPS}}.`,
    exampleInput: "ثبت‌نام و ارسال اولین پیام در چت AI",
    exampleOutput:
      "اصطکاک: انتخاب مدل قبل از دیدن ارزش اولیه باعث رهاسازی فرم ثبت‌نام می‌شود",
    useCases: ["بهبود آنبوردینگ", "کاهش رهاسازی فرم", "بازبینی چک‌اوت", "آماده‌سازی تست کاربر"],
    commonMistakes: ["تمرکز فقط روی ظاهر", "ندادن وظیفه مشخص", "پیشنهاد بدون معیار", "نادیده گرفتن موبایل"],
    relatedPrompts: ["ui-audit", "customer-persona", "cta-generator"],
    faq: standardFaq("UX Review"),
    metaTitle: "پرامپت برای UX Review | Araaye AI",
    metaDescription: "پرامپت بررسی تجربه کاربری مسیر وظیفه با نقاط اصطکاک و فلو ساده‌شده — Araaye AI.",
  }),

  definePrompt({
    slug: "color-palette",
    title: "پرامپت برای پالت رنگ",
    category: "design",
    tags: ["color", "brand"],
    intentPhrase: "پرامپت برای Color Palette",
    shortDescription: "پالت رنگ برند با نقش هر رنگ و نکته کنتراست پیشنهاد بده.",
    searchIntent: "پرامپت پالت رنگ",
    targetUser: "طراح برند و UI",
    basePrompt: `پالت رنگ بساز.

برند / حس مورد نظر:
{{BRAND_FEEL}}

کاربری (وب/اپ/چاپ):
{{USAGE}}

خروجی:
- Primary / Secondary / Accent / Neutral / Semantic (success/warn/error)
- کد Hex
- نکته کنتراست متن روی زمینه
- ۲ ترکیب ممنوع`,
    gptVersion: `Create a color palette for {{BRAND_FEEL}} used in {{USAGE}}. Roles, hex, contrast notes, forbidden combos.`,
    claudeVersion: `Accessible-minded palette. Brand feel: {{BRAND_FEEL}}. Usage: {{USAGE}}.`,
    geminiVersion: `پالت رنگ برای {{BRAND_FEEL}} کاربرد {{USAGE}}.`,
    exampleInput: "برند فین‌تک قابل‌اعتماد و مدرن",
    exampleOutput:
      "Primary #0B1F3A · Accent #1BBF8A · Neutral #F5F7FA · Error #D64545 با کنتراست AA",
    useCases: ["شروع دیزاین سیستم", "ریبرندینگ", "تم دارک/لایت", "هماهنگی مارکتینگ و محصول"],
    commonMistakes: ["فقط رنگ‌های زیبا بدون نقش", "نادیده گرفتن کنتراست", "زیادی accent", "بدون حالت خطا/موفقیت"],
    relatedPrompts: ["design-system", "logo-image", "ui-audit"],
    faq: standardFaq("پالت رنگ"),
    metaTitle: "پرامپت برای Color Palette | پالت رنگ | Araaye AI",
    metaDescription: "پرامپت ساخت پالت رنگ برند با Hex و نکات دسترسی‌پذیری — Araaye AI.",
  }),

  definePrompt({
    slug: "design-system",
    title: "پرامپت برای Design System",
    category: "design",
    tags: ["design-system"],
    intentPhrase: "پرامپت برای Design System",
    shortDescription: "اسکلت دیزاین سیستم شامل تایپ، فاصله، کامپوننت و توکن‌ها را تعریف کن.",
    searchIntent: "پرامپت دیزاین سیستم",
    targetUser: "طراح محصول و فرانت‌اند لید",
    basePrompt: `اسکلت یک Design System سبک برای محصول زیر پیشنهاد بده.

محصول:
{{PRODUCT}}

پلتفرم:
{{PLATFORM}}

خروجی:
1) اصول (۳–۵ اصل)
2) تایپ‌اسکیل
3) فاصله/رادیوس
4) فهرست کامپوننت‌های فاز ۱
5) قواعد دو و نکن`,
    gptVersion: `Outline a lightweight design system for {{PRODUCT}} on {{PLATFORM}}: principles, type, spacing, phase-1 components, rules.`,
    claudeVersion: `Pragmatic design system starter, not an encyclopedia. {{PRODUCT}} / {{PLATFORM}}.`,
    geminiVersion: `دیزاین سیستم سبک برای {{PRODUCT}} روی {{PLATFORM}}.`,
    exampleInput: "داشبورد SaaS B2B",
    exampleOutput: "فاز ۱: Button, Input, Table, Modal, Toast …",
    useCases: ["شروع محصول جدید", "یکدست‌سازی UI پراکنده", "همکاری دیزاین و دولوپ", "آماده‌سازی Storybook"],
    commonMistakes: ["شروع با ۱۰۰ کامپوننت", "بدون اصول", "نادیده گرفتن حالت‌های disabled/error", "توکن‌گذاری بیش از حد زود"],
    relatedPrompts: ["ui-audit", "color-palette", "react-component"],
    faq: standardFaq("Design System"),
    metaTitle: "پرامپت برای Design System | Araaye AI",
    metaDescription: "پرامپت تعریف اسکلت دیزاین سیستم با تایپ، فاصله و کامپوننت‌های فاز ۱ — Araaye AI.",
  }),

  // ── Learning ─────────────────────────────────────────────────
  definePrompt({
    slug: "book-summary",
    title: "پرامپت برای خلاصه کتاب",
    category: "learning",
    tags: ["summary", "book"],
    intentPhrase: "پرامپت برای خلاصه کتاب",
    shortDescription: "خلاصه کاربردی کتاب با نکات اجرایی و نقل‌قول‌های کلیدی بساز.",
    searchIntent: "پرامپت خلاصه کتاب",
    targetUser: "دانشجو و یادگیرنده خودآموز",
    basePrompt: `کتاب زیر را خلاصه کن.

نام کتاب / موضوع:
{{BOOK}}

سطح جزئیات: متوسط

خروجی:
1) خلاصه یک پاراگرافی
2) ۱۰ نکته کلیدی
3) ۳ اقدام قابل اجرا این هفته
4) برای چه کسی این کتاب مفید نیست`,
    gptVersion: `Summarize {{BOOK}}: one paragraph, 10 key points, 3 actions this week, who it's not for.`,
    claudeVersion: `Insightful book summary focused on application. Book: {{BOOK}}.`,
    geminiVersion: `خلاصه کتاب {{BOOK}} با نکات و اقدامات.`,
    exampleInput: "Atomic Habits",
    exampleOutput: "نکته: هویت قبل از نتیجه … اقدام: عادت ۲ دقیقه‌ای …",
    useCases: ["مرور قبل از آزمون", "باشگاه کتاب", "یادداشت دوم مغزی", "تصمیم خرید کتاب"],
    commonMistakes: ["نام کتاب مبهم", "درخواست اسپویل کامل داستان ادبی بدون نیاز", "بدون سطح جزئیات", "خلاصه کلیشه‌ای"],
    relatedPrompts: ["study-plan", "flashcards", "summarize"],
    faq: standardFaq("خلاصه کتاب"),
    metaTitle: "پرامپت برای خلاصه کتاب | Araaye AI",
    metaDescription: "پرامپت خلاصه کتاب با نکات کلیدی و اقدامات هفتگی — Araaye AI.",
  }),

  definePrompt({
    slug: "study-plan",
    title: "پرامپت برای برنامه مطالعه",
    category: "learning",
    tags: ["study"],
    intentPhrase: "پرامپت برای برنامه مطالعه",
    shortDescription: "برنامه مطالعه واقع‌بینانه تا تاریخ آزمون یا هدف یادگیری بساز.",
    searchIntent: "پرامپت برنامه مطالعه",
    targetUser: "دانشجو و داوطلب آزمون",
    basePrompt: `برنامه مطالعه بساز.

هدف:
{{GOAL}}

مهلت:
{{DEADLINE}}

ساعت آزاد روزانه:
{{HOURS}}

خروجی:
- برنامه هفتگی
- اولویت مباحث
- نقاط مرور (spaced repetition)
- نشانه خطر عقب‌افتادن و برنامه جبرانی`,
    gptVersion: `Build a study plan for {{GOAL}} by {{DEADLINE}} with {{HOURS}} hours/day. Weekly plan, priorities, review, catch-up.`,
    claudeVersion: `Realistic study plan. Goal {{GOAL}}, deadline {{DEADLINE}}, hours {{HOURS}}.`,
    geminiVersion: `برنامه مطالعه برای {{GOAL}} تا {{DEADLINE}} با {{HOURS}} ساعت در روز.`,
    exampleInput: "آمادگی آزمون زبان در ۶ هفته، ۲ ساعت در روز",
    exampleOutput: "هفته ۱: واژگان + listening … مرور جمعه …",
    useCases: ["کنکور و آزمون زبان", "یادگیری مهارت شغلی", "پروژه درسی", "بازگشت به مطالعه بعد از وقفه"],
    commonMistakes: ["ساعت غیرواقعی", "بدون بافر", "فقط خواندن بدون تمرین", "نادیده گرفتن مرور"],
    relatedPrompts: ["flashcards", "book-summary", "weekly-plan"],
    faq: standardFaq("برنامه مطالعه"),
    metaTitle: "پرامپت برای برنامه مطالعه | Araaye AI",
    metaDescription: "پرامپت برنامه مطالعه تا مهلت آزمون با مرور فاصله‌دار — Araaye AI.",
  }),

  definePrompt({
    slug: "flashcards",
    title: "پرامپت برای ساخت فلش‌کارت",
    category: "learning",
    tags: ["flashcards"],
    intentPhrase: "پرامپت برای فلش‌کارت",
    shortDescription: "فلش‌کارت پرسش/پاسخ برای حفظ و مرور فعال تولید کن.",
    searchIntent: "پرامپت فلش‌کارت",
    targetUser: "دانشجو و زبان‌آموز",
    basePrompt: `۲۰ فلش‌کارت از مطلب زیر بساز.

مطلب / جزوه:
{{MATERIAL}}

قالب هر کارت: سؤال کوتاه | پاسخ دقیق | یک مثال

سطح دشواری را مخلوط کن (آسان/متوسط/سخت).`,
    gptVersion: `Create 20 Q/A flashcards from {{MATERIAL}} with an example each. Mix difficulty.`,
    claudeVersion: `Active-recall flashcards, not trivia fluff. Material: {{MATERIAL}}.`,
    geminiVersion: `۲۰ فلش‌کارت از {{MATERIAL}}.`,
    exampleInput: "مفاهیم HTTP status codes",
    exampleOutput:
      "Q: تفاوت ۴۰۱ و ۴۰۳ چیست؟ A: ۴۰۱ احراز هویت نشده؛ ۴۰۳ مجاز نیست. مثال: توکن نامعتبر",
    useCases: ["آمادگی امتحان", "یادگیری زبان", "آنبوردینگ دانش فنی", "مرور سریع قبل از مصاحبه"],
    commonMistakes: ["متن منبع خیلی مبهم", "کارت‌های بیش از حد طولانی", "فقط تعریف بدون مثال", "یک سطح دشواری"],
    relatedPrompts: ["study-plan", "book-summary", "interview-prep"],
    faq: standardFaq("ساخت فلش‌کارت"),
    metaTitle: "پرامپت برای ساخت فلش‌کارت | Araaye AI",
    metaDescription: "پرامپت تولید فلش‌کارت پرسش و پاسخ برای مرور فعال — Araaye AI.",
  }),

  // ── Language ─────────────────────────────────────────────────
  definePrompt({
    slug: "tone-shift",
    title: "پرامپت برای تغییر لحن متن",
    category: "language",
    tags: ["tone"],
    intentPhrase: "پرامپت برای تغییر لحن",
    shortDescription: "همان متن را با لحن‌های مختلف (رسمی، دوستانه، فروش) بازنویسی کن.",
    searchIntent: "پرامپت تغییر لحن متن",
    targetUser: "نویسنده محتوا و پشتیبانی مشتری",
    basePrompt: `متن زیر را در ۳ لحن بازنویسی کن: رسمی، دوستانه، متقاعدکننده.

متن:
{{TEXT}}

معنی را حفظ کن. برای هر نسخه یک جمله توضیح بده کجا مناسب است.`,
    gptVersion: `Rewrite {{TEXT}} in formal, friendly, and persuasive tones. Keep meaning. Note best use for each.`,
    claudeVersion: `Tone transfer without changing facts. Text: {{TEXT}}.`,
    geminiVersion: `تغییر لحن متن به رسمی/دوستانه/متقاعدکننده:\n{{TEXT}}`,
    exampleInput: "فردا جلسه را به ساعت ۵ منتقل کردیم.",
    exampleOutput: "رسمی: به استحضار می‌رساند … دوستانه: پس فردا ۵ …",
    useCases: ["ایمیل به مشتری در مقابل تیم", "کپشن در مقابل لندینگ", "پیام پشتیبانی", "لوکالیزه کردن لحن برند"],
    commonMistakes: ["لحن هدف را نگفتن", "تغییر معنی هنگام بازنویسی", "اغراق فروش", "مخلوط چند لحن"],
    relatedPrompts: ["persian-edit", "translation", "rewrite"],
    faq: standardFaq("تغییر لحن"),
    metaTitle: "پرامپت برای تغییر لحن متن | Araaye AI",
    metaDescription: "پرامپت بازنویسی متن با لحن رسمی، دوستانه و متقاعدکننده — Araaye AI.",
  }),

  definePrompt({
    slug: "localization-fa",
    title: "پرامپت برای بومی‌سازی فارسی",
    category: "language",
    tags: ["localization", "persian"],
    intentPhrase: "پرامپت برای بومی‌سازی",
    shortDescription: "متن محصول را برای کاربر ایرانی بومی‌سازی کن؛ نه ترجمه لفظی.",
    searchIntent: "پرامپت بومی‌سازی فارسی",
    targetUser: "محصول، مارکتینگ و مترجم",
    basePrompt: `متن زیر را برای مخاطب ایرانی بومی‌سازی کن (localization نه word-for-word).

متن مبدأ:
{{SOURCE}}

زمینه محصول:
{{PRODUCT_CONTEXT}}

خروجی:
1) نسخه فارسی بومی‌شده
2) اصطلاحاتی که عوض شدند و چرا
3) هشدارهای فرهنگی/قانونی اگر مرتبط است`,
    gptVersion: `Localize to Iranian Persian (not literal). Source: {{SOURCE}}. Product context: {{PRODUCT_CONTEXT}}. Explain term changes.`,
    claudeVersion: `Iran-aware localization. Preserve intent and UX clarity. {{SOURCE}} / {{PRODUCT_CONTEXT}}.`,
    geminiVersion: `بومی‌سازی فارسی برای:\n{{SOURCE}}\nزمینه: {{PRODUCT_CONTEXT}}`,
    exampleInput: "Start your free trial — no credit card required",
    exampleOutput: "همین حالا رایگان شروع کن — نیازی به کارت بانکی نیست",
    useCases: ["UI محصول", "ایمیل onboard", "کمپین تبلیغاتی بین‌المللی", "مستندات کمک"],
    commonMistakes: ["ترجمه لفظی", "اصطلاحات انگلیسی بی‌دلیل", "نادیده گرفتن واحد پول/تاریخ", "لحن غیرطبیعی"],
    relatedPrompts: ["translation", "tone-shift", "persian-edit"],
    faq: standardFaq("بومی‌سازی فارسی"),
    metaTitle: "پرامپت برای بومی‌سازی فارسی | Araaye AI",
    metaDescription: "پرامپت localization متن محصول برای مخاطب ایرانی — نه ترجمه لفظی.",
  }),

  // ── Data ─────────────────────────────────────────────────────
  definePrompt({
    slug: "excel-analysis",
    title: "پرامپت برای تحلیل Excel",
    category: "data",
    tags: ["excel"],
    intentPhrase: "پرامپت برای تحلیل Excel",
    shortDescription: "از توضیح ستون‌ها، تحلیل، Pivot و بینش‌های اکسل بساز.",
    searchIntent: "پرامپت تحلیل اکسل",
    targetUser: "تحلیل‌گر، عملیات و فایننس",
    basePrompt: `داده اکسل زیر را تحلیل کن.

توضیح ستون‌ها / نمونه ردیف‌ها:
{{DATA}}

سؤال کسب‌وکار:
{{QUESTION}}

خروجی:
1) پاک‌سازی لازم
2) فرمول‌ها یا مراحل Pivot
3) بینش‌های کلیدی
4) نمودارهای پیشنهادی
5) گام بعدی تصمیم`,
    gptVersion: `Analyze spreadsheet data {{DATA}} for question {{QUESTION}}. Cleaning, pivot/formulas, insights, charts, next step.`,
    claudeVersion: `Practical Excel analysis. Data: {{DATA}}. Question: {{QUESTION}}.`,
    geminiVersion: `تحلیل اکسل برای سؤال {{QUESTION}} با داده:\n{{DATA}}`,
    exampleInput: "فروش ماهانه به تفکیک شهر",
    exampleOutput: "بینش: ۸۰٪ رشد از ۳ شهر … Pivot: شهر × ماه …",
    useCases: ["گزارش هفتگی فروش", "پیدا کردن ناهنجاری", "آماده‌سازی برای مدیریت", "اتوماسیون گزارش"],
    commonMistakes: ["ندادن معنای ستون‌ها", "سؤال مبهم", "داده نمونه ناکافی", "درخواست کد بدون مشخص کردن ابزار"],
    relatedPrompts: ["csv-extract", "report-from-data", "python-script"],
    faq: standardFaq("تحلیل Excel"),
    metaTitle: "پرامپت برای تحلیل Excel | Araaye AI",
    metaDescription: "پرامپت تحلیل داده اکسل با Pivot، بینش و پیشنهاد نمودار — Araaye AI.",
  }),

  definePrompt({
    slug: "csv-extract",
    title: "پرامپت برای استخراج داده از CSV",
    category: "data",
    tags: ["csv"],
    intentPhrase: "پرامپت برای استخراج داده",
    shortDescription: "قواعد استخراج، فیلتر و خلاصه‌سازی از CSV را مشخص و اجرا کن.",
    searchIntent: "پرامپت استخراج داده CSV",
    targetUser: "دیتا و عملیات",
    basePrompt: `از CSV زیر استخراج انجام بده.

نمونه/اسکیما CSV:
{{CSV}}

نیاز استخراج:
{{NEED}}

خروجی:
1) ستون‌های نهایی
2) قواعد فیلتر/تبدیل
3) نتیجه خلاصه یا جدول نمونه
4) اگر بهتر است با پایتون/اسکوئل باشد، قطعه کد کوتاه`,
    gptVersion: `Extract from CSV schema {{CSV}} per need {{NEED}}. Final columns, rules, sample result, optional code.`,
    claudeVersion: `Precise extraction rules first, then result. {{CSV}} / {{NEED}}.`,
    geminiVersion: `استخراج از CSV برای {{NEED}}.\n{{CSV}}`,
    exampleInput: "فیلتر سفارش‌های بالای ۲ میلیون و شهر تهران",
    exampleOutput: "ستون‌ها: order_id, amount, city … فیلتر amount>2e6 AND city=Tehran",
    useCases: ["آماده‌سازی ایمپورت", "گزارش موردی", "پاک‌سازی لیست مشتری", "تحویل به تیم دیگر"],
    commonMistakes: ["ندادن هدر ستون‌ها", "encoding فارسی نامشخص", "نیاز مبهم", "انتظار پردازش فایل باینری خام در چت"],
    relatedPrompts: ["excel-analysis", "python-script", "report-from-data"],
    faq: standardFaq("استخراج داده CSV"),
    metaTitle: "پرامپت برای استخراج داده CSV | Araaye AI",
    metaDescription: "پرامپت استخراج و فیلتر داده از CSV با قواعد و نمونه خروجی — Araaye AI.",
  }),

  definePrompt({
    slug: "report-from-data",
    title: "پرامپت برای گزارش از داده",
    category: "data",
    tags: ["report"],
    intentPhrase: "پرامپت برای گزارش‌نویسی از داده",
    shortDescription: "از اعداد و یافته‌ها یک گزارش مدیریتی کوتاه بنویس.",
    searchIntent: "پرامپت گزارش تحلیلی",
    targetUser: "مدیر عملیات، فایننس و رشد",
    basePrompt: `از داده‌ها/یافته‌های زیر گزارش مدیریتی بنویس.

یافته‌ها:
{{FINDINGS}}

مخاطب گزارش:
{{AUDIENCE}}

خروجی:
1) خلاصه اجرایی (۵ خط)
2) جزئیات با بولت
3) ریسک‌ها
4) ۳ پیشنهاد اقدام با اولویت`,
    gptVersion: `Write an exec report from {{FINDINGS}} for {{AUDIENCE}}: summary, details, risks, 3 prioritized actions.`,
    claudeVersion: `Decision-ready reporting. Findings: {{FINDINGS}}. Audience: {{AUDIENCE}}.`,
    geminiVersion: `گزارش مدیریتی از {{FINDINGS}} برای {{AUDIENCE}}.`,
    exampleInput: "نرخ ریزش ماهانه از ۴٪ به ۶٪ رسیده",
    exampleOutput: "خلاصه: ریزش در پلن رایگان متمرکز است … اقدام: بهبود فعال‌سازی روز۱ …",
    useCases: ["گزارش هفتگی به مدیر", "پست‌مورتم متریک", "آماده‌سازی بورد", "هم‌ترازی تیم‌ها"],
    commonMistakes: ["اعداد بدون زمینه", "گزارش طولانی بدون خلاصه", "پیشنهاد مبهم", "مخاطب نامشخص"],
    relatedPrompts: ["excel-analysis", "okr", "swot"],
    faq: standardFaq("گزارش از داده"),
    metaTitle: "پرامپت برای گزارش تحلیلی از داده | Araaye AI",
    metaDescription: "پرامپت نوشتن گزارش مدیریتی از یافته‌های داده‌ای با اقدامات اولویت‌دار — Araaye AI.",
  }),

  // ── Productivity ─────────────────────────────────────────────
  definePrompt({
    slug: "daily-plan",
    title: "پرامپت برای برنامه روزانه",
    category: "productivity",
    tags: ["daily", "planning"],
    intentPhrase: "پرامپت برای برنامه روزانه",
    shortDescription: "برنامه روزانه واقع‌بینانه بر اساس اولویت‌ها و انرژی بساز.",
    searchIntent: "پرامپت برنامه روزانه",
    targetUser: "فریلنسر، دانشجو و مدیر",
    basePrompt: `برنامه امروز را بساز.

کارها:
{{TASKS}}

زمان در دسترس:
{{TIME}}

سطح انرژی (بالا/متوسط/پایین):
{{ENERGY}}

خروجی: بلوک‌های زمانی، ۳ اولویت Must، کارهایی که باید حذف/تعویق شوند، یک عادت کوچک.`,
    gptVersion: `Make a daily plan from tasks {{TASKS}}, time {{TIME}}, energy {{ENERGY}}. Time blocks, top 3, defer list, tiny habit.`,
    claudeVersion: `Realistic daily plan. Tasks: {{TASKS}}. Time: {{TIME}}. Energy: {{ENERGY}}.`,
    geminiVersion: `برنامه روزانه برای {{TASKS}} در زمان {{TIME}} با انرژی {{ENERGY}}.`,
    exampleInput: "نوشتن گزارش، ۲ میتینگ، ورزش، ایمیل‌ها",
    exampleOutput:
      "۹–۱۱ نوشتن گزارش (Must) · ۱۱–۱۲ میتینگ · ۱۴–۱۵ ایمیل‌ها · عصر: ورزش ۳۰ دقیقه",
    useCases: ["شروع روز کاری", "روزهای پرمیتینگ", "بازیابی بعد از بی‌نظمی", "تمرکز عمیق"],
    commonMistakes: ["لیست بیش از حد بلند", "ندادن زمان واقعی", "اولویت‌بندی نکردن", "بدون بافر"],
    relatedPrompts: ["weekly-plan", "decision-framework", "idea-generation"],
    faq: standardFaq("برنامه روزانه"),
    metaTitle: "پرامپت برای برنامه روزانه | Araaye AI",
    metaDescription: "پرامپت برنامه‌ریزی روزانه با اولویت Must و بلوک زمانی — Araaye AI.",
  }),

  definePrompt({
    slug: "weekly-plan",
    title: "پرامپت برای برنامه هفتگی",
    category: "productivity",
    tags: ["weekly", "planning"],
    intentPhrase: "پرامپت برای برنامه هفتگی",
    shortDescription: "برنامه هفتگی بر اساس اهداف و ظرفیت واقعی بچین.",
    searchIntent: "پرامپت برنامه هفتگی",
    targetUser: "مدیر، فریلنسر و دانشجو",
    basePrompt: `برنامه هفته را بساز.

اهداف هفته:
{{GOALS}}

تعهدات ثابت:
{{FIXED}}

خروجی:
- تم هر روز
- ۳ نتیجه کلیدی هفته
- بلوک‌های Deep Work
- مرور جمعه (سؤالات بازبینی)`,
    gptVersion: `Weekly plan for goals {{GOALS}} with fixed commitments {{FIXED}}. Daily themes, key results, deep work, Friday review.`,
    claudeVersion: `Capacity-aware weekly plan. Goals: {{GOALS}}. Fixed: {{FIXED}}.`,
    geminiVersion: `برنامه هفتگی برای {{GOALS}} با تعهدات {{FIXED}}.`,
    exampleInput: "ارسال نسخه محصول + ۲ محتوای لینکدین",
    exampleOutput: "دوشنبه: ساخت … چهارشنبه: نوشتن … جمعه: بازبینی …",
    useCases: ["برنامه‌ریزی اسپرینت شخصی", "تعادل کار/زندگی", "هفته امتحان", "هفته لانچ"],
    commonMistakes: ["اهداف بیش از ظرفیت", "نادیده گرفتن تعهدات ثابت", "بدون Deep Work", "بدون بازبینی"],
    relatedPrompts: ["daily-plan", "okr", "study-plan"],
    faq: standardFaq("برنامه هفتگی"),
    metaTitle: "پرامپت برای برنامه هفتگی | Araaye AI",
    metaDescription: "پرامپت برنامه‌ریزی هفتگی با تم روزانه و Deep Work — Araaye AI.",
  }),

  definePrompt({
    slug: "decision-framework",
    title: "پرامپت برای تصمیم‌گیری",
    category: "productivity",
    tags: ["decision"],
    intentPhrase: "پرامپت برای تصمیم‌گیری",
    shortDescription: "گزینه‌ها را با معیار، ریسک و توصیه شفاف مقایسه کن.",
    searchIntent: "پرامپت تصمیم‌گیری",
    targetUser: "فاوندر، مدیر و هر فردی با دوراهی مهم",
    basePrompt: `برای تصمیم زیر چارچوب تصمیم‌گیری اعمال کن.

تصمیم:
{{DECISION}}

گزینه‌ها:
{{OPTIONS}}

معیارها (اگر هست):
{{CRITERIA}}

خروجی:
1) جدول مقایسه
2) ریسک هر گزینه
3) فرضیات حیاتی
4) توصیه + آزمایش کوچک برای کاهش ریسک`,
    gptVersion: `Decision framework for {{DECISION}} among {{OPTIONS}} using {{CRITERIA}}. Comparison, risks, assumptions, recommendation + small test.`,
    claudeVersion: `Help choose under uncertainty. Decision: {{DECISION}}. Options: {{OPTIONS}}. Criteria: {{CRITERIA}}.`,
    geminiVersion: `تصمیم‌گیری برای {{DECISION}} بین {{OPTIONS}}. معیار: {{CRITERIA}}.`,
    exampleInput: "استخدام فریلنسر یا نیروی تمام‌وقت برای محتوا",
    exampleOutput: "توصیه: فریلنسر ۸ هفته با KPI مشخص، سپس تصمیم استخدام …",
    useCases: ["انتخاب ابزار", "استخدام", "اولویت فیچر", "تصمیم مالی شخصی"],
    commonMistakes: ["گزینه‌های ناقص", "معیارهای مبهم", "تصمیم احساسی بدون آزمایش", "نادیده گرفتن هزینه فرصت"],
    relatedPrompts: ["swot", "daily-plan", "idea-generation"],
    faq: standardFaq("تصمیم‌گیری"),
    metaTitle: "پرامپت برای تصمیم‌گیری بهتر | Araaye AI",
    metaDescription: "پرامپت چارچوب تصمیم‌گیری با مقایسه گزینه‌ها، ریسک و آزمایش کوچک — Araaye AI.",
  }),
];

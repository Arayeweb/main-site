export type DemoPipelineStep = {
  model: "GPT" | "Claude" | "Gemini";
  role: string;
  snippet: string;
};

export type DemoScenario = {
  id: string;
  label: string;
  icon: string;
  prompt: string;
  singleModelLabel: string;
  singleModelAnswer: string;
  pipeline: DemoPipelineStep[];
  finalAnswer: string;
};

export const BETTER_THAN_ONE_AI_SCENARIOS: DemoScenario[] = [
  {
    id: "clinic-ad",
    label: "تبلیغ کلینیک",
    icon: "✨",
    prompt: "برای کلینیک پوست یک متن تبلیغاتی بنویس.",
    singleModelLabel: "ChatGPT",
    singleModelAnswer:
      "کلینیک پوست ما خدمات تخصصی ارائه می‌دهد. با تیم حرفه‌ای ما تماس بگیرید و از تخفیف ویژه بهره‌مند شوید.",
    pipeline: [
      {
        model: "GPT",
        role: "ایده اولیه",
        snippet: "تمرکز روی تخصص تیم و خدمات درمانی پوست",
      },
      {
        model: "Claude",
        role: "روان‌تر کردن متن",
        snippet: "لحن گرم‌تر، جمله‌های کوتاه‌تر، حس اعتماد بیشتر",
      },
      {
        model: "Gemini",
        role: "CTA قوی‌تر",
        snippet: "«مشاوره رایگان ۱۵ دقیقه‌ای — همین امروز رزرو کن»",
      },
    ],
    finalAnswer:
      "پوست سالم، اعتماد به نفس بیشتر.\n\nدر کلینیک ما، قبل از هر درمان یک مشاوره اختصاصی می‌گیری — بدون عجله، بدون فشار.\n\n✅ تیم متخصص پوست\n✅ تجهیزات به‌روز\n✅ پیگیری بعد از درمان\n\nمشاوره رایگان ۱۵ دقیقه‌ای — همین امروز رزرو کن.",
  },
  {
    id: "sales-email",
    label: "ایمیل فروش",
    icon: "📧",
    prompt: "یک ایمیل فروش برای معرفی دوره آنلاین برنامه‌نویسی بنویس.",
    singleModelLabel: "ChatGPT",
    singleModelAnswer:
      "سلام،\n\nدوره برنامه‌نویسی ما برای یادگیری مفاهیم پایه طراحی شده است. برای ثبت‌نام با ما تماس بگیرید.\n\nبا تشکر",
    pipeline: [
      {
        model: "GPT",
        role: "ساختار ایمیل",
        snippet: "موضوع، معرفی دوره، مزایا، دعوت به اقدام",
      },
      {
        model: "Claude",
        role: "لحن انسانی‌تر",
        snippet: "شروع با درد مخاطب: «هنوز نمی‌دانی از کجا شروع کنی؟»",
      },
      {
        model: "Gemini",
        role: "CTA و فوریت",
        snippet: "«فقط ۲۰ نفر — ثبت‌نام تا جمعه»",
      },
    ],
    finalAnswer:
      "موضوع: اگر هنوز نمی‌دانی از کجا شروع کنی، این ایمیل برای توست\n\nسلام [نام]،\n\nبیشتر کسانی که می‌خواهند برنامه‌نویس شوند، گیر می‌کنند — نه به‌خاطر کمبود استعداد، به‌خاطر نداشتن مسیر مشخص.\n\nدر ۸ هفته، از صفر تا ساخت اولین پروژه واقعی:\n• ۴ پروژه عملی در رزومه\n• منتورینگ هفتگی\n• گواهی پایان دوره\n\nفقط ۲۰ نفر — ثبت‌نام تا جمعه.\n\n[ثبت‌نام رایگان مشاوره]",
  },
  {
    id: "instagram-caption",
    label: "کپشن اینستاگرام",
    icon: "📱",
    prompt: "یک کپشن اینستاگرام برای معرفی محصول لوازم آرایشی بنویس.",
    singleModelLabel: "ChatGPT",
    singleModelAnswer:
      "محصول جدید ما با کیفیت عالی عرضه شده. برای خرید به دایرکت پیام دهید.\n\n#آرایش #زیبایی #محصول_جدید",
    pipeline: [
      {
        model: "GPT",
        role: "ایده محتوا",
        snippet: "معرفی محصول + مزیت اصلی (ماندگاری ۱۲ ساعته)",
      },
      {
        model: "Claude",
        role: "قلاب جذاب",
        snippet: "«صبح درب خانه زدی، شب هنوز مثل صبح می‌درخشی»",
      },
      {
        model: "Gemini",
        role: "CTA اینستاگرامی",
        snippet: "«کد INSTA20 — لینک در بیو»",
      },
    ],
    finalAnswer:
      "صبح درب خانه زدی، شب هنوز مثل صبح می‌درخشی ✨\n\nرژ لب مات جدید ما ۱۲ ساعت ماندگاری داره — بدون خشکی، بدون ترک.\n\nمناسب پوست حساس · ۸ رنگ ترند · ارسال فوری\n\nکد INSTA20 برای ۲۰٪ تخفیف — لینک در بیو 👇",
  },
  {
    id: "pdf-summary",
    label: "خلاصه PDF",
    icon: "📄",
    prompt: "گزارش ۲۴ صفحه‌ای فروش فصل اول را خلاصه کن.",
    singleModelLabel: "ChatGPT",
    singleModelAnswer:
      "گزارش فروش فصل اول شامل اطلاعات مربوط به درآمد، هزینه‌ها و عملکرد تیم فروش است. فروش نسبت به فصل قبل تغییراتی داشته و برخی محصولات عملکرد بهتری نشان داده‌اند.",
    pipeline: [
      {
        model: "GPT",
        role: "استخراج داده",
        snippet: "درآمد ۴.۲ میلیارد، رشد ۱۸٪، ۳ محصول برتر",
      },
      {
        model: "Claude",
        role: "ساختاردهی",
        snippet: "بخش‌بندی: خلاصه · اعداد کلیدی · ریسک‌ها · اقدام بعدی",
      },
      {
        model: "Gemini",
        role: "بینش اجرایی",
        snippet: "«تمرکز Q2 روی محصول C — پتانسیل ۳۰٪ رشد»",
      },
    ],
    finalAnswer:
      "خلاصه اجرایی — فروش Q1\n\n📊 اعداد کلیدی\n• درآمد: ۴.۲ میلیارد تومان (+۱۸٪)\n• حاشیه سود: ۳۲٪\n• بهترین محصول: سری C (۴۱٪ سهم)\n\n⚠️ ریسک\n• افت فروش در منطقه شمال (−۱۲٪)\n• تأخیر ۳ هفته‌ای تأمین محصول B\n\n✅ اقدام Q2\nتمرکز بازاریابی روی محصول C — پتانسیل ۳۰٪ رشد",
  },
];

export const BETTER_THAN_ONE_AI_AD_COPY = {
  headline: "هنوز فقط از ChatGPT استفاده می‌کنی؟",
  body: [
    "بعضی سؤال‌ها با GPT بهتر جواب می‌گیرند.",
    "بعضی با Claude.",
    "بعضی با Gemini.",
    "Araaye AI لازم نیست حدس بزند؛ چند مدل را کنار هم قرار می‌دهد تا خروجی بهتری بسازی.",
  ],
  cta: "رایگان امتحان کن",
};

export const BETTER_THAN_ONE_AI_HERO = {
  line1: "یک AI جواب می‌دهد.",
  line2: "Araaye AI بهترین جواب را پیدا می‌کند.",
};

export const BETTER_THAN_ONE_AI_CTA_HREF =
  "/ai?utm_source=landing&utm_medium=campaign&utm_campaign=better-than-one-ai";

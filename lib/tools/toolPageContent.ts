import {
  getHubLabel,
  getHubPath,
  getPublishedToolPages,
  getToolPage,
  type ToolHub,
  type ToolRegistryEntry,
} from "./toolRegistry";
import {
  getGooglesabtContentOverride,
  type GooglesabtMistakes,
  type GooglesabtExample,
  type GooglesabtVideo,
} from "@/lib/googlesabt/contentOverrides";

export type ToolFaq = { q: string; a: string };

export type ToolProgrammaticPage = {
  hub: ToolHub;
  slug: string;
  pageType: ToolRegistryEntry["pageType"];
  primaryKeyword: string;
  secondaryKeywords: readonly string[];
  label: string;
  hero: { h1: string; lead: string };
  problem: { title: string; body: string; bullets: string[] };
  steps: { title: string; items: string[] };
  benefits: { title: string; desc: string }[];
  bodyParagraphs: string[];
  toolCta: { label: string; href: string; prefillText?: string };
  faqs: ToolFaq[];
  related: { href: string; label: string; keyword: string }[];
  crossToolLinks: { href: string; anchor: string }[];
  industryLinks: { href: string; label: string }[];
  meta: { title: string; description: string; canonicalPath: string };
  mistakes?: GooglesabtMistakes;
  example?: GooglesabtExample;
  video?: GooglesabtVideo;
};

const HUB_CTA: Record<ToolHub, { label: string; path: string }> = {
  bizcard: { label: "همین حالا کارت بساز", path: "/bizcard#builder" },
  qr: { label: "ساخت QR رایگان", path: "/qr#tool" },
  shortener: { label: "لینک را کوتاه کن", path: "/shortener#tool" },
  googlesabt: { label: "مشاهده پکیج‌ها و قیمت", path: "/googlesabt#packages" },
  "review-link": { label: "ساخت لینک نظر و QR", path: "/review-link#tool" },
  "local-seo-check": { label: "شروع تست سئو محلی", path: "/local-seo-check#tool" },
  "seo-roi-calculator": { label: "محاسبه ROI سئو", path: "/seo-roi-calculator#tool" },
};

function problemFor(entry: ToolRegistryEntry): ToolProgrammaticPage["problem"] {
  if (entry.hub === "review-link") {
    return {
      title: `چرا ${entry.label} به لینک مستقیم نظر گوگل نیاز دارد؟`,
      body: `وقتی مسیر ثبت نظر طولانی یا مبهم باشد، بیشتر مشتریان ${entry.label} کار را نیمه‌کاره رها می‌کنند. لینک مستقیم و QR اصطکاک را کم می‌کند و گرفتن بازخورد واقعی را ساده‌تر می‌سازد.`,
      bullets: [
        "باز شدن مستقیم فرم ثبت نظر گوگل",
        "QR آماده چاپ روی میز، رسید یا کارت",
        "متن مودبانه و صنف‌محور برای درخواست نظر",
        "بدون ثبت‌نام و بدون ذخیره لینک",
      ],
    };
  }
  if (entry.hub === "local-seo-check") {
    return {
      title: `آیا ${entry.label} برای جست‌وجوی محلی آماده است؟`,
      body: `دیده‌شدن محلی فقط به ثبت یک نقطه روی نقشه وابسته نیست. این تست، وضعیت پروفایل، اطلاعات تماس، نظرها، سایت، محتوای محلی و اندازه‌گیری را در چند دقیقه ارزیابی می‌کند.`,
      bullets: [
        "امتیاز شفاف از ۱۰۰",
        "سه اقدام فوری بدون نیاز به اطلاعات تماس",
        "چک‌لیست متناسب با صنف",
        "گزارش کامل و قابل اجرا",
      ],
    };
  }
  if (entry.hub === "seo-roi-calculator") {
    return {
      title: `آیا سرمایه‌گذاری روی سئو برای ${entry.label} توجیه دارد؟`,
      body: `با حدس درباره سئو تصمیم نگیرید. ارزش هر مشتری، نرخ تبدیل، حاشیه سود و هزینه واقعی را وارد کنید تا نقطه سربه‌سر و سه سناریوی بازگشت سرمایه را ببینید.`,
      bullets: [
        "محاسبه سود خالص و ROI",
        "نمایش تعداد لید لازم برای سربه‌سر",
        "سه سناریوی محافظه‌کارانه تا خوش‌بینانه",
        "فرمول شفاف و بدون وعده تضمینی",
      ],
    };
  }
  if (entry.hub === "googlesabt") {
    if (entry.pageType === "guide" || entry.pageType === "comparison" || entry.pageType === "intent") {
      return {
        title: entry.primaryKeyword,
        body: `این راهنما به شما کمک می‌کند ${entry.primaryKeyword} را بهتر بفهمید و تصمیم درست بگیرید. اطلاعات کاربردی برای صاحبان کسب‌وکار ایرانی.`,
        bullets: [
          "پاسخ به سوالات رایج",
          "نکات عملی و کاربردی",
          "اشتباهات رایج و راه‌حل‌ها",
          "لینک به منابع مرتبط",
        ],
      };
    }
    return {
      title: `چرا ${entry.label} باید در گوگل مپ ثبت شود؟`,
      body: `مشتریان نزدیک وقتی «${entry.label} نزدیک من» را جست‌وجو می‌کنند، اول نتایج نقشه را می‌بینند. ${entry.primaryKeyword} باعث می‌شود نام، آدرس، ساعت کاری و تماس شما در گوگل، نشان و بلد دیده شود — نه فقط در اینستاگرام.`,
      bullets: [
        "دیده شدن در جستجوی محلی و «نزدیک من»",
        "مسیریابی مستقیم از گوگل، نشان و بلد",
        "اطلاعات تماس و ساعت کاری درست",
        "امکان هدیه کارت هوشمند کسب‌وکار از پکیج حرفه‌ای",
      ],
    };
  }
  if (entry.hub === "bizcard") {
    return {
      title: `چرا ${entry.label} به کارت ویزیت دیجیتال نیاز دارد؟`,
      body: `مشتریان ${entry.label} معمولاً شماره، آدرس، اینستاگرام و نقشه را از چند جای مختلف می‌پرسند. ${entry.primaryKeyword} همه این مسیرها را در یک لینک جمع می‌کند تا تماس، مسیریابی و شبکه‌ها یک‌جا در دسترس باشد.`,
      bullets: [
        "شماره و تماس با یک لمس",
        "نقشه و مسیریابی بدون توضیح شفاهی",
        "لینک شبکه‌های اجتماعی و سایت",
        "QR قابل پرینت برای درب و کارت کاغذی",
      ],
    };
  }
  if (entry.hub === "qr") {
    if (entry.pageType === "guide" || entry.pageType === "comparison") {
      return {
        title: entry.primaryKeyword,
        body: `در این راهنما یاد می‌گیرید ${entry.primaryKeyword} را به‌درستی انجام دهید تا QR شما خوانا، قابل چاپ و مناسب کسب‌وکار ایرانی باشد.`,
        bullets: [
          "نکات عملی برای استفاده روزمره",
          "اشتباهات رایج در ساخت و چاپ",
          "نمونه کاربرد برای کسب‌وکارها",
          "لینک مستقیم به ابزار رایگان آرایه",
        ],
      };
    }
    return {
      title: `چه زمانی به ${entry.primaryKeyword} نیاز دارید؟`,
      body: `وقتی می‌خواهید مخاطب بدون تایپ کردن لینک، مستقیم به ${entry.label} برسد، ${entry.primaryKeyword} بهترین گزینه است. با ابزار رایگان آرایه در چند ثانیه QR آماده دانلود می‌سازید.`,
      bullets: [
        "اسکن سریع با دوربین موبایل",
        "مناسب چاپ، استوری و کارت",
        "بدون ثبت‌نام و هزینه",
        "رنگ‌بندی قابل تنظیم برای برند",
      ],
    };
  }
  // shortener
  if (entry.pageType === "guide" || entry.pageType === "comparison") {
    return {
      title: entry.primaryKeyword,
      body: `این صفحه توضیح می‌دهد ${entry.primaryKeyword} چه کمکی به دیده شدن و اشتراک‌گذاری لینک‌ها می‌کند و چطور از کوتاه‌کننده آرایه استفاده کنید.`,
      bullets: [
        "مزایای لینک کوتاه در کانال‌های مختلف",
        "نکات انتخاب آدرس دلخواه",
        "اشتباهات رایج در اشتراک‌گذاری",
        "شروع رایگان با ابزار آرایه",
      ],
    };
  }
  return {
    title: `چرا لینک کوتاه برای ${entry.label} مهم است؟`,
    body: `لینک‌های بلند در ${entry.label} بدقواره و سخت‌کپی هستند. ${entry.primaryKeyword} لینک را کوتاه، تمیز و قابل اعتماد می‌کند — با امکان آدرس دلخواه و QR خودکار.`,
    bullets: [
      "ظاهر حرفه‌ای در پیام و بیو",
      "کپی و اشتراک آسان‌تر",
      "امکان slug برندشده",
      "QR خودکار برای هر لینک کوتاه",
    ],
  };
}

function stepsFor(entry: ToolRegistryEntry): ToolProgrammaticPage["steps"] {
  if (entry.hub === "review-link") {
    return {
      title: `ساخت لینک نظر گوگل ${entry.label} در ۳ قدم`,
      items: [
        "لینک Ask for reviews پروفایل گوگل یا Place ID را وارد کنید.",
        "لینک مستقیم، QR و متن پیشنهادی را همان لحظه دریافت کنید.",
        "لینک را بعد از ارائه خدمت برای مشتری واقعی بفرستید یا QR را چاپ کنید.",
      ],
    };
  }
  if (entry.hub === "local-seo-check") {
    return {
      title: `مراحل تست سئو محلی ${entry.label}`,
      items: [
        "مواردی را که اکنون در پروفایل، سایت و اندازه‌گیری انجام داده‌اید علامت بزنید.",
        "امتیاز آمادگی و سه ایراد با بیشترین اولویت را ببینید.",
        "اقدامات باقی‌مانده را اجرا کنید و چند هفته بعد تست را تکرار کنید.",
      ],
    };
  }
  if (entry.hub === "seo-roi-calculator") {
    return {
      title: `مراحل محاسبه ROI سئو ${entry.label}`,
      items: [
        "ارزش متوسط مشتری و حاشیه سود واقعی را وارد کنید.",
        "لید ماهانه، نرخ تبدیل و کل هزینه سئو را تخمین بزنید.",
        "ROI، نقطه سربه‌سر و سه سناریوی مالی را مقایسه کنید.",
      ],
    };
  }
  if (entry.hub === "googlesabt") {
    if (entry.pageType === "guide" || entry.pageType === "comparison" || entry.pageType === "intent") {
      return {
        title: `نکات کلیدی`,
        items: [
          "این راهنما را تا انتها بخوانید",
          "سوالات متداول را بررسی کنید",
          "اگر سوالی دارید با تیم آرایه تماس بگیرید",
          "برای شروع، صفحه پکیج‌ها را ببینید",
        ],
      };
    }
    return {
      title: `مراحل ${entry.primaryKeyword}`,
      items: [
        "پکیج مناسب را انتخاب و پرداخت آنلاین را انجام دهید.",
        `نام، آدرس، تماس، ساعت کاری و عکس‌های ${entry.label} را ارسال کنید.`,
        "تیم آرایه ثبت را در گوگل، نشان، بلد (و در پکیج‌های بالاتر اسنپ و OSM) انجام می‌دهد.",
        "از پکیج حرفه‌ای، کارت هوشمند کسب‌وکار با همه مسیریاب‌ها را هم تحویل می‌گیرید.",
      ],
    };
  }
  if (entry.hub === "bizcard") {
    return {
      title: `ساخت ${entry.primaryKeyword} در ۳ قدم`,
      items: [
        `وارد صفحه کارت ویزیت شوید و اطلاعات ${entry.label} را وارد کنید.`,
        "لینک اختصاصی و QR را فوری دریافت کنید.",
        "لینک را در بیو، واتساپ یا روی درب کسب‌وکار به اشتراک بگذارید.",
      ],
    };
  }
  if (entry.hub === "qr") {
    return {
      title: `مراحل ${entry.primaryKeyword}`,
      items: [
        `متن یا لینک مربوط به ${entry.label} را در ابزار وارد کنید.`,
        "رنگ QR را با برندتان هماهنگ کنید.",
        "پیش‌نمایش را ببینید و فایل PNG را دانلود کنید.",
        "برای چاپ یا استوری استفاده کنید.",
      ],
    };
  }
  return {
    title: `مراحل ${entry.primaryKeyword}`,
    items: [
      "لینک بلند را در کوتاه‌کننده بچسبانید.",
      "در صورت تمایل آدرس دلخواه انتخاب کنید.",
      "لینک کوتاه و QR را کپی یا دانلود کنید.",
      `در ${entry.label} به اشتراک بگذارید.`,
    ],
  };
}

function benefitsFor(entry: ToolRegistryEntry): ToolProgrammaticPage["benefits"] {
  if (entry.hub === "review-link") {
    return [
      { title: "اصطکاک کمتر", desc: "مشتری مستقیم وارد فرم ثبت نظر می‌شود و بین صفحه‌های گوگل گم نمی‌شود." },
      { title: "QR آماده چاپ", desc: "برای میز، کارت، فاکتور یا بسته‌بندی یک QR بدون واترمارک می‌گیرید." },
      { title: "پیام صنف‌محور", desc: `متن درخواست نظر برای لحن و نیاز ${entry.label} آماده شده است.` },
      { title: "رایگان و خصوصی", desc: "تولید لینک و QR در مرورگر انجام می‌شود و ثبت‌نام لازم نیست." },
    ];
  }
  if (entry.hub === "local-seo-check") {
    return [
      { title: "اولویت روشن", desc: "به‌جای فهرست بلند، اول سه اقدام با بیشترین اثر را می‌بینید." },
      { title: "متناسب با صنف", desc: `کنترل‌های تخصصی ${entry.label} کنار اصول عمومی سئو محلی قرار می‌گیرد.` },
      { title: "بدون ادعای رتبه", desc: "امتیاز، آمادگی اجرایی را می‌سنجد و جایگاه واقعی گوگل را جعل نمی‌کند." },
      { title: "قابل تکرار", desc: "پس از اصلاحات دوباره تست کنید و پیشرفت را بسنجید." },
    ];
  }
  if (entry.hub === "seo-roi-calculator") {
    return [
      { title: "تصمیم عددی", desc: "هزینه سئو را به سود، مشتری و نقطه سربه‌سر تبدیل می‌کند." },
      { title: "سناریوهای مختلف", desc: "ریسک را با نتایج محافظه‌کارانه، واقعی و خوش‌بینانه می‌بینید." },
      { title: "فرمول شفاف", desc: "همه ورودی‌ها دست شماست و نتیجه بر اساس داده‌های خودتان محاسبه می‌شود." },
      { title: "مناسب خدمات", desc: `برای مدل جذب لید و فروش خدمات ${entry.label} طراحی شده است.` },
    ];
  }
  if (entry.hub === "googlesabt") {
    if (entry.pageType === "guide" || entry.pageType === "comparison" || entry.pageType === "intent") {
      return [
        {
          title: "اطلاعات به‌روز",
          desc: "محتوای این صفحه بر اساس تجربه واقعی کسب‌وکارهای ایرانی نوشته شده.",
        },
        {
          title: "پاسخ سوالات رایج",
          desc: "سوالاتی که بیشتر مشتریان می‌پرسند را پوشش داده‌ایم.",
        },
        {
          title: "راهنمای عملی",
          desc: "نکات کاربردی که می‌توانید فوراً استفاده کنید.",
        },
        {
          title: "پشتیبانی آرایه",
          desc: "اگر سوالی دارید، تیم آرایه آماده پاسخگویی است.",
        },
      ];
    }
    return [
      {
        title: "جستجوی محلی",
        desc: `وقتی مشتری ${entry.label} نزدیکش را می‌جوید، شما در نقشه دیده می‌شوید.`,
      },
      {
        title: "چند نقشه همزمان",
        desc: "گوگل، نشان، بلد و در پکیج‌های بالاتر اسنپ و OpenStreetMap.",
      },
      {
        title: "تحویل سریع",
        desc: "ثبت اولیه معمولاً کمتر از یک روز کاری انجام می‌شود.",
      },
      {
        title: "کارت هوشمند کسب‌وکار",
        desc: "از پکیج حرفه‌ای، کارت هوشمند با همه مسیریاب‌ها روی یک آدرس — به‌عنوان هدیه.",
      },
    ];
  }
  if (entry.hub === "bizcard") {
    return [
      {
        title: "یک لینک برای همه تماس‌ها",
        desc: `مشتری ${entry.label} دیگر بین شماره، نقشه و اینستاگرام سردرگم نمی‌شود.`,
      },
      {
        title: "اعتماد بیشتر",
        desc: "صفحه مرتب و برندشده حس حرفه‌ای بودن می‌دهد.",
      },
      {
        title: "آپدیت همیشگی",
        desc: "اگر شماره یا آدرس عوض شد، همان لینک را به‌روز می‌کنید.",
      },
      {
        title: "رایگان و سریع",
        desc: "بدون سایت جدا و بدون کدنویسی — در چند دقیقه آماده است.",
      },
    ];
  }
  if (entry.hub === "qr") {
    return [
      {
        title: "بدون تایپ لینک",
        desc: `مخاطب با اسکن مستقیم به ${entry.label} می‌رسد.`,
      },
      {
        title: "مناسب چاپ و دیجیتال",
        desc: "برای منو، پوستر، کارت و استوری قابل استفاده است.",
      },
      {
        title: "کنترل ظاهر",
        desc: "رنگ QR را با هویت بصری هماهنگ کنید.",
      },
      {
        title: "کاملاً رایگان",
        desc: "بدون ثبت‌نام، بدون واترمارک اجباری در نسخه رایگان ابزار.",
      },
    ];
  }
  return [
    {
      title: "ظاهر تمیز",
      desc: `در ${entry.label} لینک کوتاه خیلی حرفه‌ای‌تر از URL بلند دیده می‌شود.`,
    },
    {
      title: "اشتراک آسان",
      desc: "کپی، ارسال و یادآوری لینک کوتاه ساده‌تر است.",
    },
    {
      title: "آدرس دلخواه",
      desc: "می‌توانید slug خوانا و برندشده بسازید.",
    },
    {
      title: "QR همراه",
      desc: "بعد از کوتاه کردن، QR همان لینک را هم می‌گیرید.",
    },
  ];
}

function faqsFor(entry: ToolRegistryEntry): ToolFaq[] {
  const kw = entry.primaryKeyword;
  const label = entry.label;
  if (entry.hub === "review-link") {
    return [
      { q: "لینک مستقیم نظر گوگل را از کجا بگیرم؟", a: "در پروفایل کسب‌وکار گوگل گزینه Ask for reviews را باز و لینک را کپی کنید. اگر Place ID دارید، ابزار از آن لینک مستقیم می‌سازد." },
      { q: "آیا می‌توانم برای نظر دادن جایزه بدهم؟", a: "خیر. نظر باید واقعی و بدون مشوق باشد. از مشتریان واقعی و بدون جهت‌دهی برای ثبت تجربه صادقانه دعوت کنید." },
      { q: "QR نظر گوگل منقضی می‌شود؟", a: "QR استاتیک منقضی نمی‌شود؛ تا زمانی که لینک مقصد معتبر باشد کار می‌کند." },
      { q: `بهترین زمان درخواست نظر از مشتری ${label} چه موقع است؟`, a: "بلافاصله پس از تجربه موفق و زمانی که مشتری رضایت خود را نشان داده است؛ نه با فشار یا درخواست تکراری." },
      { q: "آیا آرایه لینک یا اطلاعات من را ذخیره می‌کند؟", a: "خیر. ساخت لینک و QR در مرورگر انجام می‌شود و برای استفاده از ابزار ثبت‌نام لازم نیست." },
    ];
  }
  if (entry.hub === "local-seo-check") {
    return [
      { q: "این تست رتبه واقعی گوگل مپ را نشان می‌دهد؟", a: "خیر. این ابزار آمادگی اجرایی سئو محلی را می‌سنجد. رتبه واقعی به مکان جست‌وجو، رقبا و داده‌های زنده وابسته است." },
      { q: "امتیاز خوب سئو محلی چند است؟", a: "امتیاز بالای ۸۰ یعنی پایه‌ها آماده‌اند، اما کیفیت اجرا و قدرت رقبا همچنان باید جداگانه بررسی شود." },
      { q: `مهم‌ترین عامل سئو محلی ${label} چیست؟`, a: "پروفایل کامل و درست، یکسان بودن نام/آدرس/تلفن، نظرهای واقعی، سایت مفید و ارتباط موضوعی با جست‌وجوی محلی همگی مهم‌اند." },
      { q: "بدون وب‌سایت هم می‌توان در نقشه دیده شد؟", a: "بله، اما سایت سریع و معتبر کنترل بیشتری روی محتوا، اعتمادسازی، رزرو و اندازه‌گیری به شما می‌دهد." },
      { q: "هر چند وقت یک‌بار تست را تکرار کنم؟", a: "پس از هر دور اصلاحات یا حداقل هر سه ماه یک‌بار، به‌ویژه بعد از تغییر آدرس، تلفن، ساعت یا خدمات." },
    ];
  }
  if (entry.hub === "seo-roi-calculator") {
    return [
      { q: "فرمول ROI سئو چیست؟", a: "ROI برابر است با سود خالص حاصل از سئو تقسیم بر کل هزینه سئو، ضربدر ۱۰۰. در کسب‌وکار خدماتی باید ارزش لید و نرخ تبدیل هم لحاظ شود." },
      { q: "هزینه سئو شامل چه چیزهایی است؟", a: "هزینه آژانس یا نیروی داخلی، محتوا، توسعه فنی، ابزارها و لینک‌سازی مرتبط در همان بازه زمانی." },
      { q: "چرا حاشیه سود مهم است؟", a: "فروش با سود یکسان نیست. برای تصمیم درست باید سود هر مشتری، نه فقط مبلغ فاکتور، وارد محاسبه شود." },
      { q: `نتیجه سئو برای ${label} چند ماهه مشخص می‌شود؟`, a: "بسته به وضعیت سایت و رقابت متفاوت است؛ معمولاً ارزیابی مالی سئو در بازه ۳ تا ۶ ماهه معنادارتر از یک ماه است." },
      { q: "آیا این محاسبه تضمین فروش است؟", a: "خیر. خروجی یک مدل تصمیم‌گیری بر اساس ورودی‌های شماست و رتبه، ترافیک یا فروش را تضمین نمی‌کند." },
    ];
  }
  if (entry.hub === "googlesabt") {
    if (entry.pageType === "guide" || entry.pageType === "comparison" || entry.pageType === "intent") {
      return [
        {
          q: "ثبت در گوگل مپ چقدر طول می‌کشد؟",
          a: "ثبت اولیه معمولاً کمتر از یک روز کاری است؛ وریفای بسته به روش ۳ تا ۱۴ روز طول می‌کشد.",
        },
        {
          q: "هزینه ثبت در گوگل مپ چقدر است؟",
          a: "ثبت اولیه رایگان است. سرویس حرفه‌ای آرایه از ۲٫۲۴ میلیون تومان شروع می‌شود.",
        },
        {
          q: "آیا در نشان و بلد هم ثبت می‌شود؟",
          a: "بله. پکیج‌های آرایه شامل ثبت در گوگل، نشان و بلد است؛ پکیج‌های بالاتر اسنپ و OSM را هم پوشش می‌دهند.",
        },
        {
          q: "اگر قبلاً در گوگل ثبت شده باشم چه؟",
          a: "مالکیت پروفایل موجود را ادعا می‌کنیم و اطلاعات را اصلاح و تکمیل می‌کنیم.",
        },
        {
          q: "چطور شروع کنم؟",
          a: "صفحه پکیج‌ها را ببینید و پکیج مناسب را انتخاب کنید. بعد از پرداخت، تیم آرایه با شما تماس می‌گیرد.",
        },
      ];
    }
    return [
      {
        q: `${kw} چقدر طول می‌کشد؟`,
        a: "ثبت اولیه معمولاً کمتر از یک روز کاری است؛ زمان نهایی به درستی‌سنجی گوگل بستگی دارد که پیگیری می‌شود.",
      },
      {
        q: `برای ثبت ${label} چه اطلاعاتی لازم است؟`,
        a: "نام دقیق، آدرس و موقعیت روی نقشه، شماره تماس، ساعت کاری و چند عکس باکیفیت از محل.",
      },
      {
        q: "آیا در نشان و بلد هم ثبت می‌شود؟",
        a: "بله. بسته به پکیج، گوگل، نشان، بلد و در پکیج‌های بالاتر اسنپ و OpenStreetMap پوشش داده می‌شود.",
      },
      {
        q: "تفاوت ثبت نقشه با کارت ویزیت رایگان چیست؟",
        a: "کارت رایگان را خودتان می‌سازید. در ثبت گوگل، تیم آرایه نمایه را روی نقشه‌ها ثبت و بهینه می‌کند و از پکیج حرفه‌ای کارت هوشمند کسب‌وکار با مسیریاب‌ها هم می‌گیرید.",
      },
      {
        q: `اگر ${label} قبلاً در گوگل ثبت شده باشد؟`,
        a: "مالکیت نمایه موجود را ادعا می‌کنیم و آدرس، شماره، ساعت کاری و عکس‌ها را اصلاح و تکمیل می‌کنیم.",
      },
    ];
  }
  if (entry.hub === "bizcard") {
    return [
      {
        q: `${kw} رایگان است؟`,
        a: `بله. ساخت ${kw} در آرایه رایگان است و لینک اختصاصی به همراه QR فعال می‌شود.`,
      },
      {
        q: `چه اطلاعاتی روی کارت ${label} بگذارم؟`,
        a: "حداقل نام، تلفن و یک راه ارتباطی (واتساپ یا اینستاگرام). نقشه، ساعت کاری و لوگو هم پیشنهاد می‌شود.",
      },
      {
        q: `مشتری چطور کارت را باز می‌کند؟`,
        a: "با باز کردن لینک در مرورگر موبایل یا اسکن QR. نیازی به نصب اپ نیست.",
      },
      {
        q: `آیا بعداً می‌توانم اطلاعات را عوض کنم؟`,
        a: "بله. اطلاعات کارت قابل ویرایش است تا همیشه به‌روز بماند.",
      },
      {
        q: `تفاوت کارت دیجیتال با سایت کامل چیست؟`,
        a: `کارت دیجیتال برای تماس سریع ${label} کافی است. اگر به سئو، نوبت‌دهی یا فروش نیاز دارید، مسیر طراحی سایت آرایه را ببینید.`,
      },
    ];
  }
  if (entry.hub === "qr") {
    return [
      {
        q: `چطور ${kw} انجام دهم؟`,
        a: `متن یا لینک مربوط به ${label} را در ابزار QR آرایه وارد کنید، رنگ را انتخاب و PNG را دانلود کنید.`,
      },
      {
        q: "سایز مناسب برای چاپ چقدر است؟",
        a: "برای منو و کارت معمولاً حداقل ۲×۲ سانتی‌متر با حاشیه سفید کافی است. برای فاصله بیشتر، سایز بزرگ‌تر چاپ کنید.",
      },
      {
        q: "آیا QR رنگی هم اسکن می‌شود؟",
        a: "بله، اگر کنتراست با پس‌زمینه کافی باشد. رنگ‌های تیره روی زمینه سفید بهترین نتیجه را می‌دهند.",
      },
      {
        q: "QR منقضی می‌شود؟",
        a: "خود فایل QR منقضی نمی‌شود. اگر لینک مقصد عوض شود، QR را با لینک جدید دوباره بسازید — یا از کارت ویزیت دیجیتال با لینک ثابت استفاده کنید.",
      },
      {
        q: `برای ${label} لینک کوتاه هم لازم است؟`,
        a: "الزامی نیست، ولی لینک کوتاه داخل QR ظاهر تمیزتری دارد و اگر URL خیلی بلند است پیشنهاد می‌شود.",
      },
    ];
  }
  return [
    {
      q: `${kw} رایگان است؟`,
      a: "بله. کوتاه‌کننده لینک آرایه رایگان است و نیازی به ثبت‌نام ندارد.",
    },
    {
      q: `چطور برای ${label} لینک کوتاه بسازم؟`,
      a: "لینک بلند را وارد کنید، در صورت تمایل slug دلخواه بگذارید و دکمه کوتاه کردن را بزنید.",
    },
    {
      q: "آیا می‌توانم آدرس دلخواه بگیرم؟",
      a: "بله. اگر slug آزاد باشد، لینک به شکل araaye.com/s/your-name ساخته می‌شود.",
    },
    {
      q: "همراه لینک کوتاه QR هم می‌گیرم؟",
      a: "بله. بعد از ساخت، QR همان لینک کوتاه نمایش داده می‌شود و قابل دانلود است.",
    },
    {
      q: "لینک کوتاه برای تبلیغات مناسب است؟",
      a: "بله. مخصوصاً در پیامک، استوری و بیو که فضای محدود دارید.",
    },
  ];
}

function bodyParagraphsFor(entry: ToolRegistryEntry): string[] {
  const hubLabel = getHubLabel(entry.hub);
  const kw = entry.primaryKeyword;
  const label = entry.label;
  const secondary = entry.secondaryKeywords[0] ?? kw;

  if (entry.hub === "review-link") {
    return [
      `${kw} مسیر مشتری را از دریافت پیام تا باز شدن فرم گوگل کوتاه می‌کند. برای ${label}، این کاهش اصطکاک می‌تواند تعداد بازخوردهای واقعی را بیشتر کند.`,
      `ابزار آرایه از لینک آماده گوگل یا Place ID استفاده می‌کند و هم‌زمان لینک مستقیم، QR قابل دانلود و متن درخواست نظر متناسب با ${label} می‌سازد.`,
      `برای حفظ اعتماد، فقط از مشتری واقعی و بدون جایزه یا فشار درخواست نظر کنید. هدف جمع‌کردن تجربه واقعی است، نه دست‌کاری امتیاز.`,
      `بعد از ساخت لینک می‌توانید وضعیت کلی پروفایل را با تست سئو محلی بررسی کنید یا برای بهینه‌سازی حرفه‌ای از خدمات ثبت و سئو آرایه کمک بگیرید.`,
    ];
  }
  if (entry.hub === "local-seo-check") {
    return [
      `${kw} یک ارزیابی سریع از پایه‌های دیده‌شدن ${label} در جست‌وجوی محلی است؛ از صحت اطلاعات و دسته‌بندی تا نظرها، سایت، اسکیما و اندازه‌گیری.`,
      `این ابزار رتبه جعلی نمایش نمی‌دهد. خروجی آن امتیاز آمادگی، سه اقدام اولویت‌دار و یک فهرست اجرایی است که می‌توانید بدون ابزار تخصصی شروع کنید.`,
      `مواردی مثل ${secondary} زمانی نتیجه می‌دهند که اطلاعات کسب‌وکار یکسان، صفحات خدمات مفید و مسیر تماس یا رزرو واضح باشد.`,
      `اگر امتیاز پایین است، ابتدا مشکلات پایه را برطرف کنید؛ سپس رقبا، کلمات محلی و عملکرد واقعی در Search Console و Analytics را بررسی کنید.`,
    ];
  }
  if (entry.hub === "seo-roi-calculator") {
    return [
      `${kw} کمک می‌کند هزینه را به تعداد لید، مشتری و سود قابل فهم تبدیل کنید. مدل بر اساس داده‌های خود ${label} محاسبه می‌شود، نه وعده‌های عمومی.`,
      `ارزش مشتری، نرخ تبدیل لید، حاشیه سود و همه هزینه‌های اجرا را وارد کنید. ابزار نقطه سربه‌سر و سه سناریو را نمایش می‌دهد تا ریسک تصمیم روشن باشد.`,
      `برای ${secondary} بهتر است بازه ۳ تا ۶ ماهه را در نظر بگیرید؛ چون اثر محتوا و بهبود فنی معمولاً تدریجی است.`,
      `پس از شروع سئو، ورودی‌های تخمینی را با داده واقعی CRM، GA4 و Search Console جایگزین کنید تا محاسبه دقیق‌تر شود.`,
    ];
  }
  if (entry.hub === "googlesabt") {
    if (entry.pageType === "guide" || entry.pageType === "comparison" || entry.pageType === "intent") {
      return [
        `این راهنما به سوال «${kw}» پاسخ می‌دهد و اطلاعات کاربردی برای صاحبان کسب‌وکار ایرانی ارائه می‌کند.`,
        `ثبت کسب‌وکار در نقشه‌ها (گوگل، نشان، بلد) یکی از مهم‌ترین کارهای بازاریابی محلی است. مشتریان نزدیک اول نتایج نقشه را می‌بینند.`,
        `اگر به دنبال ${secondary} هستید، پکیج‌های آرایه از ۲٫۲۴ میلیون تومان شروع می‌شود و ثبت در همه نقشه‌ها را پوشش می‌دهد.`,
        `برای شروع، صفحه پکیج‌ها را ببینید یا با تیم آرایه تماس بگیرید.`,
      ];
    }
    return [
      `${kw} به ${label} کمک می‌کند در نتایج محلی گوگل و نقشه‌ها دیده شود؛ جایی که مشتری نزدیک برای پیدا کردن خدمات جست‌وجو می‌کند.`,
      `خیلی از کسب‌وکارهای ${label} فقط روی اینستاگرام فعال‌اند و در نقشه نیستند. با ثبت حرفه‌ای، نام، آدرس، تماس و ساعت کاری روی گوگل، نشان و بلد درست می‌شود.`,
      `اگر به دنبال ${secondary} هستید، پکیج‌های آرایه از استاندارد تا VIP با هدیه کارت هوشمند کسب‌وکار را پوشش می‌دهد. تحویل اولیه معمولاً کمتر از یک روز کاری است.`,
      `در کنار ${hubLabel}، می‌توانید کارت ویزیت دیجیتال و QR را هم برای اشتراک‌گذاری سریع‌تر مسیر تماس استفاده کنید.`,
    ];
  }
  if (entry.hub === "bizcard") {
    return [
      `${kw} به ${label} کمک می‌کند تا بدون ساخت سایت پیچیده، یک صفحه معرفی قابل اشتراک داشته باشد. مشتری با یک لینک به تماس، نقشه و شبکه‌های اجتماعی می‌رسد.`,
      `بسیاری از کسب‌وکارهای ${label} هنوز شماره را روی کاغذ می‌نویسند یا چند لینک جدا در بیو می‌گذارند. با کارت دیجیتال آرایه، همان اطلاعات در یک آدرس ثابت و حرفه‌ای جمع می‌شود.`,
      `اگر به دنبال ${secondary} هستید، می‌توانید از همین صفحه وارد ابزار شوید، فرم را پر کنید و QR را هم برای چاپ بگیرید. برای رشد بیشتر در گوگل، مسیر سئو و طراحی سایت صنفی آرایه هم در دسترس است.`,
      `${hubLabel} آرایه رایگان است و برای شروع سریع فروش و تماس حضوری طراحی شده — از رستوران و مطب تا فریلنسر و فروشگاه اینستاگرامی.`,
    ];
  }
  if (entry.hub === "qr") {
    return [
      `${kw} یکی از پرتکرارترین نیازهای کسب‌وکارهای آنلاین و حضوری است. با اسکن موبایل، مخاطب بدون تایپ کردن به مقصد ${label} می‌رسد.`,
      `ابزار ${hubLabel} آرایه این کار را بدون ثبت‌نام انجام می‌دهد: متن یا لینک را وارد کنید، رنگ را انتخاب کنید و فایل PNG را دانلود کنید. برای کاربردهایی مثل منو، وای‌فای یا کارت ویزیت، همین صفحه راهنمای اختصاصی دارد.`,
      `اگر مقصد QR یک URL بلند است، بهتر است اول با کوتاه‌کننده لینک آرایه آن را کوتاه کنید و بعد QR بسازید. ترکیب لینک کوتاه + QR برای چاپ و استوری تمیزتر است.`,
      `در کنار ${secondary}، می‌توانید از کارت ویزیت دیجیتال هم استفاده کنید تا لینک مقصد همیشه قابل ویرایش بماند و نیازی به چاپ مجدد QR نباشد.`,
    ];
  }
  return [
    `${kw} برای کانال‌هایی مثل ${label} ضروری است؛ چون فضای نمایش لینک محدود است و URLهای بلند اعتماد و خوانایی را کم می‌کنند.`,
    `با ${hubLabel} آرایه می‌توانید لینک را کوتاه کنید، آدرس دلخواه بگذارید و QR همان لینک را هم بگیرید. این برای بیو، پیامک، کمپین و اشتراک در چت بسیار کاربردی است.`,
    `اگر هدف شما ${secondary} است، همین ابزار کافی است. برای تجربه کامل‌تر (تماس + نقشه + شبکه‌ها) کارت ویزیت دیجیتال را هم ببینید.`,
    `لینک کوتاه آرایه روی دامنه araaye.com ساخته می‌شود و برای استفاده روزمره کسب‌وکارهای ایرانی طراحی شده است.`,
  ];
}

function prefillFor(entry: ToolRegistryEntry): string | undefined {
  if (entry.hub !== "qr") return undefined;
  const map: Record<string, string> = {
    instagram: "https://instagram.com/",
    whatsapp: "https://wa.me/98",
    telegram: "https://t.me/",
    linkedin: "https://linkedin.com/in/",
    youtube: "https://youtube.com/",
    aparat: "https://www.aparat.com/",
    website: "https://",
    "google-maps": "https://maps.google.com/",
    wifi: "WIFI:T:WPA;S:NetworkName;P:Password;;",
  };
  return map[entry.slug];
}

function ctaLabelFor(entry: ToolRegistryEntry): string {
  if (entry.hub === "review-link") return `ساخت لینک نظر گوگل ${entry.label}`;
  if (entry.hub === "local-seo-check") return `شروع تست سئو محلی ${entry.label}`;
  if (entry.hub === "seo-roi-calculator") return `محاسبه ROI سئو ${entry.label}`;
  if (entry.hub === "googlesabt") {
    if (entry.pageType === "guide" || entry.pageType === "comparison" || entry.pageType === "intent") {
      return "مشاهده پکیج‌ها و قیمت";
    }
    return `سفارش ${entry.primaryKeyword}`;
  }
  if (entry.hub === "bizcard") return `ساخت ${entry.primaryKeyword}`;
  if (entry.hub === "qr") {
    if (entry.pageType === "guide" || entry.pageType === "comparison") return "شروع ساخت QR رایگان";
    return entry.primaryKeyword;
  }
  if (entry.pageType === "guide" || entry.pageType === "comparison") return "شروع کوتاه کردن لینک";
  return entry.primaryKeyword;
}

export function buildToolProgrammaticPage(
  hub: ToolHub,
  slug: string,
): ToolProgrammaticPage | null {
  const entry = getToolPage(hub, slug);
  if (!entry || entry.status !== "published") return null;

  const related = entry.relatedSlugs
    .map((s) => getToolPage(hub, s))
    .filter((p): p is ToolRegistryEntry => !!p && p.status === "published")
    .slice(0, 6)
    .map((p) => ({
      href: `${getHubPath(hub)}/${p.slug}`,
      label: p.label,
      keyword: p.primaryKeyword,
    }));

  const siblings = getPublishedToolPages(hub)
    .filter((p) => p.slug !== slug)
    .slice(0, 4);
  for (const s of siblings) {
    if (!related.some((r) => r.href.endsWith(`/${s.slug}`))) {
      related.push({
        href: `${getHubPath(hub)}/${s.slug}`,
        label: s.label,
        keyword: s.primaryKeyword,
      });
    }
    if (related.length >= 6) break;
  }

  const crossToolLinks = (entry.crossToolLinks ?? []).map((c) => ({
    href: `/${c.hub}/${c.slug}`,
    anchor: c.anchor,
  }));

  const industryLinks: { href: string; label: string }[] = [];
  if (entry.industryPath) {
    industryLinks.push({
      href: `/website-design`,
      label: `طراحی سایت برای ${entry.label}`,
    });
    if (
      ["doctor", "clinic", "dentist", "beauty-clinic", "lawyer"].includes(entry.industryPath)
    ) {
      industryLinks.push({
        href: `/seo/${entry.industryPath}`,
        label: `سئو سایت ${entry.label}`,
      });
    }
    if (entry.industryPath === "doctor") {
      industryLinks.push({ href: "/doctors", label: "پکیج سایت پزشکان" });
    }
  }
  if (entry.hub === "review-link" || entry.hub === "local-seo-check") {
    industryLinks.push({ href: "/free-seo-audit", label: "تحلیل رایگان سایت و سئو" });
    if (entry.industryPath) {
      industryLinks.push({
        href: `/googlesabt/${entry.industryPath === "online-shop" ? "shop" : entry.industryPath}`,
        label: `ثبت ${entry.label} در گوگل مپ`,
      });
    } else {
      industryLinks.push({ href: "/googlesabt", label: "ثبت کسب‌وکار در گوگل مپ" });
    }
  }
  if (entry.hub === "seo-roi-calculator") {
    industryLinks.push({ href: "/free-seo-audit", label: "تحلیل رایگان سایت و سئو" });
    industryLinks.push({ href: "/seo", label: "خدمات سئو آرایه" });
  }

  const isPaidService = entry.hub === "googlesabt";
  const title = isPaidService
    ? `${entry.primaryKeyword} | از ۲٫۲۴ میلیون تومان — آرایه`
    : entry.pageType === "guide" || entry.pageType === "comparison"
      ? `${entry.primaryKeyword} | آرایه`
      : `${entry.primaryKeyword} رایگان | آرایه`;

  const description = isPaidService
    ? `${entry.primaryKeyword} — ${entry.secondaryKeywords.slice(0, 2).join("، ")}. ثبت در گوگل، نشان و بلد با تحویل سریع و هدیه کارت هوشمند کسب‌وکار از پکیج حرفه‌ای.`
    : `${entry.primaryKeyword} — ${entry.secondaryKeywords.slice(0, 2).join("، ")}. ابزار رایگان آرایه، بدون نصب اپ.`;

  const contentOverride = hub === "googlesabt" ? getGooglesabtContentOverride(slug) : undefined;

  const problem = contentOverride?.problem ?? problemFor(entry);
  const steps = contentOverride?.steps ?? stepsFor(entry);
  const bodyParagraphs = contentOverride?.bodyParagraphs ?? bodyParagraphsFor(entry);
  const faqs = contentOverride?.faqs ?? faqsFor(entry);

  return {
    hub,
    slug,
    pageType: entry.pageType,
    primaryKeyword: entry.primaryKeyword,
    secondaryKeywords: entry.secondaryKeywords,
    label: entry.label,
    hero: {
      h1: entry.primaryKeyword,
      lead: bodyParagraphs[0],
    },
    problem,
    steps,
    benefits: benefitsFor(entry),
    bodyParagraphs,
    toolCta: {
      label: ctaLabelFor(entry),
      href: HUB_CTA[hub].path,
      prefillText: prefillFor(entry),
    },
    faqs,
    related,
    crossToolLinks,
    industryLinks,
    meta: {
      title,
      description,
      canonicalPath: `${getHubPath(hub)}/${slug}`,
    },
    mistakes: contentOverride?.mistakes,
    example: contentOverride?.example,
    video: contentOverride?.video,
  };
}

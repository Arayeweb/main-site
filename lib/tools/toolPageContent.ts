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
};

function problemFor(entry: ToolRegistryEntry): ToolProgrammaticPage["problem"] {
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
        "امکان لینک همه‌کاره BizCard از پکیج محبوب",
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
        "پکیج مناسب را انتخاب و پیش‌پرداخت آنلاین را انجام دهید.",
        `نام، آدرس، تماس، ساعت کاری و عکس‌های ${entry.label} را ارسال کنید.`,
        "تیم آرایه ثبت را در گوگل، نشان، بلد (و در پکیج‌های بالاتر اسنپ و OSM) انجام می‌دهد.",
        "از پکیج محبوب، لینک BizCard با همه مسیریاب‌ها را هم تحویل می‌گیرید.",
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
        title: "لینک همه‌کاره",
        desc: "از پکیج محبوب، BizCard با همه مسیریاب‌ها روی یک آدرس.",
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
  if (entry.hub === "googlesabt") {
    if (entry.pageType === "guide" || entry.pageType === "comparison" || entry.pageType === "intent") {
      return [
        {
          q: "ثبت در گوگل مپ چقدر طول می‌کشد؟",
          a: "ثبت اولیه معمولاً کمتر از یک روز کاری است؛ وریفای بسته به روش ۳ تا ۱۴ روز طول می‌کشد.",
        },
        {
          q: "هزینه ثبت در گوگل مپ چقدر است؟",
          a: "ثبت اولیه رایگان است. سرویس حرفه‌ای آرایه از ۵۹۰ هزار تومان شروع می‌شود.",
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
        a: "کارت رایگان را خودتان می‌سازید. در ثبت گوگل، تیم آرایه نمایه را روی نقشه‌ها ثبت و بهینه می‌کند و از پکیج محبوب لینک BizCard با مسیریاب‌ها هم می‌گیرید.",
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

  if (entry.hub === "googlesabt") {
    if (entry.pageType === "guide" || entry.pageType === "comparison" || entry.pageType === "intent") {
      return [
        `این راهنما به سوال «${kw}» پاسخ می‌دهد و اطلاعات کاربردی برای صاحبان کسب‌وکار ایرانی ارائه می‌کند.`,
        `ثبت کسب‌وکار در نقشه‌ها (گوگل، نشان، بلد) یکی از مهم‌ترین کارهای بازاریابی محلی است. مشتریان نزدیک اول نتایج نقشه را می‌بینند.`,
        `اگر به دنبال ${secondary} هستید، پکیج‌های آرایه از ۵۹۰ هزار تومان شروع می‌شود و ثبت در همه نقشه‌ها را پوشش می‌دهد.`,
        `برای شروع، صفحه پکیج‌ها را ببینید یا با تیم آرایه تماس بگیرید.`,
      ];
    }
    return [
      `${kw} به ${label} کمک می‌کند در نتایج محلی گوگل و نقشه‌ها دیده شود؛ جایی که مشتری نزدیک برای پیدا کردن خدمات جست‌وجو می‌کند.`,
      `خیلی از کسب‌وکارهای ${label} فقط روی اینستاگرام فعال‌اند و در نقشه نیستند. با ثبت حرفه‌ای، نام، آدرس، تماس و ساعت کاری روی گوگل، نشان و بلد درست می‌شود.`,
      `اگر به دنبال ${secondary} هستید، پکیج‌های آرایه از ثبت پایه تا پکیج محبوب با لینک BizCard را پوشش می‌دهد. تحویل اولیه معمولاً کمتر از یک روز کاری است.`,
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

  const isPaidService = entry.hub === "googlesabt";
  const title = isPaidService
    ? `${entry.primaryKeyword} | از ۵۹۰ هزار تومان — آرایه`
    : entry.pageType === "guide" || entry.pageType === "comparison"
      ? `${entry.primaryKeyword} | آرایه`
      : `${entry.primaryKeyword} رایگان | آرایه`;

  const description = isPaidService
    ? `${entry.primaryKeyword} — ${entry.secondaryKeywords.slice(0, 2).join("، ")}. ثبت در گوگل، نشان و بلد با تحویل سریع و لینک BizCard از پکیج محبوب.`
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

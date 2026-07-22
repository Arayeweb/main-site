/**
 * FastWeb product demos — fictional one-page sites shown at /demo/fastweb/[slug]
 * and as the hero mockup on /fastweb.
 */

export const FASTWEB_DEMO_SLUGS = ["zivan-studio"] as const;

export type FastWebDemoSlug = (typeof FASTWEB_DEMO_SLUGS)[number];

export type FastWebDemoNavItem = { label: string; href: string };

export type FastWebDemoService = {
  title: string;
  description: string;
};

export type FastWebDemoProject = {
  title: string;
  category: string;
  location: string;
  image: string;
  alt: string;
};

export type FastWebDemoTestimonial = {
  name: string;
  role: string;
  text: string;
};

export type FastWebDemoFaq = {
  question: string;
  answer: string;
};

export type FastWebDemoContent = {
  slug: FastWebDemoSlug;
  businessName: string;
  tagline: string;
  previewUrl: string;
  browserBar: string;
  seoTitle: string;
  seoDescription: string;
  nav: FastWebDemoNavItem[];
  hero: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    image: string;
    imageAlt: string;
    highlights: string[];
  };
  services: FastWebDemoService[];
  about: {
    title: string;
    body: string;
    advantage: string;
    image: string;
    imageAlt: string;
  };
  projects: FastWebDemoProject[];
  testimonials: FastWebDemoTestimonial[];
  faq: FastWebDemoFaq[];
  contact: {
    title: string;
    subtitle: string;
    phone: string;
    phoneTel: string;
    whatsapp: string;
    instagram: string;
    address: string;
    hours: string;
    cta: string;
  };
};

const zivanImages = {
  hero: "/showcase-assets/medisa/hero.jpg",
  studio: "/showcase-assets/medisa/studio.jpg",
  courtyard: "/showcase-assets/medisa/project-courtyard.jpg",
  bright: "/showcase-assets/medisa/project-bright.jpg",
  office: "/showcase-assets/medisa/project-office.jpg",
  slope: "/showcase-assets/medisa/project-slope.jpg",
} as const;

export const FASTWEB_DEMOS: Record<FastWebDemoSlug, FastWebDemoContent> = {
  "zivan-studio": {
    slug: "zivan-studio",
    businessName: "استودیو ژوان",
    tagline: "معماری و طراحی داخلی",
    previewUrl: "/demo/fastweb/zivan-studio",
    browserBar: "araaye.com/demo/fastweb/zivan-studio",
    seoTitle: "دمو سایت فوری — استودیو ژوان | آرایه",
    seoDescription:
      "نمونه کامل سایت یک‌صفحه‌ای FastWeb برای استودیو معماری و طراحی داخلی؛ معرفی خدمات، پروژه‌ها، نظرات و فرم درخواست همکاری.",
    nav: [
      { label: "خدمات", href: "#services" },
      { label: "پروژه‌ها", href: "#projects" },
      { label: "درباره", href: "#about" },
      { label: "تماس", href: "#contact" },
    ],
    hero: {
      eyebrow: "استودیو معماری ژوان · تهران",
      title: "فضایی که با زندگی شما",
      titleAccent: "هم‌راستا می‌شود",
      subtitle:
        "معماری، طراحی داخلی و بازسازی — با تمرکز بر نور، متریال و جریان فضا برای خانه‌ها و فضاهای کاری که هر روز در آن‌ها زندگی می‌کنید.",
      primaryCta: "درخواست مشاوره",
      secondaryCta: "مشاهده پروژه‌ها",
      image: zivanImages.hero,
      imageAlt: "نمای معماری مسکونی مدرن با نور طبیعی",
      highlights: [
        "طراحی مفهوم تا اجرا",
        "نمونه‌کار واقعی در سایت",
        "پاسخ‌گویی سریع واتساپ",
      ],
    },
    services: [
      {
        title: "معماری مسکونی",
        description:
          "طراحی پلان، نما و جزئیات اجرایی برای ویلا، آپارتمان و بازسازی خانه‌های موجود.",
      },
      {
        title: "طراحی داخلی",
        description:
          "چیدمان فضا، انتخاب متریال، نورپردازی و جزئیات مبلمان برای فضاهای زندگی و کار.",
      },
      {
        title: "بازسازی و نوسازی",
        description:
          "برنامه بازسازی مرحله‌ای با حفظ ساختار مفید و ارتقای کیفیت نور و جریان فضا.",
      },
      {
        title: "فضای اداری و تجاری",
        description:
          "طراحی دفاتر، کلینیک‌ها و فضاهای برند با تمرکز بر تجربه مشتری و کارایی تیم.",
      },
    ],
    about: {
      title: "درباره استودیو ژوان",
      body: "ژوان یک استودیوی معماری و طراحی داخلی است که پروژه‌ها را از ایده اولیه تا جزئیات اجرایی همراهی می‌کند. ما به نور طبیعی، متریال صادق و فضاهایی که با عادت‌های واقعی زندگی هم‌خوان باشند معتقدیم — نه فقط عکس‌های زیبا.",
      advantage: "از اسکچ اول تا تحویل جزئیات اجرایی، یک تیم ثابت همراه شماست.",
      image: zivanImages.studio,
      imageAlt: "فضای داخلی مینیمال با متریال سنگی",
    },
    projects: [
      {
        title: "خانه حیاط مرکزی",
        category: "معماری مسکونی",
        location: "تهران",
        image: zivanImages.courtyard,
        alt: "نمای مفهومی خانه با حیاط مرکزی",
      },
      {
        title: "آپارتمان روشن",
        category: "طراحی داخلی",
        location: "کرج",
        image: zivanImages.bright,
        alt: "فضای داخلی روشن آپارتمان",
      },
      {
        title: "دفتر کار آوا",
        category: "فضای اداری",
        location: "تهران",
        image: zivanImages.office,
        alt: "فضای اداری مدرن",
      },
      {
        title: "ویلای شیب‌دار",
        category: "معماری مسکونی",
        location: "شمال",
        image: zivanImages.slope,
        alt: "ویلای مفهومی روی شیب",
      },
    ],
    testimonials: [
      {
        name: "سارا ن.",
        role: "کارفرمای مسکونی",
        text: "از اولین جلسه مشخص بود مسیر پروژه شفاف است. نور و چیدمان خانه دقیقاً همان چیزی شد که می‌خواستیم.",
      },
      {
        name: "امیر ک.",
        role: "مدیر دفتر",
        text: "دفتر جدید هم برای تیم راحت‌تر شد هم برای مراجعه‌کننده‌ها حرفه‌ای‌تر به نظر می‌رسد.",
      },
      {
        name: "مینا ر.",
        role: "بازسازی آپارتمان",
        text: "برنامه بازسازی مرحله‌ای بود و بدون توقف طولانی زندگی، نتیجه نهایی خیلی تمیز درآمد.",
      },
    ],
    faq: [
      {
        question: "فرآیند همکاری از کجا شروع می‌شود؟",
        answer:
          "با یک جلسه کوتاه نیازسنجی شروع می‌کنیم؛ بعد اسکچ اولیه، برآورد محدوده کار و برنامه زمان‌بندی پیشنهاد می‌شود.",
      },
      {
        question: "آیا فقط طراحی می‌کنید یا نظارت هم دارید؟",
        answer:
          "بسته به پروژه، طراحی مفهومی، نقشه‌های اجرایی و در صورت نیاز نظارت دوره‌ای روی اجرا ارائه می‌شود.",
      },
      {
        question: "برای شروع چه اطلاعاتی لازم است؟",
        answer:
          "عکس وضعیت فعلی، پلان تقریبی، بودجه حدودی و اولویت‌هایتان (نور، ذخیره، اتاق کودک و غیره) کافی است.",
      },
      {
        question: "چطور وقت مشاوره بگیرم؟",
        answer:
          "از فرم پایین صفحه یا واتساپ پیام بگذارید؛ معمولاً همان روز کاری پاسخ می‌دهیم.",
      },
    ],
    contact: {
      title: "شروع همکاری",
      subtitle:
        "نام و شماره را بگذارید تا برای جلسه مشاوره کوتاه با شما هماهنگ کنیم.",
      phone: "۰۲۱-۹۱۰۹۰۰۰۰",
      phoneTel: "tel:+982191090000",
      whatsapp: "09120000000",
      instagram: "@zivan.studio",
      address: "تهران، ولیعصر — استودیو ژوان",
      hours: "شنبه تا چهارشنبه ۹ تا ۱۸",
      cta: "ارسال درخواست",
    },
  },
};

export function isFastWebDemoSlug(slug: string): slug is FastWebDemoSlug {
  return (FASTWEB_DEMO_SLUGS as readonly string[]).includes(slug);
}

export function getFastWebDemo(slug: string): FastWebDemoContent | undefined {
  if (!isFastWebDemoSlug(slug)) return undefined;
  return FASTWEB_DEMOS[slug];
}

/** Default demo featured on the FastWeb landing hero. */
export const FASTWEB_FEATURED_DEMO = FASTWEB_DEMOS["zivan-studio"];

export interface ServiceItem {
  icon: string;
  title: string;
  description: string;
  featured?: boolean;
}

export const services: ServiceItem[] = [
  {
    icon: "code",
    title: "طراحی و توسعه نرم‌افزار اختصاصی",
    description:
      "طراحی سیستم‌های اختصاصی برای مدیریت فرایندها، فروش، مشتریان و عملیات داخلی کسب‌وکار شما.",
    featured: true,
  },
  {
    icon: "globe",
    title: "طراحی سایت و وب‌اپلیکیشن",
    description:
      "طراحی سایت و وب‌اپلیکیشن سریع، حرفه‌ای و آماده برای جذب لید، تبلیغات، فروش و توسعه آینده.",
  },
  {
    icon: "bot",
    title: "چت‌بات و اتوماسیون هوش مصنوعی",
    description:
      "ساخت چت‌بات، پاسخ‌گوی هوشمند و ابزارهای AI برای کاهش کار دستی، پاسخ سریع‌تر و اتوماسیون فرایندها.",
  },
  {
    icon: "users",
    title: "CRM و مدیریت مشتری",
    description:
      "ثبت، دسته‌بندی و پیگیری لیدها و مشتریان در یک سیستم منظم؛ بدون گم‌شدن فرصت‌های فروش.",
  },
  {
    icon: "chart",
    title: "پنل ادمین و داشبورد مدیریتی",
    description:
      "داشبوردهای مدیریتی برای دیدن فروش، سفارش‌ها، مشتریان، عملکرد تیم و گزارش‌های مهم در یک نگاه.",
  },
  {
    icon: "rocket",
    title: "MVP و محصول دیجیتال",
    description:
      "تبدیل ایده به نسخه اولیه قابل تست؛ سریع، تمیز و آماده برای جذب کاربر یا سرمایه‌گذاری.",
  },
];

export interface IndustryItem {
  icon: string;
  title: string;
  description: string;
  highlights: string[];
  relatedProject?: string;
}

export const industries: IndustryItem[] = [
  {
    icon: "stethoscope",
    title: "پزشکان و کلینیک‌ها",
    description:
      "طراحی سایت، نوبت‌دهی، فرم جذب بیمار، چت‌بات پاسخ‌گو و سیستم پیگیری مراجعه‌کننده.",
    highlights: [
      "سایت معرفی حرفه‌ای با فرم نوبت",
      "چت‌بات پاسخ به سؤالات پرتکرار",
      "CRM پیگیری بیمار و مراجع",
    ],
    relatedProject: "دکتر پوردست",
  },
  {
    icon: "building",
    title: "شرکت‌های خدماتی",
    description:
      "سایت شرکتی، فرم سفارش، CRM و داشبورد مدیریت برای پیگیری لید و فروش.",
    highlights: [
      "فرم‌های هوشمند جذب لید",
      "داشبورد فروش و گزارش لحظه‌ای",
      "اتوماسیون پیگیری مشتری",
    ],
  },
  {
    icon: "cart",
    title: "فروشگاه‌ها و برندهای آنلاین",
    description:
      "فروشگاه آنلاین، اتصال درگاه پرداخت، مدیریت سفارش و ابزارهای افزایش فروش.",
    highlights: [
      "فروشگاه با درگاه پرداخت",
      "پنل مدیریت سفارش",
      "گزارش فروش و موجودی",
    ],
  },
  {
    icon: "academy",
    title: "آموزشگاه‌ها و مراکز آموزشی",
    description:
      "ثبت‌نام آنلاین، پنل دانشجو، مدیریت دوره‌ها و اتوماسیون پیگیری ثبت‌نام.",
    highlights: [
      "ثبت‌نام آنلاین دوره‌ها",
      "پنل دانشجو و مدرس",
      "پیگیری خودکار ثبت‌نام",
    ],
  },
  {
    icon: "startup",
    title: "استارتاپ‌ها و محصولات دیجیتال",
    description:
      "ساخت MVP، توسعه محصول، اتصال API و زیرساخت قابل توسعه برای رشد سریع.",
    highlights: [
      "MVP قابل تست در ۲–۸ هفته",
      "معماری مقیاس‌پذیر",
      "اتصال API و سرویس‌های خارجی",
    ],
    relatedProject: "Emroz",
  },
  {
    icon: "handshake",
    title: "کسب‌وکارهای B2B",
    description:
      "پورتال مشتری، پنل سفارش، CRM اختصاصی و اتوماسیون فرایندهای فروش و پشتیبانی.",
    highlights: [
      "پورتال مشتری و سفارش",
      "CRM اختصاصی فروش",
      "اتوماسیون فرایند داخلی",
    ],
    relatedProject: "DeepinHQ",
  },
];

export interface SolutionItem {
  title: string;
  key: "web" | "arena" | "seo" | "bizcard";
  url: string;
  description: string;
  icon: string;
  cta: string;
  accent: string;
}

export const solutions: SolutionItem[] = [
  {
    title: "Araaye Web",
    key: "web",
    url: "/website-design",
    description:
      "طراحی سایت و وب‌اپلیکیشن حرفه‌ای برای جذب مشتری، فروش و رشد کسب‌وکار.",
    icon: "layers",
    cta: "مشاهده خدمات وب‌سایت",
    accent: "from-brand-500 to-brand-700",
  },
  {
    title: "هوش مصنوعی آرایه",
    key: "arena",
    url: "/ai",
    description:
      "دسترسی به ۵ مدل هوش مصنوعی (GPT، Gemini، Claude و…) با پرداخت تومان — بدون VPN، با امکان مقایسه و نبرد مدل‌ها.",
    icon: "network",
    cta: "۵ پرسش رایگان — شروع کن",
    accent: "from-violet-500 to-brand-600",
  },
  {
    title: "Araaye SEO",
    key: "seo",
    url: "/seo",
    description:
      "سئوی محلی و بهینه‌سازی نقشه گوگل برای دیده‌شدن در جستجوی محله و شهر، و جذب مشتری هدفمند.",
    icon: "searchCheck",
    cta: "بررسی رایگان سئوی محلی",
    accent: "from-cyan-500 to-brand-600",
  },
  {
    title: "Araaye BizCard",
    key: "bizcard",
    url: "#cta",
    description:
      "کارت ویزیت دیجیتال و لینک همه‌کاره برای معرفی حرفه‌ای، تماس سریع و دسترسی راحت‌تر.",
    icon: "scanLine",
    cta: "مشاوره رایگان",
    accent: "from-navy-700 to-brand-700",
  },
];

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export const processSteps: ProcessStep[] = [
  {
    number: "۰۱",
    title: "تحلیل نیاز",
    description:
      "هدف، فرایند، مشتری، مدل درآمدی و مشکل اصلی کسب‌وکار را بررسی می‌کنیم تا راهکار اشتباه نسازیم.",
  },
  {
    number: "۰۲",
    title: "طراحی راهکار",
    description:
      "مسیر کاربر، ساختار محصول، صفحات، پنل‌ها و امکانات اصلی را قبل از توسعه مشخص می‌کنیم.",
  },
  {
    number: "۰۳",
    title: "توسعه و اجرا",
    description:
      "پیاده‌سازی فنی، اتصال سرویس‌ها، تست، بهینه‌سازی و آماده‌سازی برای استفاده واقعی.",
  },
  {
    number: "۰۴",
    title: "رشد و پشتیبانی",
    description:
      "بعد از تحویل، مسیر بهبود، توسعه امکانات جدید، پشتیبانی و آماده‌سازی برای تبلیغات و فروش را ادامه می‌دهیم.",
  },
];

export interface WhyItem {
  title: string;
  description: string;
}

export const whyAraaye: WhyItem[] = [
  {
    title: "فقط سایت نمی‌سازیم؛ سیستم می‌سازیم",
    description:
      "محصولی که می‌سازیم بخشی از عملکرد کسب‌وکار شماست، نه فقط یک صفحه نمایشی.",
  },
  {
    title: "طراحی محصول + توسعه فنی در کنار هم",
    description:
      "از تجربه کاربری تا کد نهایی، همه چیز در یک تیم منسجم و هماهنگ.",
  },
  {
    title: "تمرکز روی نتیجه، نه فقط ظاهر",
    description:
      "هر بخش از محصول با هدف مشخص ساخته می‌شود: جذب بیشتر، فروش بهتر، هزینه کمتر.",
  },
  {
    title: "اتصال‌پذیر و یکپارچه",
    description:
      "فرم، پرداخت، CRM، AI، داشبورد و پشتیبانی می‌توانند در یک سیستم منسجم کنار هم کار کنند.",
  },
  {
    title: "مناسب کسب‌وکارهای در حال رشد",
    description:
      "سیستم‌هایی می‌سازیم که با رشد شما مقیاس‌پذیر باشند و جلوی شلوغی و دوباره‌کاری را بگیرند.",
  },
  {
    title: "قابل توسعه، نه مصرفی",
    description:
      "معماری تمیز و ماژولار، تا اضافه‌کردن امکانات جدید در آینده سریع‌تر و کم‌هزینه‌تر باشد.",
  },
];

export interface PortfolioItem {
  title: string;
  problem: string;
  solution: string;
  result: string;
  icon: string;
}

export const portfolio: PortfolioItem[] = [
  {
    title: "سیستم جذب لید برای پزشک",
    problem: "بیماران از کانال‌های مختلف تماس می‌گیرند و پیگیری ممکن نیست.",
    solution: "سایت با فرم نوبت‌دهی، چت‌بات پاسخ‌گو و اتصال به CRM.",
    result: "تماس‌ها در یک سیستم جمع می‌شود و پیگیری مراجعه‌کننده منظم می‌شود.",
    icon: "stethoscope",
  },
  {
    title: "سایت شرکتی با فرم فروش و CRM",
    problem: "لیدهای ورودی از سایت در یک جا جمع نمی‌شوند و فرصت فروش از دست می‌رود.",
    solution: "سایت شرکتی با فرم‌های هوشمند، اتصال مستقیم به CRM و داشبورد فروش.",
    result: "هر لید در سیستم ثبت می‌شود، تیم فروش پیگیری منظم دارد و گزارش لحظه‌ای.",
    icon: "building",
  },
  {
    title: "چت‌بات پاسخ‌گوی هوشمند",
    problem: "پاسخ به سؤالات تکراری مشتریان زمان زیادی از تیم می‌گیرد.",
    solution: "چت‌بات هوش مصنوعی با دانش اختصاصی کسب‌وکار، روی سایت و واتساپ.",
    result: "پاسخ فوری ۲۴ ساعته، کاهش بار پشتیبانی و هدایت خودکار به فروش.",
    icon: "bot",
  },
  {
    title: "داشبورد مدیریت سفارش و مشتری",
    problem: "سفارش‌ها در فایل‌های مختلف و پیام‌هایی پراکنده‌اند.",
    solution: "پنل مدیریتی اختصاصی برای ثبت سفارش، مدیریت مشتری و گزارش‌گیری.",
    result: "دید کامل روی فروش و سفارش‌ها، تصمیم‌گیری سریع‌تر و خطای کمتر.",
    icon: "chart",
  },
  {
    title: "لینک همه‌کاره و کارت ویزیت دیجیتال",
    problem: "معرفی خدمات و راه‌های تماس در یک جای حرفه‌ای جمع نمی‌شود.",
    solution: "کارت ویزیت دیجیتال با لینک‌های قابل تنظیم، فرم تماس و گالری.",
    result: "معرفی حرفه‌ای در یک لینک، دسترسی آسان مشتری و برند شخصی‌تر.",
    icon: "card",
  },
  {
    title: "وب‌اپلیکیشن اختصاصی برای تیم داخلی",
    problem: "فرایندهای داخلی تیم روی ابزارهای پراکنده و غیرمنظم انجام می‌شود.",
    solution: "وب‌اپلیکیشن اختصاصی با سطح دسترسی، اتوماسیون فرایند و گزارش.",
    result: "تیم سریع‌تر کار می‌کند، خطای انسانی کمتر و عملکرد قابل اندازه‌گیری.",
    icon: "rocket",
  },
];

export const companyMetrics = [
  { value: "+۴۰", label: "پروژه و محصول" },
  { value: "۲–۸", label: "هفته تا MVP" },
  { value: "۱ تیم", label: "از طراحی تا اجرا" },
];

export const testimonial = {
  quote:
    "تیم آرایه فقط سایت نساخت؛ سیستمی ساخت که فروش و پیگیری ما را منظم کرد. از ایده تا اجرا همراه بودند.",
  author: "مشتری B2B",
  role: "مدیرعامل شرکت خدماتی",
};

export interface ClientLogo {
  name: string;
  url?: string;
}

export const clientLogos: ClientLogo[] = [
  { name: "کلینیک سلامت" },
  { name: "امروز", url: "https://emroz.top" },
  { name: "دکتر پوردست" },
  { name: "امداد آهن" },
];

export type PortfolioPreviewKey = "deepinhq" | "emroz" | "shiva" | "pordast";

export interface PortfolioProject {
  name: string;
  key: PortfolioPreviewKey;
  url: string | null;
  category: string;
  description: string;
  result?: string;
  tags: string[];
  external: boolean;
  featured?: boolean;
  image?: string;
}

export const portfolioProjects: PortfolioProject[] = [
  {
    name: "DeepinHQ",
    key: "deepinhq",
    url: "https://deepinhq.com",
    category: "پلتفرم مالی و تحلیلی",
    description:
      "طراحی و توسعه محصول دیجیتال برای تحلیل مالی، داشبورد، مدیریت پورتفولیو و محتوای پژوهشی.",
    result: "محصول SaaS از صفر تا نسخه live با داشبورد تحلیلی",
    tags: ["SaaS", "Dashboard", "Finance"],
    external: true,
    featured: true,
    image: "/portfolio/deepinhq.png",
  },
  {
    name: "امروز",
    key: "emroz",
    url: "https://emroz.top",
    category: "محصول دیجیتال رشد فردی",
    description:
      "محصولی برای عادت‌سازی، کالری با هوش مصنوعی، بودجه و همراهی روزانه کاربر.",
    result: "MVP تا محصول قابل استفاده با AI assistant",
    tags: ["AI Assistant", "Digital Product", "Health"],
    external: true,
    image: "/portfolio/emroz.png",
  },
  {
    name: "شیوا اشرفی",
    key: "shiva",
    url: null,
    category: "وب‌سایت هنری و فروش آثار",
    description:
      "طراحی تجربه معرفی آثار، نمایش بهتر گالری و مسیر ساده‌تر برای مشاهده و سفارش.",
    tags: ["Art Website", "Portfolio"],
    external: false,
  },
  {
    name: "دکتر پوردست",
    key: "pordast",
    url: null,
    category: "حضور دیجیتال پزشکی",
    description:
      "طراحی مسیر معرفی حرفه‌ای، ارتباط راحت‌تر با بیمار و ساختار اعتمادساز برای خدمات پزشکی.",
    tags: ["Healthcare", "Website"],
    external: false,
  },
];

export interface FooterColumn {
  title: string;
  links: { label: string; url: string }[];
}

export const FOOTER_ADDRESS =
  "تهران، خیابان کارگر شمالی، خیابان فرشی مقدم (۱۶)، پارک علم و فناوری دانشگاه تهران";

export const FOOTER_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=%D8%AA%D9%87%D8%B1%D8%A7%D9%86+%D8%AE%DB%8C%D8%A7%D8%A8%D8%A7%D9%86+%DA%A9%D8%A7%D8%B1%DA%AF%D8%B1+%D8%B4%D9%85%D8%A7%D9%84%DB%8C+%D9%BE%D8%A7%D8%B1%DA%A9+%D8%B9%D9%84%D9%85+%D9%88+%D9%81%D9%86%D8%A7%D9%88%D8%B1%DB%8C+%D8%AF%D8%A7%D9%86%D8%B4%DA%AF%D8%A7%D9%87+%D8%AA%D9%87%D8%B1%D8%A7%D9%86";

export const footerColumns: FooterColumn[] = [
  {
    title: "شرکت آرایه",
    links: [
      { label: "درباره ما", url: "/about" },
      { label: "نمونه‌کارها", url: "/#real-portfolio" },
      { label: "خدمات آرایه", url: "/#services" },
      { label: "تماس با ما", url: "/contact" },
    ],
  },
  {
    title: "راهکارها",
    links: [
      { label: "طراحی سایت", url: "/website-design" },
      { label: "آرایه SEO", url: "/seo" },
      { label: "AdReady", url: "/adready" },
      { label: "پزشکان و کلینیک‌ها", url: "/doctors" },
      { label: "هوش مصنوعی آرایه", url: "/ai" },
      { label: "آرایه AI", url: "/ai" },
      { label: "مقایسه هوش مصنوعی", url: "/ai/compare" },
    ],
  },
  {
    title: "مسیرهای تخصصی",
    links: [
      { label: "سئو سایت پزشکان", url: "/seo/doctor" },
      { label: "سئو کلینیک", url: "/seo/clinic" },
      { label: "طراحی سایت پزشک", url: "/doctors" },
      { label: "طراحی سایت کلینیک", url: "/website/clinic" },
    ],
  },
  {
    title: "ارتباط",
    links: [
      { label: "شماره تماس: ۰۹۹۹۱۳۰۰۷۸۸", url: "tel:+98991300788" },
      { label: "ایمیل: support@araaye.com", url: "mailto:support@araaye.com" },
      { label: "اینستاگرام", url: "https://instagram.com/araayecom" },
      { label: "لینکدین", url: "https://www.linkedin.com/company/araaye" },
    ],
  },
];

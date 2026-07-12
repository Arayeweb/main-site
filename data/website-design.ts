export interface FaqItem {
  q: string;
  a: string;
}

export interface PortfolioItem {
  slug: string;
  name: string;
  industry: string;
  problem: string;
  outcome: string;
  image: string;
  href: string;
  external?: boolean;
  imagePosition?: string;
}

export const WEBSITE_DESIGN_PAGE = "/website-design";
export const LEAD_FORM_ID = "website-design-lead-form";
export const PORTFOLIO_SECTION_ID = "website-design-portfolio";

export const trustItems = [
  "طراحی اختصاصی",
  "بهینه برای موبایل",
  "آماده تبلیغات",
  "سئو پایه",
  "اتصال ابزارهای تحلیل",
] as const;

export const problems = [
  {
    title: "پیام نامشخص",
    description:
      "کاربر وارد سایت می‌شود اما سریع متوجه نمی‌شود کسب‌وکار چه کاری انجام می‌دهد و چرا باید اقدام کند.",
  },
  {
    title: "مسیر تبدیل ضعیف",
    description: "فرم، دکمه تماس و مسیر دریافت مشاوره به‌درستی طراحی نشده‌اند.",
  },
  {
    title: "تجربه موبایل نامناسب",
    description: "بخش زیادی از کاربران با موبایل وارد می‌شوند اما سایت برای صفحه کوچک بهینه نیست.",
  },
  {
    title: "نبود داده و اندازه‌گیری",
    description: "کسب‌وکار نمی‌داند کاربران از کجا آمده‌اند و در کدام مرحله از سایت خارج می‌شوند.",
  },
  {
    title: "دیده نشدن در گوگل",
    description:
      "بعضی سایت‌ها از نظر فنی برای گوگل آماده نیستند؛ ساختار صفحات، سرعت و پایه‌های لازم درست رعایت نشده. در نتیجه در جست‌وجو دیده نمی‌شوند و مشتری جدیدی وارد سایت نمی‌شود.",
  },
] as const;

export const solutionDeliverables = [
  "استراتژی ساختار صفحات",
  "طراحی رابط کاربری اختصاصی",
  "توسعه واکنش‌گرا",
  "فرم‌های جذب لید",
  "سئو فنی و پایه",
  "اتصال ابزارهای تحلیل",
] as const;

export const audienceGroups = [
  "پزشکان و کلینیک‌ها",
  "شرکت‌های خدماتی",
  "کسب‌وکارهای B2B",
  "برندهای محلی",
  "تیم‌های نرم‌افزاری",
  "کمپین‌ها و لندینگ‌پیج‌های تبلیغاتی",
] as const;

export const projectOutputCategories = [
  {
    title: "Strategy",
    titleFa: "استراتژی",
    items: [
      "بررسی کسب‌وکار و رقبا",
      "تعریف مخاطب هدف",
      "تعیین پیام اصلی",
      "طراحی ساختار صفحات",
      "تعیین مسیرهای اقدام",
    ],
  },
  {
    title: "Design",
    titleFa: "طراحی",
    items: [
      "طراحی رابط کاربری اختصاصی",
      "طراحی نسخه موبایل و دسکتاپ",
      "طراحی کامپوننت‌های اصلی",
      "هماهنگی با هویت برند",
      "بازبینی تجربه کاربری",
    ],
  },
  {
    title: "Development",
    titleFa: "توسعه",
    items: [
      "پیاده‌سازی واکنش‌گرا",
      "بهینه‌سازی سرعت",
      "فرم‌های تماس و جذب لید",
      "اتصال تماس، واتساپ یا ابزارهای موردنیاز",
      "ساخت صفحات اصلی پروژه",
    ],
  },
  {
    title: "Launch",
    titleFa: "انتشار",
    items: [
      "سئو فنی پایه",
      "تنظیم متادیتا",
      "اتصال ابزارهای تحلیل",
      "بررسی عملکرد صفحات",
      "راه‌اندازی روی دامنه و هاست",
    ],
  },
] as const;

export const websiteTypes = [
  {
    title: "سایت شرکتی و خدماتی",
    description: "برای معرفی خدمات، افزایش اعتبار و دریافت درخواست مشاوره یا تماس.",
  },
  {
    title: "سایت پزشک و کلینیک",
    description:
      "برای معرفی پزشک، خدمات درمانی، محتوای آموزشی و اتصال به سیستم نوبت‌دهی.",
  },
  {
    title: "لندینگ‌پیج تبلیغاتی",
    description: "برای کمپین‌های گوگل ادز، یکتانت، شبکه‌های اجتماعی و پیشنهادهای مشخص.",
    link: { href: "/adready", label: "مشاهده AdReady" },
  },
  {
    title: "سایت محصول و نرم‌افزار",
    description: "برای معرفی محصول، نمایش قابلیت‌ها، ثبت‌نام کاربران و اتصال به سیستم‌های نرم‌افزاری.",
    link: { href: "/software", label: "مشاهده Software" },
  },
] as const;

export const processSteps = [
  {
    id: "discovery",
    shortLabel: "شناخت",
    title: "شناخت کسب‌وکار",
    description:
      "درباره خدمات، مشتریان، هدف سایت و نمونه‌های موردعلاقه شما صحبت می‌کنیم.",
    deliverable: "شرح پروژه، فهرست نیازها و محدوده همکاری",
  },
  {
    id: "structure",
    shortLabel: "ساختار",
    title: "محتوا و ساختار سایت",
    description:
      "صفحه‌های لازم، ترتیب اطلاعات، متن‌ها، تصاویر و مسیر حرکت مشتری مشخص می‌شوند.",
    deliverable: "نقشه سایت، فهرست صفحات و موارد موردنیاز از شما",
  },
  {
    id: "design",
    shortLabel: "طراحی",
    title: "طراحی ظاهر سایت",
    description:
      "صفحه اصلی و صفحات مهم طراحی می‌شوند و قبل از ساخت، برای تأیید نمایش داده می‌شوند.",
    deliverable: "طرح تأییدشده دسکتاپ و موبایل",
  },
  {
    id: "build",
    shortLabel: "ساخت",
    title: "ساخت و اتصال امکانات",
    description:
      "طرح به سایت واقعی تبدیل می‌شود؛ فرم‌ها، راه‌های تماس، نوبت‌دهی و ابزارهای لازم متصل می‌شوند.",
    deliverable: "نسخه آزمایشی قابل بررسی",
  },
  {
    id: "launch",
    shortLabel: "انتشار",
    title: "آزمایش و انتشار",
    description:
      "نمایش موبایل، سرعت، فرم‌ها، لینک‌ها و تنظیمات پایه گوگل بررسی می‌شوند؛ سپس سایت روی دامنه اصلی منتشر می‌شود.",
    deliverable: "سایت منتشرشده، دسترسی‌ها و فایل‌های تحویل",
  },
  {
    id: "support",
    shortLabel: "پشتیبانی",
    title: "پشتیبانی پس از تحویل",
    description:
      "ایرادهای مربوط به اجرای پروژه در مدت مشخص‌شده قرارداد برطرف می‌شوند. تغییرات و توسعه‌های جدید جداگانه بررسی می‌شوند.",
    deliverable: "تحویل نهایی و مسیر پشتیبانی مشخص",
  },
] as const;

export const portfolioItems: PortfolioItem[] = [
  {
    slug: "shiva-hearing",
    name: "کلینیک شنوایی شیوا",
    industry: "کلینیک شنوایی و سمعک",
    problem: "نیاز به معرفی خدمات شنوایی و دریافت درخواست مشاوره آنلاین.",
    outcome: "ساختار سایت خدماتی با مسیر تماس و نمایش خدمات.",
    image: "/showcase-assets/shiva/hero.jpg",
    href: "/showcase/shiva-hearing",
  },
  {
    slug: "kaveh-iron",
    name: "آهن کاوه",
    industry: "فروش آهن‌آلات",
    problem: "نیاز به لندینگ متمرکز برای استعلام قیمت در مسیر فروش.",
    outcome: "صفحه فروش با فرم درخواست قیمت و معرفی محصولات.",
    image: "/showcase-assets/kaveh/hero.jpg",
    href: "/showcase/kaveh-iron",
  },
  {
    slug: "medisa-studio",
    name: "استودیو معماری مدیسا",
    industry: "معماری و طراحی داخلی",
    problem: "نیاز به نمایش نمونه‌کارها و دریافت اطلاعات پروژه‌های جدید.",
    outcome: "وب‌سایت تصویرمحور با مسیر ثبت درخواست پروژه.",
    image: "/showcase-assets/medisa/hero.jpg",
    href: "/showcase/medisa-studio",
  },
  {
    slug: "emroz",
    name: "امروز",
    industry: "محصول دیجیتال",
    problem: "نیاز به معرفی محصول و مسیر شروع استفاده برای کاربر جدید.",
    outcome: "لندینگ محصول با ساختار معرفی و ثبت‌نام.",
    image: "/portfolio/emroz.png",
    href: "https://emroz.top/landing",
    external: true,
  },
  {
    slug: "deepinhq",
    name: "DeepinHQ",
    industry: "پلتفرم SaaS مالی",
    problem: "نیاز به معرفی محصول نرم‌افزاری و نمایش قابلیت‌های اصلی.",
    outcome: "سایت محصول با ساختار معرفی و ثبت‌نام.",
    image: "/portfolio/deepinhq.png",
    href: "https://deepinhq.com",
    external: true,
  },
  {
    slug: "pourdast",
    name: "سایت مطب عالیه پوردست",
    industry: "خدمات پزشکی",
    problem: "نیاز به معرفی حرفه‌ای پزشک و مسیر تماس برای بیمار.",
    outcome: "سایت پزشکی با ساختار اعتمادساز و اطلاعات خدمات.",
    image: "/showcase-assets/pourdast/portrait.webp",
    imagePosition: "center 58%",
    href: "https://aliehpourdast.com",
    external: true,
  },
];

export interface WebsiteDesignPricingPlan {
  id: string;
  title: string;
  audience: string;
  features: readonly string[];
  priceFrom: number;
  timeline: string;
  revisions: string;
  support: string;
}

export const websiteDesignPricingPlans: WebsiteDesignPricingPlan[] = [
  {
    id: "business",
    title: "سایت معرفی کسب‌وکار",
    audience: "مناسب پزشکان، کلینیک‌ها، شرکت‌ها و کسب‌وکارهای خدماتی.",
    features: [
      "صفحه اصلی",
      "معرفی خدمات",
      "درباره ما",
      "تماس و فرم درخواست",
      "نمایش درست در موبایل",
      "تنظیمات پایه گوگل",
    ],
    priceFrom: 25_000_000,
    timeline: "۳ تا ۵ هفته",
    revisions: "۲ دور اصلاح",
    support: "۱ ماه پشتیبانی فنی",
  },
  {
    id: "professional",
    title: "سایت حرفه‌ای و محتوایی",
    audience: "مناسب کسب‌وکارهایی با چند خدمت، مقاله و مسیرهای تماس متفاوت.",
    features: [
      "صفحات خدمات اختصاصی",
      "وبلاگ یا مقالات",
      "فرم‌های پیشرفته‌تر",
      "اتصال ابزارهای آمار",
      "ساختار آماده توسعه و SEO",
      "مدیریت محتوا در صورت نیاز",
    ],
    priceFrom: 45_000_000,
    timeline: "۵ تا ۸ هفته",
    revisions: "۳ دور اصلاح",
    support: "۲ ماه پشتیبانی فنی",
  },
  {
    id: "shop",
    title: "فروشگاه آنلاین",
    audience: "مناسب فروش محصول و دریافت سفارش اینترنتی.",
    features: [
      "محصولات و دسته‌بندی‌ها",
      "جست‌وجو و فیلتر",
      "سبد خرید",
      "درگاه پرداخت",
      "مدیریت سفارش",
      "پنل مدیریت محصول",
    ],
    priceFrom: 80_000_000,
    timeline: "۸ تا ۱۲ هفته",
    revisions: "۳ دور اصلاح",
    support: "۲ ماه پشتیبانی فنی",
  },
] as const;

export const websiteDesignPricingExtras = {
  domainHosting:
    "دامنه و هاست سالانه جداگانه محاسبه می‌شود؛ در صورت نیاز، انتخاب و راه‌اندازی اولیه در محدوده پروژه قرار می‌گیرد.",
  contentProduction:
    "تولید متن، عکاسی، ویدیو و ورود محصول به‌صورت جداگانه برآورد می‌شود؛ در صورت آماده‌بودن محتوا از سمت شما، هزینه کاهش می‌یابد.",
  separateFeatures: [
    "اتصال به CRM یا نرم‌افزارهای اختصاصی",
    "چندزبانه‌سازی",
    "پنل مدیریت پیشرفته",
    "سئو و تولید محتوای مستمر",
    "نگهداری و توسعه پس از پشتیبانی اولیه",
  ],
} as const;

export function formatWebsiteDesignPrice(n: number): string {
  if (n >= 1_000_000) {
    const millions = n / 1_000_000;
    const fa = millions.toLocaleString("en-US").replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
    return `${fa} میلیون`;
  }
  return n.toLocaleString("en-US").replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export const technologies = [
  "Static HTML/CSS/JavaScript",
  "WordPress",
  "Next.js",
  "Custom web application",
] as const;

export const projectTypeOptions = [
  "سایت شرکتی",
  "سایت پزشک یا کلینیک",
  "لندینگ‌پیج",
  "سایت محصول",
  "بازطراحی سایت",
  "مطمئن نیستم",
] as const;

export const mainGoalOptions = [
  "دریافت لید",
  "افزایش اعتبار",
  "فروش",
  "تبلیغات",
  "سئو",
  "معرفی محصول",
  "سایر",
] as const;

export const websiteDesignFaq: FaqItem[] = [
  {
    q: "طراحی سایت چقدر زمان می‌برد؟",
    a: "زمان اجرا به تعداد صفحات، سطح طراحی، آماده‌بودن محتوا و امکانات موردنیاز بستگی دارد و پس از بررسی پروژه اعلام می‌شود.",
  },
  {
    q: "سایت با وردپرس ساخته می‌شود یا اختصاصی؟",
    a: "فناوری پروژه بر اساس نیاز کسب‌وکار انتخاب می‌شود. ممکن است سایت به‌صورت استاتیک، وردپرسی، Next.js یا با ساختار اختصاصی اجرا شود.",
  },
  {
    q: "آیا سایت روی موبایل درست نمایش داده می‌شود؟",
    a: "بله، طراحی واکنش‌گرا و بررسی نمایش صفحات در اندازه‌های مختلف بخشی از روند توسعه است.",
  },
  {
    q: "آیا سئو هم همراه طراحی سایت انجام می‌شود؟",
    a: "زیرساخت‌های فنی و سئو پایه هنگام طراحی رعایت می‌شوند. تولید مستمر محتوا و اجرای کامل سئو در راهکار مستقل SEO آرایه ارائه می‌شود.",
  },
  {
    q: "محتوای سایت را چه کسی آماده می‌کند؟",
    a: "محتوا می‌تواند توسط کارفرما ارائه شود یا بر اساس توافق، ساختار و متن اولیه صفحات توسط تیم آرایه آماده شود.",
  },
  {
    q: "بعداً می‌توان صفحات جدید اضافه کرد؟",
    a: "بله، ساختار سایت با توجه به نیازهای آینده طراحی می‌شود؛ بااین‌حال نحوه افزودن صفحات به فناوری انتخاب‌شده بستگی دارد.",
  },
  {
    q: "دامنه و هاست هم تهیه می‌کنید؟",
    a: "در صورت نیاز، انتخاب دامنه، هاست و راه‌اندازی اولیه می‌تواند در محدوده پروژه قرار بگیرد.",
  },
  {
    q: "چطور درخواست طراحی سایت ثبت کنم؟",
    a: "فرم پایین صفحه را تکمیل کنید تا نیاز پروژه بررسی و برای ادامه مسیر با شما تماس گرفته شود.",
  },
];

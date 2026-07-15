// داده‌های صفحه سئوی آرایه — پکیج‌ها، محتوا، FAQ و کپی.

export type SeoPackageKey =
  | "audit"
  | "gmap"
  | "local"
  | "growth"
  | "pro"
  | "enterprise";

export interface SeoPackage {
  key: SeoPackageKey;
  name: string;
  price: number;
  pricePeriod: "once" | "month";
  pricePrefix?: "from";
  checkoutEnabled: boolean;
  description: string;
  suitableFor?: string;
  recommendedDuration?: string;
  features: string[];
  notIncluded?: string[];
  initialSetup?: string[];
  monthlyScope?: string[];
  popular?: boolean;
  badge?: string;
  ctaLabel: string;
  disclaimer?: string;
}

export const seoPackages: SeoPackage[] = [
  {
    key: "audit",
    name: "تحلیل تخصصی سئو",
    price: 6_900_000,
    pricePeriod: "once",
    checkoutEnabled: true,
    description:
      "کسب‌وکاری که قبل از قرارداد ماهانه به تحلیل دقیق و برنامه اجرایی نیاز دارد.",
    features: [
      "Technical SEO Audit",
      "بررسی Search Console در صورت دسترسی",
      "تحلیل اولیه رقبا",
      "تحقیق اولیه کلمات کلیدی",
      "بررسی صفحات فعلی",
      "بررسی Local SEO",
      "بررسی مسیر تبدیل",
      "برنامه اجرایی ۹۰ روزه",
      "جلسه ارائه گزارش",
    ],
    ctaLabel: "درخواست تحلیل تخصصی",
  },
  {
    key: "gmap",
    name: "حضور در گوگل",
    price: 2_900_000,
    pricePeriod: "once",
    checkoutEnabled: true,
    description: "کسب‌وکاری که فقط به ثبت، بررسی یا تکمیل اطلاعات Google Maps نیاز دارد.",
    disclaimer: "این خدمت جایگزین سئوی کامل سایت نیست.",
    features: [
      "بررسی وضعیت فعلی",
      "تکمیل اطلاعات کسب‌وکار",
      "دسته‌بندی",
      "ساعات کاری",
      "تصاویر و راه‌های ارتباطی",
      "گزارش نهایی",
    ],
    ctaLabel: "درخواست ثبت در گوگل",
  },
  {
    key: "local",
    name: "Local SEO",
    price: 8_900_000,
    pricePeriod: "month",
    checkoutEnabled: true,
    badge: "مناسب کسب‌وکار محلی",
    recommendedDuration: "حداقل ۳ ماه برای ارزیابی منطقی روند",
    suitableFor:
      "پزشکان، کلینیک‌ها، فروشگاه‌ها و کسب‌وکارهای محلی با یک شعبه یا محدوده اصلی.",
    description: "تمرکز روی یک شهر یا محدوده و حداکثر ۲ خدمت اصلی.",
    monthlyScope: [
      "تمرکز روی یک شهر یا محدوده اصلی",
      "حداکثر ۲ خدمت اصلی",
      "بررسی و بهبود Google Business Profile",
      "تحقیق کلمات محلی",
      "ساخت یا بهینه‌سازی حداکثر ۲ صفحه خدمات یا محلی",
      "هماهنگ‌سازی اطلاعات تماس",
      "بهبود مسیر تماس و مسیریابی",
      "برنامه دریافت نظر واقعی مشتری",
      "بررسی وضعیت نمایش در نقشه",
      "گزارش ماهانه",
    ],
    notIncluded: [
      "سئوی گسترده سایت",
      "تولید مستمر مقالات",
      "لینک‌سازی گسترده",
      "چند شعبه یا چند شهر",
      "اصلاحات فنی پیچیده",
    ],
    features: [
      "Google Business Profile",
      "تحقیق کلمات محلی",
      "حداکثر ۲ صفحه خدمات یا محلی",
      "بهبود مسیر تماس",
      "گزارش ماهانه",
    ],
    ctaLabel: "شروع Local SEO",
  },
  {
    key: "growth",
    name: "SEO Growth",
    price: 17_900_000,
    pricePeriod: "month",
    checkoutEnabled: true,
    popular: true,
    badge: "پیشنهاد آرایه برای شروع سئوی کامل",
    recommendedDuration: "حداقل ۴ تا ۶ ماه برای ارزیابی منطقی روند",
    suitableFor:
      "سایت‌های شرکتی و خدماتی که می‌خواهند برای چند خدمت ورودی و لید هدفمند بگیرند.",
    description: "سئوی کامل با تمرکز روی یک خوشه اصلی خدمات.",
    initialSetup: [
      "Technical Audit",
      "تحلیل رقبا",
      "تحقیق کلمات کلیدی",
      "Keyword Mapping",
      "برنامه اجرایی ۹۰ روزه",
      "بررسی Analytics و Search Console",
    ],
    monthlyScope: [
      "تمرکز روی یک خوشه اصلی خدمات",
      "حداکثر ۲ خروجی محتوایی یا صفحه‌ای در ماه",
      "بهینه‌سازی حداکثر ۵ صفحه موجود",
      "رفع مشکلات فنی اولویت‌دار در محدوده معمول SEO",
      "لینک‌سازی داخلی",
      "On-page SEO",
      "Content Brief",
      "Local SEO در صورت نیاز",
      "بررسی CTA و مسیر تبدیل",
      "گزارش ماهانه KPIها",
      "برنامه اجرایی ماه بعد",
    ],
    features: [
      "تحلیل فنی کامل اولیه",
      "حداکثر ۲ خروجی محتوایی در ماه",
      "بهینه‌سازی ۵ صفحه موجود",
      "Technical SEO استاندارد",
      "گزارش KPI ماهانه",
    ],
    ctaLabel: "شروع SEO Growth",
  },
  {
    key: "pro",
    name: "SEO Pro",
    price: 29_900_000,
    pricePeriod: "month",
    checkoutEnabled: true,
    badge: "برای بازار رقابتی",
    recommendedDuration: "حداقل ۶ ماه برای بازارهای رقابتی",
    suitableFor:
      "کسب‌وکارهایی با چند خدمت، چند دسته، رقابت بیشتر یا نیاز جدی به رشد ارگانیک.",
    description: "اجرای پیشرفته‌تر برای بازارهای رقابتی.",
    initialSetup: [
      "Full Technical Audit",
      "Competitor Gap Analysis",
      "Advanced Keyword Research",
      "Keyword Clustering",
      "Site Architecture review",
      "Analytics and Conversion Tracking review",
      "90-day strategy",
    ],
    monthlyScope: [
      "تمرکز روی حداکثر ۲ خوشه خدمات یا محصول",
      "حداکثر ۴ خروجی محتوایی یا صفحه‌ای در ماه",
      "بهینه‌سازی حداکثر ۱۰ صفحه موجود",
      "Technical SEO پیشرفته‌تر",
      "Schema implementation within normal project scope",
      "لینک‌سازی داخلی گسترده",
      "Content pruning and refresh",
      "برنامه Off-page و رپورتاژ",
      "تحلیل بک‌لینک رقبا",
      "Local SEO در صورت نیاز",
      "CRO review for priority landing pages",
      "AI Search and entity optimization",
      "گزارش ماهانه کامل",
      "جلسه ماهانه هماهنگی",
    ],
    features: [
      "تحلیل فنی پیشرفته",
      "حداکثر ۴ خروجی محتوایی در ماه",
      "بهینه‌سازی ۱۰ صفحه موجود",
      "Off-page و CRO",
      "جلسه ماهانه هماهنگی",
    ],
    ctaLabel: "شروع SEO Pro",
  },
  {
    key: "enterprise",
    name: "SEO Enterprise",
    price: 44_900_000,
    pricePeriod: "month",
    pricePrefix: "from",
    checkoutEnabled: false,
    suitableFor:
      "فروشگاه‌های بزرگ، سایت‌های صدها یا هزاران صفحه، چند شعبه، marketplace، programmatic SEO، پروژه‌های چندزبانه.",
    description:
      "پس از تحلیل اولیه، محدوده کار، ظرفیت اجرایی، KPIها و هزینه دقیق مشخص می‌شود.",
    features: [
      "Crawl and index management at scale",
      "Faceted navigation SEO",
      "Product and category SEO",
      "Programmatic SEO",
      "International SEO",
      "Multi-location SEO",
      "Advanced CRO",
      "Dedicated reporting",
    ],
    ctaLabel: "دریافت پیشنهاد اختصاصی",
  },
];

export const seoAuditDeductionNote =
  "در صورت شروع قرارداد ماهانه حداکثر تا ۷ روز پس از تحویل تحلیل، مبلغ تحلیل از هزینه ماه اول کسر می‌شود.";

export const seoOffPageDisclaimer =
  "هزینه رپورتاژ، انتشار رسانه‌ای، تبلیغات، بک‌لینک پولی و ابزارهای پریمیوم درخواستی مشتری جدا از پکیج ماهانه است.";

export const seoTechnicalDisclaimer =
  "اصلاحات بزرگ برنامه‌نویسی، طراحی مجدد یا زیرساختی جداگانه برآورد می‌شوند.";

export const seoContentOutputNote =
  "هر خروجی می‌تواند یکی از این موارد باشد: صفحه خدمات جدید، لندینگ جدید، مقاله جدید، بازنویسی صفحه موجود یا به‌روزرسانی عمده محتوا.";

export const seoPricingDisclaimers = [
  "رتبه اول گوگل تضمین نمی‌شود.",
  "نتیجه سئو به وضعیت سایت، رقابت، سابقه دامنه و استمرار اجرا بستگی دارد.",
  "هزینه رپورتاژ، رسانه و تبلیغات جداگانه است.",
  "اصلاحات بزرگ برنامه‌نویسی، طراحی مجدد یا زیرساختی جداگانه برآورد می‌شوند.",
  "تعداد خروجی‌ها سقف ظرفیت ماهانه است و براساس اولویت پروژه بین صفحه جدید، بازنویسی، محتوا و اصلاحات تقسیم می‌شود.",
  "انتشار محتوا به تأیید به‌موقع کارفرما وابسته است.",
  "هیچ بسته‌ای شامل خرید انبوه بک‌لینک یا تولید محتوای بی‌هدف نیست.",
];

export interface SeoProblem {
  title: string;
  description: string;
}

export const seoProblems: SeoProblem[] = [
  {
    title: "بازدید می‌آید، لید نمی‌آید",
    description:
      "سایت از گوگل ورودی دارد ولی تماس، فرم یا رزرو ندارد — چون بعد از ورود، مسیری برای اقدام طراحی نشده.",
  },
  {
    title: "صفحه‌ای که گوگل می‌خواهد، وجود ندارد",
    description:
      "مشتری «دکتر پوست سعادت‌آباد» جستجو می‌کند؛ شما صفحه «خدمات ما» دارید. این دو به هم نمی‌رسند.",
  },
  {
    title: "مشکلات فنی مانع ایندکس می‌شوند",
    description:
      "خطاهای crawl، سرعت پایین، ساختار URL ضعیف یا مشکلات موبایل باعث می‌شوند گوگل سایت را درست نبیند.",
  },
  {
    title: "آژانس فقط رتبه گزارش می‌کند",
    description:
      "گزارش ماهانه پر از کلمه و رتبه است — ولی نمی‌گوید چند تماس، چند فرم و چند مشتری از گوگل آمده.",
  },
];

export interface SeoServiceCard {
  num: number;
  title: string;
  description: string;
  includes: string[];
  note?: string;
}

export const seoServiceCards: SeoServiceCard[] = [
  {
    num: 1,
    title: "تحلیل کسب‌وکار و رقبا",
    description:
      "قبل از اجرای سئو مشخص می‌کنیم کدام جست‌وجوها واقعاً می‌توانند به تماس، سفارش یا فروش منجر شوند.",
    includes: [
      "شناخت خدمات و مدل درآمدی",
      "بررسی بازار و رقبای جست‌وجویی",
      "تحلیل وضعیت فعلی سایت",
      "شناسایی فرصت‌های سریع و بلندمدت",
      "تعیین اولویت خدمات و صفحات",
    ],
  },
  {
    num: 2,
    title: "تحقیق کلمات کلیدی و استراتژی",
    description:
      "برای هر گروه از جست‌وجوها، صفحه و هدف مشخص تعریف می‌شود تا صفحات سایت با یکدیگر رقابت نکنند.",
    includes: [
      "تحقیق کلمات کلیدی",
      "تحلیل Search Intent",
      "خوشه‌بندی کلمات",
      "Keyword Mapping",
      "تعیین صفحات هدف",
      "طراحی معماری محتوا",
      "برنامه اجرایی ۹۰ روزه",
    ],
  },
  {
    num: 3,
    title: "Technical SEO",
    description:
      "مشکلاتی را که مانع درک، خزش و ایندکس درست سایت توسط گوگل می‌شوند، شناسایی و اولویت‌بندی می‌کنیم.",
    includes: [
      "بررسی Crawl و Index",
      "Google Search Console",
      "XML Sitemap",
      "robots.txt",
      "Canonical",
      "Redirect و خطاهای 404",
      "Core Web Vitals",
      "سرعت صفحات",
      "نسخه موبایل",
      "Structured Data و Schema",
      "ساختار URL",
      "بررسی مشکلات JavaScript SEO",
      "بررسی امنیت و HTTPS",
      "رفع لینک‌های شکسته",
      "بررسی بودجه خزش برای سایت‌های بزرگ",
    ],
    note: seoTechnicalDisclaimer,
  },
  {
    num: 4,
    title: "On-page SEO",
    description:
      "هر صفحه باید هم پاسخ مناسبی برای جست‌وجوی کاربر داشته باشد و هم او را به اقدام بعدی هدایت کند.",
    includes: [
      "بهینه‌سازی صفحات فعلی",
      "عنوان و Meta Description",
      "ساختار Heading",
      "بهینه‌سازی تصاویر",
      "لینک‌سازی داخلی",
      "بهبود محتوای ضعیف",
      "رفع Keyword Cannibalization",
      "بهبود صفحات دسته‌بندی، محصول و خدمات",
      "بهینه‌سازی CTA و مسیر اقدام",
    ],
  },
  {
    num: 5,
    title: "Content SEO",
    description:
      "محتوا براساس نیاز کسب‌وکار و هدف جست‌وجو ساخته می‌شود، نه صرفاً برای افزایش تعداد مقاله.",
    includes: [
      "استراتژی محتوا",
      "تقویم محتوایی",
      "صفحات خدمات",
      "صفحات دسته‌بندی",
      "صفحات محلی",
      "مقالات راهنما",
      "به‌روزرسانی محتوای قدیمی",
      "Content Brief",
      "کنترل کیفیت محتوا",
      "لینک‌سازی محتوایی",
    ],
    note: seoContentOutputNote,
  },
  {
    num: 6,
    title: "Off-page SEO و اعتبار",
    description:
      "برای افزایش اعتبار سایت، برنامه‌ای متناسب با بازار و رقبا طراحی می‌کنیم؛ بدون خرید انبوه لینک‌های بی‌کیفیت.",
    includes: [
      "تحلیل اعتبار دامنه",
      "بررسی بک‌لینک‌های فعلی",
      "شناسایی لینک‌های مخرب",
      "برنامه Link Building",
      "برنامه رپورتاژ",
      "Brand Mention opportunities",
      "Digital PR recommendations",
      "Competitor backlink analysis",
      "E-E-A-T signals",
    ],
    note: seoOffPageDisclaimer,
  },
  {
    num: 7,
    title: "Local SEO و Google Maps",
    description:
      "برای کسب‌وکارهایی که مشتریانشان براساس شهر، منطقه یا موقعیت جغرافیایی جست‌وجو می‌کنند.",
    includes: [
      "Google Business Profile review",
      "دسته‌بندی کسب‌وکار",
      "نام، آدرس و شماره تماس",
      "ساعات کاری",
      "تصاویر و اطلاعات خدمات",
      "صفحات محلی",
      "Local Keyword Research",
      "هماهنگی اطلاعات سایت و نقشه",
      "مسیر دریافت نظر واقعی مشتری",
      "بررسی تماس و مسیریابی",
    ],
  },
  {
    num: 8,
    title: "Analytics، CRO و AI Search",
    description:
      "فقط رتبه و بازدید را گزارش نمی‌کنیم؛ بررسی می‌کنیم ورودی گوگل چه رفتاری دارد و آیا به تماس و درخواست نزدیک می‌شود یا نه.",
    includes: [
      "Google Analytics",
      "Google Search Console",
      "Conversion Tracking",
      "اندازه‌گیری فرم و تماس",
      "بررسی CTA",
      "بررسی مسیر تبدیل",
      "گزارش Impression، Click و CTR",
      "گزارش صفحات و کلمات کلیدی",
      "بهینه‌سازی ساختار محتوا برای AI Search",
      "Entity clarity",
      "Structured answers and FAQ",
      "بررسی قابلیت استناد محتوا توسط موتورهای پاسخ‌گو",
    ],
  },
];

export const seoDeliverables = [
  "گزارش تحلیل اولیه سایت",
  "نقشه کلمات کلیدی و صفحات هدف",
  "برنامه اجرایی اولویت‌بندی‌شده",
  "فهرست اصلاحات فنی",
  "صفحات ساخته یا بهینه‌شده",
  "برنامه محتوایی",
  "گزارش اقدامات انجام‌شده",
  "گزارش KPIهای ماهانه",
  "برنامه ماه بعد",
];

export interface SeoSampleDeliverable {
  title: string;
  preview: string;
  type: "audit" | "keyword" | "brief" | "pages" | "report" | "conversion";
}

export const seoSampleDeliverables: SeoSampleDeliverable[] = [
  {
    title: "نمونه Technical Audit",
    preview: "فهرست اولویت‌بندی‌شده مشکلات crawl، index، سرعت و schema",
    type: "audit",
  },
  {
    title: "نمونه Keyword Map",
    preview: "خوشه کلمات، صفحه هدف و intent برای هر جست‌وجو",
    type: "keyword",
  },
  {
    title: "نمونه Content Brief",
    preview: "هدف صفحه، ساختار heading، سوالات کاربر و CTA",
    type: "brief",
  },
  {
    title: "نمونه ساختار صفحات خدمات",
    preview: "معماری صفحات خدمت، محلی و دسته‌بندی",
    type: "pages",
  },
  {
    title: "نمونه گزارش ماهانه",
    preview: "کارهای انجام‌شده، KPIها و اولویت ماه بعد",
    type: "report",
  },
  {
    title: "نمونه Conversion Tracking",
    preview: "مسیر تماس، فرم و کلیک از جست‌وجو",
    type: "conversion",
  },
];

export interface SeoExecutionPhase {
  num: number;
  title: string;
  time: string;
  tasks: string[];
  output: string;
}

export const seoExecutionPhases: SeoExecutionPhase[] = [
  {
    num: 1,
    title: "تحلیل و پایه‌گذاری",
    time: "هفته اول و دوم",
    tasks: [
      "شناخت کسب‌وکار",
      "تحلیل رقبا",
      "Technical Audit",
      "تحقیق کلمات کلیدی",
      "اتصال یا بررسی ابزارهای اندازه‌گیری",
      "مشخص‌کردن KPIها",
    ],
    output: "گزارش تحلیل + نقشه مسیر",
  },
  {
    num: 2,
    title: "اصلاحات و صفحات اولویت‌دار",
    time: "هفته سوم و چهارم",
    tasks: [
      "اصلاح مشکلات مهم فنی",
      "بهینه‌سازی صفحات اصلی",
      "اصلاح ساختار داخلی",
      "ساخت صفحات خدمات ضروری",
      "بهبود CTA و مسیر تماس",
    ],
    output: "نسخه بهینه‌شده صفحات اولویت‌دار",
  },
  {
    num: 3,
    title: "توسعه محتوا و اعتبار",
    time: "ماه دوم",
    tasks: [
      "انتشار یا بازنویسی محتوای هدفمند",
      "توسعه صفحات خدمات و محلی",
      "لینک‌سازی داخلی",
      "برنامه Off-page",
      "بهبود E-E-A-T",
    ],
    output: "توسعه پوشش جست‌وجویی سایت",
  },
  {
    num: 4,
    title: "تحلیل و رشد مستمر",
    time: "از ماه سوم",
    tasks: [
      "بررسی داده‌های Search Console",
      "تحلیل رتبه، کلیک و CTR",
      "بررسی فرم، تماس و لید",
      "بهبود صفحات دارای فرصت",
      "اصلاح برنامه ماه بعد",
    ],
    output: "گزارش عملکرد + برنامه مرحله بعد",
  },
];

export const seoExecutionDisclaimer =
  "زمان دقیق اجرا به وضعیت سایت، سطح رقابت، سرعت تأیید محتوا و میزان اصلاحات فنی بستگی دارد.";

export interface SeoPackageCompareRow {
  label: string;
  local: string;
  growth: string;
  pro: string;
  enterprise: string;
}

export const seoPackageCompareRows: SeoPackageCompareRow[] = [
  {
    label: "نوع کسب‌وکار",
    local: "محلی",
    growth: "شرکتی / خدماتی",
    pro: "چندخدمتی / رقابتی",
    enterprise: "اختصاصی",
  },
  {
    label: "تحلیل فنی",
    local: "محدود",
    growth: "کامل اولیه",
    pro: "پیشرفته",
    enterprise: "اختصاصی",
  },
  {
    label: "تحقیق کلمات",
    local: "محلی",
    growth: "دارد",
    pro: "پیشرفته",
    enterprise: "اختصاصی",
  },
  {
    label: "تعداد خوشه هدف",
    local: "یک محدوده",
    growth: "۱",
    pro: "حداکثر ۲",
    enterprise: "اختصاصی",
  },
  {
    label: "خروجی صفحه یا محتوا",
    local: "حداکثر ۲",
    growth: "حداکثر ۲",
    pro: "حداکثر ۴",
    enterprise: "اختصاصی",
  },
  {
    label: "بهینه‌سازی صفحات فعلی",
    local: "—",
    growth: "حداکثر ۵",
    pro: "حداکثر ۱۰",
    enterprise: "اختصاصی",
  },
  {
    label: "Technical SEO",
    local: "پایه",
    growth: "استاندارد",
    pro: "پیشرفته",
    enterprise: "اختصاصی",
  },
  {
    label: "Local SEO",
    local: "کامل",
    growth: "در صورت نیاز",
    pro: "دارد",
    enterprise: "اختصاصی",
  },
  {
    label: "Off-page strategy",
    local: "ندارد",
    growth: "برنامه اولیه",
    pro: "برنامه کامل",
    enterprise: "اختصاصی",
  },
  {
    label: "CRO",
    local: "بررسی مسیر تماس",
    growth: "پایه",
    pro: "دارد",
    enterprise: "اختصاصی",
  },
  {
    label: "AI Search",
    local: "ندارد",
    growth: "پایه",
    pro: "دارد",
    enterprise: "اختصاصی",
  },
  {
    label: "گزارش ماهانه",
    local: "دارد",
    growth: "دارد",
    pro: "کامل",
    enterprise: "اختصاصی",
  },
  {
    label: "جلسه هماهنگی",
    local: "در صورت نیاز",
    growth: "دوره‌ای",
    pro: "ماهانه",
    enterprise: "اختصاصی",
  },
  {
    label: "زمان پیشنهادی همکاری",
    local: "حداقل ۳ ماه",
    growth: "۴–۶ ماه",
    pro: "حداقل ۶ ماه",
    enterprise: "اختصاصی",
  },
];

export const seoSuitableFor = [
  "سایت شرکتی یا خدماتی دارید",
  "مشتری خدمات شما را در گوگل جست‌وجو می‌کند",
  "برای رشد چندماهه آمادگی دارید",
  "امکان همکاری برای محتوا و اصلاحات سایت دارید",
  "می‌خواهید تماس، فرم یا فروش را اندازه‌گیری کنید",
];

export const seoNotSuitableFor = [
  "رتبه اول تضمینی می‌خواهید",
  "انتظار نتیجه قطعی در چند روز دارید",
  "حاضر به اصلاح سایت یا محتوا نیستید",
  "فقط تعداد زیادی مقاله ارزان می‌خواهید",
  "بازار، محصول یا پیشنهاد مشخصی ندارید",
];

export const seoTrustSignals = [
  "پرداخت امن زیبال",
  "گزارش شفاف ماهانه",
  "بدون وعده رتبه تضمینی",
  "تیم اجرایی داخلی آرایه",
];

/* Legacy exports — used by deferred SEO section components */
export const seoBridgeSteps = [
  { label: "جستجو", desc: "مشتری در گوگل می‌گردد" },
  { label: "لندینگ‌پیج", desc: "وارد صفحه درست می‌شود" },
  { label: "لید", desc: "تماس یا فرم ثبت می‌کند" },
  { label: "CRM", desc: "لید ذخیره و پیگیری می‌شود" },
  { label: "فروش", desc: "تبدیل به مشتری" },
];

export interface SeoOutcome {
  title: string;
  result: string;
  detail: string;
}

export const seoOutcomes: SeoOutcome[] = [
  {
    title: "کلمه درست",
    result: "مشتری همان چیزی را پیدا می‌کند که جستجو کرده",
    detail: "تحقیق کلماتی که احتمال تماس یا خرید دارند.",
  },
  {
    title: "صفحه درست",
    result: "صفحه‌ای که هم در گوگل دیده شود هم لید بسازد",
    detail: "طراحی صفحات خدماتی برای هر جستجوی واقعی مشتری.",
  },
  {
    title: "لید درست",
    result: "هیچ تماس و فرمی گم نمی‌شود",
    detail: "اتصال فرم، تماس و CRM به مسیر سئو.",
  },
  {
    title: "گزارش درست",
    result: "می‌دانید چند لید از گوگل آمده",
    detail: "گزارش ماهانه قابل فهم برای صاحب کسب‌وکار.",
  },
];

export interface SeoFlowStep {
  label: string;
  title: string;
  description: string;
}

export const seoFlowSteps: SeoFlowStep[] = [
  {
    label: "جستجو",
    title: "مشتری دقیقاً همان را سرچ می‌کند",
    description: "جست‌وجوی واقعی مشتری — نه یک کلمه عمومی.",
  },
  {
    label: "لندینگ",
    title: "وارد صفحه‌ای می‌شود که برای همان نیاز ساخته شده",
    description: "خدمت، منطقه، اعتماد و دکمه تماس.",
  },
  {
    label: "لید",
    title: "تماس می‌گیرد یا فرم پر می‌کند",
    description: "فرم یا تماس در جای درست.",
  },
  {
    label: "CRM",
    title: "لید وارد سیستم پیگیری می‌شود",
    description: "هیچ درخواستی گم نمی‌شود.",
  },
  {
    label: "فروش",
    title: "تبدیل به مشتری",
    description: "جستجو به نوبت، قرارداد یا فروش تبدیل می‌شود.",
  },
];

export interface SeoSystemStep {
  num: number;
  title: string;
  description: string;
}

export const seoSystemSteps: SeoSystemStep[] = [
  { num: 1, title: "تحقیق کلمات", description: "کلماتی که مشتری جستجو می‌کند." },
  { num: 2, title: "صفحات خدمات", description: "صفحه برای هر خدمت و منطقه." },
  { num: 3, title: "سئوی فنی و محتوا", description: "سرعت، ساختار و محتوای هدفمند." },
  { num: 4, title: "اتصال لید", description: "فرم، تماس و پیگیری." },
  { num: 5, title: "گزارش ماهانه", description: "لید، تماس و رشد." },
];

export interface SeoNiche {
  title: string;
  exampleSearch: string;
}

export const seoNiches: SeoNiche[] = [
  { title: "پزشکان و کلینیک‌ها", exampleSearch: "دکتر پوست در سعادت‌آباد" },
  { title: "وکلا و مشاوران", exampleSearch: "وکیل طلاق تهران" },
  { title: "رستوران و کافه", exampleSearch: "رستوران ایتالیایی نزدیک من" },
];

export interface SeoCompareRow {
  label: string;
  generic: string;
  araaye: string;
}

export const seoCompareRows: SeoCompareRow[] = [
  { label: "هدف", generic: "بالا رفتن رتبه", araaye: "گرفتن لید و مشتری" },
  { label: "خروجی", generic: "مقاله و گزارش رتبه", araaye: "صفحات و مسیر تبدیل" },
  { label: "گزارش", generic: "اعداد سئویی پیچیده", araaye: "تماس و فرم از گوگل" },
];

export interface SeoProcessStep {
  num: number;
  title: string;
}

export const seoProcessSteps: SeoProcessStep[] = [
  { num: 1, title: "شناخت کسب‌وکار" },
  { num: 2, title: "تحلیل سایت و رقبا" },
  { num: 3, title: "طراحی نقشه صفحات" },
  { num: 4, title: "اجرای فنی و محتوا" },
  { num: 5, title: "گزارش و بهبود ماهانه" },
];

export const seoReportMetrics = [
  { label: "لید از گوگل", value: "—" },
  { label: "تماس مستقیم", value: "—" },
  { label: "صفحات فعال", value: "—" },
  { label: "نرخ تبدیل", value: "—" },
];

export interface SeoFaqItem {
  q: string;
  a: string;
  openByDefault?: boolean;
}

export const seoFaq: SeoFaqItem[] = [
  {
    q: "نتیجه سئو چه زمانی دیده می‌شود؟",
    a: "به وضعیت سایت، رقابت و استمرار اجرا بستگی دارد. اصلاحات فنی و Local SEO سریع‌تر دیده می‌شوند؛ رشد ارگانیک معمولاً از ماه دوم به بعد و با اجرای پیوسته قابل ارزیابی است.",
  },
  {
    q: "آیا رتبه اول گوگل را تضمین می‌کنید؟",
    a: "خیر. هیچ مجموعه‌ای کنترل کامل روی رتبه‌های گوگل ندارد. آرایه اجرای کارهای مشخص، گزارش شفاف و بهبود مستمر را تضمین می‌کند.",
    openByDefault: true,
  },
  {
    q: "تفاوت Local SEO با SEO Growth چیست؟",
    a: "Local SEO برای یک محدوده و حداکثر ۲ خدمت با تمرکز روی Google Maps است. SEO Growth سئوی کامل سایت با تحلیل فنی، محتوا، on-page و CRO برای یک خوشه خدمات است.",
  },
  {
    q: "آیا تولید محتوا داخل پکیج‌هاست؟",
    a: "بله، اما براساس استراتژی و اولویت پروژه — نه تعداد ثابت مقاله. هر خروجی می‌تواند صفحه خدمات، لندینگ، مقاله یا بازنویسی باشد.",
  },
  {
    q: "منظور از خروجی محتوایی یا صفحه‌ای چیست؟",
    a: "هر خروجی ماهانه یکی از این موارد است: صفحه خدمات جدید، لندینگ جدید، مقاله جدید، بازنویسی صفحه موجود یا به‌روزرسانی عمده محتوا.",
  },
  {
    q: "هزینه رپورتاژ داخل پکیج است؟",
    a: "خیر. هزینه انتشار رپورتاژ، رسانه و تبلیغات جداگانه و قبل از اجرا اعلام می‌شود.",
  },
  {
    q: "اصلاحات فنی سایت داخل هزینه است؟",
    a: "اصلاحات معمول SEO در محدوده پکیج انجام می‌شود. اصلاحات بزرگ برنامه‌نویسی، redesign یا زیرساختی جداگانه برآورد می‌شوند.",
  },
  {
    q: "آیا برای شروع باید سایت داشته باشم؟",
    a: "برای Local SEO و Google Maps، خیر. برای SEO Growth و بالاتر، صفحات مناسب لازم است که در صورت نبود، در برنامه اجرایی ساخته می‌شوند.",
  },
  {
    q: "موفقیت پروژه با چه KPIهایی سنجیده می‌شود؟",
    a: "Impression، Click، CTR، صفحات هدف، تماس، فرم و در صورت اتصال، لید و فروش — نه فقط رتبه.",
  },
  {
    q: "چرا تعداد مقاله ثابت و زیاد ارائه نمی‌کنید؟",
    a: "چون تولید بی‌هدف مقاله معمولاً به تماس و فروش منجر نمی‌شود. اولویت با صفحات و محتوایی است که جست‌وجوی واقعی مشتری را پوشش دهد.",
  },
  {
    q: "سئو برای نمایش در هوش مصنوعی چیست؟",
    a: "بهینه‌سازی entity، ساختار پاسخ، FAQ و وضوح محتوا برای موتورهای پاسخ‌گو. تضمین نمایش در ChatGPT یا AI Overviews داده نمی‌شود.",
  },
  {
    q: "اگر بعد از تحلیل مشخص شود سئو مناسب ما نیست چه می‌شود؟",
    a: "در گزارش تحلیل صادقانه توضیح می‌دهیم چرا و چه مسیر جایگزینی منطقی‌تر است. هدف فروش اجباری نیست.",
  },
];

export function formatToman(n: number): string {
  return n.toLocaleString("en-US").replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export function formatPackagePrice(pkg: SeoPackage): string {
  const prefix = pkg.pricePrefix === "from" ? "از " : "";
  const suffix = pkg.pricePeriod === "month" ? " / ماه" : "";
  const onceSuffix = pkg.pricePeriod === "once" ? " — یک‌باره" : "";
  return `${prefix}${formatToman(pkg.price)} تومان${suffix || onceSuffix}`;
}

export function formatSeoPlanPrice(pkg: SeoPackage): string {
  const millions = pkg.price / 1_000_000;
  const value = millions % 1 === 0 ? String(millions) : millions.toFixed(1).replace(".", ".");
  const fa = value.replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]).replace(".", "٫");
  if (pkg.pricePeriod === "month") {
    const from = pkg.pricePrefix === "from" ? "از " : "";
    return `${from}ماهانه ${fa} میلیون تومان`;
  }
  return `${fa} میلیون تومان — یک‌باره`;
}

export function getSeoPackage(key: SeoPackageKey): SeoPackage {
  const pkg = seoPackages.find((p) => p.key === key);
  if (!pkg) throw new Error(`Unknown SEO package: ${key}`);
  return pkg;
}

export function getSeoCheckoutPackages(): Record<string, { name: string; price: number }> {
  const map: Record<string, { name: string; price: number }> = {};
  for (const p of seoPackages) {
    if (!p.checkoutEnabled) continue;
    map[p.key] = { name: p.name, price: p.price };
  }
  return map;
}

export interface SeoFooterColumn {
  title: string;
  links: { label: string; url: string }[];
}

export const seoFooterColumns: SeoFooterColumn[] = [
  {
    title: "آرایه",
    links: [{ label: "صفحه اصلی", url: "/" }],
  },
  {
    title: "خدمات SEO",
    links: [
      { label: "بررسی اولیه سئو", url: "/seo#audit-form" },
      { label: "خدمات سئو آرایه", url: "/seo" },
    ],
  },
  {
    title: "ثبت و تکمیل گوگل",
    links: [{ label: "ثبت و تکمیل حضور در گوگل", url: "/googlesabt" }],
  },
  {
    title: "راهکار پزشکان",
    links: [{ label: "سئو و وب پزشکان", url: "/doctors" }],
  },
  {
    title: "AdReady",
    links: [{ label: "لندینگ کمپین", url: "/adready" }],
  },
  {
    title: "هوش مصنوعی آرایه",
    links: [{ label: "ورود به آرایه AI", url: "/ai" }],
  },
  {
    title: "درباره ما",
    links: [{ label: "آشنایی با آرایه", url: "/about" }],
  },
  {
    title: "تماس و اطلاعات قانونی",
    links: [
      { label: "تماس با ما", url: "/contact" },
      { label: "ایمیل: support@araaye.com", url: "mailto:support@araaye.com" },
    ],
  },
];

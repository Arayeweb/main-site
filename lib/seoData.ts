// داده‌های صفحه سئوی آرایه — پکیج‌ها، محتوا، FAQ و کپی.
// قیمت checkout از getSeoCheckoutPackages() در همین فایل می‌آید.

export type SeoPackageKey = "gmap" | "starter" | "growth" | "pro" | "custom";

export interface SeoPackage {
  key: SeoPackageKey;
  name: string;
  price: number;
  pricePeriod: "once" | "month";
  pricePrefix?: "from";
  checkoutEnabled: boolean;
  description: string;
  features: string[];
  popular?: boolean;
  badge?: string;
}

export const seoPackages: SeoPackage[] = [
  {
    key: "gmap",
    name: "ثبت و بهینه‌سازی Google Map",
    price: 2_900_000,
    pricePeriod: "once",
    checkoutEnabled: true,
    description: "ثبت و بهینه‌سازی کامل پروفایل کسب‌وکار در نقشه گوگل — نقطه شروع برای دیده‌شدن محلی.",
    features: [
      "ثبت و تأیید کسب‌وکار در Google Maps",
      "بهینه‌سازی NAP، دسته‌بندی و ساعت کاری",
      "عکس، توضیحات و لینک‌های تماس",
      "راه‌اندازی نظرات و پرسش‌وپاسخ",
      "گزارش تحویل و چک‌لیست نهایی",
    ],
  },
  {
    key: "starter",
    name: "Local Starter",
    price: 6_900_000,
    pricePeriod: "month",
    checkoutEnabled: true,
    description: "شروع سئوی محلی ماهانه — برای کسب‌وکاری که می‌خواهد از گوگل ورودی منظم بگیرد.",
    features: [
      "تحقیق و بهینه‌سازی ۳ کلمه محلی",
      "۲ محتوای سئوشده در ماه",
      "بهینه‌سازی صفحات خدمات پایه",
      "گزارش ماهانه لید و تماس",
      "پشتیبانی تلگرام",
    ],
  },
  {
    key: "growth",
    name: "Local Growth",
    price: 11_900_000,
    pricePeriod: "month",
    checkoutEnabled: true,
    description: "پکیج پیشنهادی — سئوی محلی + لندینگ + مسیر لید برای گرفتن تماس و فرم از گوگل.",
    popular: true,
    badge: "پیشنهادی",
    features: [
      "همه امکانات Local Starter",
      "لندینگ‌پیج محلی سئو‌شده",
      "۵ کلمه محلی پول‌ساز",
      "اتصال فرم، تماس و CRM",
      "بهینه‌سازی نقشه گوگل",
      "گزارش لید با تمرکز تبدیل",
    ],
  },
  {
    key: "pro",
    name: "Local Pro",
    price: 18_900_000,
    pricePeriod: "month",
    checkoutEnabled: true,
    description: "سیستم کامل سرچ تا لید — برای کسب‌وکارهایی که می‌خواهند از گوگل مشتری منظم بگیرند.",
    features: [
      "همه امکانات Local Growth",
      "معماری کامل صفحات خدمات و منطقه",
      "۱۰+ صفحه هدفمند سئو‌شده",
      "اتوماسیون پیگیری لید",
      "سئوی فنی و سرعت کامل",
      "پشتیبانی اختصاصی",
    ],
  },
  {
    key: "custom",
    name: "اختصاصی",
    price: 29_900_000,
    pricePeriod: "month",
    pricePrefix: "from",
    checkoutEnabled: false,
    description: "برای برندهای چندشعبه، کلینیک‌های بزرگ و پروژه‌های سفارشی با نیازهای خاص.",
    features: [
      "استراتژی سفارشی چندشعبه / چندشهر",
      "تیم اختصاصی اجرا و گزارش",
      "داشبورد گزارش سفارشی",
      "SLA و قرارداد سازمانی",
      "مشاوره و طراحی مسیر رشد",
    ],
  },
];

export const seoBridgeSteps = [
  { label: "جستجو", desc: "مشتری در گوگل می‌گردد" },
  { label: "لندینگ‌پیج", desc: "وارد صفحه درست می‌شود" },
  { label: "لید", desc: "تماس یا فرم ثبت می‌کند" },
  { label: "CRM", desc: "لید ذخیره و پیگیری می‌شود" },
  { label: "فروش", desc: "تبدیل به مشتری" },
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
    title: "لید ثبت می‌شود، گم می‌شود",
    description:
      "فرم پر می‌شود یا تماس می‌آید، ولی جایی ذخیره و پیگیری نمی‌شود. فرصت فروش از دست می‌رود.",
  },
  {
    title: "آژانس فقط رتبه گزارش می‌کند",
    description:
      "گزارش ماهانه پر از کلمه و رتبه است — ولی نمی‌گوید چند تماس، چند فرم و چند مشتری از گوگل آمده.",
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
    description: "«دکتر پوست سعادت‌آباد» — نه یک کلمه عمومی.",
  },
  {
    label: "لندینگ",
    title: "وارد صفحه‌ای می‌شود که برای همان نیاز ساخته شده",
    description: "خدمت، منطقه، اعتماد و دکمه تماس — همه در یک صفحه.",
  },
  {
    label: "لید",
    title: "تماس می‌گیرد یا فرم پر می‌کند",
    description: "فرم، واتساپ یا تماس در جای درست — بدون سردرگمی.",
  },
  {
    label: "CRM",
    title: "لید وارد سیستم پیگیری می‌شود",
    description: "هیچ درخواستی گم نمی‌شود؛ تیم می‌داند باید پیگیری کند.",
  },
  {
    label: "فروش",
    title: "تبدیل به مشتری",
    description: "جستجوی گوگل به نوبت، قرارداد یا فروش تبدیل می‌شود.",
  },
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
    detail: "تحقیق کلماتی که احتمال تماس یا خرید دارند — نه فقط حجم جستجو.",
  },
  {
    title: "صفحه درست",
    result: "لندینگی که هم در گوگل دیده شود هم لید بسازد",
    detail: "طراحی صفحات خدماتی برای هر جستجوی واقعی مشتری.",
  },
  {
    title: "لید درست",
    result: "هیچ تماس و فرمی گم نمی‌شود",
    detail: "اتصال فرم، تماس، واتساپ و CRM به مسیر سئو.",
  },
  {
    title: "گزارش درست",
    result: "می‌دانید چند لید از گوگل آمده — نه فقط چند بازدید",
    detail: "گزارش ماهانه قابل فهم برای صاحب کسب‌وکار.",
  },
];

export interface SeoSystemStep {
  num: number;
  title: string;
  description: string;
}

export const seoSystemSteps: SeoSystemStep[] = [
  {
    num: 1,
    title: "تحقیق کلمات پول‌ساز",
    description: "کلماتی که مشتری جستجو می‌کند و احتمال تماس دارد.",
  },
  {
    num: 2,
    title: "لندینگ‌پیج خدمات",
    description: "صفحه‌ای برای هر خدمت و منطقه — نه یک صفحه عمومی.",
  },
  {
    num: 3,
    title: "سئوی فنی و محتوا",
    description: "سرعت، ساختار، ایندکس و محتوای هدفمند.",
  },
  {
    num: 4,
    title: "اتصال لید و CRM",
    description: "فرم، تماس و پیگیری — سئو به فروش وصل می‌شود.",
  },
  {
    num: 5,
    title: "گزارش و بهبود ماهانه",
    description: "لید، تماس و رشد — قابل اندازه‌گیری.",
  },
];

export interface SeoNiche {
  title: string;
  exampleSearch: string;
}

export const seoNiches: SeoNiche[] = [
  { title: "پزشکان و کلینیک‌ها", exampleSearch: "دکتر پوست در سعادت‌آباد" },
  { title: "وکلا و مشاوران", exampleSearch: "وکیل طلاق تهران" },
  { title: "رستوران و کافه", exampleSearch: "رستوران ایتالیایی نزدیک من" },
  { title: "آموزشگاه‌ها", exampleSearch: "کلاس زبان آیلتس تهران" },
  { title: "خدمات ساختمانی", exampleSearch: "نقاشی ساختمان غرب تهران" },
  { title: "زیبایی و پوست", exampleSearch: "بهترین کلینیک زیبایی تهران" },
];

export interface SeoCompareRow {
  label: string;
  generic: string;
  araaye: string;
}

export const seoCompareRows: SeoCompareRow[] = [
  { label: "هدف", generic: "بالا رفتن رتبه", araaye: "گرفتن لید و مشتری" },
  { label: "خروجی", generic: "مقاله و گزارش رتبه", araaye: "لندینگ‌پیج و مسیر تبدیل" },
  { label: "بعد از ورود", generic: "کاری نمی‌کند", araaye: "فرم، تماس و CRM" },
  { label: "گزارش", generic: "اعداد سئویی پیچیده", araaye: "چند تماس و فرم از گوگل" },
  { label: "ارتباط با فروش", generic: "جدا از فروش", araaye: "متصل به CRM و پیگیری" },
];

export interface SeoProcessStep {
  num: number;
  title: string;
}

export const seoProcessSteps: SeoProcessStep[] = [
  { num: 1, title: "شناخت کسب‌وکار و اهداف فروش" },
  { num: 2, title: "تحلیل سایت، رقبا و کلمات پول‌ساز" },
  { num: 3, title: "طراحی نقشه صفحات و لندینگ‌ها" },
  { num: 4, title: "ساخت محتوا، سئوی فنی و اتصال لید" },
  { num: 5, title: "گزارش ماهانه و بهبود مستمر" },
];

export interface SeoFaqItem {
  q: string;
  a: string;
}

export const seoFaq: SeoFaqItem[] = [
  {
    q: "فرق سئوی آرایه با آژانس‌های معمولی چیست؟",
    a: "آژانس معمولی روی رتبه و مقاله کار می‌کند. آرایه سئو را به لندینگ‌پیج، لید، CRM و فروش وصل می‌کند — کل مسیر از جستجو تا مشتری.",
  },
  {
    q: "سئو چقدر زمان می‌برد؟",
    a: "اقدامات فنی از هفته اول. لندینگ‌ها و صفحات خدماتی طی ۱ تا ۲ ماه آماده می‌شوند. لید پایدار معمولاً از ماه سوم — بسته به رقابت.",
  },
  {
    q: "آیا سئو تضمینی است؟",
    a: "رتبه دقیق قابل تضمین نیست. ما روی مسیر قابل اندازه‌گیری کار می‌کنیم: صفحات ساخته‌شده، لید، تماس و گزارش ماهانه.",
  },
  {
    q: "آیا لندینگ‌پیج هم طراحی می‌کنید؟",
    a: "بله — بخش اصلی کار ما همین است. صفحاتی که برای جستجوی واقعی مشتری ساخته شده و او را به تماس یا فرم برسانند.",
  },
  {
    q: "آیا لیدها به CRM وصل می‌شوند؟",
    a: "در پکیج Local Growth و اختصاصی، فرم‌ها و تماس‌ها به CRM یا سیستم پیگیری شما متصل می‌شوند.",
  },
  {
    q: "برای چه کسب‌وکارهایی مناسب است؟",
    a: "هر کسب‌وکاری که مشتری در گوگل جستجو می‌کند و به تماس، رزرو یا فرم نیاز دارد: پزشک، کلینیک، وکیل، رستوران، آموزشگاه، خدمات شهری.",
  },
];

export const seoReportMetrics = [
  { label: "لید از گوگل", value: "—" },
  { label: "تماس مستقیم", value: "—" },
  { label: "صفحات فعال", value: "—" },
  { label: "نرخ تبدیل", value: "—" },
];

export function formatToman(n: number): string {
  return n.toLocaleString("en-US").replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export function formatPackagePrice(pkg: SeoPackage): string {
  const prefix = pkg.pricePrefix === "from" ? "از " : "";
  const suffix = pkg.pricePeriod === "month" ? " / ماه" : "";
  return `${prefix}${formatToman(pkg.price)} تومان${suffix}`;
}

export function getSeoPackage(key: SeoPackageKey): SeoPackage {
  const pkg = seoPackages.find((p) => p.key === key);
  if (!pkg) throw new Error(`Unknown SEO package: ${key}`);
  return pkg;
}

/** قیمت‌های checkout — فقط پکیج‌هایی که پرداخت آنلاین دارند */
export function getSeoCheckoutPackages(): Record<string, { name: string; price: number }> {
  const map: Record<string, { name: string; price: number }> = {};
  for (const p of seoPackages) {
    if (!p.checkoutEnabled) continue;
    map[p.key] = { name: p.name, price: p.price };
  }
  return map;
}

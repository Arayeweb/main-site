// داده‌های صفحه سئوی آرایه — پکیج‌ها، محتوا، FAQ و کپی.
// قیمت‌ها باید با SEO_PACKAGES در app/api/seo/checkout/route.ts هماهنگ بماند.

export type SeoPackageKey = "basic" | "growth" | "pro" | "bundle";

export interface SeoPackage {
  key: SeoPackageKey;
  name: string;
  price: number;
  oldPrice: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export const seoPackages: SeoPackage[] = [
  {
    key: "basic",
    name: "Starter SEO",
    price: 890_000,
    oldPrice: 1_290_000,
    description: "شروع مسیر لید از گوگل — مناسب کسب‌وکارهایی که هنوز ساختار درست ندارند.",
    features: [
      "بررسی سایت و فرصت‌های لید از جستجو",
      "تحقیق کلماتی که مشتری واقعاً جستجو می‌کند",
      "ساخت یا اصلاح صفحات خدماتی",
      "سئوی فنی پایه",
      "گزارش ماهانه",
    ],
  },
  {
    key: "growth",
    name: "Growth SEO",
    price: 1_690_000,
    oldPrice: 2_290_000,
    description: "برای کسب‌وکاری که می‌خواهد از گوگل تماس و فرم بگیرد — نه فقط بازدید.",
    popular: true,
    features: [
      "نقشه کلمات و صفحات پول‌ساز",
      "طراحی لندینگ‌پیج‌های سئو شده",
      "برنامه محتوای هدفمند",
      "سئوی فنی کامل",
      "اتصال فرم و مسیر ثبت لید",
      "گزارش ماهانه با تمرکز روی لید",
    ],
  },
  {
    key: "pro",
    name: "Custom SEO System",
    price: 2_900_000,
    oldPrice: 3_900_000,
    description: "سیستم کامل: سئو + لندینگ + CRM + پیگیری — برای کسب‌وکارهای جدی.",
    features: [
      "معماری کامل سرچ تا لید",
      "اتصال CRM و اتوماسیون پیگیری",
      "سئوی محلی و نقشه گوگل",
      "داشبورد گزارش سفارشی",
      "بهینه‌سازی مداوم",
      "پشتیبانی اختصاصی",
    ],
  },
];

export const seoBundle = {
  key: "bundle" as SeoPackageKey,
  name: "ترکیبی سئو + ثبت گوگل",
  price: 3_100_000,
  oldPrice: 3_880_000,
  description:
    "سیستم Custom SEO به‌همراه ثبت و بهینه‌سازی کامل در نقشه گوگل — برای کسب‌وکار محلی.",
  items: ["سیستم سرچ تا لید", "ثبت نقشه گوگل", "بهینه‌سازی پروفایل"],
};

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
    a: "در پکیج Growth و Custom، فرم‌ها و تماس‌ها به CRM یا سیستم پیگیری شما متصل می‌شوند.",
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

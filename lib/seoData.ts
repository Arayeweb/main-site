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
    name: "ثبت و تکمیل حضور در گوگل",
    price: 2_900_000,
    pricePeriod: "once",
    checkoutEnabled: true,
    description: "مناسب کسب‌وکاری که هنوز حضور درست و کاملی در گوگل ندارد.",
    features: [
      "ثبت یا بررسی کسب‌وکار",
      "تکمیل نام، آدرس و شماره تماس",
      "دسته‌بندی و ساعات کاری",
      "تصاویر و راه‌های ارتباطی",
      "گزارش نهایی",
    ],
  },
  {
    key: "starter",
    name: "Local Starter",
    price: 6_900_000,
    pricePeriod: "month",
    checkoutEnabled: true,
    description: "برای کسب‌وکار کوچک با یک خدمت یا محدوده اصلی.",
    features: [
      "۱ خدمت یا ۱ محدوده هدف",
      "۲ صفحه خدمات فعال",
      "بهبود ماهانه پروفایل نقشه",
      "گزارش ماهانه وضعیت و تماس",
    ],
  },
  {
    key: "growth",
    name: "Local Growth",
    price: 11_900_000,
    pricePeriod: "month",
    checkoutEnabled: true,
    description: "برای کسب‌وکاری با چند خدمت یا چند محدوده هدف.",
    features: [
      "۲–۳ خدمت یا ۲ محدوده هدف",
      "۴–۶ صفحه خدمات و محلی",
      "بهینه‌سازی نقشه + صفحات جذب تماس",
      "گزارش ماهانه با اولویت‌بندی اقدامات",
    ],
  },
  {
    key: "pro",
    name: "Local Pro",
    price: 18_900_000,
    pricePeriod: "month",
    checkoutEnabled: true,
    description: "برای بازار رقابتی و اجرای گسترده‌تر.",
    features: [
      "۴+ خدمت یا چند محدوده و شعبه",
      "۸–۱۲ صفحه اجرایی ماهانه",
      "اجرای گسترده نقشه، محتوا و مسیر تماس",
      "گزارش ماهانه + هماهنگی اجرایی",
    ],
  },
  {
    key: "custom",
    name: "اختصاصی",
    price: 29_900_000,
    pricePeriod: "month",
    pricePrefix: "from",
    checkoutEnabled: false,
    description: "برای پروژه‌های گسترده‌تر با نیاز اجرایی بالاتر.",
    features: [
      "چند شعبه یا چند شهر",
      "برنامه محتوا و صفحات سفارشی",
      "تیم اجرا و گزارش اختصاصی",
      "قرارداد و SLA سازمانی",
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
  openByDefault?: boolean;
}

export const seoFaq: SeoFaqItem[] = [
  {
    q: "چقدر طول می‌کشد تا نتیجه سئو دیده شود؟",
    a: "به وضعیت فعلی، رقابت و محدوده فعالیت بستگی دارد. اصلاح اطلاعات گوگل سریع‌تر دیده می‌شود، اما رشد در جست‌وجو معمولاً به چند ماه اجرای پیوسته نیاز دارد.",
  },
  {
    q: "آیا رتبه اول گوگل را تضمین می‌کنید؟",
    a: "خیر. هیچ مجموعه‌ای کنترل کامل روی رتبه‌های گوگل ندارد. آرایه اجرای کارهای مشخص، گزارش شفاف و بهبود مستمر را تضمین می‌کند؛ نه یک رتبه غیرقابل‌کنترل.",
    openByDefault: true,
  },
  {
    q: "برای شروع حتماً باید سایت داشته باشم؟",
    a: "برای ثبت و تکمیل حضور در گوگل، خیر. برای سئوی ماهانه به صفحات مناسب نیاز دارید که در صورت نبود، برایتان ساخته می‌شوند.",
  },
  {
    q: "فرق ثبت گوگل با سئوی ماهانه چیست؟",
    a: "ثبت گوگل یک پروژه یک‌باره برای آماده‌کردن اطلاعات و نقشه است. سئوی ماهانه برای بهتر دیده‌شدن در جست‌وجوها و ساخت و بهبود صفحات ادامه پیدا می‌کند.",
  },
  {
    q: "از کجا بفهمم چه کارهایی انجام شده؟",
    a: "گزارش دوره‌ای شامل کارهای انجام‌شده، صفحات ساخته‌شده، وضعیت حضور در گوگل و اقدامات بعدی تحویل داده می‌شود.",
  },
  {
    q: "هزینه تبلیغات یا رپورتاژ داخل پلن است؟",
    a: "خیر. اگر تبلیغ یا انتشار رپورتاژ لازم باشد، هزینه آن جداگانه و قبل از اجرا اعلام می‌شود.",
  },
  {
    q: "این خدمات برای چه کسب‌وکارهایی مناسب است؟",
    a: "برای پزشکان، کلینیک‌ها، فروشگاه‌ها و کسب‌وکارهای خدماتی که مشتریانشان آن‌ها را در گوگل یا نقشه جست‌وجو می‌کنند.",
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

/** نمایش فشرده قیمت پلن — مثلاً «ماهانه ۶.۹ میلیون» */
export function formatSeoPlanPrice(pkg: SeoPackage): string {
  const millions = pkg.price / 1_000_000;
  const value =
    millions % 1 === 0
      ? String(millions)
      : millions.toFixed(1).replace(".", ".");
  const fa = value.replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]).replace(".", "٫");
  if (pkg.pricePeriod === "month") return `ماهانه ${fa} میلیون`;
  return `${fa} میلیون تومان`;
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
      { label: "بررسی وضعیت در گوگل", url: "/free-seo-audit" },
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
    links: [{ label: "آشنایی با آرایه", url: "/#faq" }],
  },
  {
    title: "تماس و اطلاعات قانونی",
    links: [
      { label: "تماس با ما", url: "#contact" },
      { label: "ایمیل: hello@araaye.com", url: "mailto:hello@araaye.com" },
    ],
  },
];

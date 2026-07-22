import { FASTWEB_PACKAGES } from "@/lib/fastweb";
import {
  FASTWEB_START_PRICE_TOMAN,
  FASTWEB_PLUS_PRICE_TOMAN,
  formatWebsiteDesignPrice,
} from "@/lib/websitePricing";

/** Order entry point (kept stable — imported by industry landing). */
export const FASTWEB_ORDER_HREF = "/fastweb/new";

/** Structural preview languages used across hero + showcase. */
export type FwPreviewVariant = "clinic" | "local" | "studio";
export type FwPreviewDevice = "desktop" | "mobile";

/** Hero "stage" — three website outputs with visible structural differences. */
export const HERO_STAGE: {
  variant: FwPreviewVariant;
  device: FwPreviewDevice;
  index: string;
  industry: string;
  goal: string;
  direction: string;
}[] = [
  {
    variant: "clinic",
    device: "desktop",
    index: "۰۱",
    industry: "کلینیک و مطب",
    goal: "دریافت نوبت",
    direction: "آرام و مطمئن",
  },
  {
    variant: "local",
    device: "desktop",
    index: "۰۲",
    industry: "کسب‌وکار محلی",
    goal: "تماس و مسیر",
    direction: "گرم و ساده",
  },
  {
    variant: "studio",
    device: "desktop",
    index: "۰۳",
    industry: "استودیو و نمونه‌کار",
    goal: "درخواست همکاری",
    direction: "نشریه‌ای و تیره",
  },
];

/** The colophon metadata beside the manifest line. */
export const SPEC_COLOPHON: { term: string; value: string }[] = [
  { term: "شروع قیمت", value: `${formatWebsiteDesignPrice(FASTWEB_START_PRICE_TOMAN)} تومان` },
  { term: "زمان تحویل", value: "نسخه اول، ۲۴ ساعت کاری" },
  { term: "قبل از پرداخت", value: "پیش‌نمایش زنده" },
  { term: "میزبانی", value: "یک‌ساله + دامنه .ir" },
];

/** Signature production-line narrative (business info → published site). */
export const PRODUCTION_STAGES: {
  index: string;
  key: "brief" | "journey" | "blueprint" | "direction" | "site";
  title: string;
  caption: string;
}[] = [
  {
    index: "۰۱",
    key: "brief",
    title: "اطلاعات کسب‌وکار",
    caption: "خدمات، مخاطب و راه ارتباطی را در چند سؤال کوتاه می‌گویی.",
  },
  {
    index: "۰۲",
    key: "journey",
    title: "مسیر مشتری",
    caption: "تصمیم می‌گیریم بازدیدکننده از کجا وارد شود و کجا تماس بگیرد.",
  },
  {
    index: "۰۳",
    key: "blueprint",
    title: "نقشه صفحه",
    caption: "ساختار بخش‌ها و ترتیب آن‌ها به‌شکل نقشه اولیه چیده می‌شود.",
  },
  {
    index: "۰۴",
    key: "direction",
    title: "جهت بصری",
    caption: "تایپوگرافی، رنگ و تصاویر روی همان ساختار می‌نشیند.",
  },
  {
    index: "۰۵",
    key: "site",
    title: "سایت منتشرشده",
    caption: "نسخه اول قابل انتشار را می‌بینی، تأیید می‌کنی و آنلاین می‌شود.",
  },
];

/** Editorial showcase — one dominant + two secondary, each a different language. */
export const SHOWCASE = {
  dominant: {
    variant: "studio" as FwPreviewVariant,
    device: "desktop" as FwPreviewDevice,
    index: "۰۱",
    title: "استودیو ژوان",
    kind: "معماری و طراحی داخلی",
    note: "زبان نشریه‌ای: تصویر تمام‌قاب، تیتر درشت و شبکه پروژه‌ها.",
    href: "/demo/fastweb/zivan-studio",
  },
  secondary: [
    {
      variant: "clinic" as FwPreviewVariant,
      device: "mobile" as FwPreviewDevice,
      index: "۰۲",
      title: "مطب و کلینیک",
      kind: "خدمات درمانی",
      note: "زبان خدماتی: مسیر نوبت‌دهی در مرکز، خدمات به‌صورت فهرست.",
    },
    {
      variant: "local" as FwPreviewVariant,
      device: "mobile" as FwPreviewDevice,
      index: "۰۳",
      title: "کسب‌وکار محلی",
      kind: "خدمات شهری",
      note: "زبان محلی: تماس، ساعت کاری و آدرس در دسترس فوری.",
    },
  ],
};

/** Scope ledger (not cards) — kept in sync with package source of truth. */
export const SCOPE_LEDGER = {
  included: FASTWEB_PACKAGES.fast.features,
  excluded: [
    "فروشگاه و مدیریت سفارش",
    "طراحی کاملاً یونیک برند",
    "سئوی مستمر ماهانه",
    "اتوماسیون و رزرو سفارشی",
  ],
} as const;

/** Two packages, presented as an editorial price sheet. */
export const PRICE_SHEET: {
  key: "fast" | "plus";
  name: string;
  price: string;
  priceRaw: number;
  tagline: string;
  meta: { term: string; value: string }[];
  features: readonly string[];
  emphasized: boolean;
  packageParam: string;
}[] = [
  {
    key: "fast",
    name: FASTWEB_PACKAGES.fast.name,
    price: formatWebsiteDesignPrice(FASTWEB_START_PRICE_TOMAN),
    priceRaw: FASTWEB_START_PRICE_TOMAN,
    tagline: "نسخه اول قابل انتشار برای شروع رسمی کسب‌وکار.",
    meta: [
      { term: "صفحه", value: "یک صفحه" },
      { term: "اصلاح", value: `${FASTWEB_PACKAGES.fast.revisions} مرحله` },
      { term: "تحویل", value: "۲۴ ساعت کاری" },
    ],
    features: FASTWEB_PACKAGES.fast.features,
    emphasized: true,
    packageParam: "fast",
  },
  {
    key: "plus",
    name: FASTWEB_PACKAGES.plus.name,
    price: formatWebsiteDesignPrice(FASTWEB_PLUS_PRICE_TOMAN),
    priceRaw: FASTWEB_PLUS_PRICE_TOMAN,
    tagline: "برای چند صفحه، صفحات خدمات و پشتیبانی بیشتر.",
    meta: [
      { term: "صفحه", value: `تا ${FASTWEB_PACKAGES.plus.maxPages} صفحه` },
      { term: "اصلاح", value: `${FASTWEB_PACKAGES.plus.revisions} مرحله` },
      { term: "پشتیبانی", value: "سه‌ماهه" },
    ],
    features: FASTWEB_PACKAGES.plus.features,
    emphasized: false,
    packageParam: "plus",
  },
];

export const fastwebFaq = [
  {
    q: "قیمت طراحی سایت ارزان از چقدر شروع می‌شود؟",
    a: `بسته سایت فوری از ${formatWebsiteDesignPrice(FASTWEB_START_PRICE_TOMAN)} تومان شروع می‌شود و شامل نسخه اول قابل انتشار، مسیر تماس و میزبانی یک‌ساله است. پلاس برای چند صفحه و پشتیبانی بیشتر مناسب است.`,
  },
  {
    q: "واقعاً در ۲۴ ساعت چه چیزی تحویل می‌گیرم؟",
    a: "نسخه اول قابل انتشار سایت را تحویل می‌گیرید: ساختار صفحه، متن اولیه، طراحی بصری، نسخه موبایل و مسیر ارتباط توافق‌شده. این یک پروژه نامحدود و کاملاً سفارشی در یک روز نیست؛ نسخه اولی است که بعد از تکمیل اطلاعات اولیه کسب‌وکارتان آماده می‌شود.",
  },
  {
    q: "مالکیت سایت بعد از تحویل با کیست؟",
    a: "پس از تکمیل سفارش و انتشار، سایت برای کسب‌وکار شما راه‌اندازی می‌شود. دامنه .ir در صورت آزاد بودن و میزبانی یک‌ساله طبق بسته شامل می‌شود؛ جزئیات دسترسی در زمان تحویل اعلام می‌شود.",
  },
  {
    q: "آیا دامنه و هاست هم شامل می‌شود؟",
    a: "بله. در بسته‌های سایت فوری، میزبانی یک‌ساله و دامنه .ir در صورت آزاد بودن شامل می‌شود. اگر دامنه مدنظر آزاد نباشد یا دامنه دیگری بخواهید، تیم آرایه برای راه‌اندازی دامنه کمکتان می‌کند.",
  },
  {
    q: "آیا بعداً می‌توانم سایت را توسعه بدهم؟",
    a: "بله. سایت فوری نقطه شروع حضور آنلاین است. اگر بعداً به فروشگاه، پنل کاربری، رزرو یا امکانات پیچیده‌تر نیاز داشتید، می‌توانید از طریق طراحی سایت اختصاصی آرایه آن را توسعه دهید.",
  },
  {
    q: "اگر طراحی را نپسندم چه می‌شود؟",
    a: "قبل از انتشار، نسخه اول را می‌بینید و می‌توانید اصلاح‌های ضروری را در محدوده توافق‌شده درخواست کنید. انتشار فقط پس از تأیید شما انجام می‌شود.",
  },
  {
    q: "FastWeb چه تفاوتی با طراحی سایت اختصاصی آرایه دارد؟",
    a: "سایت فوری برای تحویل سریع و اقتصادی نسخه اول قابل انتشار است. طراحی اختصاصی برای برند گسترده‌تر، صفحات بیشتر و سیستم فروش کامل‌تر مناسب است.",
  },
] as const;

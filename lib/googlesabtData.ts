// داده‌های لندینگ ثبت گوگل — پکیج‌ها، FAQ و کپی.
// قیمت‌ها باید با GOOGLESABT_PACKAGES در app/api/googlesabt/checkout/route.ts هماهنگ بماند.

export type GooglesabtPackageKey = "basic" | "popular" | "vip";

export interface GooglesabtPackage {
  key: GooglesabtPackageKey;
  name: string;
  tagline: string;
  price: number;
  oldPrice: number;
  /** پیش‌پرداخت رزرو — با پرداخت آنلاین این مبلغ، قیمت قفل و ثبت شروع می‌شود */
  deposit: number;
  description: string;
  mapCount: number;
  includesBizcard: boolean;
  features: string[];
  popular?: boolean;
}

export const googlesabtPackages: GooglesabtPackage[] = [
  {
    key: "basic",
    name: "دیده شو",
    tagline: "ثبت در ۳ نقشه",
    price: 590_000,
    oldPrice: 1_200_000,
    deposit: 290_000,
    mapCount: 3,
    includesBizcard: false,
    description: "ثبت حرفه‌ای در گوگل، نشان و بلد + لینک پروفایل گوگل قابل اشتراک.",
    features: [
      "ثبت در ۳ نقشه: گوگل، نشان، بلد",
      "درستی‌سنجی نمایه گوگل",
      "لینک پروفایل گوگل قابل اشتراک",
      "تحویل کمتر از یک روز کاری",
    ],
  },
  {
    key: "popular",
    name: "محبوب",
    tagline: "ثبت + لینک همه‌کاره",
    price: 990_000,
    oldPrice: 2_800_000,
    deposit: 490_000,
    mapCount: 5,
    includesBizcard: true,
    popular: true,
    description:
      "ثبت در ۵ نقشه + کارت ویزیت آنلاین با همه مسیریاب‌ها روی یک لینک (araaye.com/b/…).",
    features: [
      "ثبت در ۵ نقشه: گوگل، نشان، بلد، اسنپ، OSM",
      "کارت BizCard کامل + QR اختصاصی",
      "همه مسیریاب‌ها روی یک لینk",
      "عکس، ساعت کاری و اطلاعات تماس",
      "تحویل کمتر از یک روز کاری",
    ],
  },
  {
    key: "vip",
    name: "کامل",
    tagline: "مدیریت حرفه‌ای",
    price: 1_990_000,
    oldPrice: 4_500_000,
    deposit: 990_000,
    mapCount: 5,
    includesBizcard: true,
    description: "همه امکانات محبوب + پنل پیامکی و مدیریت نظرات گوگل.",
    features: [
      "همه امکانات پکیج محبوب",
      "پنل پیامکی مدیریت نمایه",
      "مدیریت نظرات و پاسخ‌گویی",
      "پیگیری درستی‌سنجی گوگل",
    ],
  },
];

/** برای API checkout — باید با googlesabtPackages هماهنگ بماند */
export const GOOGLESABT_PACKAGES: Record<
  GooglesabtPackageKey,
  { name: string; deposit: number; price: number; includesBizcard: boolean }
> = Object.fromEntries(
  googlesabtPackages.map((p) => [
    p.key,
    { name: p.name, deposit: p.deposit, price: p.price, includesBizcard: p.includesBizcard },
  ])
) as Record<
  GooglesabtPackageKey,
  { name: string; deposit: number; price: number; includesBizcard: boolean }
>;

export interface GooglesabtFaqItem {
  q: string;
  a: string;
}

export const googlesabtFaq: GooglesabtFaqItem[] = [
  {
    q: "ثبت کسب‌وکار در گوگل مپ چقدر طول می‌کشد؟",
    a: "ثبت اولیه معمولاً کمتر از یک روز کاری انجام می‌شود؛ زمان نهایی به درستی‌سنجی گوگل بستگی دارد که آن را هم برایت پیگیری می‌کنیم.",
  },
  {
    q: "لینک BizCard چیست و چه فرقی با ثبت گوگل دارد؟",
    a: "ثبت گوگل یعنی کسب‌وکار شما در نقشه‌ها دیده می‌شود. لینک BizCard (از پکیج محبوب) همه مسیریاب‌ها، تماس، واتساپ و شبکه‌های اجتماعی را در یک صفحه جمع می‌کند تا مشتری با یک لینک همه‌چیز را پیدا کند.",
  },
  {
    q: "برای ثبت چه اطلاعاتی لازم است؟",
    a: "نام دقیق کسب‌وکار، آدرس و موقعیت روی نقشه، شماره تماس، ساعت کاری و چند عکس باکیفیت. بقیه مراحل فنی با ماست.",
  },
  {
    q: "اگر اطلاعاتم اشتباه ثبت شده باشد چه؟",
    a: "مالکیت نمایه موجود را ادعا می‌کنیم و آدرس، شماره، ساعت کاری و عکس‌ها را اصلاح و بهینه می‌کنیم.",
  },
  {
    q: "کارت ویزیت رایگان /bizcard با این پکیج‌ها چه فرقی دارد؟",
    a: "کارت رایگان را خودتان می‌سازید. در پکیج پولی، تیم آرایه ثبت حرفه‌ای در نقشه‌ها را انجام می‌دهد و (از پکیج محبوب) لینک شما با همه مسیریاب‌های پر شده تحویل می‌گیرد.",
  },
];

export { formatToman } from "@/lib/doctorsData";

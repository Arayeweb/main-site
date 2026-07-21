// داده‌های لندینگ ثبت گوگل — پکیج‌ها، FAQ و کپی.
// قیمت‌ها باید با GOOGLESABT_PACKAGES در app/api/googlesabt/checkout/route.ts هماهنگ بماند.

export type GooglesabtPackageKey = "basic" | "popular" | "vip";

export interface GooglesabtPackage {
  key: GooglesabtPackageKey;
  name: string;
  tagline: string;
  price: number;
  oldPrice: number;
  /** مبلغ پرداخت آنلاین = قیمت کامل پکیج (تومان) */
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
    name: "استاندارد",
    tagline: "Standard",
    price: 2_241_000,
    oldPrice: 2_490_000,
    deposit: 2_241_000,
    mapCount: 3,
    includesBizcard: false,
    description: "ثبت حرفه‌ای در گوگل، نشان و بلد برای شروع دیده‌شدن.",
    features: [
      "ثبت در ۳ نقشه: گوگل، نشان، بلد",
      "درستی‌سنجی نمایه گوگل",
      "لینک پروفایل گوگل قابل اشتراک",
      "تحویل کمتر از یک روز کاری",
    ],
  },
  {
    key: "popular",
    name: "حرفه‌ای",
    tagline: "Professional",
    price: 3_411_000,
    oldPrice: 3_790_000,
    deposit: 3_411_000,
    mapCount: 5,
    includesBizcard: true,
    popular: true,
    description: "ثبت در ۵ نقشه + هدیه کارت هوشمند کسب‌وکار.",
    features: [
      "ثبت در ۵ نقشه: گوگل، نشان، بلد، اسنپ، OSM",
      "هدیه: کارت هوشمند کسب‌وکار + QR اختصاصی",
      "همه مسیریاب‌ها روی یک لینک",
      "عکس، ساعت کاری و اطلاعات تماس",
      "تحویل کمتر از یک روز کاری",
    ],
  },
  {
    key: "vip",
    name: "VIP",
    tagline: "VIP",
    price: 4_491_000,
    oldPrice: 4_990_000,
    deposit: 4_491_000,
    mapCount: 5,
    includesBizcard: true,
    description: "همه امکانات حرفه‌ای + مدیریت نظرات و پشتیبانی اختصاصی.",
    features: [
      "همه امکانات پکیج حرفه‌ای",
      "هدیه: کارت هوشمند کسب‌وکار",
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
    q: "آیا این سرویس برای کسب‌وکار من مناسب است؟",
    a: "اگر مشتریان شما نام کسب‌وکارتان را در گوگل جستجو می‌کنند، این سرویس برای شما مناسب است؛ از فروشگاه‌ها و مطب‌ها گرفته تا شرکت‌ها و مراکز خدماتی.",
  },
  {
    q: "راه‌اندازی چقدر زمان می‌برد؟",
    a: "پس از تکمیل سفارش، فرایند راه‌اندازی آغاز می‌شود و نتیجه در کوتاه‌ترین زمان ممکن به شما اطلاع داده خواهد شد.",
  },
  {
    q: "برای ثبت سفارش چه اطلاعاتی نیاز است؟",
    a: "نام کسب‌وکار، شماره تماس، آدرس، دسته‌بندی و اطلاعات پایه کافی است. در صورت نیاز، کارشناسان ما با شما هماهنگ خواهند شد.",
  },
  {
    q: "اگر اطلاعات کسب‌وکارم تغییر کند چه می‌شود؟",
    a: "در صورت نیاز می‌توانید درخواست به‌روزرسانی اطلاعات را ثبت کنید.",
  },
  {
    q: "اگر در حین انجام کار سوال داشته باشم؟",
    a: "تیم پشتیبانی آرایه در تمام مراحل پاسخگوی شما خواهد بود.",
  },
  {
    q: "پرداخت آنلاین امن است؟",
    a: "بله. پرداخت از طریق درگاه بانکی امن انجام می‌شود و اطلاعات پرداخت نزد آرایه ذخیره نخواهد شد.",
  },
  {
    q: "اگر قبل از خرید سوال داشته باشم؟",
    a: "از چت‌بات مشاوره رایگان همین صفحه، تماس یا واتساپ می‌توانید با کارشناسان آرایه در ارتباط باشید.",
  },
];

export const googlesabtHowToSteps = [
  "پکیج مناسب را انتخاب کنید.",
  "اطلاعات کسب‌وکار، آدرس و ساعات کاری را تکمیل کنید.",
  "پرداخت آنلاین را انجام دهید.",
  "تیم آرایه راه‌اندازی را انجام می‌دهد و خروجی را تحویل می‌دهد.",
];

export interface GooglesabtCaseStudy {
  id: string;
  name: string;
  category: string;
  googleImage: string;
  smartLinkImage: string;
  googleUrl: string;
  smartLinkUrl: string;
  logo: string;
}

/** نمونه‌های واقعی ثبت‌شده — اسکرین‌شات از گوگل مپ و کارت هوشمند کسب‌وکار */
export const googlesabtCaseStudies: GooglesabtCaseStudy[] = [
  {
    id: "shoope",
    name: "اسموک لاب شوپه",
    category: "رستوران باربیکیو · کرمان",
    googleImage: "/showcase-assets/googlesabt/shoope-google-panel.png",
    smartLinkImage: "/showcase-assets/googlesabt/shoope-smartlink-card.png",
    googleUrl: "https://maps.app.goo.gl/RrDnaiHEaRYgyKf76",
    smartLinkUrl: "/b/shoope_smoke_lab",
    logo: "/showcase-assets/shoope/logo.jpg",
  },
  {
    id: "emdadahan",
    name: "امداد آهن",
    category: "توزیع مقاطع فولادی · تهران",
    googleImage: "/showcase-assets/googlesabt/emdadahan-google-panel.png",
    smartLinkImage: "/showcase-assets/googlesabt/emdadahan-smartlink-card.png",
    googleUrl: "https://maps.app.goo.gl/Lhfkg6XUfBY2j2xaA?g_st=ic",
    smartLinkUrl: "/b/emdadahan",
    logo: "/showcase-assets/emdadahan/logo.jpg",
  },
  {
    id: "salamt",
    name: "کلینیک دندانپزشکی سلامت",
    category: "دندانپزشکی · تهران",
    googleImage: "/showcase-assets/googlesabt/salamt-google-panel.png",
    smartLinkImage: "/showcase-assets/googlesabt/salamt-smartlink-card.png",
    googleUrl:
      "https://www.google.com/maps/place/Salamat+clinic/@35.7814536,51.4677344,17z/data=!3m1!4b1!4m6!3m5!1s0x3f8e0474aa3f977b:0xdd6a292a2448bd1f!8m2!3d35.7814536!4d51.4677344!16s%2Fg%2F11f1226tf0",
    smartLinkUrl: "/b/salamt-clinic",
    logo: "/showcase-assets/salamt/logo.jpg",
  },
];

export interface GooglesabtTestimonial {
  id: string;
  name: string;
  business: string;
  review: string;
  rating: number;
  logo: string;
  /** لینک کارت ویزیت — زیر اسم به‌صورت کوچک نمایش داده می‌شود */
  cardUrl?: string;
}

export const googlesabtTestimonials: GooglesabtTestimonial[] = [
  {
    id: "emdadahan",
    name: "امداد آهن",
    business: "توزیع مقاطع فولادی",
    review: "ثبت در گوگل را انجام دادند؛ از نتیجه راضی هستیم.",
    rating: 5,
    logo: "/showcase-assets/emdadahan/logo.jpg",
    cardUrl: "/b/emdadahan",
  },
  {
    id: "mohaseb-pardaz",
    name: "محاسبه پرداز حکمت",
    business: "نرم‌افزار و فناوری اطلاعات",
    review: "حضورمان در نقشه درست شد؛ مشتری قبل از آمدن آدرس و ساعت کاری را می‌بیند.",
    rating: 5,
    logo: "/showcase-assets/googlesabt/testimonials/mohaseb-pardaz.svg",
    cardUrl: "/b/mohaseb_pardaz",
  },
  {
    id: "tahereh-poordast",
    name: "دکتر طاهره پوردست",
    business: "متخصص زنان و زایمان",
    review: "ثبت مطب در گوگل انجام شد؛ بیمار مسیر و تماس را مستقیم از نقشه پیدا می‌کند.",
    rating: 5,
    logo: "/showcase-assets/googlesabt/testimonials/tahereh-poordast.jpg",
    cardUrl: "/b/dr-tahereh-poordast",
  },
];

/** نظرات تکمیلی — کوچک‌تر، زیر ردیف اصلی */
export const googlesabtTestimonialsMore: GooglesabtTestimonial[] = [
  {
    id: "almas-rayane",
    name: "الماس رایانه",
    business: "فروش و خدمات کامپیوتر",
    review: "کارت و نقشه با هم آماده شد؛ مشتری راحت‌تر پیدامون می‌کنه.",
    rating: 5,
    logo: "/showcase-assets/googlesabt/testimonials/almas-rayane.svg",
    cardUrl: "/b/card-njcmu8",
  },
  {
    id: "salamt-more",
    name: "کلینیک دندانپزشکی سلامت",
    business: "دندانپزشکی",
    review: "ساعت کاری و آدرس روی نقشه واضح شد؛ تماس‌ها بیشتر شد.",
    rating: 5,
    logo: "/showcase-assets/salamt/logo.jpg",
    cardUrl: "/b/salamt-clinic",
  },
  {
    id: "shoope-more",
    name: "اسموک لاب شوپه",
    business: "رستوران باربیکیو",
    review: "جست‌وجوی رستوران در کرمان دیگر بی‌نتیجه نیست.",
    rating: 5,
    logo: "/showcase-assets/shoope/logo.jpg",
    cardUrl: "/b/shoope_smoke_lab",
  },
  {
    id: "novin-salon",
    name: "سالن زیبایی نوین",
    business: "آرایشگاه و زیبایی",
    review: "ثبت نشان و بلد هم انجام شد؛ رزرو از نقشه راحت‌تر شد.",
    rating: 5,
    logo: "/showcase-assets/googlesabt/testimonials/novin-salon.svg",
  },
  {
    id: "aria-pharmacy",
    name: "داروخانه آریا",
    business: "داروخانه",
    review: "اطلاعات تماس و مسیر یک‌جا درست شد؛ پشتیبانی خوب بود.",
    rating: 5,
    logo: "/showcase-assets/googlesabt/testimonials/aria-pharmacy.svg",
  },
  {
    id: "pars-cafe",
    name: "کافه پارس",
    business: "کافی‌شاپ",
    review: "بعد از ثبت در گوگل، مشتری‌های عبوری بیشتر شدن.",
    rating: 5,
    logo: "/showcase-assets/googlesabt/testimonials/ParsCafe.svg",
  },
];

export { formatToman } from "@/lib/doctorsData";

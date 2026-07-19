// داده‌های لندینگ فروش مستقیم طراحی سایت پزشکی — Direct Response.
// قیمت نمایشی تومان؛ Structured Data با IRR (= تومان × ۱۰).

/** قیمت پکیج مطب تک‌پزشک */
export const DOCTORS_PRODUCT_PRICE_TOMAN = 20_000_000;
/** پیش‌پرداخت شروع = ۳۰٪ */
export const DOCTORS_DEPOSIT_TOMAN = 6_000_000;
/** @deprecated قیمت قدیمی */
export const DOCTORS_PRODUCT_OLD_PRICE_TOMAN = 30_000_000;

/**
 * فوریت قابل‌مدیریت — فقط با مقدار واقعی پر شود.
 * اگر null باشد، نوار فوریت مربوطه رندر نمی‌شود. عدد ساختگی نگذارید.
 */
export const doctorsUrgencyConfig: {
  /** تاریخ پایان قیمت فعلی — ISO date مثل 2026-08-15 */
  priceValidUntil: string | null;
  /** ظرفیت باقی‌مانده اجرای جدید در ماه جاری */
  remainingSlotsThisMonth: number | null;
} = {
  priceValidUntil: null,
  remainingSlotsThisMonth: null,
};

export const DOCTORS_WA_ORDER_MESSAGE =
  "سلام، پکیج ۲۰ میلیونی طراحی سایت پزشکی را دیدم. تخصص من … و شهر فعالیتم … است. می‌خواهم با پیش‌پرداخت ۶ میلیون شروع کنم. لطفاً نمونه و مراحل را بفرستید.";

export function buildDoctorsWaSpecialtyMessage(specialty: string): string {
  return `سلام، پکیج ۲۰ میلیونی طراحی سایت پزشکی را دیدم. تخصص من ${specialty} است. این مدل را برای مطب من می‌خواهم. لطفاً نمونه و شروع با ۶ میلیون را هماهنگ کنید.`;
}

export function buildDoctorsWaQuoteMessage(opts: {
  specialty: string;
  city?: string;
  businessType?: string;
  addons?: string[];
  name?: string;
}): string {
  const lines = [
    "سلام، از صفحه طراحی سایت پزشکی آرایه پیام می‌دهم.",
    opts.name?.trim() ? `نام: ${opts.name.trim()}` : null,
    `تخصص: ${opts.specialty}`,
    opts.city?.trim() ? `شهر: ${opts.city.trim()}` : null,
    opts.businessType ? `نوع مجموعه: ${opts.businessType}` : null,
    opts.addons?.length ? `امکانات: ${opts.addons.join("، ")}` : null,
    "لطفاً نمونه مرتبط، زمان‌بندی و مراحل شروع را بفرستید.",
  ].filter(Boolean);
  return lines.join("\n");
}

export const DOCTORS_SALES_SUCCESS_MESSAGE =
  "درخواست شما ثبت شد. نمونه مرتبط، زمان‌بندی و مراحل شروع را همین الان می‌توانید ببینید و در واتساپ ادامه دهید.";

export const DOCTORS_SPECIALTY_EVENT = "doctors:specialty-select";

export type DoctorPackageKey = "matab" | "clinic" | "center";

export interface DoctorPackage {
  key: DoctorPackageKey;
  name: string;
  tagline: string;
  price: number;
  oldPrice: number;
  deposit: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export const doctorPackages: DoctorPackage[] = [
  {
    key: "matab",
    name: "مطب",
    tagline: "برای پزشک انفرادی",
    price: DOCTORS_PRODUCT_PRICE_TOMAN,
    oldPrice: DOCTORS_PRODUCT_OLD_PRICE_TOMAN,
    deposit: DOCTORS_DEPOSIT_TOMAN,
    description: "سایت اختصاصی مطب تک‌پزشک برای جذب بیمار و درخواست نوبت.",
    features: [
      "سایت تخصصی + صفحات خدمت",
      "مسیر تماس، واتساپ و نوبت",
      "دامنه و سرور به نام پزشک",
      "سئوی فنی اولیه",
      "نسخه اولیه در ۲ روز کاری",
      "۳۰ روز پشتیبانی اولیه",
    ],
  },
  {
    key: "clinic",
    name: "کلینیک",
    tagline: "برای ۲ تا ۶ پزشک",
    price: 45_000_000,
    oldPrice: 55_000_000,
    deposit: 4_900_000,
    description: "سایت کامل چندپزشکه — پکیج جدا از مطب تک‌پزشک.",
    popular: true,
    features: [
      "همه امکانات پکیج مطب",
      "چندپزشکه با تقویم نوبت مجزا",
      "چت‌بات پاسخگوی بیماران",
      "سئوی تخصصی + بلاگ",
      "پنل مدیریت یکپارچه",
      "پشتیبانی ۶ ماهه",
    ],
  },
  {
    key: "center",
    name: "مرکز درمانی",
    tagline: "راهکار سازمانی",
    price: 59_000_000,
    oldPrice: 74_000_000,
    deposit: 9_900_000,
    description: "راهکار کامل برای درمانگاه و مرکز درمانی.",
    features: [
      "همه امکانات پکیج کلینیک",
      "اتصال به سیستم‌های داخلی",
      "پنل بیمار",
      "مدیر پروژه اختصاصی",
      "گزارش ماهانه",
      "پشتیبانی ۱۲ ماهه",
    ],
  },
];

export function tomanToIrr(toman: number): number {
  return toman * 10;
}

export const DOCTORS_SLA =
  "گزارش حداکثر تا پایان روز کاری بعد در واتساپ ارسال می‌شود.";

export const DOCTORS_SUCCESS_MESSAGE =
  "درخواست شما ثبت شد. مسیر آنلاین مطب بررسی می‌شود و گزارش حداکثر تا پایان روز کاری بعد در واتساپ برایتان ارسال خواهد شد.";

export type DoctorPresenceKey = "website" | "social_or_medical_profile" | "none";
export type DoctorPrimaryGoalKey =
  | "search_visibility"
  | "patient_trust"
  | "appointment_conversion"
  | "not_sure";

export const doctorPresenceOptions: { key: DoctorPresenceKey; label: string }[] = [
  { key: "website", label: "سایت" },
  { key: "social_or_medical_profile", label: "فقط اینستاگرام یا پروفایل پزشکی" },
  { key: "none", label: "هیچ‌کدام" },
];

export const doctorPrimaryGoalOptions: { key: DoctorPrimaryGoalKey; label: string }[] = [
  { key: "search_visibility", label: "دیده‌شدن در جستجو" },
  { key: "patient_trust", label: "افزایش اعتماد بیمار" },
  { key: "appointment_conversion", label: "ساده‌ترشدن درخواست نوبت" },
  { key: "not_sure", label: "مطمئن نیستم" },
];

export interface DoctorReportAxis {
  label: string;
  note: string;
}

export type DoctorActionImpact = "زیاد" | "متوسط";
export type DoctorActionEffort = "کم" | "متوسط" | "زیاد";

export interface DoctorPriorityAction {
  text: string;
  impact: DoctorActionImpact;
  effort: DoctorActionEffort;
}

export const doctorSampleReport = {
  clinicName: "نمونه: مطب تخصصی پوست — تهران",
  axes: [
    {
      label: "دیده‌شدن در جستجو",
      note: "نام پزشک پیدا می‌شود، اما صفحات مشخصی برای خدمات اصلی وجود ندارد.",
    },
    {
      label: "ردپای محلی",
      note: "اطلاعات آدرس و ساعات در سایت، اینستاگرام و نقشه‌های محلی یکدست نیست.",
    },
    {
      label: "اعتماد و اطلاعات مطب",
      note: "تخصص و آدرس مشخص است؛ اطلاعات بیمه، خدمات و پاسخ سؤالات رایج ناقص است.",
    },
    {
      label: "مسیر تماس یا درخواست نوبت",
      note: "فقط شماره تماس وجود دارد و مسیر واتساپ یا درخواست نوبت واضح نیست.",
    },
  ] satisfies DoctorReportAxis[],
  diagnosis:
    "بیمار بعد از جستجوی خدمت، صفحه‌ای که توضیح خدمت و مسیر اقدام را یکجا نشان دهد پیدا نمی‌کند.",
  priorityActions: [
    {
      text: "ساخت صفحه مجزا برای ۳ خدمت اصلی با عنوان‌های قابل‌جستجو",
      impact: "زیاد",
      effort: "متوسط",
    },
    {
      text: "اضافه‌کردن دکمه ثابت تماس یا واتساپ در موبایل",
      impact: "زیاد",
      effort: "کم",
    },
    {
      text: "یکسان‌سازی آدرس، ساعات و اطلاعات مطب در سایت، اینستاگرام، نشان و بلد",
      impact: "متوسط",
      effort: "متوسط",
    },
  ] satisfies DoctorPriorityAction[],
  suggestedPath:
    "در این مرحله طراحی مجدد کامل لازم نیست؛ اولویت با اصلاح صفحات خدمات و مسیر درخواست نوبت است.",
};

export interface DoctorCaseStudy {
  specialty: string;
  title: string;
  city: string;
  siteUrl?: string;
  problem: string;
  /** @deprecated use problem */
  initialState?: string;
  work: string[];
  outcome: string;
  duration: string;
  quote?: string;
  quoteRole?: string;
  image?: string;
  mobileImage?: string;
  desktopImage?: string;
}

export const doctorCaseStudy: DoctorCaseStudy = {
  specialty: "بیماری‌های عفونی",
  title: "دکتر عالیه پوردست",
  city: "تهران",
  siteUrl: "https://aliehpourdast.com",
  problem:
    "بیماران برای پیدا کردن تخصص، سابقه و راه تماس باید چند مسیر جدا را طی می‌کردند؛ مسیر از جستجو تا درخواست نوبت کوتاه و شفاف نبود.",
  work: [
    "صفحه معرفی تخصص و رزومه علمی",
    "اطلاعات مطب و مسیر تماس یکدست",
    "معرفی خدمات و مسیر مشخص درخواست نوبت",
  ],
  outcome:
    "خروجی قابل‌مشاهده شامل معرفی تخصص و رزومه علمی، اطلاعات یکدست مطب، معرفی خدمات و مسیر مشخص تماس یا درخواست نوبت است.",
  duration: "حدود ۵ روز کاری پس از دریافت محتوا",
  quote:
    "برای من مهم بود سایت هم تخصص و سابقه علمی‌ام را درست نشان بدهد و هم کارکردن با آن ساده باشد؛ مسائل فنی را تیم مدیریت کرد.",
  quoteRole: "فوق تخصص بیماری‌های عفونی و گرمسیری",
  image: "/showcase-assets/pourdast/portrait.webp",
  mobileImage: "/showcase-assets/pourdast/mobile.png",
  desktopImage: "/showcase-assets/pourdast/desktop.png",
};

/** پروژه‌های واقعی — با اضافه کردن آیتم جدید بدون تغییر صفحه نمایش داده می‌شوند */
export type DoctorPortfolioProject = {
  id: string;
  name: string;
  specialty: string;
  city: string;
  siteUrl: string;
  desktopImage?: string;
  mobileImage?: string;
  portraitImage?: string;
  problem: string;
  work: string[];
  duration: string;
  quote?: string;
  quoteRole?: string;
  verified: boolean;
};

export const doctorPortfolioProjects: DoctorPortfolioProject[] = [
  {
    id: "pourdast",
    name: doctorCaseStudy.title,
    specialty: doctorCaseStudy.specialty,
    city: doctorCaseStudy.city,
    siteUrl: doctorCaseStudy.siteUrl!,
    desktopImage: doctorCaseStudy.desktopImage,
    mobileImage: doctorCaseStudy.mobileImage,
    portraitImage: doctorCaseStudy.image,
    problem: doctorCaseStudy.problem,
    work: doctorCaseStudy.work,
    duration: doctorCaseStudy.duration,
    quote: doctorCaseStudy.quote,
    quoteRole: doctorCaseStudy.quoteRole,
    verified: true,
  },
  {
    id: "pourdast-tahereh",
    name: "دکتر طاهره پوردست",
    specialty: "زنان و زایمان",
    city: "شیراز",
    siteUrl: "https://dr-pourdast.vercel.app",
    desktopImage: "/showcase-assets/pourdast-tahereh/desktop.png",
    mobileImage: "/showcase-assets/pourdast-tahereh/mobile.png",
    problem:
      "بیماران برای پیدا کردن تخصص، فلوشیپ لاپاراسکوپی و مسیر نوبت باید چند کانال جدا را طی می‌کردند؛ معرفی علمی و اقدام در یک مقصد نبود.",
    work: [
      "صفحه معرفی تخصص زنان و فلوشیپ لاپاراسکوپی",
      "تمرکز روی درمان اندومتریوز و جراحی‌های کم‌تهاجمی",
      "مسیر مشخص تماس مطب و مشاهده نوبت‌های آزاد",
    ],
    duration: "حدود ۵ روز کاری پس از دریافت محتوا",
    quote:
      "برای جست‌وجوهای مربوط به مطب زنان، حضورمان در گوگل شفاف‌تر شد و نوبت‌گیری برای بیماران راحت‌تر شده.",
    quoteRole: "متخصص زنان و زایمان — فلوشیپ لاپاراسکوپی پیشرفته زنان",
    verified: true,
  },
];

export function getVerifiedDoctorProjects() {
  return doctorPortfolioProjects.filter((p) => p.verified);
}

export type DoctorReview = {
  id: string;
  name: string;
  image?: string;
  specialty: string;
  city: string;
  quote: string;
  siteUrl?: string;
  verified: boolean;
};

/** فقط Reviewهای واقعی و verified نمایش داده می‌شوند */
export const doctorReviews: DoctorReview[] = [
  {
    id: "pourdast",
    name: "دکتر عالیه پوردست",
    image: "/showcase-assets/pourdast/portrait.webp",
    specialty: "بیماری‌های عفونی",
    city: "تهران",
    quote:
      "برای من مهم بود سایت هم تخصص و سابقه علمی‌ام را درست نشان بدهد و هم کارکردن با آن ساده باشد؛ مسائل فنی را تیم مدیریت کرد.",
    siteUrl: "https://aliehpourdast.com",
    verified: true,
  },
  {
    id: "salamt-clinic",
    name: "کلینیک سلامت",
    specialty: "مراقبت و درمان",
    city: "تهران",
    quote:
      "حضورمان در گوگل و نقشه درست شد؛ بیمار قبل از مراجعه آدرس، ساعت کاری و راه تماس را می‌بیند.",
    siteUrl: "https://araaye.com/b/salamt-clinic",
    verified: true,
  },
  {
    id: "ashrafivand",
    name: "شیوا اشرفی‌وند",
    specialty: "کلینیک شنوایی",
    city: "تهران",
    quote:
      "کسانی که برای سمعک یا مشاوره شنوایی جست‌وجو می‌کنند، راحت‌تر به کلینیک ما می‌رسند و مسیر نوبت‌گیری شفاف‌تر شده.",
    verified: true,
  },
  {
    id: "pourdast-tahereh",
    name: "دکتر طاهره پوردست",
    specialty: "زنان و زایمان",
    city: "شیراز",
    quote:
      "برای جست‌وجوهای مربوط به مطب زنان، حضورمان در گوگل شفاف‌تر شد و نوبت‌گیری برای بیماران راحت‌تر شده.",
    siteUrl: "https://dr-pourdast.vercel.app",
    verified: true,
  },
  {
    id: "kordian-clinic",
    name: "کلینیک دندان‌پزشکی کوردیان",
    specialty: "دندان‌پزشکی",
    city: "تهران",
    quote:
      "سایت هم خدمات کلینیک را واضح نشان می‌دهد و هم بیمار قبل از تماس می‌فهمد چه خدماتی داریم؛ پیگیری تماس‌ها خیلی منظم‌تر شد.",
    verified: true,
  },
];

export function getVerifiedDoctorReviews() {
  return doctorReviews.filter((r) => r.verified && r.quote.trim().length > 0);
}

export type DoctorSampleKind = "demo" | "executed";

export interface DoctorSpecialtySample {
  key: string;
  label: string;
  kind: DoctorSampleKind;
  demoUrl: string;
  demoExternal?: boolean;
  accent: string;
  buyReason?: string;
}

export const doctorSpecialtySamples: DoctorSpecialtySample[] = [
  {
    key: "dentist",
    label: "دندانپزشکی",
    kind: "demo",
    demoUrl: "/doctors/demo/dentist",
    accent: "cyan",
    buyReason: "نمایش خدمات، نمونه درمان و درخواست مشاوره",
  },
  {
    key: "dermatology",
    label: "پوست و زیبایی",
    kind: "demo",
    demoUrl: "/doctors/demo/dermatology",
    accent: "slate",
    buyReason: "گالری، صفحات خدمات و جذب مشاوره زیبایی",
  },
  {
    key: "ophthalmology",
    label: "چشم‌پزشکی",
    kind: "demo",
    demoUrl: "/doctors/demo/ophthalmology",
    accent: "sky",
    buyReason: "معرفی جراحی‌ها، اعتبار علمی و مسیر معاینه",
  },
  {
    key: "pediatric",
    label: "کودکان",
    kind: "demo",
    demoUrl: "/doctors/demo/pediatric",
    accent: "teal",
    buyReason: "اعتماد والدین، معرفی خدمات و نوبت ساده",
  },
  {
    key: "physiotherapy",
    label: "فیزیوتراپی",
    kind: "demo",
    demoUrl: "/doctors/demo/physiotherapy",
    accent: "brand",
    buyReason: "معرفی روش‌های درمان و درخواست ارزیابی",
  },
  {
    key: "women",
    label: "زنان",
    kind: "executed",
    demoUrl: "https://dr-pourdast.vercel.app",
    demoExternal: true,
    accent: "teal",
    buyReason: "معرفی تخصص، پاسخ به نگرانی‌های بیمار و نوبت سریع",
  },
  {
    key: "other",
    label: "سایر تخصص‌ها",
    kind: "demo",
    demoUrl: "/doctors/demo/other",
    accent: "sky",
    buyReason: "هویت اختصاصی پزشک، صفحات خدمت و مسیر درخواست نوبت",
  },
];

export type DoctorSpecialtyOption = {
  key: string;
  label: string;
  sampleKey: string;
  buyReason: string;
};

export const doctorSpecialtyOptions: DoctorSpecialtyOption[] = [
  {
    key: "dentist",
    label: "دندانپزشکی",
    sampleKey: "dentist",
    buyReason: "نمایش خدمات، نمونه درمان و درخواست مشاوره",
  },
  {
    key: "women",
    label: "زنان",
    sampleKey: "women",
    buyReason: "معرفی تخصص، پاسخ به نگرانی‌های بیمار و نوبت سریع",
  },
  {
    key: "dermatology",
    label: "پوست و زیبایی",
    sampleKey: "dermatology",
    buyReason: "گالری، صفحات خدمات و جذب مشاوره زیبایی",
  },
  {
    key: "ophthalmology",
    label: "چشم‌پزشکی",
    sampleKey: "ophthalmology",
    buyReason: "معرفی جراحی‌ها، اعتبار علمی و مسیر معاینه",
  },
  {
    key: "pediatric",
    label: "کودکان",
    sampleKey: "pediatric",
    buyReason: "اعتماد والدین، معرفی خدمات و نوبت ساده",
  },
  {
    key: "physiotherapy",
    label: "فیزیوتراپی",
    sampleKey: "physiotherapy",
    buyReason: "معرفی روش‌های درمان و درخواست ارزیابی",
  },
  {
    key: "other",
    label: "سایر تخصص‌ها",
    sampleKey: "other",
    buyReason: "هویت اختصاصی پزشک، صفحات خدمت و مسیر درخواست نوبت",
  },
];

export const doctorOfferStack = [
  "سایت اختصاصی و متناسب با برند پزشک",
  "سه لندینگ مستقل برای خدمات اصلی",
  "مسیر مستقیم تماس، واتساپ و درخواست نوبت",
  "اتصال به سامانه نوبت‌دهی فعلی",
  "رزومه، سوابق علمی و عناصر اعتمادسازی",
  "پنل انتشار مقاله برای رشد در گوگل",
  "زیرساخت فنی و صفحات آماده سئو",
  "نقشه و اطلاعات کامل مطب",
  "طراحی کامل موبایل",
  "مالکیت کامل دامنه و سایت",
  "دو مرحله اصلاح",
  "۳۰ روز پشتیبانی و رفع ایراد",
] as const;

export const doctorProductPackageFeatures = doctorOfferStack;

export const doctorProductPackageExcluded = [
  "اجرای ماهانه سئو",
  "تولید مستمر مقاله",
  "عکاسی و فیلم‌برداری",
  "ساخت سامانه نوبت‌دهی اختصاصی",
  "پرونده الکترونیک بیمار",
  "امکانات نرم‌افزاری سفارشی",
] as const;

export const doctorSeoDisclaimer =
  "سئوی اولیه به معنی تضمین رتبه اول گوگل نیست؛ تولید محتوا و رقابت روی عبارت‌های تخصصی، خدمت جداگانه است.";

export const doctorPaymentMilestones = [
  {
    label: "شروع پروژه",
    percent: "۳۰٪",
    amountLabel: "۶ میلیون تومان",
    note: "پیش‌پرداخت شروع — بدون پرداخت کامل",
  },
  {
    label: "پس از تأیید نسخه اولیه",
    percent: "۴۰٪",
    amountLabel: "۸ میلیون تومان",
    note: "فقط بعد از دیدن و تأیید نسخه اول",
  },
  {
    label: "هنگام تحویل نهایی",
    percent: "۳۰٪",
    amountLabel: "۶ میلیون تومان",
    note: "انتشار روی دامنه پزشک",
  },
] as const;

export const doctorDeliveryTimeline = [
  { label: "نسخه اولیه", value: "۲ روز کاری پس از دریافت اطلاعات" },
  { label: "تحویل نهایی", value: "حدود ۵ تا ۷ روز کاری" },
] as const;

export const doctorRiskGuarantees = [
  "نسخه اولیه در زمان توافق‌شده",
  "مالکیت کامل دامنه و سایت",
  "رفع ایرادات فنی تا ۳۰ روز",
] as const;

export const doctorLossAversion = {
  title: "وقتی بیمار شما را در گوگل پیدا نکند، پزشک بعدی را انتخاب می‌کند",
  problems: [
    "بیمار نام یا خدمت شما را جستجو می‌کند، ولی صفحه حرفه‌ای و کاملی پیدا نمی‌کند.",
    "برای فهمیدن خدمات، سابقه، آدرس و نوبت باید بین اینستاگرام و سامانه‌های مختلف بچرخد.",
    "تماس خارج از ساعت پاسخ داده نمی‌شود و درخواست بیمار از دست می‌رود.",
  ],
  punchline: "هر مسیر نامشخص، یعنی یک درخواست نوبت کمتر.",
};

export const doctorProductProcessSteps = [
  {
    step: "۱",
    title: "ارسال اطلاعات مطب",
    description: "اطلاعات مطب، خدمات و تصاویر را می‌فرستید.",
  },
  {
    step: "۲",
    title: "آماده‌سازی نسخه اولیه",
    description: "نسخه اولیه طی دو روز کاری آماده می‌شود.",
  },
  {
    step: "۳",
    title: "تأیید و اصلاح",
    description: "نسخه را می‌بینید، تأیید می‌کنید و تا دو مرحله اصلاح انجام می‌شود.",
  },
  {
    step: "۴",
    title: "انتشار روی دامنه پزشک",
    description: "سایت روی دامنه و سرور به نام شما منتشر می‌شود.",
  },
];

export const doctorPatientPathBar = {
  steps: ["جستجو در گوگل", "بررسی تخصص و اعتبار", "درخواست نوبت"],
  note: "سایت مسیر فروش مطب است: از جستجو تا تماس، واتساپ یا درخواست نوبت.",
};

export const doctorSpecialtyNeedCards = [
  {
    key: "visual",
    title: "تخصص‌های بصری",
    specialties: "دندانپزشکی، پوست، زیبایی",
    focus: "گالری، تصاویر قبل و بعد، معرفی خدمات و درخواست مشاوره — تبدیل بازدید به مشاوره.",
  },
  {
    key: "scientific",
    title: "تخصص‌های علمی",
    specialties: "داخلی، عفونی، زنان، چشم و مشابه",
    focus: "رزومه علمی، سوابق، مقالات تأییدشده، FAQ و نوبت — ساخت اعتماد قبل از تماس.",
  },
] as const;

export const doctorComparisonRows = [
  { criterion: "هویت اختصاصی پزشک", araaye: "بله", template: "قالبی و تکراری", booking: "خیر" },
  { criterion: "مالکیت کامل", araaye: "دامنه و سایت به نام پزشک", template: "معمولاً محدود", booking: "متعلق به پلتفرم" },
  { criterion: "صفحات مستقل خدمات", araaye: "سه لندینگ خدمت", template: "محدود یا یک صفحه", booking: "معمولاً ندارد" },
  { criterion: "قابلیت رشد در گوگل", araaye: "ساختار قابل ایندکس + پنل مقاله", template: "ضعیف", booking: "محدود به پلتفرم" },
  { criterion: "مسیر تبدیل و CTA", araaye: "تماس، واتساپ، نوبت", template: "ناقص", booking: "فقط نوبت داخلی" },
  { criterion: "امکان توسعه", araaye: "بله", template: "کم", booking: "محدود" },
  { criterion: "پشتیبانی مشخص", araaye: "۳۰ روز + قرارداد", template: "مبهم", booking: "پشتیبانی پلتفرم" },
  { criterion: "زمان‌بندی و قرارداد", araaye: "۲ تا ۷ روز کاری", template: "نامشخص", booking: "آنی ولی وابسته" },
  { criterion: "قیمت شفاف", araaye: "۲۰ میلیون", template: "ارزان اول، هزینه بعد", booking: "اشتراک ماهانه" },
] as const;

export const doctorComparisonFooter =
  "اگر فقط یک صفحه معرفی ارزان می‌خواهید، آرایه انتخاب مناسبی نیست. اگر می‌خواهید سایت به دارایی رسمی و قابل توسعه مطب تبدیل شود، این پکیج برای شماست.";

export const doctorTrustBarItems = [
  "جذب بیمار از گوگل",
  "افزایش درخواست نوبت",
  "تبدیل بازدیدکننده به مراجعه‌کننده",
  "ساخت مسیر فروش مطب",
] as const;

export type DoctorFormAddon = {
  key: string;
  label: string;
  /** اگر true داخل پکیج ۲۰M است؛ وگرنه «نیازمند برآورد» */
  inPackage: boolean;
};

export const doctorFormAddons: DoctorFormAddon[] = [
  { key: "booking_connect", label: "اتصال نوبت‌دهی", inPackage: true },
  { key: "content", label: "تولید محتوا", inPackage: false },
  { key: "monthly_seo", label: "سئوی ماهانه", inPackage: false },
  { key: "multilingual", label: "چندزبانه", inPackage: false },
  { key: "photography", label: "عکاسی", inPackage: false },
  { key: "custom", label: "امکانات اختصاصی", inPackage: false },
];

export const doctorSeoContentBlocks = [
  {
    title: "قیمت طراحی سایت پزشکی چقدر است؟",
    body: "پکیج مطب تک‌پزشک آرایه قیمت ۲۰ میلیون تومان دارد: ۳۰٪ شروع (۶ میلیون)، ۴۰٪ بعد از تأیید نسخه اولیه، ۳۰٪ هنگام تحویل. کلینیک چندپزشکه پکیج جداگانه دارد و امکانات اضافه مثل سئوی ماهانه، تولید محتوا یا عکاسی نیازمند برآورد جدا هستند.",
  },
  {
    title: "نمونه سایت پزشکی واقعی چیست؟",
    body: "نمونه‌های اجراشده قابل‌مشاهده، سایت دکتر عالیه پوردست و سایت دکتر طاهره پوردست هستند. علاوه بر آن، دموهای تخصصی دندانپزشکی، پوست و زیبایی، چشم، کودکان و فیزیوتراپی مسیر معرفی خدمت تا درخواست نوبت را نشان می‌دهند.",
  },
  {
    title: "امکانات سایت پزشکان در این پکیج",
    body: "هویت اختصاصی، معرفی پزشک و رزومه، سه لندینگ خدمت، مسیر تماس و واتساپ و نوبت، اتصال به سامانه نوبت موجود، پنل مقاله، نقشه مطب، موبایل کامل، سئوی فنی اولیه، دامنه و سرور به نام پزشک، دو مرحله اصلاح و ۳۰ روز رفع ایراد.",
  },
  {
    title: "طراحی سایت نوبت‌دهی پزشکی یعنی چه؟",
    body: "در این پکیج سامانه نوبت‌دهی اختصاصی ساخته نمی‌شود؛ اگر سامانه دارید، به آن وصل می‌شویم تا بیمار از صفحه خدمت به درخواست نوبت برسد. ساخت نرم‌افزار نوبت جداگانه خارج از پکیج است.",
  },
  {
    title: "طراحی سایت مطب در مقابل طراحی سایت کلینیک",
    body: "مطب تک‌پزشک با پکیج ۲۰ میلیونی پوشش داده می‌شود. کلینیک چندپزشکه نیاز به ساختار چندپزشک، تقویم مجزا و مدیریت پیچیده‌تر دارد و در صفحه طراحی سایت کلینیک قیمت‌گذاری می‌شود.",
  },
  {
    title: "طراحی سایت برای تخصص‌های مختلف",
    body: "تخصص‌های بصری (دندان، پوست، زیبایی) روی گالری و مشاوره تمرکز دارند؛ تخصص‌های علمی (زنان، چشم، عفونی و مشابه) روی رزومه، FAQ و نوبت. سایت قالب تکراری پزشکی نیست؛ متناسب با مسیر تصمیم بیمار همان تخصص طراحی می‌شود.",
  },
  {
    title: "سایت پزشکی وردپرسی یا اختصاصی؟",
    body: "خروجی آرایه سایت اختصاصی با مالکیت دامنه و سرور به نام پزشک است و برای رشد در گوگل و توسعه بعدی انعطاف بیشتری از قالب آماده دارد. انتخاب نهایی بر اساس نیاز مطب و محدوده پروژه هماهنگ می‌شود.",
  },
  {
    title: "مراحل سفارش و مدت تحویل",
    body: "ارسال اطلاعات مطب، نسخه اولیه در ۲ روز کاری، تأیید و اصلاح، سپس انتشار روی دامنه پزشک. تحویل نهایی معمولاً حدود ۵ تا ۷ روز کاری است.",
  },
  {
    title: "سئو سایت پزشکی از کجا شروع می‌شود؟",
    body: "سئوی فنی اولیه و ساختار قابل ایندکس داخل پکیج است. تولید مستمر مقاله و سئوی ماهانه خدمت جداست و تضمین رتبه اول گوگل داده نمی‌شود؛ هدف، آماده‌کردن مسیر جذب بیمار از جستجو تا نوبت است.",
  },
  {
    title: "سایت پزشکی یا اینستاگرام؟",
    body: "اینستاگرام برای نمایش و ارتباط مفید است، اما مقصد قابل ایندکس در گوگل، صفحات خدمت مستقل و مالکیت دارایی دیجیتال نیست. سایت مسیر رسمی مطب را می‌سازد و می‌تواند به اینستاگرام و واتساپ هم وصل شود.",
  },
  {
    title: "سایت اختصاصی یا سامانه‌های عمومی نوبت‌دهی",
    body: "سامانه عمومی بیشتر برای نوبت است؛ سایت اختصاصی هویت پزشک، صفحات خدمت، رشد گوگل و مالکیت دامنه را می‌دهد و در عین حال می‌تواند به همان سامانه نوبت وصل شود.",
  },
] as const;

export const doctorStartingPriceToman = doctorPackages[0].price;

/** @deprecated */
export const doctorPatientPath = [
  { step: "۱", title: "جستجو", description: "بیمار تخصص یا نام شما را در گوگل جستجو می‌کند." },
  { step: "۲", title: "اعتماد", description: "صفحه خدمات، اطلاعات مطب و نظرات را سریع بررسی می‌کند." },
  { step: "۳", title: "درخواست نوبت", description: "اگر مسیر تماس واضح باشد، همان‌جا نوبت می‌گیرد یا پیام می‌دهد." },
];

export const doctorProcessSteps = doctorProductProcessSteps;

export const doctorAuditProcessSteps = [
  { step: "۱", title: "بررسی رایگان", description: "وضعیت حضور در گوگل، صفحه خدمات و مسیر نوبت را بررسی می‌کنیم." },
  { step: "۲", title: "گزارش و پیشنهاد", description: "سه ایراد مهم و پیشنهاد عملی می‌فرستیم." },
  { step: "۳", title: "اجرا با محدوده روشن", description: "بعد از توافق روی محدوده کار، اجرا شروع می‌شود." },
];

/** @deprecated */
export const doctorProblems = [
  { title: "در گوگل پیدا نمی‌شوید", description: "نام و تخصص در نتایج محلی نیست یا اطلاعات ناقص است." },
  { title: "سایت فقط معرفی است", description: "صفحه خدمات و مسیر درخواست نوبت برای بیمار روشن نیست." },
  { title: "تماس‌ها خارج از ساعت از دست می‌رود", description: "بیمار شب یا آخر هفته شماره می‌زند و جوابی نمی‌گیرد." },
  { title: "منشی زیر بار سؤالات تکراری است", description: "هزینه، آدرس، بیمه و ساعات مدام تلفنی تکرار می‌شود." },
];

/** @deprecated */
export const doctorOutputs = [
  { title: "سایت مطب", description: "معرفی تخصص، خدمات و مسیر درخواست نوبت", href: "/demo" },
  { title: "نمونه واقعی", description: "سایت دکتر عالیه پوردست", href: "https://aliehpourdast.com", external: true },
  {
    title: "نمونه واقعی",
    description: "سایت دکتر طاهره پوردست",
    href: "https://dr-pourdast.vercel.app",
    external: true,
  },
  { title: "نمونه گزارش", description: "خروجی بررسی رایگان مسیر جذب بیمار", href: "#sample-report" },
];

export type DoctorDiagnosticKey = "foundation" | "visibility" | "conversion" | "custom";

export interface DoctorDiagnosticPath {
  key: DoctorDiagnosticKey;
  title: string;
  description: string;
}

export const doctorDiagnosticPaths: DoctorDiagnosticPath[] = [
  {
    key: "foundation",
    title: "مقصد قابل‌اعتماد ندارید",
    description: "اگر سایت یا صفحه مناسبی برای معرفی خدمات ندارید، ساخت زیرساخت اولیه پیشنهاد می‌شود.",
  },
  {
    key: "visibility",
    title: "سایت دارید اما دیده نمی‌شوید",
    description: "اگر زیرساخت وجود دارد ولی در جستجو ورودی نمی‌گیرد، مسیر SEO و دیده‌شدن بررسی می‌شود.",
  },
  {
    key: "conversion",
    title: "بازدید دارید اما درخواست نوبت کم است",
    description: "اولویت با اصلاح صفحات خدمات، CTA و مسیر تماس یا نوبت است.",
  },
  {
    key: "custom",
    title: "کلینیک چندپزشکه یا نیاز پیچیده دارید",
    description: "برای چند پزشک، چند شعبه یا اتصال به سیستم‌های دیگر، محدوده اختصاصی تعریف می‌شود.",
  },
];

export const doctorAfterReportTrust =
  "اگر مشکل مهمی وجود نداشته باشد، فقط چک‌لیست اصلاحات را دریافت می‌کنید و پیشنهادی برای اجرا ارسال نمی‌شود.";

export const doctorCooperationNote =
  "شروع با پیش‌پرداخت ۶ میلیون؛ ادامه پرداخت بعد از تأیید نسخه اولیه. جزئیات در واتساپ یا فرم هماهنگ می‌شود.";

export const doctorAuditCooperationNote =
  "گزارش رایگان است. اجرای پیشنهادها فقط در صورت درخواست شما، با محدوده و قیمت جداگانه ارائه می‌شود.";

export const doctorSuitableFor = [
  "پزشکی که می‌خواهد از گوگل بیمار جذب کند و درخواست نوبت بگیرد.",
  "مطبی که سایت ندارد یا سایت فعلی مسیر فروش ندارد.",
  "پزشکی که می‌خواهد با پیش‌پرداخت مشخص و نسخه اولیه سریع شروع کند.",
];

export const doctorNotSuitableFor = [
  "کسانی که فقط یک صفحه معرفی خیلی ارزان می‌خواهند.",
  "کسب‌وکارهای خارج از حوزه پزشکی.",
  "کسانی که فعلاً قصد اقدام و شروع پروژه ندارند.",
];

export type DoctorNeedKey = "booking" | "site" | "chatbot" | "patients";

export const doctorNeeds: { key: DoctorNeedKey; label: string }[] = [
  { key: "booking", label: "نوبت‌دهی آنلاین" },
  { key: "site", label: "سایت و معرفی تخصص" },
  { key: "chatbot", label: "چت‌بات پاسخگوی بیماران" },
  { key: "patients", label: "جذب بیمار بیشتر" },
];

export interface DoctorFaqItem {
  q: string;
  a: string;
}

export const doctorFaq: DoctorFaqItem[] = [
  {
    q: "دقیقاً چه چیزی تحویل می‌گیرم؟",
    a: "سایت اختصاصی مطب با حداکثر ۸ صفحه، معرفی پزشک و رزومه، سه صفحه خدمت، پنل مقاله، مسیر تماس/واتساپ/نوبت، اتصال به سامانه نوبت موجود، نقشه، سئوی فنی اولیه، دامنه و سرور به نام شما، دو مرحله اصلاح و ۳۰ روز رفع ایراد.",
  },
  {
    q: "نسخه اولیه و تحویل نهایی چند روز طول می‌کشد؟",
    a: "نسخه اولیه طی ۲ روز کاری پس از دریافت اطلاعات آماده می‌شود. تحویل نهایی معمولاً حدود ۵ تا ۷ روز کاری است.",
  },
  {
    q: "با چه مبلغی می‌توانم شروع کنم؟",
    a: "شروع پروژه با ۳۰٪ یعنی ۶ میلیون تومان است. ۴۰٪ بعدی فقط بعد از دیدن و تأیید نسخه اولیه، و ۳۰٪ هنگام تحویل نهایی پرداخت می‌شود.",
  },
  {
    q: "دامنه و سایت به نام چه کسی است؟",
    a: "دامنه و سرور به نام پزشک ثبت می‌شود و مالکیت کامل سایت برای شماست.",
  },
  {
    q: "آیا سیستم نوبت‌دهی داخل پکیج است؟",
    a: "ساخت سامانه نوبت‌دهی اختصاصی داخل پکیج نیست. اگر سامانه دارید، لینک یا اتصال آن در سایت قرار می‌گیرد.",
  },
  {
    q: "تفاوت اتصال نوبت‌دهی با ساخت سامانه اختصاصی چیست؟",
    a: "اتصال یعنی لینک یا یکپارچه‌سازی با سامانه‌ای که از قبل دارید. ساخت سامانه اختصاصی نرم‌افزار جداگانه است و خارج از این پکیج برآورد می‌شود.",
  },
  {
    q: "سئوی اولیه شامل چه مواردی است؟",
    a: "ساختار قابل ایندکس، تنظیمات فنی پایه و آماده‌سازی صفحات برای جستجو. تضمین رتبه اول گوگل نمی‌دهیم.",
  },
  {
    q: "تولید محتوا و سئوی ماهانه داخل قیمت است؟",
    a: "خیر. تولید مستمر مقاله و اجرای ماهانه سئو خارج از پکیج و نیازمند برآورد جدا هستند.",
  },
  {
    q: "پرداخت چگونه انجام می‌شود؟",
    a: "۳۰٪ شروع (۶ میلیون)، ۴۰٪ بعد از تأیید نسخه اولیه، ۳۰٪ هنگام تحویل نهایی.",
  },
  {
    q: "بعد از تحویل چه پشتیبانی‌ای داریم؟",
    a: "۳۰ روز رفع ایراد و پشتیبانی اولیه پس از تحویل در پکیج است.",
  },
  {
    q: "آیا سایت کلینیک چندپزشکه هم با همین قیمت است؟",
    a: "خیر. این قیمت مخصوص مطب تک‌پزشک است. برای کلینیک چندپزشکه پکیج جداگانه در صفحه طراحی سایت کلینیک ارائه می‌شود.",
  },
];

export const doctorAuditFaq: DoctorFaqItem[] = [
  {
    q: "بررسی رایگان دقیقاً شامل چه چیزهایی است؟",
    a: "وضعیت دیده‌شدن در جستجو، اطلاعات عمومی مطب، معرفی خدمات و مسیر تماس یا درخواست نوبت بررسی می‌شود.",
  },
  {
    q: "آیا باید از قبل سایت داشته باشم؟",
    a: "خیر. اگر فقط اینستاگرام، پروفایل پزشکی یا شماره تماس دارید هم می‌توانیم مسیر فعلی بیمار را بررسی کنیم.",
  },
  {
    q: "گزارش چه زمانی و کجا ارسال می‌شود؟",
    a: "گزارش حداکثر تا پایان روز کاری بعد در واتساپ ارسال می‌شود.",
  },
  {
    q: "بعد از دریافت گزارش چه اتفاقی می‌افتد؟",
    a: "ابتدا گزارش را دریافت می‌کنید. فقط در صورت درخواست شما، محدوده اجرای راهکار مرتبط ارائه می‌شود.",
  },
  {
    q: "آیا اجرای پیشنهادها اجباری است؟",
    a: "خیر. گزارش رایگان و بدون تعهد است.",
  },
  {
    q: "برای بررسی چه اطلاعاتی لازم است؟",
    a: "نام پزشک یا کلینیک و یکی از مسیرهای فعلی مانند سایت، اینستاگرام یا پروفایل پزشکی کافی است.",
  },
];

export function formatToman(n: number): string {
  return n.toLocaleString("en-US").replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export function buildDoctorsLeadDetail(
  identity: string,
  currentPresence?: DoctorPresenceKey | "",
  primaryGoal?: DoctorPrimaryGoalKey | ""
): string {
  const parts = [`clinic_identity: ${identity.trim()}`];
  if (currentPresence) parts.push(`current_presence: ${currentPresence}`);
  if (primaryGoal) parts.push(`primary_goal: ${primaryGoal}`);
  return parts.join(" | ");
}

// داده‌های لندینگ پزشکان — گزارش رایگان، مسیر بیمار، FAQ و تشخیص مسیر.
// قیمت‌ها باید با DOCTOR_PACKAGES در app/api/doctors/checkout/route.ts هماهنگ بماند.
// در ایران قیمت نمایشی تومان است؛ Structured Data با IRR (= تومان × ۱۰) ثبت می‌شود.

export type DoctorPackageKey = "matab" | "clinic" | "center";

export interface DoctorPackage {
  key: DoctorPackageKey;
  name: string;
  tagline: string;
  /** مبلغ تومان — برای نمایش و checkout */
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
    price: 30_000_000,
    oldPrice: 30_000_000,
    deposit: 2_900_000,
    description: "حضور آنلاین حرفه‌ای برای مطب تک‌پزشک؛ سایت تخصصی + نوبت‌دهی آنلاین.",
    features: [
      "سایت تخصصی + صفحه تخصص و رزومه علمی",
      "نوبت‌دهی آنلاین با یادآوری پیامکی",
      "دامنه اختصاصی به نام شما + سرور یک‌ساله",
      "سئوی پایه (جستجوی نام و تخصص در گوگل)",
      "اتصال درگاه پرداخت و پیش‌پرداخت ویزیت",
      "پشتیبانی و نگهداری ۳ ماهه",
    ],
  },
  {
    key: "clinic",
    name: "کلینیک",
    tagline: "برای ۲ تا ۶ پزشک",
    price: 45_000_000,
    oldPrice: 55_000_000,
    deposit: 4_900_000,
    description: "سایت کامل چندپزشکه با چت‌بات پاسخگوی بیماران و سئوی تخصصی.",
    popular: true,
    features: [
      "همه امکانات پکیج مطب",
      "چندپزشکه با تقویم نوبت مجزا برای هر پزشک",
      "چت‌بات پاسخگوی بیماران ۲۴ ساعته (هزینه، آدرس، بیمه)",
      "سئوی تخصصی پزشکی + بلاگ سلامت",
      "پنل مدیریت یکپارچه نوبت‌ها و پیام‌ها",
      "پشتیبانی و نگهداری ۶ ماهه",
    ],
  },
  {
    key: "center",
    name: "مرکز درمانی",
    tagline: "راهکار سازمانی",
    price: 59_000_000,
    oldPrice: 74_000_000,
    deposit: 9_900_000,
    description: "راهکار کامل برای درمانگاه و مرکز درمانی؛ یکپارچه‌سازی و مدیر پروژه اختصاصی.",
    features: [
      "همه امکانات پکیج کلینیک",
      "اتصال به سیستم‌های داخلی (نرم‌افزار مطب / HIS)",
      "پنل اختصاصی بیمار و پرونده نوبت‌ها",
      "مدیر پروژه اختصاصی + آموزش پرسنل",
      "گزارش ماهانه نوبت‌ها و تماس‌ها",
      "پشتیبانی و نگهداری ۱۲ ماهه",
    ],
  },
];

/** مبلغ ریالی برای Schema.org (۱ تومان = ۱۰ ریال) */
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

/** نمونه گزارش قابل‌نمایش در بخش نمونه */
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
  siteUrl?: string;
  initialState: string;
  work: string[];
  outcome: string;
  quote?: string;
  quoteRole?: string;
  image?: string;
}

/** یک Case Study واقعی با لینک قابل‌تأیید */
export const doctorCaseStudy: DoctorCaseStudy = {
  specialty: "بیماری‌های عفونی",
  title: "دکتر عالیه پوردست — تهران",
  siteUrl: "https://aliehpourdast.com",
  initialState:
    "بیماران برای پیدا کردن تخصص، سابقه و راه تماس باید چند مسیر جدا را طی می‌کردند؛ مسیر از جستجو تا درخواست نوبت کوتاه و شفاف نبود.",
  work: [
    "صفحه معرفی تخصص و رزومه علمی",
    "اطلاعات مطب و مسیر تماس یکدست",
    "معرفی خدمات و مسیر مشخص درخواست نوبت",
  ],
  outcome:
    "خروجی قابل‌مشاهده شامل معرفی تخصص و رزومه علمی، اطلاعات یکدست مطب، معرفی خدمات و مسیر مشخص تماس یا درخواست نوبت است.",
  quote:
    "برای من مهم بود سایت هم تخصص و سابقه علمی‌ام را درست نشان بدهد و هم کارکردن با آن ساده باشد؛ مسائل فنی را تیم مدیریت کرد.",
  quoteRole: "فوق تخصص بیماری‌های عفونی و گرمسیری",
  image: "/showcase-assets/pourdast/portrait.webp",
};

export const doctorPatientPathBar = {
  steps: ["جستجو", "اعتماد", "تماس یا درخواست نوبت"],
  note: "گزارش مشخص می‌کند مشکل اصلی در کدام مرحله است.",
};

/** کمینه سرمایه‌گذاری — فقط برای checkout و کامپوننت‌های legacy */
export const doctorStartingPriceToman = doctorPackages[0].price;

/** @deprecated — فقط کامپوننت legacy DoctorsPatientPath */
export const doctorPatientPath = [
  { step: "۱", title: "جستجو", description: "بیمار تخصص یا نام شما را در گوگل جستجو می‌کند." },
  { step: "۲", title: "اعتماد", description: "صفحه خدمات، اطلاعات مطب و نظرات را سریع بررسی می‌کند." },
  { step: "۳", title: "درخواست نوبت", description: "اگر مسیر تماس واضح باشد، همان‌جا نوبت می‌گیرد یا پیام می‌دهد." },
];

/** @deprecated — فقط کامپوننت legacy DoctorsProcess */
export const doctorProcessSteps = [
  { step: "۱", title: "بررسی رایگان", description: "وضعیت حضور در گوگل، صفحه خدمات و مسیر نوبت را بررسی می‌کنیم." },
  { step: "۲", title: "گزارش و پیشنهاد", description: "سه ایراد مهم و پیشنهاد عملی می‌فرستیم." },
  { step: "۳", title: "اجرا با محدوده روشن", description: "بعد از توافق روی محدوده کار، اجرا شروع می‌شود." },
];

/** @deprecated — فقط کامپوننت legacy */
export const doctorProblems = [
  { title: "در گوگل پیدا نمی‌شوید", description: "نام و تخصص در نتایج محلی نیست یا اطلاعات ناقص است." },
  { title: "سایت فقط معرفی است", description: "صفحه خدمات و مسیر درخواست نوبت برای بیمار روشن نیست." },
  { title: "تماس‌ها خارج از ساعت از دست می‌رود", description: "بیمار شب یا آخر هفته شماره می‌زند و جوابی نمی‌گیرد." },
  { title: "منشی زیر بار سؤالات تکراری است", description: "هزینه، آدرس، بیمه و ساعات مدام تلفنی تکرار می‌شود." },
];

/** @deprecated — فقط کامپوننت legacy DoctorsOutputs */
export const doctorOutputs = [
  { title: "سایت مطب", description: "معرفی تخصص، خدمات و مسیر درخواست نوبت", href: "/demo" },
  { title: "نمونه واقعی", description: "سایت دکتر عالیه پوردست", href: "https://aliehpourdast.com", external: true },
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
    description:
      "اگر سایت یا صفحه مناسبی برای معرفی خدمات ندارید، ساخت زیرساخت اولیه پیشنهاد می‌شود.",
  },
  {
    key: "visibility",
    title: "سایت دارید اما دیده نمی‌شوید",
    description:
      "اگر زیرساخت وجود دارد ولی در جستجو ورودی نمی‌گیرد، مسیر SEO و دیده‌شدن بررسی می‌شود.",
  },
  {
    key: "conversion",
    title: "بازدید دارید اما درخواست نوبت کم است",
    description:
      "در این حالت اولویت با اصلاح صفحات خدمات، CTA و مسیر تماس یا نوبت است.",
  },
  {
    key: "custom",
    title: "کلینیک چندپزشکه یا نیاز پیچیده دارید",
    description:
      "برای چند پزشک، چند شعبه یا اتصال به سیستم‌های دیگر، محدوده اختصاصی تعریف می‌شود.",
  },
];

export const doctorAfterReportTrust =
  "اگر مشکل مهمی وجود نداشته باشد، فقط چک‌لیست اصلاحات را دریافت می‌کنید و پیشنهادی برای اجرا ارسال نمی‌شود.";

export const doctorCooperationNote =
  "گزارش رایگان است. اجرای پیشنهادها فقط در صورت درخواست شما، با محدوده و قیمت جداگانه ارائه می‌شود.";

export const doctorSuitableFor = [
  "پزشک یا مدیری که نمی‌داند مشکل اصلی سایت، دیده‌شدن یا مسیر نوبت است.",
  "مطبی که قصد دارد طی ماه‌های آینده حضور آنلاین خود را اصلاح کند.",
  "پزشک یا کلینیکی که سایت ندارد یا از نتیجه سایت فعلی راضی نیست.",
];

export const doctorNotSuitableFor = [
  "افرادی که فقط دنبال یک عدد یا گزارش فنی سئو هستند.",
  "کسب‌وکارهای خارج از حوزه پزشکی.",
  "افرادی که در حال حاضر قصد بررسی یا اصلاح حضور آنلاین خود را ندارند.",
];

export type DoctorNeedKey = "booking" | "site" | "chatbot" | "patients";

/** برای فرم پکیج (checkout) — در لندینگ اصلی استفاده نمی‌شود */
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
    q: "بررسی رایگان دقیقاً شامل چه چیزهایی است؟",
    a: "وضعیت دیده‌شدن در جستجو، اطلاعات عمومی مطب، معرفی خدمات و مسیر تماس یا درخواست نوبت بررسی می‌شود. در پایان، مشکل اصلی و سه اقدام اولویت‌دار دریافت می‌کنید.",
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
    a: "خیر. گزارش رایگان و بدون تعهد است و می‌توانید پیشنهادها را خودتان یا با تیم دیگری اجرا کنید.",
  },
  {
    q: "برای بررسی چه اطلاعاتی لازم است؟",
    a: "نام پزشک یا کلینیک و یکی از مسیرهای فعلی مانند سایت، اینستاگرام یا پروفایل پزشکی کافی است. فقط اطلاعات عمومی بررسی می‌شود.",
  },
];

export function formatToman(n: number): string {
  return n.toLocaleString("en-US").replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

/** ساخت رشته detail برای API لید */
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

export type ModaresVariant = "students" | "courses" | "default";

export function resolveModaresVariant(variant?: string | null): ModaresVariant {
  if (variant === "courses") return "courses";
  if (variant === "students") return "students";
  return "default";
}

export type ModaresContent = {
  eyebrow: string;
  h1: string;
  supportingCopy: string;
  price: string;
  priceOriginal?: string;
  discountPercent?: number;
};

export const MODARES_DELIVERY =
  "نسخه اولیه تا ۲ روز کاری پس از دریافت کامل محتوا";

export const MODARES_STUDENT_PRICE_ORIGINAL_TOMAN = 10_000_000;
export const MODARES_STUDENT_DISCOUNT_PERCENT = 25;
export const MODARES_STUDENT_PRICE_TOMAN = 7_500_000;

export const MODARES_TRUST_CHIPS = [
  "قرارداد رسمی",
  "پرداخت مرحله‌ای",
  "طراحی اختصاصی",
] as const;

export const MODARES_OUTCOMES = [
  {
    title: "معرفی حرفه‌ای",
    description:
      "رزومه، تخصص‌ها، کلاس‌ها و نمونه تدریس شما در یک آدرس اختصاصی.",
  },
  {
    title: "دریافت درخواست کلاس",
    description:
      "هنرجو بدون جست‌وجوی شماره، مستقیماً فرم را تکمیل می‌کند یا در واتساپ پیام می‌دهد.",
  },
  {
    title: "آماده حضور در گوگل",
    description: "ساختار سریع، موبایل‌محور و آماده ایندکس و توسعه سئو.",
  },
] as const;

export type ModaresDemoTabId = "language" | "tutoring" | "music";

export type ModaresDemoTab = {
  id: ModaresDemoTabId;
  label: string;
  initials: string;
  name: string;
  role: string;
  specialties: string;
  intro: string;
  accent: {
    avatar: string;
    role: string;
    tag: string;
    classBg: string;
    cta: string;
    ctaHover: string;
    footer: string;
    focus: string;
  };
  classCard: {
    tag: string;
    title: string;
    detail: string;
    price: string;
  };
  sampleTeaching: {
    title: string;
    detail: string;
  };
  article: {
    title: string;
    detail: string;
  };
  ctaLabel: string;
};

export const MODARES_DEMO_TABS: ModaresDemoTab[] = [
  {
    id: "language",
    label: "زبان",
    initials: "س‌ن",
    name: "سارا نادری",
    role: "مدرس زبان انگلیسی",
    specialties: "آیلتس، مکالمه و کلاس خصوصی",
    intro:
      "بیش از ۸ سال تجربه تدریس آیلتس و مکالمه؛ کلاس‌های آنلاین و حضوری با برنامه اختصاصی.",
    accent: {
      avatar: "bg-cyan-50 text-cyan-700",
      role: "text-cyan-700",
      tag: "text-cyan-700",
      classBg: "bg-cyan-50/40 border-cyan-100",
      cta: "bg-cyan-600",
      ctaHover: "hover:bg-cyan-700",
      footer: "border-cyan-100 bg-cyan-50/50",
      focus: "focus:border-cyan-400",
    },
    classCard: {
      tag: "کلاس خصوصی",
      title: "مکالمه پیشرفته",
      detail: "۸ جلسه آنلاین · سطح B2 و بالاتر",
      price: "۲.۵ میلیون تومان",
    },
    sampleTeaching: {
      title: "نمونه جلسه مکالمه",
      detail: "ویدیوی ۳ دقیقه‌ای · موضوع: مصاحبه کاری",
    },
    article: {
      title: "۵ اشتباه رایج در آیلتس Speaking",
      detail: "راهنمای عملی برای افزایش نمره بخش گفتاری",
    },
    ctaLabel: "درخواست کلاس",
  },
  {
    id: "tutoring",
    label: "کنکور و دروس خصوصی",
    initials: "ا‌ا",
    name: "امیر احمدی",
    role: "مدرس ریاضی و کنکور",
    specialties: "کنکور تجربی، حسابان و هندسه",
    intro:
      "مدرس ریاضی کنکور با تمرکز بر حل تست و برنامه‌ریزی هفتگی برای دانش‌آموزان پایه دوازدهم.",
    accent: {
      avatar: "bg-brand-50 text-brand-700",
      role: "text-brand-700",
      tag: "text-brand-700",
      classBg: "bg-brand-50/40 border-brand-100",
      cta: "bg-brand-600",
      ctaHover: "hover:bg-brand-700",
      footer: "border-brand-100 bg-brand-50/50",
      focus: "focus:border-brand-400",
    },
    classCard: {
      tag: "کلاس خصوصی",
      title: "حسابان کنکور",
      detail: "۱۲ جلسه · حل تست و آزمون هفتگی",
      price: "۳.۲ میلیون تومان",
    },
    sampleTeaching: {
      title: "نمونه تدریس",
      detail: "ویدیوی ۵ دقیقه‌ای · حل سوال مشتق",
    },
    article: {
      title: "برنامه مطالعه ریاضی ۳ ماه مانده کنکور",
      detail: "چک‌لیست هفتگی برای جمع‌بندی فصل‌ها",
    },
    ctaLabel: "رزرو جلسه مشاوره",
  },
  {
    id: "music",
    label: "موسیقی و هنر",
    initials: "ن‌ز",
    name: "نیلوفر زمانی",
    role: "مدرس پیانو",
    specialties: "پیانو کلاسیک، مقدماتی و پیشرفته",
    intro:
      "آموزش پیانو برای کودکان و بزرگسالان با تمرکز بر تکنیک، سلفژ و اجرای قطعات کلاسیک.",
    accent: {
      avatar: "bg-violet-500/10 text-violet-600",
      role: "text-violet-600",
      tag: "text-violet-600",
      classBg: "bg-violet-500/5 border-violet-500/20",
      cta: "bg-violet-600",
      ctaHover: "hover:bg-violet-600/90",
      footer: "border-violet-500/20 bg-violet-500/5",
      focus: "focus:border-violet-400",
    },
    classCard: {
      tag: "کلاس حضوری",
      title: "پیانو مقدماتی",
      detail: "۱۶ جلسه · ۴۵ دقیقه · گروه ۱ نفره",
      price: "۴ میلیون تومان",
    },
    sampleTeaching: {
      title: "نمونه اجرا",
      detail: "ویدیوی ۲ دقیقه‌ای · قطعه Für Elise",
    },
    article: {
      title: "چطور برای اولین کلاس پیانو آماده شویم؟",
      detail: "لیست وسایل و نکات تمرین در خانه",
    },
    ctaLabel: "درخواست کلاس آزمایشی",
  },
];

export const MODARES_TRUST_POINTS = [
  "شرکت هوش آرایه پارس",
  "مستقر در پارک علم و فناوری دانشگاه تهران",
  "قرارداد رسمی",
  "پرداخت مرحله‌ای",
  "مالکیت دامنه و سایت برای مشتری",
] as const;

/** Verified Araaye design sample from the internal portfolio — not a teacher client. */
export const MODARES_PROJECT_PROOF = {
  label: "نمونه پروژه آرایه",
  name: "کلینیک شنوایی شیوا",
  description: "وب‌سایت خدماتی برای معرفی خدمات و دریافت درخواست مشاوره — طراحی و اجرا توسط آرایه",
  href: "/showcase/shiva-hearing",
} as const;

export const MODARES_PAYMENT_TERMS =
  "۵۰٪ شروع پروژه، ۵۰٪ پس از تأیید نهایی و پیش از انتشار";

export type ModaresOfferContent = {
  heading: string;
  title: string;
  price: string;
  priceOriginal?: string;
  discountPercent?: number;
  delivery: string;
  deliverables: readonly string[];
  cta: string;
  clarification?: string;
  alternatives?: readonly string[];
};

const MODARES_STUDENT_OFFER: ModaresOfferContent = {
  heading: "پیشنهاد مناسب برای شروع تدریس حرفه‌ای",
  title: "سایت حرفه‌ای مدرس",
  price: "۷.۵ میلیون تومان",
  priceOriginal: "۱۰ میلیون تومان",
  discountPercent: MODARES_STUDENT_DISCOUNT_PERCENT,
  delivery: MODARES_DELIVERY,
  deliverables: [
    "طراحی اختصاصی و سازگار با موبایل",
    "معرفی مدرس، رزومه و کلاس‌ها",
    "نمایش نمونه تدریس",
    "فرم درخواست کلاس و اتصال واتساپ",
    "پنل انتشار مقاله",
    "زیرساخت اولیه سئو",
    "اتصال دامنه اختصاصی",
    "سه ماه پشتیبانی فنی",
  ],
  cta: "نمونه مرتبط را در واتساپ بگیرم",
  alternatives: [
    "فقط صفحه معرفی از ۷ میلیون تومان",
    "فروش دوره و پرداخت آنلاین از ۱۵ میلیون تومان",
  ],
};

const MODARES_COURSES_OFFER: ModaresOfferContent = {
  heading: "پیشنهاد مناسب برای فروش دوره آنلاین",
  title: "سایت فروش دوره",
  price: "از ۱۵ میلیون تومان",
  delivery: "نسخه اولیه تا ۵ روز کاری پس از دریافت کامل محتوا",
  deliverables: [
    "طراحی اختصاصی",
    "معرفی مدرس و دوره‌ها",
    "صفحه فروش برای هر دوره",
    "ثبت‌نام و اتصال درگاه پرداخت",
    "نمایش نمونه تدریس",
    "پنل انتشار مقاله",
    "فرم پشتیبانی و واتساپ",
    "زیرساخت اولیه سئو",
  ],
  clarification:
    "سامانه کامل LMS، آزمون و پنل پیشرفته دانشجو بر اساس نیاز جداگانه برآورد می‌شود.",
  cta: "نمونه سایت فروش دوره را بفرستید",
};

export function getModaresOffer(variant: ModaresVariant): ModaresOfferContent {
  if (variant === "courses") return MODARES_COURSES_OFFER;
  return MODARES_STUDENT_OFFER;
}

export const MODARES_FAQ = [
  {
    q: "برای مدیریت سایت دانش فنی لازم است؟",
    a: "خیر. در پکیج حرفه‌ای، مقاله‌ها و اطلاعات کلاس‌ها از یک پنل ساده مدیریت می‌شوند و آموزش اولیه هم ارائه می‌شود.",
  },
  {
    q: "آیا سایت رتبه اول گوگل را تضمین می‌کند؟",
    a: "خیر. طراحی سریع، ساختار فنی سئو و امکان ایندکس در گوگل فراهم می‌شود؛ رتبه‌گیری روی عبارت‌های رقابتی به تولید محتوا و سئوی مستمر نیاز دارد.",
  },
  {
    q: "پرداخت و شروع پروژه چگونه است؟",
    a: "پس از مشخص‌شدن محدوده کار، قرارداد ارسال می‌شود؛ ۵۰٪ در شروع و ۵۰٪ بعد از تأیید نهایی و قبل از انتشار دریافت می‌شود.",
  },
] as const;

export function getModaresContent(variant: ModaresVariant): ModaresContent {
  if (variant === "courses") {
    return {
      eyebrow: "ویژه معلم‌ها و مدرسان خصوصی",
      h1: "کلاس و دوره‌تان را در سایت خودتان بفروشید",
      supportingCopy:
        "دوره‌ها، نمونه تدریس و مقالاتتان را در یک سایت اختصاصی ارائه کنید و ثبت‌نام آنلاین بگیرید.",
      price: "سایت فروش دوره از ۱۵ میلیون تومان",
    };
  }

  return {
    eyebrow: "ویژه معلم‌ها و مدرسان خصوصی",
    h1: "سایت مستقل مدرس؛ معرفی حرفه‌ای و دریافت مستقیم درخواست کلاس",
    supportingCopy:
      variant === "students"
        ? "رزومه، کلاس‌ها و نمونه تدریس خود را حرفه‌ای نمایش دهید و درخواست کلاس دریافت کنید."
        : "با یک سایت مستقل، رزومه، کلاس‌ها، نمونه تدریس و مسیر درخواست شاگرد را در یک آدرس حرفه‌ای نمایش دهید — بدون وابستگی به پلتفرم.",
    price: "سایت حرفه‌ای مدرس: ۷.۵ میلیون تومان",
    priceOriginal: "۱۰ میلیون تومان",
    discountPercent: MODARES_STUDENT_DISCOUNT_PERCENT,
  };
}

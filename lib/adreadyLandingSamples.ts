export type AdReadyLandingSample = {
  slug: string;
  industry: string;
  business: string;
  badge: string;
  headline: string;
  subhead: string;
  cta: string;
  benefits: string[];
  theme: "warm" | "dark" | "clean";
};

export const ADREADY_LANDING_SAMPLES: AdReadyLandingSample[] = [
  {
    slug: "salon-noor",
    industry: "سالن زیبایی",
    business: "سالن نور",
    badge: "مشاوره رایگان",
    headline: "رزرو وقت مشاوره قبل از شروع دوره",
    subhead: "فرم را پر کن تا برای هماهنگی وقت با تو تماس بگیریم.",
    cta: "ثبت درخواست مشاوره",
    benefits: ["مشاوره تخصصی", "برنامه اختصاصی", "پیگیری بعد از دوره"],
    theme: "warm",
  },
  {
    slug: "ahan-kaveh",
    industry: "فروش آهن‌آلات",
    business: "آهن کاوه",
    badge: "استعلام سریع",
    headline: "قیمت میلگرد و تیرآهن را همین امروز بگیر",
    subhead: "مشخصات سفارش را ثبت کن تا برای قیمت‌دهی تماس بگیریم.",
    cta: "دریافت قیمت",
    benefits: ["پاسخ سریع", "تحویل به‌موقع", "مشاوره انتخاب مقطع"],
    theme: "dark",
  },
  {
    slug: "course-farsi",
    industry: "آموزشگاه",
    business: "آکادمی فارسی",
    badge: "ثبت‌نام ترم جدید",
    headline: "کلاس مکالمه با اساتید بومی",
    subhead: "ظرفیت محدود — برای رزرو جایگاه فرم را پر کن.",
    cta: "رزرو جایگاه",
    benefits: ["کلاس کوچک", "تمرین مکالمه", "گواهی پایان دوره"],
    theme: "clean",
  },
];

export const ADREADY_HERO_SAMPLE = ADREADY_LANDING_SAMPLES[0];

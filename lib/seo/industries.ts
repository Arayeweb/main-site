export type IndustrySlug =
  | "doctor"
  | "clinic"
  | "beauty-clinic"
  | "restaurant"
  | "cafe"
  | "lawyer"
  | "real-estate"
  | "online-shop";

export interface IndustryBase {
  slug: IndustrySlug;
  persianName: string;
  englishName: string;
  /** کوتاه‌ترین توصیف برای استفاده در badgeها */
  audienceHint: string;
}

export const industries: IndustryBase[] = [
  {
    slug: "doctor",
    persianName: "پزشکان",
    englishName: "doctor",
    audienceHint: "سیستم سرچ تا نوبت برای مطب و پزشک",
  },
  {
    slug: "clinic",
    persianName: "کلینیک‌ها",
    englishName: "clinic",
    audienceHint: "لندینگ هر بخش + CRM + رزرو",
  },
  {
    slug: "beauty-clinic",
    persianName: "کلینیک زیبایی",
    englishName: "beauty-clinic",
    audienceHint: "خدمات زیبایی با نیاز به اعتماد و تصمیم‌گیری سریع",
  },
  {
    slug: "restaurant",
    persianName: "رستوران",
    englishName: "restaurant",
    audienceHint: "ورود مشتری نزدیک + رزرو/سفارش",
  },
  {
    slug: "cafe",
    persianName: "کافه",
    englishName: "cafe",
    audienceHint: "جستجوی محلی «نزدیک من» + تجربه موبایلی عالی",
  },
  {
    slug: "lawyer",
    persianName: "وکلاء و مشاوران حقوقی",
    englishName: "lawyer",
    audienceHint: "اعتماد، تخصص پرونده و مسیر تماس/مشاوره",
  },
  {
    slug: "real-estate",
    persianName: "املاک",
    englishName: "real-estate",
    audienceHint: "جذب لید برای بازدید و مشاوره خرید/فروش/رهن",
  },
  {
    slug: "online-shop",
    persianName: "فروشگاه آنلاین",
    englishName: "online-shop",
    audienceHint: "صفحات دسته‌بندی/محصولیِ قابل ایندکس + راه ارتباط با فروش",
  },
];


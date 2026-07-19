export type IndustrySlug =
  | "doctor"
  | "clinic"
  | "dentist"
  | "beauty-clinic"
  | "restaurant"
  | "cafe"
  | "lawyer"
  | "real-estate"
  | "online-shop"
  | "private-tutor"
  | "consultant"
  | "architect"
  | "photographer"
  | "service-company"
  | "instagram-business";

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
    slug: "dentist",
    persianName: "دندانپزشکی",
    englishName: "dentist",
    audienceHint: "نوبت‌دهی، خدمات درمان و تماس اورژانسی",
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
    audienceHint: "جذب مشتری برای بازدید و مشاوره خرید/فروش/رهن",
  },
  {
    slug: "online-shop",
    persianName: "فروشگاه آنلاین",
    englishName: "online-shop",
    audienceHint: "صفحات دسته‌بندی/محصولیِ قابل ایندکس + راه ارتباط با فروش",
  },
  {
    slug: "private-tutor",
    persianName: "مدرسان خصوصی",
    englishName: "private-tutor",
    audienceHint: "معرفی درس و پایه + ثبت درخواست شاگرد مستقیم",
  },
  {
    slug: "consultant",
    persianName: "مشاوران",
    englishName: "consultant",
    audienceHint: "تخصص، حوزه‌ها و رزرو جلسه با اعتبارسازی",
  },
  {
    slug: "architect",
    persianName: "معماران و دفاتر معماری",
    englishName: "architect",
    audienceHint: "گالری پروژه، شرح مسئله و فرم درخواست همکاری",
  },
  {
    slug: "photographer",
    persianName: "عکاسان و آتلیه‌ها",
    englishName: "photographer",
    audienceHint: "گالری سریع، پکیج‌ها و رزرو جلسه عکاسی",
  },
  {
    slug: "service-company",
    persianName: "شرکت‌های خدماتی",
    englishName: "service-company",
    audienceHint: "فهرست خدمات، استعلام قیمت و تماس فوری",
  },
  {
    slug: "instagram-business",
    persianName: "کسب‌وکارهای اینستاگرامی",
    englishName: "instagram-business",
    audienceHint: "فروش مستقل با دامنه اختصاصی و اتصال به پیج",
  },
];


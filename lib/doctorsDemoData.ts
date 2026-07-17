// داده لندینگ یک‌صفحه‌ای دموی تخصص‌های پزشکان

import { demoSites } from "@/lib/demoData";
import { pedBrand, pedImages } from "@/lib/showdemoto/pediatric/config";
import { sfBrand, sfImages } from "@/lib/showdemoto/salamat-farda/config";

export type DoctorDemoKey =
  | "dentist"
  | "dentist-kordian"
  | "ophthalmology"
  | "dermatology"
  | "pediatric"
  | "physiotherapy"
  | "women"
  | "other";

export type DoctorDemoAccent = "cyan" | "sky" | "teal" | "brand" | "slate";
export type DoctorDemoLayout = "cool" | "warm";

export interface DoctorDemoAccentClasses {
  bg: string;
  hoverBg: string;
  text: string;
  badgeBg: string;
  badgeText: string;
  softBg: string;
  gradientFrom: string;
  gradientVia: string;
  heroPanel: string;
  iconBg: string;
  ring: string;
}

export interface DoctorDemoLayoutClasses {
  pageBg: string;
  heroWrap: string;
  heroPanel: string;
  sectionBg: string;
  sectionAltBg: string;
  cardBg: string;
  cardBorder: string;
  textMuted: string;
  headerBg: string;
}

export const doctorDemoLayoutConfig: Record<DoctorDemoLayout, DoctorDemoLayoutClasses> = {
  cool: {
    pageBg: "bg-[#f4f8fb]",
    heroWrap: "bg-gradient-to-br from-sky-50/60 via-white to-cyan-50/40",
    heroPanel: "rounded-[2rem] bg-white/70 shadow-[0_24px_80px_-32px_rgba(16,42,67,0.18)] ring-1 ring-sky-100/80 backdrop-blur-sm",
    sectionBg: "bg-white",
    sectionAltBg: "bg-[#f4f8fb]",
    cardBg: "bg-white",
    cardBorder: "border-sky-100/80",
    textMuted: "text-navy-500",
    headerBg: "border-b border-sky-100/80 bg-white/90 backdrop-blur-md",
  },
  warm: {
    pageBg: "bg-[#FAF7F2]",
    heroWrap: "bg-[#FAF7F2]",
    heroPanel: "rounded-[2.5rem] bg-[#F0E8DE] shadow-[0_28px_90px_-36px_rgba(93,64,55,0.22)] ring-1 ring-[#E6D9CC]",
    sectionBg: "bg-[#FAF7F2]",
    sectionAltBg: "bg-[#F3EDE4]",
    cardBg: "bg-white",
    cardBorder: "border-[#E8DDD2]",
    textMuted: "text-[#6B5B4F]",
    headerBg: "border-b border-[#E8DDD2] bg-[#FAF7F2]/95 backdrop-blur-md",
  },
};

export interface DoctorDemoService {
  title: string;
  description: string;
  icon: string;
}

export interface DoctorDemoStat {
  value: string;
  label: string;
}

export interface DoctorDemoGalleryImage {
  src: string;
  alt: string;
}

export interface DoctorDemoLandingContent {
  key: DoctorDemoKey;
  practiceName: string;
  doctorName: string;
  doctorTitle: string;
  city: string;
  accent: DoctorDemoAccent;
  layout: DoctorDemoLayout;
  heroBadge: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  heroCta: string;
  heroImage: string;
  heroImageAlt: string;
  heroSecondaryImage?: string;
  trustBullets: string[];
  stats: DoctorDemoStat[];
  aboutTitle: string;
  aboutText: string;
  aboutImage: string;
  aboutImageAlt: string;
  services: DoctorDemoService[];
  galleryImages?: DoctorDemoGalleryImage[];
  previewUrl: string;
}

export const doctorDemoAccentConfig: Record<DoctorDemoAccent, DoctorDemoAccentClasses> = {
  cyan: {
    bg: "bg-cyan-700",
    hoverBg: "hover:bg-cyan-800",
    text: "text-cyan-700",
    badgeBg: "bg-cyan-50",
    badgeText: "text-cyan-800",
    softBg: "bg-cyan-50",
    gradientFrom: "from-cyan-50/80",
    gradientVia: "via-white",
    heroPanel: "from-cyan-100 to-cyan-50",
    iconBg: "bg-cyan-100 text-cyan-700",
    ring: "ring-cyan-200/60",
  },
  sky: {
    bg: "bg-sky-700",
    hoverBg: "hover:bg-sky-800",
    text: "text-sky-700",
    badgeBg: "bg-sky-50",
    badgeText: "text-sky-800",
    softBg: "bg-sky-50",
    gradientFrom: "from-sky-50/80",
    gradientVia: "via-white",
    heroPanel: "from-sky-100 to-sky-50",
    iconBg: "bg-sky-100 text-sky-700",
    ring: "ring-sky-200/60",
  },
  teal: {
    bg: "bg-teal-700",
    hoverBg: "hover:bg-teal-800",
    text: "text-teal-700",
    badgeBg: "bg-teal-50",
    badgeText: "text-teal-800",
    softBg: "bg-teal-50",
    gradientFrom: "from-teal-50/80",
    gradientVia: "via-white",
    heroPanel: "from-teal-100 to-teal-50",
    iconBg: "bg-teal-100 text-teal-700",
    ring: "ring-teal-200/60",
  },
  brand: {
    bg: "bg-navy-900",
    hoverBg: "hover:bg-navy-800",
    text: "text-brand-600",
    badgeBg: "bg-brand-50",
    badgeText: "text-brand-700",
    softBg: "bg-brand-50",
    gradientFrom: "from-brand-50/80",
    gradientVia: "via-white",
    heroPanel: "from-brand-100 to-brand-50",
    iconBg: "bg-brand-100 text-brand-700",
    ring: "ring-brand-200/60",
  },
  slate: {
    bg: "bg-navy-900",
    hoverBg: "hover:bg-navy-800",
    text: "text-navy-700",
    badgeBg: "bg-navy-50",
    badgeText: "text-navy-700",
    softBg: "bg-navy-50",
    gradientFrom: "from-navy-50/80",
    gradientVia: "via-white",
    heroPanel: "from-navy-100 to-navy-50",
    iconBg: "bg-navy-100 text-navy-700",
    ring: "ring-navy-200/60",
  },
};

const dentist = demoSites.dentist;

export const doctorDemoLandings: Record<DoctorDemoKey, DoctorDemoLandingContent> = {
  dentist: {
    key: "dentist",
    practiceName: dentist.practiceName,
    doctorName: dentist.doctorName,
    doctorTitle: dentist.doctorTitle,
    city: dentist.city,
    accent: "cyan",
    layout: "cool",
    heroBadge: dentist.heroBadge,
    heroTitle: dentist.heroTitle,
    heroTitleAccent: dentist.heroTitleAccent,
    heroSubtitle: dentist.heroSubtitle,
    heroCta: dentist.heroCtaPrimary,
    heroImage:
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1600&q=85",
    heroImageAlt: "فضای کلینیک دندان‌پزشکی با تجهیزات مدرن",
    heroSecondaryImage:
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    trustBullets: dentist.credentials.slice(0, 3),
    stats: dentist.stats,
    aboutTitle: dentist.aboutTitle,
    aboutText: dentist.aboutParagraphs[0],
    aboutImage:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=80",
    aboutImageAlt: "دندان‌پزشک در حال معاینه بیمار",
    services: dentist.services.slice(0, 4),
    galleryImages: [
      { src: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=400&q=80", alt: "فضای کلینیک ۱" },
      { src: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=400&q=80", alt: "فضای کلینیک ۲" },
      { src: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80", alt: "معاینه دندان" },
      { src: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=400&q=80", alt: "لبخند سالم" },
    ],
    previewUrl: "araaye.com/doctors/demo/dentist",
  },
  "dentist-kordian": {
    key: "dentist-kordian",
    practiceName: "کلینیک دندان‌پزشکی کوردیان",
    doctorName: "دکتر آرش کوردیان",
    doctorTitle: "متخصص دندان‌پزشکی — نسخه چندزبانه",
    city: "تهران",
    accent: "cyan",
    layout: "cool",
    heroBadge: "نسخه فارسی · English · Русский",
    heroTitle: "لبخندی که",
    heroTitleAccent: "بیماران بین‌المللی هم می‌فهمند",
    heroSubtitle:
      "سایت چندزبانه برای معرفی خدمات، مسیر نوبت و ارتباط شفاف با بیماران خارج از کشور.",
    heroCta: "رزرو مشاوره آنلاین",
    heroImage:
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=85",
    heroImageAlt: "کلینیک دندان‌پزشکی آماده پذیرش بیماران بین‌المللی",
    heroSecondaryImage:
      "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80",
    trustBullets: [
      "محتوای فارسی، انگلیسی و روسی",
      "مسیر نوبت و تماس برای بیماران خارجی",
      "معرفی خدمات با زبان ساده و حرفه‌ای",
    ],
    stats: [
      { value: "+۳۲۰۰", label: "بیمار بین‌المللی" },
      { value: "۳ زبان", label: "محتوای سایت" },
      { value: "۴.۹ / ۵", label: "رضایت بیماران" },
    ],
    aboutTitle: "کلینیکی برای بیماران داخلی و خارجی",
    aboutText:
      "دکتر آرش کوردیان با بیش از ۱۵ سال تجربه، خدمات دندان‌پزشکی را به سه زبان ارائه می‌دهد تا بیماران خارج از کشور با اطمینان کامل مراجعه کنند.",
    aboutImage:
      "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=80",
    aboutImageAlt: "فضای مدرن کلینیک کوردیان",
    services: [
      { title: "ایمپلنت دیجیتال", description: "کاشت با طراحی سه‌بعدی و گارانتی بین‌المللی.", icon: "tooth" },
      { title: "لمینت سرامیکی", description: "لبخند هالیوودی با متریال اروپایی.", icon: "sparkle" },
      { title: "ارتودنسی نامرئی", description: "اصلاح ردیف دندان بدون براکت فلزی.", icon: "target" },
      { title: "جرم‌گیری و سفیدکردن", description: "مراقبت دوره‌ای و سفیدکردن حرفه‌ای.", icon: "bolt" },
    ],
    previewUrl: "araaye.com/doctors/demo/dentist-kordian",
  },
  ophthalmology: {
    key: "ophthalmology",
    practiceName: sfBrand.name,
    doctorName: "تیم جراحان چشم",
    doctorTitle: "جراحی و زیبایی چشم",
    city: "تهران",
    accent: "sky",
    layout: "cool",
    heroBadge: "معاینه و جراحی تخصصی چشم",
    heroTitle: "دید واضح‌تر،",
    heroTitleAccent: "مسیر درمان شفاف‌تر",
    heroSubtitle: sfBrand.tagline,
    heroCta: "درخواست مشاوره",
    heroImage: sfImages.hero,
    heroImageAlt: sfImages.heroAlt,
    heroSecondaryImage:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    trustBullets: [
      "معرفی خدمات تخصصی با عنوان‌های قابل جستجو",
      "گالری قبل و بعد و مسیر تماس یکدست",
      "اطلاعات مطب و ساعات کاری شفاف",
    ],
    stats: [
      { value: "+۸۰۰۰", label: "جراحی موفق" },
      { value: "۲۰ سال", label: "سابقه تخصصی" },
      { value: "۴.۹ / ۵", label: "رضایت بیماران" },
    ],
    aboutTitle: "مرکز تخصصی جراحی و لیزیک چشم",
    aboutText:
      "تیم جراحان چشم با تجهیزات پیشرفته لیزیک و فمتولیزیک، مسیر درمان شفاف و بدون ابهام را برای بیماران فراهم می‌کند.",
    aboutImage:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=900&q=80",
    aboutImageAlt: "معاینه تخصصی چشم",
    services: [
      { title: "لیزیک و فمتولیزیک", description: "اصلاح عیوب انکساری با جدیدترین دستگاه‌ها.", icon: "scanLine" },
      { title: "جراحی آب مروارید", description: "درمان بدون درد با لنزهای پیشرفته.", icon: "shield" },
      { title: "جراحی پلک", description: "زیبایی و اصلاح افتادگی پلک.", icon: "sparkle" },
      { title: "معاینه جامع", description: "ارزیابی کامل بینایی و سلامت چشم.", icon: "searchCheck" },
    ],
    galleryImages: [
      { src: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=400&q=80", alt: "نمونه درمان چشم ۱" },
      { src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80", alt: "نمونه درمان چشم ۲" },
      { src: "https://images.unsplash.com/photo-1581594549595-35f006a4e00c?auto=format&fit=crop&w=400&q=80", alt: "نمونه درمان چشم ۳" },
      { src: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80", alt: "نمونه درمان چشم ۴" },
    ],
    previewUrl: "araaye.com/doctors/demo/ophthalmology",
  },
  dermatology: {
    key: "dermatology",
    practiceName: "کلینیک پوست و زیبایی نورا",
    doctorName: "دکتر مریم نورایی",
    doctorTitle: "متخصص پوست، مو و زیبایی",
    city: "تهران، فرمانیه",
    accent: "slate",
    layout: "warm",
    heroBadge: "درمان تخصصی پوست و زیبایی",
    heroTitle: "پوست سالم،",
    heroTitleAccent: "اعتماد بیشتر",
    heroSubtitle:
      "معرفی خدمات درمانی و زیبایی با مسیر مشاوره و نوبت آنلاین — برای بیمارانی که قبل از مراجعه اطلاعات می‌خواهند.",
    heroCta: "رزرو مشاوره",
    heroImage:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=85",
    heroImageAlt: "فضای آرام کلینیک پوست و زیبایی",
    heroSecondaryImage:
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80",
    trustBullets: [
      "صفحات مجزا برای خدمات اصلی",
      "معرفی پزشک و سوابق تخصصی",
      "دکمه ثابت واتساپ و درخواست نوبت",
    ],
    stats: [
      { value: "+۶۰۰۰", label: "بیمار راضی" },
      { value: "۱۰ سال", label: "سابقه تخصصی" },
      { value: "۴.۸ / ۵", label: "امتیاز رضایت" },
    ],
    aboutTitle: "درباره کلینیک نورا",
    aboutText:
      "دکتر مریم نورایی با رویکردی علمی و آرام، خدمات درمانی و زیبایی پوست را با تجهیزات روز دنیا و برنامه درمانی شخصی‌سازی‌شده ارائه می‌دهد.",
    aboutImage:
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=80",
    aboutImageAlt: "مشاوره پوست در کلینیک نورا",
    services: [
      { title: "جوان‌سازی پوست", description: "لیفت و شادابی با تکنیک‌های غیرتهاجمی.", icon: "sparkle" },
      { title: "لیزر موهای زائد", description: "درمان دائمی با دستگاه‌های FDA.", icon: "bolt" },
      { title: "درمان آکنه و لک", description: "برنامه درمانی اختصاصی برای هر نوع پوست.", icon: "shield" },
      { title: "تزریقات زیبایی", description: "بوتاکس و فیلر با متریال اورجینال.", icon: "heart" },
    ],
    galleryImages: [
      { src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80", alt: "نمونه کار ۱" },
      { src: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=400&q=80", alt: "نمونه کار ۲" },
      { src: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=400&q=80", alt: "نمونه کار ۳" },
      { src: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80", alt: "نمونه کار ۴" },
    ],
    previewUrl: "araaye.com/doctors/demo/dermatology",
  },
  pediatric: {
    key: "pediatric",
    practiceName: pedBrand.name,
    doctorName: pedBrand.doctor,
    doctorTitle: pedBrand.title,
    city: "تهران",
    accent: "teal",
    layout: "cool",
    heroBadge: "مراقبت از نوزادی تا نوجوانی",
    heroTitle: "سلامت کوچولوی شما،",
    heroTitleAccent: "اولویت ماست",
    heroSubtitle: pedBrand.tagline,
    heroCta: "رزرو نوبت آنلاین",
    heroImage: pedImages.hero,
    heroImageAlt: pedImages.heroAlt,
    heroSecondaryImage:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80",
    trustBullets: [
      "معرفی گروه‌های سنی و خدمات مطب",
      "محیط آرام و اطلاعات شفاف برای والدین",
      "مسیر تماس و نوبت‌دهی ساده",
    ],
    stats: [
      { value: "+۱۲۰۰۰", label: "ویزیت کودکان" },
      { value: "۱۸ سال", label: "سابقه تخصصی" },
      { value: "۴.۹ / ۵", label: "رضایت والدین" },
    ],
    aboutTitle: "مطب دوست‌داشتنی برای کودکان",
    aboutText:
      "دکتر با تجربه‌ای که دارد، فضایی آرام و بدون استرس برای کودکان و والدین فراهم کرده تا هر ویزیت تجربه‌ای مثبت باشد.",
    aboutImage:
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=900&q=80",
    aboutImageAlt: "ویزیت کودک در مطب",
    services: [
      { title: "ویزیت نوزاد و شیرخوار", description: "پیگیری رشد و واکسیناسیون.", icon: "heart" },
      { title: "معاینه دوره‌ای", description: "چکاپ سلامت کودکان و نوجوانان.", icon: "stethoscope" },
      { title: "مشاوره تغذیه", description: "برنامه غذایی متناسب با سن.", icon: "chart" },
      { title: "واکسیناسیون", description: "تزریق واکسن طبق برنامه وزارت بهداشت.", icon: "shield" },
    ],
    galleryImages: [
      { src: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=400&q=80", alt: "فضای مطب ۱" },
      { src: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=400&q=80", alt: "ویزیت کودک" },
      { src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80", alt: "فضای مطب ۲" },
      { src: "https://images.unsplash.com/photo-1584820925082-99f8e5e5e5e5?auto=format&fit=crop&w=400&q=80", alt: "مشاوره والدین" },
    ],
    previewUrl: "araaye.com/doctors/demo/pediatric",
  },
  physiotherapy: {
    key: "physiotherapy",
    practiceName: "کلینیک فیزیوتراپی رها",
    doctorName: "دکتر امیر رهنما",
    doctorTitle: "فیزیوتراپیست و متخصص توانبخشی",
    city: "تهران، سعادت‌آباد",
    accent: "brand",
    layout: "cool",
    heroBadge: "توانبخشی و فیزیوتراپی تخصصی",
    heroTitle: "بازگشت به حرکت،",
    heroTitleAccent: "با برنامه درمانی شفاف",
    heroSubtitle:
      "معرفی خدمات فیزیوتراپی، مسیر ارزیابی اولیه و درخواست نوبت — برای بیمارانی که قبل از مراجعه می‌خواهند بدانند چه انتظاری دارند.",
    heroCta: "درخواست ارزیابی",
    heroImage:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=85",
    heroImageAlt: "جلسه فیزیوتراپی تخصصی در کلینیک",
    heroSecondaryImage:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80",
    trustBullets: [
      "معرفی روش‌های درمان و شرایط مراجعه",
      "اطلاعات آدرس، ساعات و بیمه",
      "فرم درخواست نوبت یا تماس سریع",
    ],
    stats: [
      { value: "+۵۰۰۰", label: "بیمار توان‌یافته" },
      { value: "۱۴ سال", label: "سابقه تخصصی" },
      { value: "۴.۸ / ۵", label: "رضایت بیماران" },
    ],
    aboutTitle: "کلینیک تخصصی توانبخشی رها",
    aboutText:
      "دکتر امیر رهنما با تیمی مجرب، برنامه درمانی شخصی‌سازی‌شده برای آسیب‌های ورزشی، ارتوپدی و نورولوژیک ارائه می‌دهد.",
    aboutImage:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80",
    aboutImageAlt: "جلسه فیزیوتراپی",
    services: [
      { title: "فیزیوتراپی ورزشی", description: "بازگشت سریع به میادین ورزشی.", icon: "target" },
      { title: "توانبخشی ارتوپدی", description: "درمان آسیب‌های مفصلی و عضلانی.", icon: "stethoscope" },
      { title: "الکتروتراپی", description: "کاهش درد با دستگاه‌های پیشرفته.", icon: "bolt" },
      { title: "ارزیابی اولیه", description: "معاینه و طرح درمان شفاف.", icon: "searchCheck" },
    ],
    previewUrl: "araaye.com/doctors/demo/physiotherapy",
  },
  women: {
    key: "women",
    practiceName: "مطب زنان و زایمان سپیده",
    doctorName: "دکتر سپیده رادمنش",
    doctorTitle: "متخصص زنان، زایمان و نازایی",
    city: "تهران، ونک",
    accent: "teal",
    layout: "warm",
    heroBadge: "مراقبت تخصصی زنان",
    heroTitle: "همراهی مطمئن،",
    heroTitleAccent: "در هر مرحله زندگی",
    heroSubtitle:
      "معرفی خدمات زنان و زایمان، پاسخ به نگرانی‌های شایع و مسیر نوبت آنلاین — با لحنی آرام و قابل‌اعتماد برای بیمار.",
    heroCta: "رزرو نوبت",
    heroImage:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1600&q=85",
    heroImageAlt: "فضای آرام مطب زنان و زایمان",
    heroSecondaryImage:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    trustBullets: [
      "صفحات خدمت برای ویزیت، بارداری و پیگیری",
      "FAQ برای کاهش اضطراب قبل از مراجعه",
      "تماس، واتساپ و درخواست نوبت در یک مسیر",
    ],
    stats: [
      { value: "+۹۰۰۰", label: "زایمان موفق" },
      { value: "۱۶ سال", label: "سابقه تخصصی" },
      { value: "۴.۹ / ۵", label: "رضایت بیماران" },
    ],
    aboutTitle: "مطب زنان و زایمان سپیده",
    aboutText:
      "دکتر سپیده رادمنش با رویکردی همدلانه، همراهی مطمئن در تمام مراحل زندگی زنان — از ویزیت دوره‌ای تا بارداری و زایمان.",
    aboutImage:
      "https://images.unsplash.com/photo-1584820925082-99f8e5e5e5e5?auto=format&fit=crop&w=900&q=80",
    aboutImageAlt: "مشاوره زنان در مطب",
    services: [
      { title: "ویزیت و معاینه", description: "چکاپ دوره‌ای و غربالگری.", icon: "stethoscope" },
      { title: "پیگیری بارداری", description: "مراقبت کامل دوران بارداری.", icon: "heart" },
      { title: "نازایی و IVF", description: "مشاوره و درمان ناباروری.", icon: "sparkle" },
      { title: "جراحی‌های زنان", description: "اقدامات جراحی با حداقل تهاجم.", icon: "shield" },
    ],
    galleryImages: [
      { src: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80", alt: "فضای مطب ۱" },
      { src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80", alt: "فضای مطب ۲" },
      { src: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=400&q=80", alt: "فضای مطب ۳" },
      { src: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=400&q=80", alt: "فضای مطب ۴" },
    ],
    previewUrl: "araaye.com/doctors/demo/women",
  },
  other: {
    key: "other",
    practiceName: "مطب تخصصی دکتر آریا",
    doctorName: "دکتر نیما آریا",
    doctorTitle: "فوق‌تخصص داخلی",
    city: "تهران، مطهری",
    accent: "sky",
    layout: "cool",
    heroBadge: "سایت اختصاصی برای هر تخصص",
    heroTitle: "هویت تخصصی شما،",
    heroTitleAccent: "نه یک قالب تکراری",
    heroSubtitle:
      "نمونه لندینگ برای تخصص‌هایی مثل داخلی، غدد، قلب و مشابه — با رزومه علمی، صفحات خدمت و مسیر شفاف درخواست نوبت.",
    heroCta: "درخواست مشاوره سایت",
    heroImage:
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1600&q=85",
    heroImageAlt: "مطب پزشکی تخصصی با فضای حرفه‌ای",
    heroSecondaryImage:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    trustBullets: [
      "طراحی متناسب با نوع تخصص و مسیر تصمیم بیمار",
      "رزومه، سوابق و اعتمادسازی علمی",
      "فرم نوبت، تماس و واتساپ یکدست",
    ],
    stats: [
      { value: "+۱۵۰۰۰", label: "ویزیت سالانه" },
      { value: "۲۲ سال", label: "سابقه تخصصی" },
      { value: "۴.۹ / ۵", label: "رضایت بیماران" },
    ],
    aboutTitle: "درباره دکتر نیما آریا",
    aboutText:
      "فوق‌تخصص داخلی با تمرکز بر تشخیص دقیق و درمان شخصی‌سازی‌شده — سایت اختصاصی برای معرفی تخصص، سوابق علمی و مسیر نوبت.",
    aboutImage:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=900&q=80",
    aboutImageAlt: "دکتر در مطب تخصصی",
    services: [
      { title: "ویزیت تخصصی", description: "معاینه و تشخیص دقیق بیماری‌ها.", icon: "stethoscope" },
      { title: "چکاپ جامع", description: "ارزیابی کامل سلامت بزرگسالان.", icon: "searchCheck" },
      { title: "مشاوره بیماری مزمن", description: "دیابت، فشار خون و ...", icon: "chart" },
      { title: "پیگیری درمانی", description: "برنامه درمان و پیگیری منظم.", icon: "shield" },
    ],
    previewUrl: "araaye.com/doctors/demo/other",
  },
};

export const doctorDemoKeys = Object.keys(doctorDemoLandings) as DoctorDemoKey[];

export function getDoctorDemo(key: string): DoctorDemoLandingContent | null {
  return doctorDemoLandings[key as DoctorDemoKey] ?? null;
}

export function getDoctorDemoAccent(accent: DoctorDemoAccent): DoctorDemoAccentClasses {
  return doctorDemoAccentConfig[accent];
}

export function getDoctorDemoLayout(layout: DoctorDemoLayout): DoctorDemoLayoutClasses {
  return doctorDemoLayoutConfig[layout];
}

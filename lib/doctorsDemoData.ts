// داده لندینگ یک‌صفحه‌ای دموی تخصص‌های پزشکان — فقط hero و trust bullets.

import { demoSites } from "@/lib/demoData";
import { pedBrand, pedImages } from "@/lib/showdemoto/pediatric/config";
import { sfBrand, sfImages } from "@/lib/showdemoto/salamat-farda/config";

export type DoctorDemoKey =
  | "dentist"
  | "dentist-kordian"
  | "ophthalmology"
  | "dermatology"
  | "pediatric"
  | "physiotherapy";

export type DoctorDemoAccent = "cyan" | "sky" | "teal" | "brand" | "slate";

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

export interface DoctorDemoLandingContent {
  key: DoctorDemoKey;
  practiceName: string;
  doctorName: string;
  doctorTitle: string;
  city: string;
  accent: DoctorDemoAccent;
  heroBadge: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  heroCta: string;
  heroImage: string;
  heroImageAlt: string;
  trustBullets: string[];
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
    heroBadge: dentist.heroBadge,
    heroTitle: dentist.heroTitle,
    heroTitleAccent: dentist.heroTitleAccent,
    heroSubtitle: dentist.heroSubtitle,
    heroCta: dentist.heroCtaPrimary,
    heroImage:
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1600&q=85",
    heroImageAlt: "فضای کلینیک دندان‌پزشکی با تجهیزات مدرن",
    trustBullets: dentist.credentials.slice(0, 3),
    previewUrl: "araaye.com/doctors/demo/dentist",
  },
  "dentist-kordian": {
    key: "dentist-kordian",
    practiceName: "کلینیک دندان‌پزشکی کوردیان",
    doctorName: "دکتر آرش کوردیان",
    doctorTitle: "متخصص دندان‌پزشکی — نسخه چندزبانه",
    city: "تهران",
    accent: "cyan",
    heroBadge: "نسخه فارسی · English · Русский",
    heroTitle: "لبخندی که",
    heroTitleAccent: "بیماران بین‌المللی هم می‌فهمند",
    heroSubtitle:
      "سایت چندزبانه برای معرفی خدمات، مسیر نوبت و ارتباط شفاف با بیماران خارج از کشور.",
    heroCta: "رزرو مشاوره آنلاین",
    heroImage:
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=85",
    heroImageAlt: "کلینیک دندان‌پزشکی آماده پذیرش بیماران بین‌المللی",
    trustBullets: [
      "محتوای فارسی، انگلیسی و روسی",
      "مسیر نوبت و تماس برای بیماران خارجی",
      "معرفی خدمات با زبان ساده و حرفه‌ای",
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
    heroBadge: "معاینه و جراحی تخصصی چشم",
    heroTitle: "دید واضح‌تر،",
    heroTitleAccent: "مسیر درمان شفاف‌تر",
    heroSubtitle: sfBrand.tagline,
    heroCta: "درخواست مشاوره",
    heroImage: sfImages.hero,
    heroImageAlt: sfImages.heroAlt,
    trustBullets: [
      "معرفی خدمات تخصصی با عنوان‌های قابل جستجو",
      "گالری قبل و بعد و مسیر تماس یکدست",
      "اطلاعات مطب و ساعات کاری شفاف",
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
    heroBadge: "درمان تخصصی پوست و زیبایی",
    heroTitle: "پوست سالم،",
    heroTitleAccent: "اعتماد بیشتر",
    heroSubtitle:
      "معرفی خدمات درمانی و زیبایی با مسیر مشاوره و نوبت آنلاین — برای بیمارانی که قبل از مراجعه اطلاعات می‌خواهند.",
    heroCta: "رزرو مشاوره",
    heroImage:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=85",
    heroImageAlt: "فضای آرام کلینیک پوست و زیبایی",
    trustBullets: [
      "صفحات مجزا برای خدمات اصلی",
      "معرفی پزشک و سوابق تخصصی",
      "دکمه ثابت واتساپ و درخواست نوبت",
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
    heroBadge: "مراقبت از نوزادی تا نوجوانی",
    heroTitle: "سلامت کوچولوی شما،",
    heroTitleAccent: "اولویت ماست",
    heroSubtitle: pedBrand.tagline,
    heroCta: "رزرو نوبت آنلاین",
    heroImage: pedImages.hero,
    heroImageAlt: pedImages.heroAlt,
    trustBullets: [
      "معرفی گروه‌های سنی و خدمات مطب",
      "محیط آرام و اطلاعات شفاف برای والدین",
      "مسیر تماس و نوبت‌دهی ساده",
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
    heroBadge: "توانبخشی و فیزیوتراپی تخصصی",
    heroTitle: "بازگشت به حرکت،",
    heroTitleAccent: "با برنامه درمانی شفاف",
    heroSubtitle:
      "معرفی خدمات فیزیوتراپی، مسیر ارزیابی اولیه و درخواست نوبت — برای بیمارانی که قبل از مراجعه می‌خواهند بدانند چه انتظاری دارند.",
    heroCta: "درخواست ارزیابی",
    heroImage:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=85",
    heroImageAlt: "جلسه فیزیوتراپی تخصصی در کلینیک",
    trustBullets: [
      "معرفی روش‌های درمان و شرایط مراجعه",
      "اطلاعات آدرس، ساعات و بیمه",
      "فرم درخواست نوبت یا تماس سریع",
    ],
    previewUrl: "araaye.com/doctors/demo/physiotherapy",
  },
};

export const doctorDemoKeys = Object.keys(doctorDemoLandings) as DoctorDemoKey[];

export function getDoctorDemo(key: string): DoctorDemoLandingContent | null {
  return doctorDemoLandings[key as DoctorDemoKey] ?? null;
}

export function getDoctorDemoAccent(accent: DoctorDemoAccent): DoctorDemoAccentClasses {
  return doctorDemoAccentConfig[accent];
}

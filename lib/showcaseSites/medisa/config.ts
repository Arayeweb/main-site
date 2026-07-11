import { SITE_URL } from "@/lib/siteUrl";

export const medisaImages = {
  hero: "/showcase-assets/medisa/hero.jpg",
  heroAlt: "نمای معماری مسکونی مدرن با نور طبیعی",
  studio: "/showcase-assets/medisa/studio.jpg",
  studioAlt: "فضای داخلی مینیمال با متریال سنگی",
  featured: [
    "/showcase-assets/medisa/featured-1.jpg",
    "/showcase-assets/medisa/featured-2.jpg",
    "/showcase-assets/medisa/featured-3.jpg",
  ],
  projects: {
    courtyard: "/showcase-assets/medisa/project-courtyard.jpg",
    bright: "/showcase-assets/medisa/project-bright.jpg",
    office: "/showcase-assets/medisa/project-office.jpg",
    slope: "/showcase-assets/medisa/project-slope.jpg",
  },
} as const;

export const medisaContact = {
  phone: "۰۲۱-۰۰۰۰۰۰۰۰",
  phoneTel: "tel:+982100000000",
  instagram: "[اینستاگرام — پس از تأیید نهایی]",
  address: "[آدرس استودیو — پس از تأیید نهایی]",
} as const;

export const medisaNav = [
  { label: "پروژه‌ها", href: "#projects" },
  { label: "خدمات", href: "#services" },
  { label: "رویکرد ما", href: "#approach" },
  { label: "استودیو", href: "#studio" },
  { label: "شروع همکاری", href: "#inquiry" },
] as const;

export const medisaProjects = [
  {
    slug: "courtyard",
    title: "خانه حیاط مرکزی",
    category: "معماری مسکونی",
    location: "تهران",
    status: "پروژه مفهومی",
    image: medisaImages.projects.courtyard,
    alt: "نمای مفهومی خانه با حیاط مرکزی",
  },
  {
    slug: "bright",
    title: "آپارتمان روشن",
    category: "طراحی داخلی",
    location: "کرج",
    status: "پروژه مفهومی",
    image: medisaImages.projects.bright,
    alt: "فضای داخلی روشن آپارتمان مفهومی",
  },
  {
    slug: "office",
    title: "دفتر کار آوا",
    category: "فضای اداری",
    location: "تهران",
    status: "پروژه مفهومی",
    image: medisaImages.projects.office,
    alt: "فضای اداری مفهومی با نور طبیعی",
  },
  {
    slug: "slope",
    title: "ویلای شیب",
    category: "معماری ویلا",
    location: "دماوند",
    status: "پروژه مفهومی",
    image: medisaImages.projects.slope,
    alt: "ویلای مفهومی در منظره کوهستانی",
  },
] as const;

export const medisaServices = [
  "طراحی معماری",
  "طراحی داخلی",
  "بازسازی",
  "طراحی فضای اداری و تجاری",
  "طراحی ویلا",
  "مشاوره پیش از خرید یا ساخت",
] as const;

export const medisaApproach = [
  "شناخت نیازها و سبک زندگی",
  "بررسی فضا و محدودیت‌ها",
  "شکل‌گیری ایده طراحی",
  "توسعه نقشه‌ها و جزئیات",
  "همراهی در اجرای پروژه",
] as const;

export const medisaProjectTypes = [
  "طراحی معماری",
  "طراحی داخلی",
  "بازسازی",
  "طراحی ویلا",
  "فضای اداری یا تجاری",
  "مشاوره",
] as const;

export const medisaProjectStatuses = [
  "در مرحله ایده",
  "ملک یا زمین انتخاب شده",
  "در حال ساخت",
  "نیازمند بازسازی",
  "فقط مشاوره اولیه",
] as const;

export const medisaFeatured = {
  title: "خانه حیاط مرکزی",
  type: "معماری مسکونی",
  concept:
    "خانه‌ای درون‌گرا با ارتباط مستقیم میان فضای زندگی، نور طبیعی و حیاط مرکزی.",
  challenge: "ایجاد نور و تهویه کافی در قطعه‌ای با تراکم شهری بالا.",
  approach:
    "تمرکز بر حیاط مرکزی به‌عنوان قلب پروژه و چیدمان فضاها حول آن برای نورگیری یکنواخت.",
  materials: "سنگ طبیعی، چوب، شیشه و سطوح مات خاکستری",
} as const;

export const medisaJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "استودیو معماری مدیسا",
  description:
    "معماری، طراحی داخلی و بازسازی — نمونه مفهومی طراحی شده توسط آرایه.",
  url: `${SITE_URL}/showcase/medisa-studio`,
  serviceType: medisaServices,
};

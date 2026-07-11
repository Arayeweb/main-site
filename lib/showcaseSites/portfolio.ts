import type { ShowcasePortfolioEntry, ShowcaseSlug } from "./types";

export const SHOWCASE_PORTFOLIO: ShowcasePortfolioEntry[] = [
  {
    slug: "shiva-hearing",
    title: "کلینیک شنوایی شیوا",
    industry: "کلینیک شنوایی و سمعک",
    description:
      "وب‌سایت خدماتی برای معرفی خدمات شنوایی، سمعک و دریافت درخواست مشاوره.",
    thumbnail: "/showcase-assets/shiva/hero.jpg",
    desktopPreview: "/showcase-assets/shiva/hero.jpg",
    mobilePreview: "/showcase-assets/shiva/interior.jpg",
    services: [
      "ارزیابی شنوایی",
      "مشاوره سمعک",
      "شنوایی کودکان",
      "تنظیم و سرویس سمعک",
    ],
    projectType: "وب‌سایت خدماتی",
    route: "/showcase/shiva-hearing",
    showcaseStatus: "conceptual",
    leadSource: "showcase-shiva-hearing",
  },
  {
    slug: "kaveh-iron",
    title: "آهن کاوه",
    industry: "فروش آهن‌آلات",
    description:
      "لندینگ‌پیج فروش برای معرفی محصولات و دریافت سریع درخواست استعلام قیمت آهن‌آلات.",
    thumbnail: "/showcase-assets/kaveh/hero.jpg",
    desktopPreview: "/showcase-assets/kaveh/hero.jpg",
    mobilePreview: "/showcase-assets/kaveh/product-beam.jpg",
    services: ["میلگرد", "تیرآهن", "ورق", "نبشی", "لوله", "استعلام قیمت"],
    projectType: "لندینگ فروش",
    route: "/showcase/kaveh-iron",
    showcaseStatus: "conceptual",
    leadSource: "showcase-kaveh-iron",
  },
  {
    slug: "medisa-studio",
    title: "استودیو معماری مدیسا",
    industry: "معماری و طراحی داخلی",
    description:
      "وب‌سایت تصویرمحور برای نمایش پروژه‌های معماری و دریافت اطلاعات پروژه‌های جدید.",
    thumbnail: "/showcase-assets/medisa/hero.jpg",
    desktopPreview: "/showcase-assets/medisa/hero.jpg",
    mobilePreview: "/showcase-assets/medisa/project-courtyard.jpg",
    services: [
      "طراحی معماری",
      "طراحی داخلی",
      "بازسازی",
      "طراحی ویلا",
      "فضای اداری",
    ],
    projectType: "وب‌سایت نمونه‌کار",
    route: "/showcase/medisa-studio",
    showcaseStatus: "conceptual",
    leadSource: "showcase-medisa-studio",
  },
];

export function getShowcasePortfolioEntry(
  slug: ShowcaseSlug,
): ShowcasePortfolioEntry | undefined {
  return SHOWCASE_PORTFOLIO.find((entry) => entry.slug === slug);
}

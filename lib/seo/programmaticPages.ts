import type { IndustrySlug } from "./industries";
import type { ServiceType } from "./pageContent";
import { NEW_WEBSITE_PROGRAMMATIC_PAGES } from "./newWebsiteIndustryContent";

export type PageStatus = "published" | "draft";

export interface ProgrammaticIndustryPage {
  slug: IndustrySlug;
  productType: ServiceType;
  status: PageStatus;
  primaryKeyword: string;
  secondaryKeywords: readonly string[];
  /** Sibling slugs for internal linking (same productType). */
  relatedSlugs: readonly IndustrySlug[];
}

/** Central registry — only `published` pages are indexable and in sitemap. */
export const PROGRAMMATIC_INDUSTRY_PAGES: readonly ProgrammaticIndustryPage[] = [
  // ── Website design (published) ──
  {
    slug: "doctor",
    productType: "website",
    status: "draft",
    primaryKeyword: "طراحی سایت پزشک",
    secondaryKeywords: [
      "طراحی سایت پزشکی",
      "طراحی سایت مطب",
      "سایت نوبت‌دهی پزشک",
      "طراحی وب‌سایت پزشکی",
    ],
    relatedSlugs: ["clinic", "dentist", "beauty-clinic"],
  },
  {
    slug: "clinic",
    productType: "website",
    status: "published",
    primaryKeyword: "طراحی سایت کلینیک",
    secondaryKeywords: [
      "طراحی سایت کلینیک پزشکی",
      "وب‌سایت کلینیک",
      "سایت نوبت‌دهی کلینیک",
    ],
    relatedSlugs: ["dentist", "beauty-clinic", "lawyer"],
  },
  {
    slug: "beauty-clinic",
    productType: "website",
    status: "published",
    primaryKeyword: "طراحی سایت کلینیک زیبایی",
    secondaryKeywords: [
      "طراحی وب‌سایت کلینیک زیبایی",
      "طراحی سایت کلینیک پوست و مو",
      "سایت کلینیک زیبایی",
      "نمونه سایت کلینیک زیبایی",
    ],
    relatedSlugs: ["clinic", "dentist", "lawyer"],
  },
  {
    slug: "dentist",
    productType: "website",
    status: "published",
    primaryKeyword: "طراحی سایت دندانپزشکی",
    secondaryKeywords: [
      "طراحی سایت کلینیک دندانپزشکی",
      "طراحی سایت مطب دندانپزشکی",
      "سایت دندانپزشکی",
      "سایت نوبت‌دهی دندانپزشک",
    ],
    relatedSlugs: ["clinic", "beauty-clinic", "lawyer"],
  },
  {
    slug: "lawyer",
    productType: "website",
    status: "published",
    primaryKeyword: "طراحی سایت وکیل",
    secondaryKeywords: [
      "طراحی سایت وکالت",
      "طراحی وب‌سایت وکلا",
      "طراحی سایت وکیل خانواده",
      "نمونه طراحی سایت وکیل",
    ],
    relatedSlugs: ["restaurant", "clinic", "beauty-clinic"],
  },
  // Sales landing lives at /website-design/restaurant; /website/restaurant redirects there.
  {
    slug: "restaurant",
    productType: "website",
    status: "draft",
    primaryKeyword: "طراحی سایت رستوران",
    secondaryKeywords: [
      "طراحی سایت رستوران و فست‌فود",
      "طراحی سایت رستوران و کافی‌شاپ",
      "طراحی سایت منوی رستوران",
      "قیمت طراحی سایت رستوران",
      "هزینه طراحی سایت رستوران",
    ],
    relatedSlugs: ["lawyer", "beauty-clinic", "clinic"],
  },
  // ── Website design (draft) ──
  {
    slug: "cafe",
    productType: "website",
    status: "published",
    primaryKeyword: "طراحی سایت کافه",
    secondaryKeywords: [
      "طراحی وب‌سایت کافه",
      "سایت منوی کافه",
      "قیمت طراحی سایت کافه",
      "نمونه سایت کافه",
    ],
    relatedSlugs: ["restaurant", "instagram-business", "service-company"],
  },
  {
    slug: "real-estate",
    productType: "website",
    status: "draft",
    primaryKeyword: "طراحی سایت املاک",
    secondaryKeywords: [
      "طراحی سایت مشاور املاک",
      "سایت فایل ملکی",
      "طراحی وب‌سایت املاک",
    ],
    relatedSlugs: ["lawyer", "service-company"],
  },
  {
    slug: "online-shop",
    productType: "website",
    status: "published",
    primaryKeyword: "طراحی سایت فروشگاه",
    secondaryKeywords: [
      "طراحی فروشگاه اینترنتی",
      "طراحی وب‌سایت فروشگاهی",
      "قیمت طراحی سایت فروشگاه",
      "ساخت فروشگاه آنلاین",
    ],
    relatedSlugs: ["instagram-business", "service-company", "restaurant"],
  },
  ...(NEW_WEBSITE_PROGRAMMATIC_PAGES as ProgrammaticIndustryPage[]),

  // ── SEO (published) ──
  {
    slug: "doctor",
    productType: "seo",
    status: "published",
    primaryKeyword: "سئو سایت پزشکی",
    secondaryKeywords: [
      "خدمات سئو سایت پزشکی",
      "سئو پزشکی",
      "قیمت سئو سایت پزشکی",
      "هزینه سئو سایت پزشکی",
      "طراحی و سئو سایت پزشکی",
    ],
    relatedSlugs: ["clinic", "dentist", "beauty-clinic"],
  },
  {
    slug: "clinic",
    productType: "seo",
    status: "published",
    primaryKeyword: "سئو سایت کلینیک",
    secondaryKeywords: ["سئو کلینیک", "سئو پزشکی", "سئو سایت‌های پزشکی"],
    relatedSlugs: ["doctor", "dentist", "beauty-clinic"],
  },
  {
    slug: "beauty-clinic",
    productType: "seo",
    status: "published",
    primaryKeyword: "سئو سایت کلینیک زیبایی",
    secondaryKeywords: [
      "سئو کلینیک زیبایی",
      "سئو سایت پوست و مو",
      "سئو پزشکی",
      "سئو کلینیک زیبایی در تهران",
    ],
    relatedSlugs: ["clinic", "dentist", "doctor"],
  },
  {
    slug: "dentist",
    productType: "seo",
    status: "published",
    primaryKeyword: "سئو سایت دندانپزشکی",
    secondaryKeywords: [
      "خدمات سئو سایت دندانپزشکی",
      "سئوی سایت دندانپزشکی",
      "سئو پزشکی",
      "سئو کلینیک دندانپزشکی",
    ],
    relatedSlugs: ["clinic", "doctor", "beauty-clinic"],
  },
  {
    slug: "lawyer",
    productType: "seo",
    status: "published",
    primaryKeyword: "سئو سایت وکیل",
    secondaryKeywords: [
      "سئو سایت وکالت",
      "سئو سایت وکلا",
      "سئو سایت حقوقی",
      "طراحی و سئو سایت حقوقی",
    ],
    relatedSlugs: ["doctor", "clinic", "beauty-clinic"],
  },
  // ── SEO (draft) ──
  { slug: "restaurant", productType: "seo", status: "draft", primaryKeyword: "سئو رستوران", secondaryKeywords: [], relatedSlugs: ["lawyer"] },
  { slug: "cafe", productType: "seo", status: "draft", primaryKeyword: "سئو کافه", secondaryKeywords: [], relatedSlugs: ["restaurant"] },
  { slug: "real-estate", productType: "seo", status: "draft", primaryKeyword: "سئو املاک", secondaryKeywords: [], relatedSlugs: ["lawyer"] },
  { slug: "online-shop", productType: "seo", status: "draft", primaryKeyword: "سئو فروشگاه", secondaryKeywords: [], relatedSlugs: ["restaurant"] },
  { slug: "private-tutor", productType: "seo", status: "draft", primaryKeyword: "سئو سایت مدرس خصوصی", secondaryKeywords: [], relatedSlugs: [] },
  { slug: "consultant", productType: "seo", status: "draft", primaryKeyword: "سئو سایت مشاور", secondaryKeywords: [], relatedSlugs: [] },
  { slug: "architect", productType: "seo", status: "draft", primaryKeyword: "سئو سایت معماری", secondaryKeywords: [], relatedSlugs: [] },
  { slug: "photographer", productType: "seo", status: "draft", primaryKeyword: "سئو سایت عکاسی", secondaryKeywords: [], relatedSlugs: [] },
  { slug: "service-company", productType: "seo", status: "draft", primaryKeyword: "سئو سایت شرکت خدماتی", secondaryKeywords: [], relatedSlugs: [] },
  { slug: "instagram-business", productType: "seo", status: "draft", primaryKeyword: "سئو سایت اینستاگرامی", secondaryKeywords: [], relatedSlugs: [] },
] as const;

export function getProgrammaticPage(
  productType: ServiceType,
  slug: IndustrySlug,
): ProgrammaticIndustryPage | undefined {
  return PROGRAMMATIC_INDUSTRY_PAGES.find((p) => p.productType === productType && p.slug === slug);
}

export function isPublishedIndustryPage(productType: ServiceType, slug: IndustrySlug): boolean {
  return getProgrammaticPage(productType, slug)?.status === "published";
}

export function getPublishedIndustryPages(productType: ServiceType): ProgrammaticIndustryPage[] {
  return PROGRAMMATIC_INDUSTRY_PAGES.filter(
    (p) => p.productType === productType && p.status === "published",
  );
}

export function getPublishedIndustryPaths(productType: ServiceType): string[] {
  return getPublishedIndustryPages(productType).map((p) => `/${productType}/${p.slug}`);
}

/** Analytics source slug, e.g. `website_dentist_organic`. */
export function industryOrganicSource(productType: ServiceType, slug: IndustrySlug): string {
  return `${productType}_${slug}_organic`;
}

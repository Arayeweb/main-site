import Link from "next/link";
import {
  getProgrammaticPage,
  getPublishedIndustryPages,
} from "@/lib/seo/programmaticPages";
import type { IndustrySlug } from "@/lib/seo/industries";
import type { ServiceType } from "@/lib/seo/pageContent";

type IndustryRelatedLinksProps = {
  serviceType: ServiceType;
  slug: IndustrySlug;
};

/** Varied blog anchors — avoid identical anchor text on every industry page. */
const INDUSTRY_BLOG_LINKS: Partial<
  Record<IndustrySlug, { href: string; label: string }>
> = {
  "private-tutor": {
    href: "/blog/website-design-order-checklist",
    label: "چک‌لیست قبل از سفارش سایت",
  },
  consultant: {
    href: "/blog/website-design-order-checklist",
    label: "قبل از قرارداد طراحی سایت چه بدانیم؟",
  },
  architect: {
    href: "/blog/website-design-order-checklist",
    label: "آماده‌سازی سفارش طراحی سایت",
  },
  photographer: {
    href: "/blog/instagram-page-to-website",
    label: "از شبکه اجتماعی تا سایت مستقل",
  },
  "service-company": {
    href: "/blog/website-design-order-checklist",
    label: "راهنمای سفارش طراحی سایت کسب‌وکار",
  },
  "instagram-business": {
    href: "/blog/instagram-page-to-website",
    label: "تبدیل پیج اینستاگرام به سایت",
  },
  clinic: {
    href: "/blog/clinic-website-features",
    label: "امکانات ضروری سایت کلینیک",
  },
  dentist: {
    href: "/blog/clinic-website-features",
    label: "چه امکاناتی برای سایت درمانی لازم است؟",
  },
  "beauty-clinic": {
    href: "/blog/clinic-website-features",
    label: "چک‌لیست امکانات سایت کلینیک زیبایی",
  },
  lawyer: {
    href: "/blog/website-design-order-checklist",
    label: "چک‌لیست سفارش طراحی سایت",
  },
  restaurant: {
    href: "/website-design/restaurant",
    label: "سفارش سایت رستوران و منوی دیجیتال",
  },
};

const PRICING_PATH_LABEL: Partial<Record<IndustrySlug, string>> = {
  "private-tutor": "شروع سریع با سایت فوری",
  consultant: "طراحی سایت ارزان و فوری",
  architect: "مقایسه سایت فوری و اختصاصی",
  photographer: "تعرفه سایت فوری",
  "service-company": "مسیر اقتصادی FastWeb",
  "instagram-business": "ساخت سریع سایت از پیج",
  clinic: "سایت فوری برای شروع",
  dentist: "گزینه اقتصادی طراحی سایت",
  "beauty-clinic": "سایت فوری آرایه",
  lawyer: "تحویل سریع نسخه اول سایت",
  restaurant: "سایت فوری برای کسب‌وکار محلی",
};

export default function IndustryRelatedLinks({ serviceType, slug }: IndustryRelatedLinksProps) {
  const current = getProgrammaticPage(serviceType, slug);
  const hubPath = serviceType === "seo" ? "/seo" : "/website-design";
  const hubLabel = serviceType === "seo" ? "خدمات سئو سایت" : "طراحی سایت حرفه‌ای";
  const commercialPath = serviceType === "seo" ? "/website-design" : "/seo";
  const commercialLabel = serviceType === "seo" ? "طراحی سایت حرفه‌ای" : "خدمات سئو سایت";

  const fromRelated =
    current?.relatedSlugs
      .map((s) => getProgrammaticPage(serviceType, s))
      .filter((p): p is NonNullable<typeof p> => p?.status === "published") ?? [];

  const siblings =
    fromRelated.length >= 2
      ? fromRelated.slice(0, 3)
      : getPublishedIndustryPages(serviceType)
          .filter((p) => p.slug !== slug)
          .slice(0, 2);

  const blog = INDUSTRY_BLOG_LINKS[slug];
  const fastwebLabel = PRICING_PATH_LABEL[slug] ?? "طراحی سایت ارزان و فوری";

  return (
    <section className="section-py border-t border-navy-100 bg-white">
      <div className="container-mx container-px">
        <h2 className="text-lg font-extrabold text-navy-900">صفحات مرتبط</h2>
        <ul className="mt-4 flex flex-col gap-2 text-[13px]">
          <li>
            <Link href={hubPath} className="font-bold text-teal-700 hover:text-teal-800">
              {hubLabel}
            </Link>
          </li>
          {serviceType === "website" ? (
            <>
              <li>
                <Link
                  href="/website-design/cost"
                  className="font-bold text-teal-700 hover:text-teal-800"
                >
                  قیمت طراحی سایت
                </Link>
              </li>
              <li>
                <Link href="/fastweb" className="font-bold text-teal-700 hover:text-teal-800">
                  {fastwebLabel}
                </Link>
              </li>
            </>
          ) : null}
          {siblings.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/${serviceType}/${s.slug}`}
                className="font-bold text-teal-700 hover:text-teal-800"
              >
                {s.primaryKeyword}
              </Link>
            </li>
          ))}
          {blog ? (
            <li>
              <Link href={blog.href} className="font-bold text-teal-700 hover:text-teal-800">
                {blog.label}
              </Link>
            </li>
          ) : null}
          <li>
            <Link href={commercialPath} className="font-bold text-teal-700 hover:text-teal-800">
              {commercialLabel}
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}

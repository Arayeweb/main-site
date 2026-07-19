import Link from "next/link";
import SectionHeader from "@/components/home/SectionHeader";
import { getPublishedIndustryPages } from "@/lib/seo/programmaticPages";
import type { ServiceType } from "@/lib/seo/pageContent";
import { industries } from "@/lib/seo/industries";

type IndustryHubLinksProps = {
  productType: ServiceType;
  title: string;
  subtitle: string;
};

function persianLabel(slug: string): string {
  return industries.find((i) => i.slug === slug)?.persianName ?? slug;
}

/** Sales landings that replace programmatic /website/{slug} cards on the hub. */
const WEBSITE_SALES_OVERRIDES = new Set(["restaurant"]);

export default function IndustryHubLinks({ productType, title, subtitle }: IndustryHubLinksProps) {
  const pages = getPublishedIndustryPages(productType).filter(
    (page) => !(productType === "website" && WEBSITE_SALES_OVERRIDES.has(page.slug)),
  );
  const hubPath = productType === "seo" ? "/seo" : "/website-design";
  const hubLabel = productType === "seo" ? "خدمات سئو سایت" : "طراحی سایت حرفه‌ای";

  return (
    <section className="section-py bg-navy-50/20">
      <div className="container-mx container-px">
        <SectionHeader badge="راهکارهای تخصصی" title={title} subtitle={subtitle} />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {productType === "website" && (
            <Link
              href="/doctors"
              className="card !p-5 transition hover:border-teal-200 hover:shadow-card"
            >
              <p className="text-sm font-extrabold text-navy-900">طراحی سایت پزشکی</p>
              <p className="mt-2 text-[13px] leading-relaxed text-navy-500">
                پزشکان — طراحی سایت پزشک
              </p>
            </Link>
          )}
          {productType === "website" && (
            <Link
              href="/website-design/restaurant"
              className="card !p-5 transition hover:border-teal-200 hover:shadow-card"
            >
              <p className="text-sm font-extrabold text-navy-900">طراحی سایت رستوران</p>
              <p className="mt-2 text-[13px] leading-relaxed text-navy-500">
                رستوران و کافه — منوی دیجیتال و سفارش آنلاین
              </p>
            </Link>
          )}
          {pages.map((page) => (
            <Link
              key={page.slug}
              href={`/${productType}/${page.slug}`}
              className="card !p-5 transition hover:border-teal-200 hover:shadow-card"
            >
              <p className="text-sm font-extrabold text-navy-900">{page.primaryKeyword}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-navy-500">
                {persianLabel(page.slug)} — {page.secondaryKeywords[0] ?? ""}
              </p>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-center text-[13px] text-navy-500">
          <Link href={hubPath} className="font-bold text-teal-700 hover:text-teal-800">
            بازگشت به {hubLabel}
          </Link>
        </p>
      </div>
    </section>
  );
}

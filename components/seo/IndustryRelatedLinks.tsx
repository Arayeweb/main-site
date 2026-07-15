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

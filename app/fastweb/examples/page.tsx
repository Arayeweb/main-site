import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getFastWebExamplePath,
  getIndexableFastWebIndustries,
  getProofFastWebIndustries,
} from "@/lib/fastweb/industries";
import { canonicalUrl } from "@/lib/siteUrl";
import { SITE_NAME, organizationProviderRef } from "@/lib/seo/siteIdentity";

export const metadata: Metadata = {
  title: { absolute: "نمونه سایت فوری FastWeb بر اساس صنف | آرایه" },
  description:
    "نمونه‌های طراحی فرضی سایت فوری برای سالن زیبایی، باشگاه و دفتر وکالت — با ساختار متفاوت برای هر صنف.",
  alternates: { canonical: "/fastweb/examples" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "نمونه سایت فوری FastWeb بر اساس صنف",
    description: "ساختار متفاوت برای هر صنف — نه فقط تعویض نام شغل.",
    url: canonicalUrl("/fastweb/examples"),
    type: "website",
    locale: "fa_IR",
  },
};

export default function FastWebExamplesHubPage() {
  const industries = getProofFastWebIndustries();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      organizationProviderRef(),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: canonicalUrl("/") },
          { "@type": "ListItem", position: 2, name: "سایت فوری", item: canonicalUrl("/fastweb") },
          { "@type": "ListItem", position: 3, name: "نمونه‌ها", item: canonicalUrl("/fastweb/examples") },
        ],
      },
      {
        "@type": "ItemList",
        name: "نمونه سایت‌های فوری FastWeb",
        itemListElement: industries.map((industry, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: industry.examples[0]?.conceptName ?? industry.name,
          url: canonicalUrl(getFastWebExamplePath(industry.slug)),
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#f4f1ea] text-navy-900" dir="rtl">
        <Navbar solid ctaHref="/fastweb/new" ctaLabel="شروع سفارش" />
        <main className="mx-auto max-w-6xl px-5 pb-20 pt-24 sm:px-8">
          <p className="text-sm font-bold text-[#9a4a32]">نمونه‌ها</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl">
            نمونه سایت فوری؛ هر صنف یک ساختار
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-navy-500">
            این‌ها نمونه طراحی فرضی‌اند. هدف نشان دادن تفاوت blueprint و intent است — نه معرفی مشتری واقعی.
            فعلاً {getIndexableFastWebIndustries().length} صنف با کیفیت انتشار.
          </p>

          <ul className="mt-12 divide-y divide-navy-200 border-y border-navy-200">
            {industries.map((industry, i) => {
              const example = industry.examples[0];
              return (
                <li key={industry.slug} className="grid gap-3 py-7 sm:grid-cols-[4rem_1fr_auto] sm:items-center">
                  <span className="text-sm font-bold text-[#9a4a32]">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h2 className="text-xl font-extrabold">{example?.conceptName ?? industry.name}</h2>
                    <p className="mt-1 text-sm text-navy-500">{industry.searchIntent}</p>
                    <p className="mt-2 text-xs text-navy-400">نمونه طراحی فرضی · {industry.name}</p>
                  </div>
                  <Link
                    href={getFastWebExamplePath(industry.slug)}
                    className="text-sm font-bold text-navy-900 underline underline-offset-4"
                  >
                    مشاهده نمونه
                  </Link>
                </li>
              );
            })}
          </ul>
        </main>
        <Footer />
      </div>
    </>
  );
}

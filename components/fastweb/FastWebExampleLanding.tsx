"use client";

import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IndustryPreviewFrame from "@/components/fastweb/industry/IndustryPreviewFrame";
import {
  getFastWebIndustryPath,
  getIndustryOrderHref,
  type FastWebIndustry,
} from "@/lib/fastweb/industries";
import { trackFastWebEvent } from "@/lib/analytics/fastwebEvents";
import { canonicalUrl } from "@/lib/siteUrl";
import { SITE_NAME, organizationProviderRef } from "@/lib/seo/siteIdentity";

export default function FastWebExampleLanding({ industry }: { industry: FastWebIndustry }) {
  const example = industry.examples[0];
  const pagePath = `/fastweb/examples/${industry.slug}`;

  useEffect(() => {
    trackFastWebEvent("fastweb_example_view", {
      page_path: pagePath,
      industry: industry.slug,
      primary_keyword: industry.searchTerms[0],
      offer: "fastweb",
      page_type: "example",
      example_slug: example?.slug,
    });
  }, [industry.slug, industry.searchTerms, example?.slug, pagePath]);

  if (!example) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      organizationProviderRef(),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: canonicalUrl("/") },
          { "@type": "ListItem", position: 2, name: "سایت فوری", item: canonicalUrl("/fastweb") },
          {
            "@type": "ListItem",
            position: 3,
            name: industry.name,
            item: canonicalUrl(getFastWebIndustryPath(industry.slug)),
          },
          {
            "@type": "ListItem",
            position: 4,
            name: `نمونه ${industry.name}`,
            item: canonicalUrl(pagePath),
          },
        ],
      },
      {
        "@type": "WebPage",
        name: `نمونه سایت ${industry.name}`,
        description: example.whyStructure,
        url: canonicalUrl(pagePath),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#f4f1ea] text-navy-900" dir="rtl">
        <Navbar solid ctaHref={getIndustryOrderHref(industry.slug, "fastweb_example_page")} ctaLabel="شروع سفارش" />
        <main className="mx-auto max-w-6xl px-5 pb-20 pt-20 sm:px-8">
          <nav aria-label="مسیر صفحه" className="text-xs text-navy-400">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/fastweb" className="hover:text-navy-700">
                  سایت فوری
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/fastweb/examples" className="hover:text-navy-700">
                  نمونه‌ها
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-semibold text-navy-700">{industry.name}</li>
            </ol>
          </nav>

          <header className="mt-8 max-w-3xl">
            <p className="text-sm font-bold text-[#9a4a32]">نمونه طراحی فرضی</p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
              {example.conceptName} — ساختار سایت {industry.name}
            </h1>
            <p className="mt-4 text-sm leading-7 text-navy-500">{example.disclaimer}</p>
          </header>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <IndustryPreviewFrame industry={industry} variant="desktop" />
              <p className="mt-3 text-xs text-navy-400">{example.desktopCaption}</p>
            </div>
            <div>
              <IndustryPreviewFrame industry={industry} variant="mobile" />
              <p className="mt-3 text-center text-xs text-navy-400">{example.mobileCaption}</p>
            </div>
          </div>

          <dl className="mt-14 grid gap-8 border-y border-navy-200 py-10 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold text-navy-400">هدف کسب‌وکار</dt>
              <dd className="mt-2 text-sm leading-7 text-navy-700">{example.businessGoal}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-navy-400">سبک بصری</dt>
              <dd className="mt-2 text-sm leading-7 text-navy-700">{example.visualStyle}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-bold text-navy-400">چرا این ساختار؟</dt>
              <dd className="mt-2 text-sm leading-7 text-navy-700">{example.whyStructure}</dd>
            </div>
          </dl>

          <section className="mt-12">
            <h2 className="text-xl font-extrabold">بلوک‌های FastWeb در این نمونه</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {example.includedBlocks.map((key) => {
                const block = industry.requiredBlocks.find((b) => b.key === key);
                return (
                  <li
                    key={key}
                    className="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm font-semibold text-navy-700"
                  >
                    {block?.title ?? key}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-extrabold">نقشه صفحه</h2>
            <ol className="mt-5 space-y-2">
              {industry.blueprint.map((key, i) => {
                const block = industry.requiredBlocks.find((b) => b.key === key);
                return (
                  <li key={key} className="flex gap-3 text-sm text-navy-700">
                    <span className="font-bold text-[#9a4a32]">{String(i + 1).padStart(2, "0")}</span>
                    <span>{block?.title ?? key}</span>
                  </li>
                );
              })}
            </ol>
          </section>

          <div className="mt-14 flex flex-wrap items-center gap-5 rounded-lg bg-navy-950 px-6 py-8 text-[#f4f1ea]">
            <div className="flex-1">
              <p className="text-lg font-extrabold">همین ساختار را برای کسب‌وکار خودتان بسازید</p>
              <p className="mt-2 text-sm text-white/70">
                ویزارد با صنعت «{industry.name}» از پیش انتخاب می‌شود؛ قابل تغییر است.
              </p>
            </div>
            <Link
              href={getIndustryOrderHref(industry.slug, "fastweb_example_page")}
              className="inline-flex rounded-md bg-[#f4f1ea] px-5 py-3 text-sm font-extrabold text-navy-950"
              onClick={() =>
                trackFastWebEvent("fastweb_primary_cta_click", {
                  page_path: pagePath,
                  industry: industry.slug,
                  cta_position: "final",
                  offer: "fastweb",
                  page_type: "example",
                  source: "fastweb_example_page",
                })
              }
            >
              {industry.primaryCta}
            </Link>
            <Link
              href={getFastWebIndustryPath(industry.slug)}
              className="text-sm font-bold text-white/80 underline underline-offset-4"
            >
              صفحه {industry.name}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

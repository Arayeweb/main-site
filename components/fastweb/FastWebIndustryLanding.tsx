"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/home/SectionHeader";
import FastWebIndustryAnalytics from "@/components/fastweb/FastWebIndustryAnalytics";
import { FASTWEB_ORDER_HREF } from "@/components/fastweb/FastWebLanding";
import {
  getFastWebIndustry,
  getFastWebIndustryPath,
  type FastWebIndustry,
} from "@/lib/fastweb/industries";
import { FASTWEB_PACKAGES } from "@/lib/fastweb";
import {
  FASTWEB_START_PRICE_TOMAN,
  formatWebsiteDesignPrice,
} from "@/lib/websitePricing";
import { trackFastWebEvent } from "@/lib/analytics/fastwebEvents";
import type { FastWebCtaPosition } from "@/lib/analytics/fastwebEvents";
import { canonicalUrl } from "@/lib/siteUrl";
import { ORGANIZATION_ID, SITE_NAME, organizationProviderRef } from "@/lib/seo/siteIdentity";

const PROCESS_STEPS = [
  { n: "۱", title: "اطلاعات صنف را تکمیل می‌کنید", text: "خدمات، مخاطب و راه تماس را در فرم سفارش وارد می‌کنید." },
  { n: "۲", title: "نسخه اول آماده می‌شود", text: "تیم آرایه ساختار، متن و طراحی مناسب صنف شما را در ۲۴ ساعت کاری آماده می‌کند." },
  { n: "۳", title: "بررسی و انتشار", text: "پیش‌نمایش را می‌بینید، اصلاح می‌کنید و برای انتشار تأیید می‌دهید." },
] as const;

function trackCta(industry: FastWebIndustry, position: FastWebCtaPosition) {
  const base = {
    page_path: getFastWebIndustryPath(industry.slug),
    industry: industry.slug,
    primary_keyword: industry.primaryKeyword,
    cta_position: position,
    offer: "fastweb" as const,
  };
  if (position === "sample") {
    trackFastWebEvent("fastweb_sample_click", base);
    return;
  }
  trackFastWebEvent("fastweb_cta_click", base);
}

function BrowserFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card">
        <div className="flex items-center gap-2 border-b border-navy-100 bg-navy-50/70 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-navy-200" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-navy-200" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-navy-200" aria-hidden="true" />
          <span className="mr-auto truncate rounded-md bg-white px-3 py-1 text-[11px] font-medium text-navy-400 ring-1 ring-navy-100">
            araaye.com/s/sample
          </span>
        </div>
        <div className="bg-gradient-to-b from-slate-50 to-white p-6">{children}</div>
      </div>
      <p className="mt-3 text-center text-xs font-medium text-navy-400">{label}</p>
    </div>
  );
}

function IndustryMockup({ industry }: { industry: FastWebIndustry }) {
  const { sampleConfig } = industry;
  return (
    <BrowserFrame label="نمونه نمایشی FastWeb">
      <div className="space-y-3 text-right" dir="rtl">
        <div className="rounded-lg bg-teal-700 px-4 py-3 text-white">
          <p className="text-sm font-bold">{sampleConfig.label}</p>
          <p className="mt-1 text-xs opacity-80">{sampleConfig.style}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {sampleConfig.sections.map((section) => (
            <div
              key={section}
              className="rounded-md border border-navy-100 bg-white px-3 py-2 text-xs font-semibold text-navy-600"
            >
              {section}
            </div>
          ))}
        </div>
        <div className="rounded-md border border-dashed border-navy-200 bg-navy-50/50 px-3 py-2 text-[11px] leading-relaxed text-navy-400">
          {sampleConfig.disclaimer}
        </div>
      </div>
    </BrowserFrame>
  );
}

function CtaLink({
  industry,
  position,
  className,
  children,
}: {
  industry: FastWebIndustry;
  position: FastWebCtaPosition;
  className: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={FASTWEB_ORDER_HREF}
      className={className}
      onClick={() => trackCta(industry, position)}
    >
      {children}
    </Link>
  );
}

export default function FastWebIndustryLanding({ industry }: { industry: FastWebIndustry }) {
  const pagePath = getFastWebIndustryPath(industry.slug);
  const pageUrl = canonicalUrl(pagePath);

  const relatedIndustries = industry.relatedIndustries
    .map((slug) => getFastWebIndustry(slug))
    .filter((i): i is FastWebIndustry => i !== undefined);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      organizationProviderRef(),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: canonicalUrl("/") },
          { "@type": "ListItem", position: 2, name: "سایت فوری FastWeb", item: canonicalUrl("/fastweb") },
          { "@type": "ListItem", position: 3, name: industry.name, item: pageUrl },
        ],
      },
      {
        "@type": "Service",
        name: industry.title,
        serviceType: industry.primaryKeyword,
        provider: { "@id": ORGANIZATION_ID },
        areaServed: { "@type": "Country", name: "Iran" },
        url: pageUrl,
        description: industry.description,
        offers: [
          {
            "@type": "Offer",
            name: FASTWEB_PACKAGES.fast.name,
            price: String(FASTWEB_PACKAGES.fast.priceToman),
            priceCurrency: "IRR",
            availability: "https://schema.org/InStock",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: industry.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  return (
    <>
      <FastWebIndustryAnalytics industry={industry} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-[#F7F8FA] text-navy-900" dir="rtl">
        <Navbar solid ctaHref={FASTWEB_ORDER_HREF} ctaLabel={industry.cta.label} />

        <main>
          {/* Breadcrumb */}
          <nav aria-label="مسیر صفحه" className="container-mx container-px pt-20">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-navy-400">
              <li>
                <Link href="/" className="hover:text-teal-700">
                  خانه
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/fastweb" className="hover:text-teal-700">
                  سایت فوری
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-semibold text-navy-600">{industry.name}</li>
            </ol>
          </nav>

          {/* Hero */}
          <section className="border-b border-navy-100/80 bg-[#F7F8FA]">
            <div className="container-mx container-px py-10 sm:py-14">
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
                <div className="text-right">
                  <p className="text-sm font-bold text-teal-700">{industry.primaryKeyword}</p>
                  <h1 className="mt-4 max-w-xl text-balance text-3xl font-extrabold leading-[1.25] tracking-tight text-navy-900 sm:text-4xl">
                    {industry.h1}
                  </h1>
                  <p className="mt-5 max-w-xl text-[15px] leading-[1.9] text-navy-500 sm:text-base">
                    {industry.subheading}
                  </p>

                  <div className="mt-6 rounded-xl border border-teal-100 bg-teal-50/60 px-5 py-4">
                    <p className="text-sm font-bold text-navy-800">
                      شروع از {formatWebsiteDesignPrice(FASTWEB_START_PRICE_TOMAN)} تومان
                    </p>
                    <p className="mt-1 text-xs text-navy-500">
                      نسخه اول در ۲۴ ساعت کاری پس از تکمیل اطلاعات
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <CtaLink
                      industry={industry}
                      position="hero"
                      className="inline-flex items-center justify-center rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 active:scale-[0.98]"
                    >
                      {industry.cta.label}
                    </CtaLink>
                    <Link
                      href="/website-design/cost"
                      className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-6 py-3 text-sm font-bold text-navy-700 transition-all hover:bg-navy-50"
                    >
                      مقایسه قیمت
                    </Link>
                  </div>
                </div>

                <div className="lg:ps-2">
                  <IndustryMockup industry={industry} />
                </div>
              </div>
            </div>
          </section>

          {/* Pain points */}
          <section className="section-py bg-white">
            <div className="container-mx container-px">
              <SectionHeader
                badge="مشکلات واقعی"
                title={`چرا ${industry.name} بدون سایت مشتری از دست می‌دهد؟`}
                subtitle={`هدف: ${industry.conversionGoal}`}
              />
              <div className="grid gap-4 md:grid-cols-3">
                {industry.painPoints.map((p) => (
                  <article key={p.title} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
                    <h3 className="text-base font-extrabold text-navy-900">{p.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-navy-500">{p.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Required sections */}
          <section className="section-py bg-navy-50/40">
            <div className="container-mx container-px">
              <SectionHeader
                badge="ساختار سایت"
                title={`بخش‌های ضروری سایت ${industry.name}`}
              />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {industry.requiredSections.map((s, i) => (
                  <article key={s.title} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
                    <span className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-50 text-xs font-extrabold text-teal-700">
                      {i + 1}
                    </span>
                    <h3 className="text-base font-extrabold text-navy-900">{s.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-navy-500">{s.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Mockup CTA */}
          <section className="section-py bg-white">
            <div className="container-mx container-px">
              <div className="grid items-center gap-10 lg:grid-cols-2">
                <IndustryMockup industry={industry} />
                <div>
                  <h2 className="text-2xl font-extrabold text-navy-900">
                    پیش‌نمایش ساختار سایت {industry.name} شما
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-navy-500">
                    این نمونه نمایشی ساختار صفحه است. پس از تکمیل اطلاعات، نسخه واقعی با محتوای
                    کسب‌وکار شما تولید می‌شود.
                  </p>
                  <CtaLink
                    industry={industry}
                    position="sample"
                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-teal-800"
                  >
                    {industry.cta.label}
                  </CtaLink>
                </div>
              </div>
            </div>
          </section>

          {/* Included / Excluded */}
          <section className="section-py bg-navy-50/40">
            <div className="container-mx container-px">
              <SectionHeader badge="محدوده بسته" title="داخل و خارج پکیج FastWeb" />
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft">
                  <h3 className="text-lg font-extrabold text-navy-900">داخل پکیج</h3>
                  <ul className="mt-5 space-y-3">
                    {industry.includedFeatures.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-navy-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft">
                  <h3 className="text-lg font-extrabold text-navy-900">خارج از پکیج</h3>
                  <ul className="mt-5 space-y-3">
                    {industry.excludedFeatures.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-navy-600">
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-navy-300" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Fit for */}
          <section className="section-py bg-white">
            <div className="container-mx container-px">
              <SectionHeader badge="مخاطب" title="FastWeb برای چه کسی مناسب است؟" />
              <p className="mx-auto max-w-2xl text-center text-sm leading-7 text-navy-600">
                {industry.audience}
              </p>
            </div>
          </section>

          {/* When custom design */}
          <section className="section-py bg-navy-50/40">
            <div className="container-mx container-px">
              <SectionHeader
                badge="طراحی اختصاصی"
                title="چه زمانی طراحی اختصاصی لازم است؟"
              />
              <p className="mx-auto max-w-2xl text-center text-sm leading-7 text-navy-600">
                اگر به امکانات خارج از پکیج FastWeb نیاز دارید — مثل{" "}
                {industry.excludedFeatures.slice(0, 2).join("، ")} — مسیر طراحی اختصاصی مناسب‌تر
                است.
              </p>
              <div className="mt-8 text-center">
                <Link
                  href={industry.advancedProjectRoute}
                  className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-6 py-3 text-sm font-bold text-navy-700 transition-all hover:bg-navy-50"
                  onClick={() =>
                    trackFastWebEvent("fastweb_advanced_project_click", {
                      page_path: pagePath,
                      industry: industry.slug,
                      primary_keyword: industry.primaryKeyword,
                      cta_position: "pricing",
                      offer: "fastweb",
                    })
                  }
                >
                  مشاهده طراحی سایت اختصاصی
                </Link>
              </div>
            </div>
          </section>

          {/* Process */}
          <section className="section-py bg-white">
            <div className="container-mx container-px">
              <SectionHeader
                badge="فرایند"
                title="از سفارش تا نسخه اول، در ۳ مرحله"
                subtitle="زمان ۲۴ ساعت کاری پس از تکمیل اطلاعات اولیه محاسبه می‌شود."
              />
              <div className="grid gap-6 md:grid-cols-3">
                {PROCESS_STEPS.map((step) => (
                  <article
                    key={step.n}
                    className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                      {step.n}
                    </span>
                    <h3 className="mt-4 text-base font-extrabold text-navy-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-navy-500">{step.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="section-py scroll-mt-24 bg-navy-50/40">
            <div className="container-mx container-px">
              <SectionHeader badge="سوالات متداول" title={`پرسش‌های رایج درباره سایت ${industry.name}`} />
              <div className="mx-auto max-w-2xl border-t border-navy-100">
                {industry.faqs.map((item) => (
                  <details key={item.question} className="group border-b border-navy-100">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-right text-sm font-bold leading-relaxed text-navy-900 sm:py-5 sm:text-[15px] [&::-webkit-details-marker]:hidden">
                      <span>{item.question}</span>
                      <span
                        className="shrink-0 text-xl font-light text-navy-300 transition-transform duration-200 motion-reduce:transition-none group-open:rotate-45"
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </summary>
                    <p className="pb-4 text-sm leading-relaxed text-navy-500 sm:pb-5 sm:text-[15px]">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Related */}
          <section className="section-py bg-white">
            <div className="container-mx container-px">
              <SectionHeader badge="صفحات مرتبط" title="مسیرهای مفید بعد از این صفحه" />
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/fastweb"
                  className="rounded-xl border border-navy-100 bg-white px-4 py-2.5 text-sm font-semibold text-navy-700 shadow-soft transition hover:border-teal-200 hover:text-teal-700"
                >
                  سایت فوری FastWeb
                </Link>
                {relatedIndustries.map((related) => (
                  <Link
                    key={related.slug}
                    href={getFastWebIndustryPath(related.slug)}
                    className="rounded-xl border border-navy-100 bg-white px-4 py-2.5 text-sm font-semibold text-navy-700 shadow-soft transition hover:border-teal-200 hover:text-teal-700"
                  >
                    {related.primaryKeyword}
                  </Link>
                ))}
                <Link
                  href={industry.advancedProjectRoute}
                  className="rounded-xl border border-navy-100 bg-white px-4 py-2.5 text-sm font-semibold text-navy-700 shadow-soft transition hover:border-teal-200 hover:text-teal-700"
                >
                  طراحی سایت اختصاصی
                </Link>
                {industry.relatedBlog && (
                  <Link
                    href={industry.relatedBlog.href}
                    className="rounded-xl border border-navy-100 bg-white px-4 py-2.5 text-sm font-semibold text-navy-700 shadow-soft transition hover:border-teal-200 hover:text-teal-700"
                  >
                    {industry.relatedBlog.label}
                  </Link>
                )}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="section-py bg-teal-50">
            <div className="container-mx container-px text-center">
              <h2 className="mx-auto max-w-2xl text-2xl font-extrabold leading-snug text-navy-900 sm:text-3xl">
                {industry.cta.label}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-navy-500 sm:text-base">
                نسخه اول سایت {industry.name} در ۲۴ ساعت کاری — از{" "}
                {formatWebsiteDesignPrice(FASTWEB_START_PRICE_TOMAN)} تومان.
              </p>
              <CtaLink
                industry={industry}
                position="final"
                className="mt-8 inline-flex items-center justify-center rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                شروع سفارش
              </CtaLink>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

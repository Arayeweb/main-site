import type { IndustryLandingPageContent } from "@/lib/seo/pageContent";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/home/SectionHeader";
import IndustryStickyCta from "./IndustryStickyCta";
import IndustryConsultForm from "./IndustryConsultForm";
import IndustryRelatedLinks from "./IndustryRelatedLinks";
import IndustryPageAnalytics from "./IndustryPageAnalytics";
import IndustryHero from "./industry/IndustryHero";
import { IconCheck } from "@/components/icons";
import { canonicalUrl } from "@/lib/siteUrl";
import { ORGANIZATION_ID, SITE_NAME, organizationProviderRef } from "@/lib/seo/siteIdentity";

export default function IndustryLandingPage({ page }: { page: IndustryLandingPageContent }) {
  const pageUrl = canonicalUrl(page.meta.canonicalPath);
  const hubUrl =
    page.serviceType === "seo" ? canonicalUrl("/seo") : canonicalUrl("/website-design");
  const hubName = page.serviceType === "seo" ? "خدمات سئو سایت" : "طراحی سایت حرفه‌ای";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...organizationProviderRef(),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: canonicalUrl("/") },
          {
            "@type": "ListItem",
            position: 2,
            name: hubName,
            item: hubUrl,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: page.persianIndustryName,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "Service",
        name: page.meta.title,
        serviceType:
          page.serviceType === "seo"
            ? `سئو برای ${page.persianIndustryName}`
            : `طراحی سایت برای ${page.persianIndustryName}`,
        provider: { "@id": ORGANIZATION_ID },
        areaServed: { "@type": "Country", name: "Iran" },
        url: pageUrl,
        description: page.meta.description,
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <IndustryPageAnalytics serviceType={page.serviceType} slug={page.slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Navbar ctaHref="#consult-form" ctaLabel={page.hero.primaryCtaLabel} />

      <IndustryStickyCta label={page.hero.primaryCtaLabel} />

      <main className="pb-20 sm:pb-0">
        <IndustryHero page={page} />

        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <SectionHeader
              badge="مسئله واقعی"
              title={page.problem.title}
              subtitle="مشکل معمولاً کمبود رتبه نیست؛ مشکل در مسیر اقدام بعد از ورود کاربر است."
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-navy-100 bg-slate-50/60 p-5">
                <p className="text-sm font-extrabold text-navy-900">چه اتفاقی می‌افتد؟</p>
                <p className="mt-2 text-[13px] leading-relaxed text-navy-600">{page.problem.description}</p>
              </div>
              <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
                <p className="text-sm font-extrabold text-navy-900">چرا روی فروش اثر دارد؟</p>
                <p className="mt-2 text-[13px] leading-relaxed text-navy-600">{page.problem.impact}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-py bg-slate-50/70">
          <div className="container-mx container-px">
            <SectionHeader
              badge="اشتباهات رایج"
              title="۶ اشتباه که تماس و نوبت را کم می‌کند"
              subtitle="اگر این موارد را دارید، ورودی گوگل به فروش تبدیل نمی‌شود."
            />

            <div className="mt-8 grid gap-3 md:grid-cols-2">
              {page.commonMistakes.map((m) => (
                <div key={m} className="rounded-2xl border border-navy-100 bg-white p-4">
                  <p className="text-[13px] font-bold leading-relaxed text-navy-700">{m}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <SectionHeader
              badge="خروجی همکاری"
              title="آنچه آرایه می‌سازد یا اصلاح می‌کند"
              subtitle="تمرکز روی تماس، نوبت و فروش — نه فقط بازدید."
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
                <p className="text-sm font-extrabold text-navy-900">چه چیزهایی را درست می‌کنیم؟</p>
                <ul className="mt-3 space-y-2 text-[13px] text-navy-600">
                  {page.whatAraayeBuildsFixes.map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                        <IconCheck size={12} strokeWidth={3} />
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-navy-100 bg-slate-50/60 p-5">
                <p className="text-sm font-extrabold text-navy-900">چه چیزی تحویل می‌گیرید؟</p>
                <ul className="mt-3 space-y-2 text-[13px] text-navy-600">
                  {page.whatYouReceive.map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                        <IconCheck size={12} strokeWidth={3} />
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section-py bg-slate-50/70">
          <div className="container-mx container-px">
            <SectionHeader
              badge="برنامه اجرا"
              title="برنامه ۳۰ روزه، مرحله به مرحله"
              subtitle="هدف: مسیر فروش قابل اجرا، نه تولید انبوه صفحات بی‌کیفیت."
            />

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {page.mvpPlanWeeks.map((w) => (
                <div key={w.label} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
                  <p className="text-sm font-extrabold text-navy-900">{w.label}</p>
                  <ul className="mt-3 space-y-2 text-[13px] text-navy-600">
                    {w.items.map((it) => (
                      <li key={it} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                          <IconCheck size={12} strokeWidth={3} />
                        </span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <SectionHeader
              badge="نیازهای صنعت شما"
              title="صفحه‌ها و قابلیت‌هایی که باید داشته باشید"
              subtitle="این لیست کمک می‌کند سایت از حالت ویترین خارج شود."
            />

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-navy-100 bg-slate-50/60 p-5">
                <p className="text-sm font-extrabold text-navy-900">چه می‌خواهیم بسازیم؟</p>
                <ul className="mt-3 space-y-2 text-[13px] text-navy-600">
                  {page.requiredPagesAndFeatures.map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                        <IconCheck size={12} strokeWidth={3} />
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
                <p className="text-sm font-extrabold text-navy-900">چه کسانی مناسب این مسیر هستند؟</p>
                <p className="mt-2 text-[13px] leading-relaxed text-navy-600">
                  برای کسب‌وکارهایی که می‌خواهند از گوگل تماس و نوبت بگیرند، نه فقط بازدید.
                </p>
                <div className="mt-4 grid gap-4">
                  <div className="rounded-2xl border border-navy-100 bg-slate-50/40 p-4">
                    <p className="text-xs font-extrabold text-navy-900">برای شماست اگر:</p>
                    <ul className="mt-2 space-y-2 text-[13px] text-navy-600">
                      {page.whoFor.map((t) => (
                        <li key={t} className="flex items-start gap-2">
                          <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                            <IconCheck size={12} strokeWidth={3} />
                          </span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-navy-100 bg-slate-50/40 p-4">
                    <p className="text-xs font-extrabold text-navy-900">برای شما نیست اگر:</p>
                    <ul className="mt-2 space-y-2 text-[13px] text-navy-600">
                      {page.notFor.map((t) => (
                        <li key={t} className="flex items-start gap-2">
                          <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                            <IconCheck size={12} strokeWidth={3} />
                          </span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="section-py scroll-mt-24 bg-slate-50/70">
          <div className="container-mx container-px">
            <SectionHeader
              badge="سوالات پرتکرار"
              title="قبل از شروع همکاری"
              subtitle="پاسخ‌های عملی، بدون وعده‌های غیرواقعی."
            />

            <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3">
              {page.faqs.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-navy-100 bg-white shadow-soft transition-colors open:border-sky-200"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-navy-800 [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="text-lg text-navy-300 transition-transform group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="px-5 pb-5 text-[13px] leading-relaxed text-navy-500">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
              <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-50 to-white p-6 sm:p-8">
                <SectionHeader
                  badge="شروع همکاری"
                  title={page.ctaBlock.title}
                  subtitle={page.ctaBlock.lead}
                  className="mb-6"
                />
                <ul className="space-y-2 text-[13px] text-navy-600">
                  {page.whatYouReceive.slice(0, 4).map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                        <IconCheck size={12} strokeWidth={3} />
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-navy-400">
                  تبلیغاتی یا اسپم نمی‌فرستیم؛ فقط برای هماهنگی مشاوره و پیش‌فاکتور تماس می‌گیریم.
                </p>
              </div>

              <IndustryConsultForm
                serviceType={page.serviceType}
                slug={page.slug}
                submitLabel={page.ctaBlock.submitLabel}
              />
            </div>
          </div>
        </section>

        <IndustryRelatedLinks serviceType={page.serviceType} slug={page.slug} />
      </main>

      <Footer />
    </>
  );
}

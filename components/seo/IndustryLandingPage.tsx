import type { IndustryLandingPageContent } from "@/lib/seo/pageContent";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/home/SectionHeader";
import IndustryStickyCta from "./IndustryStickyCta";
import IndustryAuditForm from "./IndustryAuditForm";
import { IconCheck, DynamicIcon } from "@/components/icons";

export default function IndustryLandingPage({ page }: { page: IndustryLandingPageContent }) {
  const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com").replace(/\/$/, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "آرایه",
        url: SITE_URL,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "آرایه", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: page.serviceType === "seo" ? "سئو" : "طراحی سایت",
            item: page.serviceType === "seo" ? `${SITE_URL}/seo` : `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: page.persianIndustryName,
            item: `${SITE_URL}${page.meta.canonicalPath}`,
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
        provider: { "@type": "Organization", name: "آرایه", url: SITE_URL },
        areaServed: { "@type": "Country", name: "Iran" },
        url: `${SITE_URL}${page.meta.canonicalPath}`,
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Navbar
        tone="dark-hero"
        ctaHref="#lead-form"
        ctaLabel={page.hero.primaryCtaLabel}
      />

      <IndustryStickyCta />

      <main className="pb-20 sm:pb-0">
        {/* HERO */}
        <section className="relative overflow-hidden bg-navy-900 pt-28 text-white">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-brand-200/25 blur-3xl" />
            <div className="absolute top-20 left-1/4 h-80 w-80 rounded-full bg-violet-200/15 blur-3xl" />
            <div className="absolute inset-0 -z-10 grid-pattern opacity-30" />
          </div>

          <div className="container-mx container-px pb-14 sm:pb-20">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div className="text-right">
                <span className="badge mb-4 bg-brand-50 text-brand-700">
                  <DynamicIcon name="searchCheck" size={13} className="text-brand-500" />
                  {page.serviceType === "seo" ? "سیستم سرچ تا لید" : "سیستم جذب مشتری"}
                </span>

                <h1 className="text-3xl font-extrabold leading-[1.3] tracking-tight text-white sm:text-4xl lg:text-[2.55rem]">
                  {page.hero.h1}
                </h1>

                <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                  {page.hero.lead}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a href="#lead-form" className="btn-primary">
                    {page.hero.primaryCtaLabel}
                  </a>
                  <a href="/demo" className="btn-secondary">
                    {page.hero.secondaryCtaLabel}
                  </a>
                </div>

                <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-extrabold text-white">
                    چه خروجی‌ای می‌گیری؟
                  </p>
                  <ul className="mt-3 space-y-2 text-[13px] text-white/70">
                    {page.whatYouReceive.slice(0, 3).map((t) => (
                      <li key={t} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/15 text-teal-200">
                          <IconCheck size={12} strokeWidth={3} />
                        </span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* RIGHT — context card */}
              <div className="relative">
                <div className="absolute -top-6 -left-6 hidden h-20 w-20 rounded-2xl bg-white/10 blur-[1px] sm:block" />
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <SectionHeader
                    badge={page.persianIndustryName}
                    badgeClassName="bg-white/10 text-white/80"
                    title={page.serviceType === "seo" ? "مسیر از جستجو تا تماس" : "طراحی مسیر تصمیم"}
                    subtitle={
                      page.serviceType === "seo"
                        ? "روی تبدیل تمرکز می‌کنیم: صفحه درست، CTA درست، و لید قابل پیگیری."
                        : "سایت باید کاربر را به اقدام برساند: فرم/تماس در جای درست و تجربه موبایل سریع."
                    }
                    dark
                    className="mb-0 text-right"
                  />

                  <div className="mt-2">
                    <div className="flex flex-col gap-2">
                      <div className="card !rounded-xl !p-4 border-white/10 bg-white/0">
                        <p className="text-xs font-extrabold text-white/80">
                          مشکل رایج
                        </p>
                        <p className="mt-2 text-[13px] leading-relaxed text-white/70">
                          {page.problem.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-extrabold text-white/80">برای شروع همین MVP کافیه</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-white/70">
                      همین حالا آدرس سایتت رو بده؛ بررسی می‌کنیم کجا مسیر کاربر به اقدام تبدیل نمی‌شود.
                    </p>
                    <a href="#lead-form" className="mt-4 inline-flex w-full justify-center btn-primary">
                      {page.hero.primaryCtaLabel}
                    </a>
                    <a href="/demo" className="mt-2 inline-flex w-full justify-center btn-secondary">
                      {page.hero.secondaryCtaLabel}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <SectionHeader badge="مسئله واقعی" title={page.problem.title} subtitle="مشکل معمولاً «کمبود رتبه» نیست؛ مشکل در مسیر اقدام بعد از ورود است." />

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="card !bg-navy-50/40">
                <p className="text-sm font-extrabold text-navy-900">چی اتفاق می‌افتد؟</p>
                <p className="mt-2 text-[13px] leading-relaxed text-navy-600">{page.problem.description}</p>
              </div>
              <div className="card">
                <p className="text-sm font-extrabold text-navy-900">چرا روی تبدیل اثر دارد؟</p>
                <p className="mt-2 text-[13px] leading-relaxed text-navy-600">{page.problem.impact}</p>
              </div>
            </div>
          </div>
        </section>

        {/* COMMON MISTAKES */}
        <section className="section-py bg-navy-50/20">
          <div className="container-mx container-px">
            <SectionHeader badge="اشتباهات رایج" title="۶ اشتباه که لید را کم می‌کند" subtitle="چک کنید شما هم در این دام‌ها گیر افتاده‌اید یا نه." />

            <div className="mt-8 grid gap-3 md:grid-cols-2">
              {page.commonMistakes.map((m) => (
                <div key={m} className="card !p-4">
                  <p className="text-[13px] leading-relaxed text-navy-700 font-bold">{m}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT WE BUILD / FIX */}
        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <SectionHeader badge="آرایه چه می‌سازد/اصلاح می‌کند" title="خروجی‌های عملی، نه صرفاً محتوا" subtitle="در هر صنعت، یک نقشه مشخص برای تبدیل آماده می‌شود." />

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="card">
                <p className="text-sm font-extrabold text-navy-900">چه چیزهایی را درست می‌کنیم؟</p>
                <ul className="mt-3 space-y-2 text-[13px] text-navy-600">
                  {page.whatAraayeBuildsFixes.map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                        <IconCheck size={12} strokeWidth={3} />
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card !bg-navy-50/40">
                <p className="text-sm font-extrabold text-navy-900">چه چیزی تحویل می‌گیری؟</p>
                <ul className="mt-3 space-y-2 text-[13px] text-navy-600">
                  {page.whatYouReceive.map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700">
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

        {/* 30-DAY PLAN */}
        <section className="section-py bg-navy-50/20">
          <div className="container-mx container-px">
            <SectionHeader badge="پلن MVP" title="برنامه ۳۰ روزه، مرحله به مرحله" subtitle="هدف: ساخت مسیر تبدیل قابل اجرا، نه تولید انبوه صفحات بی‌کیفیت." />

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {page.mvpPlanWeeks.map((w) => (
                <div key={w.label} className="card">
                  <p className="text-sm font-extrabold text-navy-900">{w.label}</p>
                  <ul className="mt-3 space-y-2 text-[13px] text-navy-600">
                    {w.items.map((it) => (
                      <li key={it} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700">
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

        {/* REQUIRED PAGES / FEATURES */}
        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <SectionHeader badge="نیازهای صنعت شما" title="صفحه‌ها و قابلیت‌هایی که باید داشته باشید" subtitle="این لیست به شما کمک می‌کند سایت از حالت ویترین خارج شود." />

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="card !bg-navy-50/40">
                <p className="text-sm font-extrabold text-navy-900">چه می‌خواهیم بسازیم؟</p>
                <ul className="mt-3 space-y-2 text-[13px] text-navy-600">
                  {page.requiredPagesAndFeatures.map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                        <IconCheck size={12} strokeWidth={3} />
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <p className="text-sm font-extrabold text-navy-900">چه کسانی مناسب این مسیر هستند؟</p>
                <p className="mt-2 text-[13px] leading-relaxed text-navy-600">
                  این MVP برای کسب‌وکارهایی طراحی می‌شود که می‌خواهند «لید» بسازند، نه فقط بازدید.
                </p>
                <div className="mt-4 grid gap-4">
                  <div className="rounded-2xl border border-navy-100 bg-white p-4">
                    <p className="text-xs font-extrabold text-navy-900">برای شماست اگر:</p>
                    <ul className="mt-2 space-y-2 text-[13px] text-navy-600">
                      {page.whoFor.map((t) => (
                        <li key={t} className="flex items-start gap-2">
                          <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                            <IconCheck size={12} strokeWidth={3} />
                          </span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-navy-100 bg-white p-4">
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

        {/* FAQ */}
        <section id="faq" className="section-py bg-navy-50/20 scroll-mt-24">
          <div className="container-mx container-px">
            <SectionHeader badge="سوالات پرتکرار" title="قبل از شروع همکاری" subtitle="پاسخ‌های عملی، بدون وعده‌های غیرواقعی." />

            <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3">
              {page.faqs.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-navy-100 bg-white shadow-soft transition-colors open:border-teal-200"
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

        {/* CTA BLOCK */}
        <section className="section-py bg-white">
          <div className="container-mx container-px">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
              <div className="rounded-3xl border border-navy-100 bg-navy-50/40 p-6 sm:p-8">
                <SectionHeader
                  badge={page.serviceType === "seo" ? "بررسی رایگان سئو" : "بررسی رایگان سایت"}
                  title="شفافیت از روز اول"
                  subtitle={page.ctaBlock.lead}
                  className="mb-6"
                />
                <div className="space-y-3">
                  <p className="text-[13px] leading-relaxed text-navy-600">
                      {page.ctaBlock.title}
                  </p>
                  <ul className="space-y-2 text-[13px] text-navy-600">
                    {page.whatYouReceive.slice(0, 4).map((t) => (
                      <li key={t} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                          <IconCheck size={12} strokeWidth={3} />
                        </span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-navy-400">تبلیغاتی یا اسپم نمی‌فرستیم؛ فقط برای هماهنگی بررسی.</p>
                </div>
              </div>

              <div>
                <div className="text-right mb-4">
                  <h2 className="text-2xl font-extrabold text-navy-900 sm:text-3xl">
                    {page.ctaBlock.title}
                  </h2>
                </div>
                <IndustryAuditForm serviceType={page.serviceType} slug={page.slug} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}


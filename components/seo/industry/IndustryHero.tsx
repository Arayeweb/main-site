import Link from "next/link";
import type { IndustryLandingPageContent } from "@/lib/seo/pageContent";
import IndustryConsultForm from "@/components/seo/IndustryConsultForm";

const PRICE_TEASER: Record<IndustryLandingPageContent["serviceType"], { text: string; href: string }> = {
  seo: { text: "پکیج سئو از ۸.۹ میلیون تومان در ماه", href: "/seo#packages" },
  website: { text: "مقایسه قیمت طراحی سایت", href: "/website-design/cost" },
};

export default function IndustryHero({ page }: { page: IndustryLandingPageContent }) {
  const hubPath = page.serviceType === "seo" ? "/seo" : "/website-design";
  const hubName = page.serviceType === "seo" ? "خدمات سئو سایت" : "طراحی سایت حرفه‌ای";
  const badge =
    page.serviceType === "seo"
      ? `سئو تخصصی برای ${page.persianIndustryName}`
      : `طراحی سایت برای ${page.persianIndustryName}`;
  const price = PRICE_TEASER[page.serviceType];
  const secondaryCtaHref = page.serviceType === "website" ? "/website-design/cost" : price.href;
  const primaryCtaHref = page.hero.primaryCtaHref ?? "#consult-form";

  return (
    <section className="relative overflow-hidden border-b border-navy-100/80 bg-gradient-to-b from-sky-50/80 via-white to-white pb-12 pt-28 sm:pb-16 sm:pt-32">
      <div className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-20 h-64 w-64 rounded-full bg-cyan-200/25 blur-3xl" />

      <div className="container-mx container-px relative">
        <nav aria-label="مسیر صفحه" className="mb-5 text-xs text-navy-400">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-navy-600">
                آرایه
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={hubPath} className="hover:text-navy-600">
                {hubName}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-navy-600">{page.persianIndustryName}</li>
          </ol>
        </nav>

        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="text-right">
            <span className="badge mb-5 bg-sky-50 text-sky-700 ring-1 ring-sky-100">{badge}</span>

            <h1 className="text-balance text-3xl font-extrabold leading-[1.35] text-navy-900 sm:text-4xl lg:text-[2.65rem]">
              {page.hero.h1}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-500 sm:text-lg">{page.hero.lead}</p>

            <p className="mt-5 text-lg font-extrabold text-sky-700 sm:text-xl">
              <Link href={price.href} className="hover:underline">
                {price.text}
              </Link>
              <span className="mx-2 font-normal text-navy-300">·</span>
              <span className="text-[15px] font-bold text-navy-500">مشاوره قبل از شروع همکاری</span>
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={primaryCtaHref}
                className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98]"
              >
                {page.hero.primaryCtaLabel}
              </a>
              <a
                href={secondaryCtaHref}
                className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-6 py-3 text-sm font-bold text-navy-700 transition-all hover:bg-navy-50 active:scale-[0.98]"
              >
                {page.hero.secondaryCtaLabel}
              </a>
            </div>

            <ul className="mt-8 grid gap-2 sm:grid-cols-3">
              {page.whatYouReceive.slice(0, 3).map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-navy-100 bg-white/80 px-3.5 py-2.5 text-[12px] font-medium leading-relaxed text-navy-600 shadow-soft"
                >
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-6 text-[12px] leading-relaxed text-navy-400">
              شرکت هوش آرایه پارس — مستقر در پارک علم و فناوری دانشگاه تهران
            </p>
          </div>

          <div className="rounded-3xl border border-navy-100 bg-white p-5 shadow-soft sm:p-6">
            <IndustryConsultForm serviceType={page.serviceType} slug={page.slug} variant="hero" />
          </div>
        </div>
      </div>
    </section>
  );
}

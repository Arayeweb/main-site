"use client";

import { pushGtmEvent } from "@/lib/gtm";
import { LEAD_FORM_ID, PORTFOLIO_SECTION_ID, trustItems } from "@/data/website-design";

function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none" aria-hidden="true">
      <div className="relative rounded-2xl border border-navy-100 bg-white p-3 shadow-card sm:p-4">
        <div className="flex items-center gap-1.5 border-b border-navy-50 pb-2.5">
          <span className="h-2 w-2 rounded-full bg-red-300" />
          <span className="h-2 w-2 rounded-full bg-amber-300" />
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          <span className="ms-auto truncate text-[10px] text-navy-400">business-site.ir</span>
        </div>
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="h-2.5 w-24 rounded bg-navy-900" />
            <div className="rounded-lg bg-brand-600 px-3 py-1 text-[9px] font-bold text-white">
              درخواست مشاوره
            </div>
          </div>
          <div className="rounded-xl bg-navy-50 p-4">
            <div className="mx-auto max-w-[85%] space-y-2 text-center">
              <div className="mx-auto h-2 w-3/4 rounded bg-navy-200" />
              <div className="mx-auto h-2 w-1/2 rounded bg-navy-100" />
              <div className="mx-auto mt-3 h-7 w-28 rounded-lg bg-navy-900" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["خدمات", "درباره", "تماس"].map((label) => (
              <div
                key={label}
                className="rounded-lg border border-navy-50 bg-navy-50/60 px-2 py-3 text-center text-[9px] font-medium text-navy-500"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -bottom-4 -start-3 w-[38%] max-w-[140px] rounded-2xl border border-navy-100 bg-white p-2 shadow-lg sm:-bottom-6 sm:-start-5 sm:max-w-[155px] sm:p-2.5">
        <div className="mb-2 flex items-center justify-center">
          <div className="h-1 w-8 rounded-full bg-navy-100" />
        </div>
        <div className="space-y-1.5">
          <div className="h-8 rounded-lg bg-brand-50" />
          <div className="h-2 w-3/4 rounded bg-navy-100" />
          <div className="h-2 w-1/2 rounded bg-navy-50" />
          <div className="mt-2 h-6 rounded-md bg-navy-900" />
        </div>
      </div>
    </div>
  );
}

function trackCta(event: string, location: string) {
  pushGtmEvent(event, {
    page: "/website-design",
    location,
    timestamp: Date.now(),
  });
}

export default function WebsiteDesignHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-navy-50/40 pb-12 pt-12 sm:pb-16 sm:pt-16">
      <div className="container-mx container-px">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="text-center lg:text-start">
            <span className="badge mb-4 bg-brand-50 text-brand-600">طراحی سایت آرایه</span>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-navy-900 sm:text-4xl lg:text-[2.65rem]">
              سایتی که فقط زیبا نیست؛ برای جذب مشتری ساخته شده است
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-navy-500 sm:text-base lg:mx-0">
              طراحی و توسعه سایت‌های حرفه‌ای، سریع و قابل‌اندازه‌گیری برای کسب‌وکارهایی که
              می‌خواهند از وب‌سایت خود مشتری، اعتبار و رشد واقعی بگیرند.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <a
                href={`#${LEAD_FORM_ID}`}
                onClick={() => trackCta("cta_click", "hero_primary")}
                className="btn-primary"
              >
                ثبت درخواست طراحی سایت
              </a>
              <a
                href={`#${PORTFOLIO_SECTION_ID}`}
                onClick={() => {
                  trackCta("website_design_portfolio_click", "hero_secondary");
                }}
                className="btn-secondary"
              >
                مشاهده نمونه‌کارها
              </a>
            </div>

            <ul className="mt-6 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              {trustItems.map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center rounded-full border border-navy-100 bg-white px-3 py-1 text-[11px] font-bold text-navy-600"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <HeroMockup />
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import SectionHeader from "@/components/home/SectionHeader";
import { pushGtmEvent } from "@/lib/gtm";
import { LEAD_FORM_ID, pricingFactors, technologies } from "@/data/website-design";

function trackSeoClick() {
  pushGtmEvent("website_design_seo_click", {
    page: "/website-design",
    timestamp: Date.now(),
  });
}

export function WebsiteDesignSeoBlock() {
  return (
    <section className="section-py bg-white">
      <div className="container-mx container-px">
        <SectionHeader
          badge="آماده رشد"
          title="سایتی که برای سئو هم زیرساخت مناسبی دارد"
          subtitle="در طراحی سایت، ساختار صفحات، سرعت، نسخه موبایل، متادیتا، لینک‌سازی داخلی و اصول فنی پایه از ابتدا در نظر گرفته می‌شوند."
        />

        <div className="mx-auto max-w-2xl text-center">
          <Link
            href="/seo"
            onClick={trackSeoClick}
            className="inline-flex items-center text-sm font-bold text-brand-600 transition-colors hover:text-brand-700"
          >
            مشاهده راهکار SEO آرایه
            <span aria-hidden="true" className="ms-1.5">
              ←
            </span>
          </Link>
          <p className="mt-6 text-sm leading-relaxed text-navy-500">
            سئو پایه و زیرساخت فنی بخشی از پروژه طراحی سایت است؛ اجرای مستمر سئو، محتوا و رشد
            رتبه‌ها در راهکار مستقل SEO آرایه ارائه می‌شود.
          </p>
        </div>
      </div>
    </section>
  );
}

export function WebsiteDesignTechnology() {
  return (
    <section className="section-py bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="فناوری متناسب با پروژه"
          title="هر سایت را با ابزار مناسب خودش می‌سازیم"
          subtitle="بسته به نیاز پروژه، سرعت تحویل، مدیریت محتوا، امکانات آینده و بودجه، معماری مناسب انتخاب می‌شود."
        />

        <div className="mx-auto max-w-3xl">
          <ul className="divide-y divide-navy-100 rounded-2xl border border-navy-100 bg-white">
            {technologies.map((tech) => (
              <li key={tech} className="px-5 py-4 text-sm font-bold text-navy-800 sm:px-6 sm:text-[15px]">
                {tech}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-sm leading-relaxed text-navy-500">
            انتخاب فناوری پس از بررسی نیاز واقعی پروژه انجام می‌شود، نه صرفاً بر اساس ترند بازار.
          </p>
        </div>
      </div>
    </section>
  );
}

export function WebsiteDesignPricing() {
  return (
    <section className="section-py bg-white">
      <div className="container-mx container-px">
        <SectionHeader
          badge="هزینه پروژه"
          title="قیمت طراحی سایت بر چه اساسی مشخص می‌شود؟"
        />

        <ul className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
          {pricingFactors.map((factor) => (
            <li
              key={factor}
              className="rounded-xl border border-navy-100 bg-navy-50/30 px-4 py-3.5 text-sm font-bold text-navy-800"
            >
              {factor}
            </li>
          ))}
        </ul>

        <div className="mt-8 text-center">
          <a href={`#${LEAD_FORM_ID}`} className="btn-primary">
            دریافت پیشنهاد قیمت
          </a>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-navy-500">
            پس از بررسی نیاز پروژه، محدوده کار، زمان اجرا و هزینه به‌صورت شفاف اعلام می‌شود.
          </p>
        </div>
      </div>
    </section>
  );
}

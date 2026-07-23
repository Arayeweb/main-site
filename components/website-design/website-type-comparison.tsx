"use client";

import Link from "next/link";
import SectionHeader from "@/components/home/SectionHeader";
import { pushGtmEvent } from "@/lib/gtm";
import { LEAD_FORM_ID, websiteTypes } from "@/data/website-design";
import {
  FASTWEB_START_PRICE_TOMAN,
  WEBSITE_PRICING_UPDATED_AT,
  formatWebsiteDesignPrice,
  websiteDesignPricingPlans,
} from "@/lib/websitePricing";

function trackLink(event: string) {
  if (typeof window === "undefined") return;
  pushGtmEvent(event, {
    page: "/website-design",
    timestamp: Date.now(),
  });
}

export function WebsiteDesignTypes() {
  return (
    <section className="section-py bg-white">
      <div className="container-mx container-px">
        <SectionHeader badge="مدل‌های اجرا" title="چه نوع سایتی طراحی می‌کنیم؟" />

        <div className="grid gap-4 sm:grid-cols-2">
          {websiteTypes.map((type) => (
            <article
              key={type.title}
              className="flex flex-col rounded-2xl border border-navy-100 bg-white p-5 shadow-soft sm:p-6"
            >
              <h3 className="text-base font-extrabold text-navy-900">{type.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-500">
                {type.description}
              </p>
              {"link" in type && type.link ? (
                <Link
                  href={type.link.href}
                  onClick={() =>
                    trackLink(
                      type.link!.href === "/adready"
                        ? "website_design_adready_click"
                        : "cta_click",
                    )
                  }
                  className="mt-4 inline-flex w-fit text-sm font-bold text-brand-600 transition-colors hover:text-brand-700"
                >
                  {type.link.label}
                  <span aria-hidden="true" className="ms-1.5">
                    ←
                  </span>
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function WebsiteTypeComparison() {
  const customFrom = formatWebsiteDesignPrice(websiteDesignPricingPlans[0].priceFrom);
  const fastFrom = formatWebsiteDesignPrice(FASTWEB_START_PRICE_TOMAN);

  return (
    <section className="section-py bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="انتخاب مسیر درست"
          title="کدام محصول آرایه مناسب شماست؟"
        />
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-navy-500">
          تعرفه از {fastFrom} تومان (سایت فوری) تا شروع از {customFrom} تومان (اختصاصی) — به‌روز{" "}
          {WEBSITE_PRICING_UPDATED_AT}
        </p>

        <div className="mx-auto mt-8 grid max-w-5xl gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft">
            <h3 className="text-lg font-extrabold text-navy-900">سایت فوری</h3>
            <p className="mt-1 text-xs font-bold text-navy-400">
              شروع از {fastFrom} تومان · سایت رسمی دائمی
            </p>
            <ul className="mt-4 space-y-2">
              {[
                "معرفی یک‌صفحه‌ای کسب‌وکار",
                "نسخه اول قابل انتشار در ۲۴ ساعت کاری",
                "بازبینی قبل از انتشار",
                "پیش‌نمایش قبل از پرداخت",
                "میزبانی یک‌ساله",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-navy-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/fastweb"
              onClick={() => trackLink("website_design_fastweb_click")}
              className="btn-secondary mt-6 w-full"
            >
              مشاهده سایت فوری
            </Link>
          </article>

          <article className="relative rounded-2xl border border-[#3157F6] bg-white p-6 shadow-soft ring-2 ring-[#3157F6]/15">
            <span className="absolute -top-3 right-4 inline-flex rounded-full bg-[#3157F6] px-3 py-1 text-[11px] font-extrabold text-white">
              اگر رشد و برند مهم است
            </span>
            <h3 className="text-lg font-extrabold text-navy-900">طراحی اختصاصی</h3>
            <p className="mt-1 text-xs font-bold text-navy-400">
              شروع از {customFrom} تومان · برند و امکانات سفارشی
            </p>
            <ul className="mt-4 space-y-2">
              {[
                "معرفی کامل برند",
                "چند خدمت یا محصول",
                "فروشگاه و امکانات سفارشی",
                "سئو بلندمدت",
                "اعتبار و اعتماد",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-navy-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <a href={`#${LEAD_FORM_ID}`} className="btn-primary mt-6 w-full">
              دریافت برآورد رایگان
            </a>
          </article>

          <article className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft">
            <h3 className="text-lg font-extrabold text-navy-900">AdReady</h3>
            <p className="mt-1 text-xs font-bold text-navy-400">صفحه موقت برای کمپین تبلیغاتی</p>
            <ul className="mt-4 space-y-2">
              {[
                "اجرای سریع کمپین",
                "یک پیشنهاد مشخص",
                "دریافت فوری درخواست",
                "تبلیغات کلیکی",
                "تست بازار",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-navy-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/adready"
              onClick={() => trackLink("website_design_adready_click")}
              className="btn-secondary mt-6 w-full"
            >
              مشاهده AdReady
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}

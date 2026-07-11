"use client";

import { useState } from "react";
import Link from "next/link";
import { pushGtmEvent } from "@/lib/gtm";
import DeepinHomePreview from "@/components/home/previews/DeepinHomePreview";
import MedisaHomePreview from "@/components/home/previews/MedisaHomePreview";
import ShivaClinicHomePreview from "@/components/home/previews/ShivaClinicHomePreview";
import KavehIronHomePreview from "@/components/home/previews/KavehIronHomePreview";

const ACCENT = "#3157F6";

const SITE_TYPES = [
  {
    id: "corporate",
    title: "سایت خدماتی و شرکتی",
    summary: "برای معرفی کسب‌وکار، خدمات، اعتبار و دریافت تماس مشتری.",
    goal: "معرفی کسب‌وکار و دریافت درخواست مشاوره",
    sections: "خدمات، درباره، اعتماد، تماس",
    action: "ثبت درخواست یا تماس با تیم فروش",
    Preview: DeepinHomePreview,
  },
  {
    id: "medical",
    title: "سایت پزشک و کلینیک",
    summary: "برای معرفی پزشک و خدمات، پاسخ به سؤالات بیماران و هدایت به نوبت‌دهی.",
    goal: "معرفی تخصص و دریافت نوبت",
    sections: "خدمات، درباره پزشک، سؤالات، تماس",
    action: "ورود به سامانه نوبت‌دهی",
    Preview: ShivaClinicHomePreview,
  },
  {
    id: "portfolio",
    title: "سایت نمونه‌کار و پروژه",
    summary: "برای معماران، استودیوها و متخصصانی که کیفیت کارشان باید دیده شود.",
    goal: "نمایش کیفیت کار و دریافت درخواست پروژه",
    sections: "پروژه‌ها، خدمات، رویکرد، شروع همکاری",
    action: "ثبت درخواست همکاری یا ارسال اطلاعات پروژه",
    Preview: MedisaHomePreview,
  },
  {
    id: "shop",
    title: "فروشگاه آنلاین",
    summary: "برای معرفی محصول، دسته‌بندی، ثبت سفارش و پرداخت اینترنتی.",
    goal: "معرفی محصول و ثبت سفارش",
    sections: "محصولات، دسته‌بندی، استعلام قیمت، تماس",
    action: "ثبت سفارش یا استعلام قیمت",
    Preview: KavehIronHomePreview,
  },
] as const;

type SiteTypeId = (typeof SITE_TYPES)[number]["id"];

function track(event: string, extra: Record<string, string | undefined> = {}) {
  pushGtmEvent(event, {
    page: "/website-design",
    timestamp: Date.now(),
    ...extra,
  });
}

export default function WebsiteDesignTypes() {
  const [activeId, setActiveId] = useState<SiteTypeId>("corporate");
  const active = SITE_TYPES.find((t) => t.id === activeId) ?? SITE_TYPES[0];
  const ActivePreview = active.Preview;

  return (
    <section className="bg-navy-50/40 py-16 sm:py-20 lg:py-24">
      <div className="container-mx container-px">
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="inline-flex items-center rounded-full px-3.5 py-1 text-xs font-bold"
            style={{ backgroundColor: "#EEF2FF", color: ACCENT }}
          >
            متناسب با کسب‌وکار شما
          </span>
          <h2 className="mt-4 text-2xl font-extrabold leading-snug tracking-tight text-navy-900 sm:text-3xl">
            چه نوع سایتی برای شما مناسب است؟
          </h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-[1100px] gap-8 lg:mt-12 lg:grid-cols-[minmax(240px,300px)_1fr] lg:gap-10">
          <div
            role="tablist"
            aria-label="انواع سایت"
            className="flex flex-col gap-1 border-s-2 border-[#E8EDFF] ps-0 lg:gap-0"
          >
            {SITE_TYPES.map((type) => {
              const selected = type.id === activeId;
              return (
                <button
                  key={type.id}
                  type="button"
                  role="tab"
                  id={`wd-type-tab-${type.id}`}
                  aria-selected={selected}
                  aria-controls={`wd-type-panel-${type.id}`}
                  onClick={() => setActiveId(type.id)}
                  className="group relative w-full border-b border-[#E8EDFF] py-4 text-right transition-colors last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157F6] focus-visible:ring-offset-2 lg:py-5 lg:ps-5"
                >
                  <span
                    className="absolute inset-y-3 -start-[2px] w-[3px] rounded-full transition-opacity lg:inset-y-4"
                    style={{
                      backgroundColor: ACCENT,
                      opacity: selected ? 1 : 0,
                    }}
                    aria-hidden="true"
                  />
                  <span
                    className="block text-[15px] font-extrabold leading-snug transition-colors sm:text-base"
                    style={{ color: selected ? ACCENT : "#102a43" }}
                  >
                    {type.title}
                  </span>
                  <span
                    className={`mt-1.5 block text-[13px] leading-relaxed transition-colors ${
                      selected ? "text-navy-600" : "text-navy-400"
                    }`}
                  >
                    {type.summary}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id={`wd-type-panel-${active.id}`}
            aria-labelledby={`wd-type-tab-${active.id}`}
          >
            <div className="overflow-hidden rounded-[12px] border border-navy-100/90 bg-white shadow-soft">
              <div className="max-h-[420px] overflow-hidden [&>div]:!rounded-none [&>div]:!border-0 [&>div]:!shadow-none">
                <ActivePreview />
              </div>

              <dl className="grid gap-4 border-t border-navy-100 px-4 py-5 sm:grid-cols-3 sm:gap-5 sm:px-6 sm:py-6">
                <div>
                  <dt className="text-[11px] font-bold text-navy-400">هدف سایت</dt>
                  <dd className="mt-1.5 text-[13px] font-semibold leading-relaxed text-navy-800 sm:text-sm">
                    {active.goal}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold text-navy-400">بخش‌های اصلی</dt>
                  <dd className="mt-1.5 text-[13px] font-semibold leading-relaxed text-navy-800 sm:text-sm">
                    {active.sections}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold text-navy-400">اقدام مشتری</dt>
                  <dd className="mt-1.5 text-[13px] font-semibold leading-relaxed text-navy-800 sm:text-sm">
                    {active.action}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-[1100px] flex-col items-center justify-between gap-3 rounded-xl border border-[#E8EDFF] bg-white px-5 py-4 text-center sm:flex-row sm:text-right">
          <p className="text-sm font-semibold text-navy-700">
            فقط یک صفحه برای تبلیغات می‌خواهید؟
          </p>
          <Link
            href="/adready"
            onClick={() => track("website_design_adready_click", { location: "types_bar" })}
            className="inline-flex shrink-0 items-center text-sm font-bold transition-colors hover:opacity-80"
            style={{ color: ACCENT }}
          >
            مشاهده AdReady
            <span aria-hidden="true" className="ms-1.5">
              ←
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

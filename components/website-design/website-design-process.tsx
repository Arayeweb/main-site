"use client";

import { useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { openSiteChat } from "@/lib/openSiteChat";
import { processSteps } from "@/data/website-design";

const ACCENT = "#3157F6";

type StepId = (typeof processSteps)[number]["id"];

export default function WebsiteDesignProcess() {
  const [activeId, setActiveId] = useState<StepId>("discovery");
  const active = processSteps.find((step) => step.id === activeId) ?? processSteps[0];
  const activeIndex = processSteps.findIndex((step) => step.id === activeId);

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="container-mx container-px">
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="inline-flex items-center rounded-full px-3.5 py-1 text-xs font-bold"
            style={{ backgroundColor: "#EEF2FF", color: ACCENT }}
          >
            فرآیند همکاری
          </span>
          <h2 className="mt-4 text-2xl font-extrabold leading-snug tracking-tight text-navy-900 sm:text-3xl">
            از اولین گفت‌وگو تا سایت منتشرشده
          </h2>
          <p className="mt-4 text-[15px] leading-[1.85] text-navy-500 sm:text-base">
            هر مرحله خروجی مشخصی دارد؛ می‌دانید پروژه کجاست، چه چیزی آماده شده و قدم
            بعدی چیست.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-[1000px] lg:mt-12">
          <div
            role="tablist"
            aria-label="مراحل فرآیند طراحی سایت"
            className="relative flex flex-col gap-0 sm:flex-row sm:items-start sm:justify-between sm:gap-2"
          >
            <div
              className="absolute hidden h-0.5 bg-navy-100 sm:block"
              style={{
                top: "1.125rem",
                insetInlineStart: "2.5rem",
                insetInlineEnd: "2.5rem",
              }}
              aria-hidden="true"
            />

            {processSteps.map((step, index) => {
              const selected = step.id === activeId;
              return (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  id={`wd-process-tab-${step.id}`}
                  aria-selected={selected}
                  aria-controls="wd-process-panel"
                  onClick={() => setActiveId(step.id)}
                  className="relative flex flex-1 items-center gap-3 border-b border-navy-100 py-3 text-right transition-colors last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157F6] focus-visible:ring-offset-2 sm:flex-col sm:items-center sm:border-b-0 sm:px-1 sm:py-0 sm:text-center"
                >
                  <span
                    className="relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold tabular-nums transition-colors"
                    style={
                      selected
                        ? { backgroundColor: ACCENT, color: "#fff" }
                        : { backgroundColor: "#EEF2FF", color: "#94a3b8" }
                    }
                  >
                    {index + 1}
                  </span>
                  <span
                    className="min-w-0 text-sm font-bold transition-colors sm:mt-2 sm:text-[13px]"
                    style={{ color: selected ? ACCENT : "#94a3b8" }}
                  >
                    {step.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id="wd-process-panel"
            aria-labelledby={`wd-process-tab-${active.id}`}
            className="mt-8 rounded-2xl border border-[#E8EDFF] bg-navy-50/30 p-6 sm:p-8"
          >
            <p className="text-[11px] font-bold tabular-nums text-navy-400">
              مرحله {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(processSteps.length).padStart(2, "0")}
            </p>
            <h3 className="mt-2 text-xl font-extrabold text-navy-900 sm:text-[1.35rem]">
              {active.title}
            </h3>
            <p className="mt-3 max-w-2xl text-[15px] leading-[1.85] text-navy-600">
              {active.description}
            </p>
            <div className="mt-5 border-t border-[#E8EDFF] pt-5">
              <p className="text-[11px] font-bold text-navy-400">خروجی</p>
              <p className="mt-1.5 text-sm font-semibold leading-relaxed text-navy-800 sm:text-[15px]">
                {active.deliverable}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-2 text-center text-[13px] leading-relaxed text-navy-500">
            <p>
              زمان اجرای پروژه پس از دریافت کامل اطلاعات و محتوای موردنیاز محاسبه
              می‌شود.
            </p>
            <p>
              تعداد اصلاحات، زمان تحویل و مدت پشتیبانی پیش از شروع در قرارداد مشخص
              می‌شود.
            </p>
          </div>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => {
                pushGtmEvent("cta_click", {
                  location: "website_design_process",
                  page: "/website-design",
                });
                openSiteChat("website_design_process");
              }}
              className="inline-flex h-14 items-center justify-center rounded-xl px-7 text-sm font-bold text-white transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157F6] focus-visible:ring-offset-2"
              style={{ backgroundColor: ACCENT }}
            >
              گفت‌وگو درباره سایت
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

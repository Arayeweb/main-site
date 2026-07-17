"use client";

import { useState } from "react";
import SectionHeader from "@/components/home/SectionHeader";
import {
  DOCTORS_PRODUCT_PRICE_TOMAN,
  formatToman,
} from "@/lib/doctorsData";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";

const toLatinDigits = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[^\d]/g, "");

export default function DoctorsRoiCalculator() {
  const [raw, setRaw] = useState("");
  const value = Number(toLatinDigits(raw));
  const hasValue = Number.isFinite(value) && value > 0;
  const visitsNeeded = hasValue ? Math.ceil(DOCTORS_PRODUCT_PRICE_TOMAN / value) : null;

  return (
    <section id="roi" className="section-py scroll-mt-24 bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="بازگشت سرمایه"
          badgeClassName="bg-cyan-50 text-cyan-800"
          title="سایت با چند مراجعه جدید هزینه‌اش را جبران می‌کند؟"
          subtitle="محاسبه فقط با عدد خودتان — بدون مثال از پیش‌فرض."
        />

        <div className="mx-auto max-w-xl rounded-3xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8">
          <label htmlFor="roi-revenue" className="mb-2 block text-sm font-bold text-navy-800">
            میانگین درآمد مطب از هر مراجعه یا خدمت (تومان)
          </label>
          <input
            id="roi-revenue"
            type="text"
            inputMode="numeric"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="مبلغ را وارد کنید"
            className="w-full rounded-xl border border-navy-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
          />

          {visitsNeeded != null ? (
            <div className="mt-5 rounded-2xl bg-cyan-50 px-4 py-4" role="status">
              <p className="text-sm font-bold text-navy-700">
                {formatToman(DOCTORS_PRODUCT_PRICE_TOMAN)} ÷ {formatToman(value)} =
              </p>
              <p className="mt-1 text-2xl font-extrabold text-cyan-800">
                حدود {formatToman(visitsNeeded)} مراجعه
              </p>
              <p className="mt-3 text-[12px] leading-relaxed text-navy-500">
                این محاسبه تضمین جذب بیمار نیست؛ فقط نسبت هزینه سایت به ارزش مراجعه را نشان می‌دهد.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-[13px] text-navy-400">
              با وارد کردن مبلغ، تعداد مراجعه موردنیاز برای جبران هزینه سایت محاسبه می‌شود.
            </p>
          )}

          <a
            href="#quote-form"
            onClick={() => trackDoctorsEvent("doctors_hero_cta_click", { source: "roi_calculator" })}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-cyan-700 px-6 py-3.5 text-sm font-extrabold text-white hover:bg-cyan-800"
          >
            برای تخصص من بررسی کنید
          </a>
        </div>
      </div>
    </section>
  );
}

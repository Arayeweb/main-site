"use client";

import { useEffect, useRef } from "react";
import SectionHeader from "@/components/home/SectionHeader";
import {
  DOCTORS_PRODUCT_PRICE_TOMAN,
  doctorDeliveryTimeline,
  doctorPaymentMilestones,
  formatToman,
} from "@/lib/doctorsData";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";

export default function DoctorsPricing() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || viewedRef.current) return;
        viewedRef.current = true;
        trackDoctorsEvent("doctors_pricing_view", { source: "pricing_section" });
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="pricing" className="section-py scroll-mt-24 bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="قیمت"
          badgeClassName="bg-cyan-50 text-cyan-800"
          title="قیمت شفاف، بدون هزینه‌های مبهم"
          subtitle="ادامه پرداخت بعد از دیدن و تأیید نسخه اولیه انجام می‌شود."
        />

        <div className="mx-auto max-w-xl rounded-3xl border border-navy-100 bg-white p-8 text-center shadow-soft">
          <p className="text-sm font-medium text-navy-500">طراحی سایت مطب تک‌پزشک</p>
          <p className="mt-2 text-4xl font-extrabold text-cyan-700">
            {formatToman(DOCTORS_PRODUCT_PRICE_TOMAN)}
            <span className="mr-1 text-base font-medium text-navy-400">تومان</span>
          </p>

          <ol className="relative mt-10 space-y-0 text-right">
            {doctorPaymentMilestones.map((item, index) => (
              <li key={item.label} className="relative flex gap-4 pb-8 last:pb-0">
                {index < doctorPaymentMilestones.length - 1 ? (
                  <span
                    className="absolute right-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-cyan-100"
                    aria-hidden
                  />
                ) : null}
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-700 text-[11px] font-extrabold text-white">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-extrabold text-navy-900">{item.label}</span>
                    <span className="text-sm font-extrabold text-cyan-700">{item.percent}</span>
                  </div>
                  <p className="mt-1 text-[12px] text-navy-500">{item.note}</p>
                </div>
              </li>
            ))}
          </ol>

          <ul className="mt-6 space-y-2 border-t border-navy-50 pt-6 text-right text-[13px] text-navy-500">
            {doctorDeliveryTimeline.map((item) => (
              <li key={item.label}>
                <span className="font-bold text-navy-700">{item.label}:</span> {item.value}
              </li>
            ))}
          </ul>

          <a
            href="#quote-form"
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-cyan-700 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-cyan-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 active:scale-[0.98]"
          >
            دریافت نمونه و قیمت
          </a>
        </div>
      </div>
    </section>
  );
}

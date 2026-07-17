"use client";

import { useEffect, useRef } from "react";
import SectionHeader from "@/components/home/SectionHeader";
import { IconCheck } from "@/components/icons";
import {
  DOCTORS_DEPOSIT_TOMAN,
  doctorPaymentMilestones,
  doctorRiskGuarantees,
  formatToman,
} from "@/lib/doctorsData";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";

export default function DoctorsRiskReduction() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || viewedRef.current) return;
        viewedRef.current = true;
        trackDoctorsEvent("doctors_pricing_view", { source: "risk_reduction" });
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="pricing" className="section-py scroll-mt-24">
      <div className="container-mx container-px">
        <SectionHeader
          badge="کاهش ریسک"
          badgeClassName="bg-cyan-50 text-cyan-800"
          title="اول نسخه را ببینید، بعد پرداخت دوم را انجام دهید"
          subtitle={`شروع فقط با ${formatToman(DOCTORS_DEPOSIT_TOMAN)} تومان — ادامه بعد از تأیید نسخه اولیه.`}
        />

        <div className="mx-auto max-w-3xl">
          <ol className="space-y-0">
            {doctorPaymentMilestones.map((item, index) => (
              <li key={item.label} className="relative flex gap-4 pb-8 last:pb-0">
                {index < doctorPaymentMilestones.length - 1 ? (
                  <span className="absolute right-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-cyan-100" aria-hidden />
                ) : null}
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-700 text-[11px] font-extrabold text-white">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1 rounded-2xl border border-navy-100 bg-white px-4 py-4 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-extrabold text-navy-900">{item.label}</span>
                    <span className="text-sm font-extrabold text-cyan-800">
                      {item.percent} · {item.amountLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-navy-500">{item.note}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {doctorRiskGuarantees.map((g) => (
              <div
                key={g}
                className="flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-[13px] font-bold text-emerald-900"
              >
                <IconCheck size={16} className="mt-0.5 shrink-0 text-emerald-700" />
                <span>{g}</span>
              </div>
            ))}
          </div>

          <a
            href="#quote-form"
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-cyan-700 px-6 py-3.5 text-sm font-extrabold text-white hover:bg-cyan-800"
          >
            شروع پروژه با ۶ میلیون
          </a>
        </div>
      </div>
    </section>
  );
}

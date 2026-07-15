"use client";

import { useEffect, useState } from "react";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";
import { DOCTORS_SLA } from "@/lib/doctorsData";
import { scrollToDoctorsAuditForm } from "@/lib/doctorsScroll";

export default function DoctorsStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white/95 p-3 shadow-2xl backdrop-blur sm:hidden">
      <div className="flex items-center gap-3">
        <div className="flex-1 text-right">
          <div className="text-[13px] font-extrabold text-navy-900">گزارش رایگان مطبم را بگیرم</div>
          <div className="text-[10px] leading-snug text-navy-400">{DOCTORS_SLA}</div>
        </div>
        <button
          type="button"
          onClick={() => {
            trackDoctorsEvent("doctors_final_cta_click", { source: "sticky_mobile" });
            scrollToDoctorsAuditForm();
          }}
          className="shrink-0 rounded-xl bg-sky-600 px-5 py-2.5 text-[13px] font-bold text-white transition-all active:scale-[0.98]"
        >
          دریافت گزارش
        </button>
      </div>
    </div>
  );
}

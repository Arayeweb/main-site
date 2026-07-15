"use client";

import { scrollToDoctorsAuditForm } from "@/lib/doctorsScroll";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";

export default function DoctorsFinalCta() {
  const handleClick = () => {
    trackDoctorsEvent("doctors_final_cta_click", { source: "final_section" });
    scrollToDoctorsAuditForm();
  };

  return (
    <section id="final-cta" className="pb-20 sm:pb-28">
      <div className="container-mx container-px">
        <div className="mx-auto max-w-xl rounded-3xl border border-sky-200 bg-gradient-to-b from-sky-50 to-white p-8 text-center shadow-soft sm:p-10">
          <h2 className="text-xl font-extrabold text-navy-900 sm:text-2xl">
            مسیر جذب بیمار مطب‌تان را بررسی کنیم
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-navy-500">
            نام مطب و شماره واتساپ را وارد کنید تا مشکل اصلی و سه اقدام اولویت‌دار را دریافت
            کنید.
          </p>

          <button
            type="button"
            onClick={handleClick}
            className="mt-6 w-full rounded-xl bg-sky-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98] sm:w-auto sm:min-w-[240px]"
          >
            گزارش رایگان مطبم را بگیرم
          </button>
        </div>
      </div>
    </section>
  );
}

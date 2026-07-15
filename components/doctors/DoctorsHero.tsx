"use client";

import DoctorsAuditForm from "@/components/doctors/DoctorsAuditForm";
import { DOCTORS_SLA, doctorPatientPathBar } from "@/lib/doctorsData";

export default function DoctorsHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/80 via-white to-white pb-10 pt-10 sm:pb-14 sm:pt-14">
      <div className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-20 h-64 w-64 rounded-full bg-cyan-200/25 blur-3xl" />

      <div className="container-mx container-px relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge mb-5 bg-sky-50 text-sky-700 ring-1 ring-sky-100">
            ویژه پزشکان، مطب‌ها و کلینیک‌ها
          </span>

          <h1 className="text-balance text-3xl font-extrabold leading-[1.35] text-navy-900 sm:text-4xl lg:text-[2.75rem]">
            مسیر آنلاین مطب‌تان کجا بیمار را از دست می‌دهد؟
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-navy-500 sm:text-lg">
            نام پزشک یا کلینیک را وارد کنید. وضعیت دیده‌شدن، اطلاعات مطب، معرفی خدمات و مسیر
            تماس یا نوبت را بررسی می‌کنیم و ۳ اقدام اولویت‌دار را در واتساپ می‌فرستیم.
          </p>
        </div>

        <div id="audit" className="mx-auto mt-10 max-w-md scroll-mt-24">
          <DoctorsAuditForm source="doctors_hero_audit" />
        </div>

        <div className="mx-auto mt-8 max-w-2xl">
          <div className="rounded-2xl border border-navy-100 bg-white px-4 py-3 text-center shadow-soft sm:px-6">
            <div className="flex flex-wrap items-center justify-center gap-2 text-[13px] font-bold text-navy-700">
              {doctorPatientPathBar.steps.map((step, i) => (
                <span key={step} className="inline-flex items-center gap-2">
                  {i > 0 ? (
                    <span className="text-navy-300" aria-hidden>
                      ←
                    </span>
                  ) : null}
                  {step}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-navy-500">{doctorPatientPathBar.note}</p>
          </div>
          <p className="mt-3 text-center text-[11px] text-navy-400">{DOCTORS_SLA}</p>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { doctorCases } from "@/lib/doctorsData";
import SectionHeader from "@/components/home/SectionHeader";
import { IconArrowLeft } from "@/components/icons";
import { pushGtmEvent } from "@/lib/gtm";

export default function DoctorsCases() {
  return (
    <section id="cases" className="section-py bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="نمونه‌کار واقعی"
          badgeClassName="bg-sky-50 text-sky-700"
          title="پزشکانی که با آرایه بیمارآور شدند"
          subtitle="از سایت تخصصی و نوبت‌دهی آنلاین تا جذب بیمار از گوگل — نتایج واقعی همکاران شما."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {doctorCases.map((c) => (
            <article
              key={c.title}
              className="flex flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
            >
              <span className="mb-3 inline-flex w-fit rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold text-sky-700">
                {c.tag}
              </span>
              <h3 className="text-sm font-bold text-navy-900">{c.title}</h3>

              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 rounded-xl bg-red-50/70 px-3 py-3 text-center">
                  <div className="text-[11px] text-navy-400">{c.beforeLabel}</div>
                  <div className="mt-1 text-xl font-extrabold text-red-500">{c.before}</div>
                </div>
                <span className="text-lg text-navy-300" aria-hidden>
                  ←
                </span>
                <div className="flex-1 rounded-xl bg-sky-50/80 px-3 py-3 text-center">
                  <div className="text-[11px] text-navy-400">{c.afterLabel}</div>
                  <div className="mt-1 text-xl font-extrabold text-sky-600">{c.after}</div>
                </div>
              </div>

              <p className="flex-1 text-[13px] leading-relaxed text-navy-500">{c.result}</p>
              <div className="mt-4 border-t border-navy-100 pt-3 text-xs font-bold text-sky-600">
                {c.time}
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-sky-200 bg-gradient-to-b from-sky-50 to-white p-6 text-center shadow-soft sm:p-8">
          <h3 className="text-base font-extrabold text-navy-900 sm:text-lg">
            ببینید سایت واقعی مطب چطور به نظر می‌رسد
          </h3>
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-navy-500">
            تخصص مطب‌تان را انتخاب کنید و در چند ثانیه یک نمونه‌سایت کامل — دقیقاً مثل چیزی که
            برای شما می‌سازیم — را ببینید.
          </p>
          <Link
            href="/demo"
            onClick={() => pushGtmEvent("demo_click", { location: "doctors_cases", page: "doctors" })}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-sky-300 bg-white px-6 py-3 text-sm font-bold text-sky-700 transition-all hover:border-sky-400 hover:bg-sky-50 active:scale-[0.98]"
          >
            مشاهده نمونه سایت مطب
            <IconArrowLeft size={15} />
          </Link>
        </div>

        <figure className="mx-auto mt-10 max-w-2xl rounded-3xl border border-navy-100 border-r-4 border-r-sky-500 bg-white p-7 shadow-soft sm:p-8">
          <blockquote className="text-sm leading-loose text-navy-700 sm:text-[15px]">
            «قبلاً بخش زیادی از هماهنگی نوبت‌ها به‌صورت دستی انجام می‌شد. بعد از راه‌اندازی سایت،
            بیماران در هر ساعتی می‌توانند خدمات را ببینند و برای نوبت اقدام کنند. برای من مهم بود
            که سایت هم تخصص و سابقه علمی‌ام را درست نشان بدهد و هم کارکردن با آن ساده باشد؛
            خوشبختانه در تمام مراحل، مسائل فنی را خود تیم مدیریت کرد.»
          </blockquote>
          <figcaption className="mt-4">
            <strong className="block text-sm font-extrabold text-navy-900">
              دکتر عالیه پوردست
            </strong>
            <span className="text-xs text-navy-400">فوق تخصص بیماری‌های عفونی و گرمسیری</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

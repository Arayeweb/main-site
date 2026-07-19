"use client";

import { pushGtmEvent } from "@/lib/gtm";

export default function GooglesabtHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-blue-50/40 pb-10 pt-12 sm:pb-14 sm:pt-16">
      <div className="container-mx container-px text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-[#4285F4]">
          ثبت گوگل مپ + لینک همه‌کاره
        </span>
        <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight text-navy-900 sm:text-4xl lg:text-[2.75rem]">
          ثبت کسب‌وکار در{" "}
          <span className="text-[#4285F4]">گوگل مپ</span>
          {" "}از ۵۹۰ هزار تومان
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-navy-500 sm:text-base">
          ثبت در گوگل، نشان، بلد و اسنپ — تا مشتری‌های نزدیک{" "}
          <strong className="font-bold text-navy-700">تو را پیدا کنند، نه رقیبت را.</strong>{" "}
          از پکیج محبوب، لینک BizCard با همه مسیریاب‌ها روی یک آدرس تحویل می‌گیرید.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[12px] text-navy-500">
          {["تحویل کمتر از ۱ روز", "پرداخت آنلاین امن", "لینک همه‌کاره از پکیج محبوب"].map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full border border-navy-100 bg-white px-3 py-1 font-bold"
            >
              ✓ {t}
            </span>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#packages"
            onClick={() => pushGtmEvent("cta_click", { location: "googlesabt_hero_packages", page: "googlesabt" })}
            className="rounded-xl bg-[#4285F4] px-7 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-[#1b6ef3] active:scale-[0.98]"
          >
            مشاهده پکیج‌ها و قیمت
          </a>
          <a
            href="/bizcard"
            className="rounded-xl border border-navy-200 bg-white px-7 py-3.5 text-sm font-bold text-navy-700 transition hover:border-blue-200 hover:text-[#4285F4]"
          >
            کارت ویزیت رایگان
          </a>
        </div>
      </div>
    </section>
  );
}

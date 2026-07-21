"use client";

import { pushGtmEvent } from "@/lib/gtm";
import GooglesabtHeroMockup from "./GooglesabtHeroMockup";

export default function GooglesabtHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-blue-50/40 pb-12 pt-12 sm:pb-16 sm:pt-20">
      <div className="container-mx container-px">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-14">
          {/* Copy */}
          <div className="max-w-2xl text-center lg:text-right">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-[#4285F4]">
              <span aria-hidden="true">✨</span>
              مناسب فروشگاه‌ها، مطب‌ها، شرکت‌ها و سایر کسب‌وکارهای ایرانی
            </span>

            <h1 className="text-3xl font-extrabold leading-tight text-navy-900 sm:text-4xl lg:text-[2.75rem]">
              در گوگل دیده شوید، قبل از اینکه مشتری سراغ رقیبتان برود.
            </h1>

            <p className="mt-5 text-[15px] leading-relaxed text-navy-500 sm:text-base">
              اگر اطلاعات کسب‌وکارتان در گوگل نمایش داده نمی‌شود یا ناقص است، مشتریان ممکن است به سراغ رقیب شما بروند.
              ما حضور کسب‌وکارتان را در گوگل راه‌اندازی می‌کنیم تا مشتریان راحت‌تر شما را پیدا کنند و با شما ارتباط بگیرند.
            </p>

            {/* Trust bar */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[13px] font-bold text-navy-600 lg:justify-start">
              {[
                "مناسب کسب‌وکارهای ایرانی",
                "پشتیبانی تا پایان فرایند",
                "بدون نیاز به دانش فنی",
              ].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <span className="text-[#34A853]">✓</span>
                  {t}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <a
                href="#packages"
                onClick={() =>
                  pushGtmEvent("cta_click", { location: "googlesabt_hero_start", page: "googlesabt" })
                }
                className="rounded-xl bg-[#4285F4] px-8 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-[#1b6ef3] active:scale-[0.98]"
              >
                شروع درخواست
              </a>
            </div>
            <p className="mt-3 text-xs font-bold text-navy-400">
              ثبت درخواست کمتر از ۲ دقیقه زمان می‌برد.
            </p>
          </div>

          {/* Visual result */}
          <div className="w-full max-w-md lg:max-w-lg">
            <GooglesabtHeroMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

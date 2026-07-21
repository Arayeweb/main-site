"use client";

import { pushGtmEvent } from "@/lib/gtm";

const TRUST = [
  "🔒 پرداخت امن بانکی",
  "💬 پشتیبانی تا پایان راه‌اندازی",
  "⭐ صدها کسب‌وکار به آرایه اعتماد کرده‌اند",
] as const;

export default function GooglesabtFinalCta() {
  return (
    <section
      className="relative overflow-hidden py-24 sm:py-32"
      aria-labelledby="googlesabt-final-cta-heading"
      style={{
        background:
          "linear-gradient(165deg, #0b1220 0%, #152238 42%, #1a2f4d 72%, #0f1a2e 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(66,133,244,0.28), transparent 60%)",
        }}
      />

      <div className="container-mx container-px relative text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold text-blue-200 backdrop-blur-sm">
          <span aria-hidden>✨</span>
          آماده شروع هستید؟
        </span>

        <h2
          id="googlesabt-final-cta-heading"
          className="mx-auto mt-7 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]"
        >
          همین امروز حضور آنلاین کسب‌وکارتان را آغاز کنید.
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-white/60 sm:text-base">
          ثبت سفارش کمتر از دو دقیقه زمان می‌برد و بلافاصله پس از پرداخت، فرایند راه‌اندازی آغاز خواهد شد.
        </p>

        <ul className="mx-auto mt-10 flex max-w-3xl flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
          {TRUST.map((item) => (
            <li key={item} className="text-[13px] font-bold text-white/75 sm:text-[14px]">
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
          <a
            href="#packages"
            onClick={() =>
              pushGtmEvent("cta_click", { location: "googlesabt_final_order", page: "googlesabt" })
            }
            className="inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-[#4285F4] px-10 py-4 text-base font-bold text-white shadow-[0_12px_40px_rgba(66,133,244,0.35)] transition hover:bg-[#1b6ef3] hover:shadow-[0_16px_48px_rgba(66,133,244,0.45)] active:scale-[0.98]"
          >
            ثبت سفارش
          </a>
          <a
            href="#packages"
            onClick={() =>
              pushGtmEvent("cta_click", { location: "googlesabt_final_packages", page: "googlesabt" })
            }
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-bold text-white/70 underline-offset-4 transition hover:text-white hover:underline"
          >
            مشاهده پکیج‌ها
          </a>
        </div>

        <p className="mt-8 text-[12px] font-medium text-white/40">
          هیچ هزینه پنهانی وجود ندارد.
        </p>
      </div>
    </section>
  );
}

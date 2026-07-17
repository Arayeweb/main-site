"use client";

import {
  DOCTORS_DEPOSIT_TOMAN,
  DOCTORS_PRODUCT_PRICE_TOMAN,
  formatToman,
} from "@/lib/doctorsData";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";

type DoctorsHeroProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  /** @deprecated استفاده از eyebrow؛ برای سازگاری با صفحات تخصص نگه داشته شده */
  badge?: string;
};

export default function DoctorsHero({
  eyebrow,
  badge,
  title = "بیمار در گوگل دنبال خدمات شماست؛ سایت باید او را به نوبت برساند",
  subtitle = `سایت اختصاصی مطب با نمایش تخصص، اعتبار و مسیر تماس یا نوبت. نسخه اولیه در ۲ روز کاری — قیمت ثابت ${formatToman(DOCTORS_PRODUCT_PRICE_TOMAN)} تومان، شروع با ${formatToman(DOCTORS_DEPOSIT_TOMAN)} تومان.`,
}: DoctorsHeroProps) {
  const productLine = eyebrow ?? badge ?? "طراحی سایت پزشکی";

  return (
    <section className="relative overflow-hidden bg-[#f7faf9] pt-28 pb-14 sm:pt-32 sm:pb-16 lg:pt-36 lg:pb-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 45% at 50% -10%, rgba(13,92,82,0.08), transparent)",
        }}
      />

      <div className="container-mx container-px relative">
        <div className="mx-auto flex max-w-[920px] flex-col items-center text-center">
          <p className="text-sm font-bold tracking-wide text-teal-700">شرکت آرایه</p>
          <p className="mt-2 text-[13px] font-medium text-navy-500">{productLine}</p>

          <h1 className="mt-5 max-w-[920px] text-balance text-[1.85rem] font-extrabold leading-[1.3] tracking-tight text-navy-900 sm:text-5xl lg:text-[3rem]">
            {title}
          </h1>

          <p className="mt-6 max-w-[720px] text-base leading-relaxed text-navy-500 sm:text-lg">
            {subtitle}
          </p>

          <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:w-auto sm:flex-row sm:justify-center">
            <a
              href="#quote-form"
              onClick={() => trackDoctorsEvent("doctors_hero_cta_click", { source: "hero_primary" })}
              className="inline-flex h-14 items-center justify-center rounded-xl bg-navy-900 px-7 text-sm font-extrabold text-white transition hover:bg-navy-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 active:scale-[0.98]"
            >
              شروع پروژه با {formatToman(DOCTORS_DEPOSIT_TOMAN)} تومان
            </a>
            <a
              href="#samples"
              onClick={() => trackDoctorsEvent("doctors_demo_click", { source: "hero_secondary" })}
              className="inline-flex h-14 items-center justify-center rounded-xl border border-navy-200 bg-white px-7 text-sm font-bold text-navy-800 transition hover:border-navy-300 hover:bg-navy-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-400 active:scale-[0.98]"
            >
              نمونه تخصصم را ببینم
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

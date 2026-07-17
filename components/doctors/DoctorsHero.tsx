"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import PourdastClinicHomePreview from "@/components/home/previews/PourdastClinicHomePreview";
import { BrowserChrome, PhoneFrame } from "@/components/showcase/ShowcaseFrames";
import {
  DOCTORS_DEPOSIT_TOMAN,
  DOCTORS_PRODUCT_PRICE_TOMAN,
  doctorCaseStudy,
  doctorHeroTrustChips,
  formatToman,
} from "@/lib/doctorsData";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";

function HeroMockups() {
  const c = doctorCaseStudy;
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-700 ring-1 ring-emerald-100">
          پروژه واقعی و قابل مشاهده
        </span>
        {c.siteUrl ? (
          <a
            href={c.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackDoctorsEvent("doctors_live_sample_click", { source: "hero_mockup" })}
            className="text-[12px] font-extrabold text-cyan-800 underline-offset-2 hover:underline"
          >
            مشاهده سایت زنده ←
          </a>
        ) : null}
      </div>

      <BrowserChrome url="aliehpourdast.com">
        {c.desktopImage ? (
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={c.desktopImage}
              alt={`نمای دسکتاپ سایت ${c.title}`}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 520px"
              priority
            />
          </div>
        ) : (
          <PourdastClinicHomePreview />
        )}
      </BrowserChrome>

      {c.mobileImage ? (
        <div className="absolute -bottom-6 left-2 w-[112px] sm:left-4 sm:w-[140px]">
          <PhoneFrame>
            <div className="relative aspect-[9/19] overflow-hidden">
              <Image
                src={c.mobileImage}
                alt={`نمای موبایل سایت ${c.title}`}
                fill
                className="object-cover object-top"
                sizes="140px"
              />
            </div>
          </PhoneFrame>
        </div>
      ) : null}

      <p className="mt-8 text-center text-xs font-medium text-navy-400 sm:mt-10">
        {c.title} — {c.specialty}
      </p>
    </div>
  );
}

type DoctorsHeroProps = {
  badge?: string;
  title?: string;
  subtitle?: string;
  mockup?: ReactNode;
};

export default function DoctorsHero({
  badge = "طراحی سایت پزشکی برای جذب بیمار و نوبت",
  title = "بیمار در گوگل دنبال خدمات شماست؛ سایت شما باید او را به درخواست نوبت برساند",
  subtitle = `یک سایت پزشکی اختصاصی می‌سازیم که تخصص، اعتبار و خدمات شما را حرفه‌ای نمایش دهد و بیمار را از جستجوی گوگل به تماس، واتساپ یا درخواست نوبت هدایت کند. نسخه اولیه در ۲ روز کاری؛ قیمت ثابت ${formatToman(DOCTORS_PRODUCT_PRICE_TOMAN)} تومان.`,
  mockup,
}: DoctorsHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-navy-100/80 bg-gradient-to-b from-amber-50/80 via-white to-cyan-50/40 pb-14 pt-8 sm:pb-20 sm:pt-12">
      <div className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-20 h-64 w-64 rounded-full bg-amber-200/25 blur-3xl" />

      <div className="container-mx container-px relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
          <div className="text-right">
            <span className="badge mb-5 bg-cyan-50 text-cyan-900 ring-1 ring-cyan-100">{badge}</span>

            <h1 className="text-balance text-3xl font-extrabold leading-[1.35] text-navy-900 sm:text-4xl lg:text-[2.55rem]">
              {title}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-600 sm:text-lg">{subtitle}</p>

            <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50/80 px-5 py-4">
              <p className="text-lg font-extrabold text-cyan-900 sm:text-xl">
                شروع پروژه فقط با {formatToman(DOCTORS_DEPOSIT_TOMAN)} تومان
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-cyan-900/80">
                ۳۰٪ شروع، ۴۰٪ بعد از دیدن و تأیید نسخه اولیه، ۳۰٪ هنگام تحویل.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#quote-form"
                onClick={() => trackDoctorsEvent("doctors_hero_cta_click", { source: "hero_primary" })}
                className="inline-flex items-center justify-center rounded-xl bg-cyan-700 px-6 py-3.5 text-sm font-extrabold text-white shadow-soft transition-all hover:bg-cyan-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 active:scale-[0.98]"
              >
                شروع پروژه با ۶ میلیون
              </a>
              <a
                href="#samples"
                onClick={() => trackDoctorsEvent("doctors_demo_click", { source: "hero_secondary" })}
                className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-6 py-3.5 text-sm font-bold text-navy-800 transition-all hover:bg-navy-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-400 active:scale-[0.98]"
              >
                اول نمونه تخصصم را ببینم
              </a>
            </div>

            <ul className="mt-5 flex flex-wrap gap-2">
              {doctorHeroTrustChips.map((chip) => (
                <li
                  key={chip}
                  className="rounded-lg bg-white/90 px-3 py-1.5 text-[11px] font-bold text-navy-700 ring-1 ring-navy-100"
                >
                  {chip}
                </li>
              ))}
            </ul>
          </div>

          <div className="pb-8 lg:ps-2 lg:pb-4">{mockup ?? <HeroMockups />}</div>
        </div>
      </div>
    </section>
  );
}

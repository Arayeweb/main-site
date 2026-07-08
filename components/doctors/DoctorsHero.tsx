"use client";

import Link from "next/link";
import { useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import { doctorStats } from "@/lib/doctorsData";
import { IconCheck, IconArrowLeft } from "@/components/icons";
import DoctorsHeroVideo from "@/components/doctors/DoctorsHeroVideo";

const isValidIranianMobile = (value: string): boolean => {
  const digits = value.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)).replace(/\D/g, "");
  return /^09\d{9}$/.test(digits);
};

const trustPills = [
  "تحویل اولین نسخه در ۲ روز",
  "دامنه، سرور و درگاه پرداخت با ما",
  "ضمانت بازگشت وجه ۷ روزه",
];

export default function DoctorsHero() {
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!isValidIranianMobile(phone)) {
      setError("شماره موبایل را درست وارد کنید.");
      return;
    }
    if (!consent) {
      setError("برای تماس، لطفاً رضایت خود را تأیید کنید.");
      return;
    }

    setLoading(true);
    try {
      const digits = phone.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)).replace(/\D/g, "");
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "doctors_hero",
          page: "/doctors",
          contact: digits,
          goal: "doctor_site",
          plan: "consultation",
          channel: "doctors_landing",
          consent: true,
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          company: "",
          ...getUtmParams(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(
          data.error === "rate_limited"
            ? "درخواست‌های زیاد. چند دقیقه بعد دوباره تلاش کنید."
            : "ثبت درخواست ناموفق بود. دوباره تلاش کنید."
        );
        return;
      }
      pushGtmEvent("generate_lead", { source: "doctors_hero", goal: "doctor_site", page: "doctors" });
      setSuccess(true);
      setPhone("");
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-white pb-14 pt-5 sm:pb-20 sm:pt-6">
      <div className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-20 h-64 w-64 rounded-full bg-cyan-200/25 blur-3xl" />

      <div className="container-mx container-px relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-12 xl:grid-cols-[1fr_280px]">
          <div className="text-center lg:text-right">
        <span className="badge mb-5 bg-sky-50 text-sky-700 ring-1 ring-sky-100">
          آرایه — ویژه پزشکان و مطب‌ها
        </span>

        <h1 className="mx-auto max-w-3xl text-balance text-3xl font-extrabold leading-[1.3] text-navy-900 sm:text-4xl lg:text-5xl">
          سایت مطب که فقط معرفی نمی‌کند؛{" "}
          <em className="not-italic text-sky-600">بیمار نوبت می‌گیرد</em>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-navy-500 sm:text-lg">
          وب‌سایت تخصصی مطب با نوبت‌دهی آنلاین، چت‌بات پاسخگوی بیماران، دامنه، سرور و درگاه
          پرداخت — تحویل آماده. شما فقط محتوای مطب را می‌دهید؛ بقیه‌اش با ماست.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {trustPills.map((pill) => (
            <span
              key={pill}
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-navy-600 shadow-soft backdrop-blur"
            >
              <IconCheck size={13} className="text-sky-600" />
              {pill}
            </span>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-medium text-navy-600">
            اگر دنبال مسیر تخصصی سئو یا طراحی سایت برای پزشکان هستید:
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/seo/doctor"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-navy-200 bg-white px-4 py-2 text-sm font-bold text-navy-700 transition-colors hover:border-sky-300 hover:bg-white hover:text-sky-700"
            >
              سئو سایت پزشکان
            </a>
            <a
              href="/website/doctor"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-navy-200 bg-white px-4 py-2 text-sm font-bold text-navy-700 transition-colors hover:border-sky-300 hover:bg-white hover:text-sky-700"
            >
              طراحی سایت پزشک
            </a>
          </div>
        </div>

        {/* Lead capture — primary conversion */}
        <div className="mx-auto mt-8 w-full max-w-lg">
          {success ? (
            <div
              className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-soft"
              role="status"
              aria-live="polite"
            >
              <p className="text-sm font-bold text-sky-700">درخواست شما ثبت شد ✓</p>
              <p className="mt-1 text-sm text-navy-500">
                کارشناس آرایه در کمتر از ۲ ساعت کاری برای پیشنهاد اختصاصی مطب‌تان تماس می‌گیرد.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-2.5 text-sm font-medium text-navy-600">
                شماره‌ات را بگذار؛ پیشنهاد قیمت اختصاصی مطب‌ات را در کمتر از ۲ ساعت کاری می‌فرستیم.
              </p>
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-sky-100 bg-white p-3 shadow-card"
                noValidate
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label htmlFor="doctors-hero-phone" className="sr-only">
                    شماره موبایل
                  </label>
                  <input
                    id="doctors-hero-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    dir="ltr"
                    placeholder="09xxxxxxxxx"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full flex-1 rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-center text-sm text-navy-900 outline-none transition focus:border-sky-400 focus:bg-white sm:text-right"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98] disabled:opacity-60"
                  >
                    {loading ? "در حال ثبت..." : "قیمت مطب من را بگیر"}
                  </button>
                </div>
                <label className="mt-3 flex cursor-pointer items-start gap-2 text-right text-[11px] leading-relaxed text-navy-500">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (error) setError(null);
                    }}
                    className="mt-0.5 shrink-0 rounded border-navy-200"
                  />
                  <span>مایلم آرایه برای ارسال پیشنهاد قیمت با من تماس بگیرد.</span>
                </label>
              </form>
              {error ? (
                <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
            </>
          )}

          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="#packages"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-700 transition-colors hover:text-sky-800"
              onClick={() => pushGtmEvent("cta_click", { location: "doctors_hero_packages", page: "doctors" })}
            >
              مشاهده پکیج‌ها و قیمت‌ها
              <IconArrowLeft size={15} />
            </a>
            <span className="hidden text-navy-200 sm:inline" aria-hidden>
              |
            </span>
            <Link
              href="/demo"
              className="inline-flex items-center gap-1.5 rounded-xl border border-navy-200 bg-white px-5 py-2.5 text-sm font-bold text-navy-700 transition-colors hover:border-sky-300 hover:text-sky-700"
              onClick={() => pushGtmEvent("demo_click", { location: "doctors_hero", page: "doctors" })}
            >
              مشاهده نمونه سایت مطب
              <IconArrowLeft size={15} />
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
          {doctorStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-navy-100 bg-white/80 px-5 py-5 shadow-soft backdrop-blur"
            >
              <div className="text-2xl font-extrabold text-sky-600 sm:text-3xl">{stat.value}</div>
              <div className="mt-1.5 text-xs text-navy-500 sm:text-[13px]">{stat.label}</div>
            </div>
          ))}
        </div>
          </div>

          {/* Social proof — Higgsfield reel یا mockup نوبت‌دهی */}
          <div className="hidden shrink-0 lg:block">
            <DoctorsHeroVideo />
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-xs lg:hidden">
          <DoctorsHeroVideo compact />
        </div>
      </div>
    </section>
  );
}

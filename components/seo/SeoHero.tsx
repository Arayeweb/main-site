"use client";

import { useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import { seoStats } from "@/lib/seoData";
import { IconCheck, IconArrowLeft } from "@/components/icons";

const isValidIranianMobile = (value: string): boolean => {
  const digits = value.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)).replace(/\D/g, "");
  return /^09\d{9}$/.test(digits);
};

const trustPills = [
  "بررسی رایگان در ۲۴ ساعت",
  "تمرکز روی نقشه گوگل و «نزدیک من»",
  "پرداخت آنلاین امن",
];

export default function SeoHero() {
  const [phone, setPhone] = useState("");
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

    setLoading(true);
    try {
      const digits = phone.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)).replace(/\D/g, "");
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "seo_hero",
          page: "/seo",
          contact: digits,
          goal: "seo_audit_free",
          plan: "free_audit",
          channel: "seo_landing",
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
      pushGtmEvent("generate_lead", { source: "seo_hero", goal: "seo_audit_free", page: "seo" });
      setSuccess(true);
      setPhone("");
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-white to-white pt-28 pb-14 sm:pt-36 sm:pb-20">
      <div className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-20 h-64 w-64 rounded-full bg-cyan-200/25 blur-3xl" />

      <div className="container-mx container-px relative text-center">
        <span className="badge mb-5 bg-teal-50 text-teal-700 ring-1 ring-teal-100">
          Araaye SEO — سئوی محلی
        </span>

        <h1 className="mx-auto max-w-3xl text-balance text-3xl font-extrabold leading-[1.3] text-navy-900 sm:text-4xl lg:text-5xl">
          وقتی مشتری نزدیکت جستجو می‌کند،{" "}
          <em className="not-italic text-teal-600">اول تو را ببیند</em>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-navy-500 sm:text-lg">
          سئوی محلی برای کلینیک‌ها، رستوران‌ها و کسب‌وکارهای خدماتی: بهینه‌سازی نقشه گوگل،
          محتوای محلی و رفع مشکلات فنی سایت — با قیمت شفاف و بررسی رایگان قبل از هر تصمیمی.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {trustPills.map((pill) => (
            <span
              key={pill}
              className="inline-flex items-center gap-1.5 rounded-full border border-teal-100 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-navy-600 shadow-soft backdrop-blur"
            >
              <IconCheck size={13} className="text-teal-600" />
              {pill}
            </span>
          ))}
        </div>

        {/* Free audit form — primary conversion */}
        <div className="mx-auto mt-8 w-full max-w-lg">
          {success ? (
            <div
              className="rounded-2xl border border-teal-200 bg-teal-50 p-5 shadow-soft"
              role="status"
              aria-live="polite"
            >
              <p className="text-sm font-bold text-teal-700">
                درخواست بررسی رایگان ثبت شد ✓
              </p>
              <p className="mt-1 text-sm text-navy-500">
                گزارش سئوی سایت‌تان تا ۲۴ ساعت آینده آماده می‌شود و کارشناس ما تماس می‌گیرد.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-2.5 text-sm font-medium text-navy-600">
                شماره‌ات را بگذار؛ بررسی رایگان سئوی محلی سایتت را تا ۲۴ ساعت می‌فرستیم.
              </p>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-2 rounded-2xl border border-teal-100 bg-white p-2 shadow-card sm:flex-row sm:items-center"
                noValidate
              >
                <label htmlFor="seo-hero-phone" className="sr-only">
                  شماره موبایل
                </label>
                <input
                  id="seo-hero-phone"
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
                  className="w-full flex-1 rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-center text-sm text-navy-900 outline-none transition focus:border-teal-400 focus:bg-white sm:text-right"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? "در حال ثبت..." : "بررسی رایگان بگیر"}
                </button>
              </form>
              {error ? (
                <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
            </>
          )}

          <a
            href="#packages"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 transition-colors hover:text-teal-800"
            onClick={() => pushGtmEvent("cta_click", { location: "seo_hero_packages", page: "seo" })}
          >
            مشاهده پکیج‌ها و قیمت‌ها
            <IconArrowLeft size={15} />
          </a>
        </div>

        {/* Stats bar */}
        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
          {seoStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-navy-100 bg-white/80 px-5 py-5 shadow-soft backdrop-blur"
            >
              <div className="text-2xl font-extrabold text-teal-600 sm:text-3xl">{stat.value}</div>
              <div className="mt-1.5 text-xs text-navy-500 sm:text-[13px]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

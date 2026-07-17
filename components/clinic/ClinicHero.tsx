"use client";

import { useState } from "react";
import Link from "next/link";
import { pushGtmEvent } from "@/lib/gtm";
import ChatOpenButton from "@/components/home/ChatOpenButton";
import ShivaClinicHomePreview from "@/components/home/previews/ShivaClinicHomePreview";
import { clinicStats, clinicTrustLogos } from "@/lib/clinicData";

const isValidContact = (value: string): boolean => {
  const trimmed = value.trim();
  if (/^09\d{9}$/.test(trimmed.replace(/\D/g, ""))) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

export default function ClinicHero() {
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!isValidContact(contact)) {
      setError("ایمیل یا شماره موبایل را درست وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "clinic_hero",
          page: "/clinic",
          contact: contact.trim(),
          channel: "clinic_hero",
          goal: "consultation",
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          company: "",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(
          data.error === "rate_limited"
            ? "درخواست‌های زیاد. چند دقیقه بعد دوباره تلاش کنید."
            : "ثبت درخواست ناموفق بود. دوباره تلاش کنید.",
        );
        return;
      }
      pushGtmEvent("lead_submit", { source: "clinic_hero", page: "clinic" });
      setSuccess(true);
      setContact("");
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f7f9fc] via-white to-brand-50/20 pb-12 pt-28 sm:pb-16 sm:pt-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,108,255,0.12), transparent), radial-gradient(ellipse 40% 30% at 100% 50%, rgba(14,26,43,0.04), transparent)",
        }}
      />

      <div className="container-mx container-px relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="text-right">
            <p className="mb-3 text-sm font-bold tracking-wide text-teal-700 sm:text-base">
              شرکت آرایه
            </p>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold text-brand-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              سایت و رزرو آنلاین برای کلینیک زیبایی
            </span>
            <h1 className="max-w-xl text-3xl font-extrabold leading-tight text-navy-900 sm:text-4xl lg:text-[2.6rem]">
              کلینیک‌تان را به یک{" "}
              <span className="bg-gradient-to-l from-brand-600 to-brand-400 bg-clip-text text-transparent">
                مسیر جذب و رزرو
              </span>{" "}
              تبدیل کنید
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-navy-500 sm:text-base">
              گالری نتایج، رزرو آنلاین با بیعانه، چت‌بات دایرکت، دامنه، سرور و درگاه پرداخت —
              همه با آرایه. شما روی کلینیک تمرکز کنید.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <ChatOpenButton
                location="clinic_hero_demo"
                className="inline-flex items-center justify-center rounded-xl bg-navy-900 px-6 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-navy-800 active:scale-[0.98]"
              >
                دموی زنده رزرو و چت‌بات
              </ChatOpenButton>
              <a
                href="#leadform"
                onClick={() =>
                  pushGtmEvent("cta_click", { location: "clinic_hero_consult", page: "clinic" })
                }
                className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-6 py-3.5 text-sm font-bold text-navy-700 transition hover:border-brand-200 hover:text-brand-600"
              >
                دریافت مشاوره رایگان
              </a>
            </div>

            {success ? (
              <div
                className="mt-5 max-w-md rounded-2xl border border-green-100 bg-white p-4 shadow-soft"
                role="status"
                aria-live="polite"
              >
                <p className="text-sm font-medium text-green-700">
                  دریافت شد. کارشناسان آرایه خیلی زود با شما تماس می‌گیرند.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-5 flex max-w-md flex-col gap-2 rounded-2xl border border-navy-100 bg-white p-2 shadow-soft sm:flex-row sm:items-center"
                noValidate
                aria-label="دریافت مشاوره سریع کلینیک"
              >
                <label htmlFor="clinic-hero-contact" className="sr-only">
                  ایمیل یا شماره موبایل
                </label>
                <input
                  id="clinic-hero-contact"
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="ایمیل یا ۰۹۱۲…"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={loading}
                  className="w-full flex-1 rounded-xl bg-navy-50/50 px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-navy-200 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="shrink-0 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? "…" : "ارسال"}
                </button>
                <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              </form>
            )}
            {error ? (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-2">
              {clinicStats.map((s) => (
                <div
                  key={s.lbl}
                  className="rounded-xl border border-navy-100 bg-white/80 px-3.5 py-2.5 shadow-soft"
                >
                  <div className="text-lg font-extrabold text-brand-600">{s.num}</div>
                  <div className="mt-0.5 text-[11px] font-bold text-navy-500">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none select-none [&_a]:pointer-events-none">
              <ShivaClinicHomePreview />
            </div>
            <div className="absolute -bottom-3 start-3 rounded-xl border border-navy-100 bg-white px-3 py-2 text-[11px] font-bold text-navy-700 shadow-soft sm:start-4">
              <span className="me-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              رزرو جدید ثبت شد
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-navy-100 pt-8">
          <p className="mb-4 text-center text-xs font-bold text-navy-400">
            بخشی از کسب‌وکارهایی که به آرایه اعتماد کرده‌اند
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            {clinicTrustLogos.map((name) => (
              <span
                key={name}
                className="rounded-full border border-navy-100 bg-white px-4 py-2 text-xs font-bold text-navy-500"
              >
                {name}
              </span>
            ))}
          </div>
          <p className="mt-5 text-center text-[12px] text-navy-400">
            پزشک هستید؟{" "}
            <Link href="/doctors" className="font-bold text-brand-600 hover:underline">
              پکیج سایت مطب پزشکان ←
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import DoctorsReportPreview from "@/components/doctors/DoctorsReportPreview";

const isValidIranianMobile = (value: string): boolean => {
  const digits = value.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)).replace(/\D/g, "");
  return /^09\d{9}$/.test(digits);
};

const toLatinDigits = (value: string) =>
  value.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)).replace(/\D/g, "");

export default function DoctorsHero() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [identity, setIdentity] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const goToPhone = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (identity.trim().length < 2) {
      setError("نام پزشک، کلینیک یا آدرس اینستاگرام را وارد کنید.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (identity.trim().length < 2) {
      setError("نام پزشک، کلینیک یا آدرس اینستاگرام را وارد کنید.");
      setStep(1);
      return;
    }
    if (!isValidIranianMobile(phone)) {
      setError("شماره موبایل یا واتساپ را درست وارد کنید.");
      return;
    }
    if (!consent) {
      setError("برای ارسال گزارش، لطفاً رضایت تماس را تأیید کنید.");
      return;
    }

    setLoading(true);
    try {
      const digits = toLatinDigits(phone);
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "doctors_hero_audit",
          page: "/doctors",
          name: identity.trim(),
          contact: digits,
          goal: "clinic_audit",
          plan: "free_report",
          channel: "doctors_landing",
          detail: `clinic_identity: ${identity.trim()}`,
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
      pushGtmEvent("generate_lead", {
        source: "doctors_hero_audit",
        goal: "clinic_audit",
        page: "doctors",
      });
      router.push("/tashkor?from=doctors_audit");
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/80 via-white to-white pb-16 pt-10 sm:pb-24 sm:pt-14">
      <div className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-20 h-64 w-64 rounded-full bg-cyan-200/25 blur-3xl" />

      <div className="container-mx container-px relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge mb-5 bg-sky-50 text-sky-700 ring-1 ring-sky-100">
            ویژه پزشکان، مطب‌ها و کلینیک‌ها
          </span>

          <h1 className="text-balance text-3xl font-extrabold leading-[1.35] text-navy-900 sm:text-4xl lg:text-[2.75rem]">
            بیمارانی که در گوگل دنبال خدمات شما هستند،{" "}
            <span className="text-sky-600">راحت‌تر به درخواست نوبت برسند.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-navy-500 sm:text-lg">
            حضور مطب در گوگل، صفحه معرفی خدمات و مسیر درخواست نوبت را بررسی می‌کنیم و می‌گوییم
            برای جذب بیمار چه چیزی باید اصلاح شود.
          </p>
        </div>

        <div
          id="audit"
          className="mx-auto mt-10 grid max-w-5xl scroll-mt-24 items-start gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-12"
        >
          <div className="mx-auto w-full max-w-md lg:mx-0">
            <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-card sm:p-6">
              <h2 className="text-center text-base font-extrabold text-navy-900 sm:text-lg">
                بررسی رایگان وضعیت مطب شما
              </h2>

              {step === 1 ? (
                <form onSubmit={goToPhone} className="mt-5 space-y-3" noValidate>
                  <label htmlFor="doctors-hero-identity" className="sr-only">
                    نام پزشک، کلینیک یا آدرس اینستاگرام
                  </label>
                  <input
                    id="doctors-hero-identity"
                    type="text"
                    autoComplete="organization"
                    placeholder="نام پزشک، کلینیک یا آدرس اینستاگرام"
                    value={identity}
                    onChange={(e) => {
                      setIdentity(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3.5 text-center text-sm text-navy-900 outline-none transition focus:border-sky-400 focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-sky-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98]"
                  >
                    ادامه
                  </button>
                  <p className="text-center text-[11px] text-navy-400">مرحله ۱ از ۲</p>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="mt-5 space-y-3" noValidate>
                  <p className="rounded-xl bg-sky-50 px-3 py-2 text-center text-xs text-navy-600">
                    {identity}
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="mr-2 font-bold text-sky-700 hover:underline"
                    >
                      ویرایش
                    </button>
                  </p>
                  <label htmlFor="doctors-hero-phone" className="sr-only">
                    شماره موبایل یا واتساپ
                  </label>
                  <input
                    id="doctors-hero-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    dir="ltr"
                    placeholder="شماره موبایل یا واتساپ"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (error) setError(null);
                    }}
                    disabled={loading}
                    className="w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3.5 text-center text-sm text-navy-900 outline-none transition focus:border-sky-400 focus:bg-white disabled:opacity-60"
                  />
                  <label className="flex cursor-pointer items-start gap-2 text-right text-[11px] leading-relaxed text-navy-500">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => {
                        setConsent(e.target.checked);
                        if (error) setError(null);
                      }}
                      disabled={loading}
                      className="mt-0.5 shrink-0 rounded border-navy-200"
                    />
                    <span>مایلم گزارش بررسی مطب را در واتساپ دریافت کنم.</span>
                  </label>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-sky-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98] disabled:opacity-60"
                  >
                    {loading ? "در حال ثبت..." : "گزارش رایگان مطبم را بفرستید"}
                  </button>
                  <p className="text-center text-[11px] text-navy-400">مرحله ۲ از ۲</p>
                </form>
              )}

              {error ? (
                <p className="mt-3 text-center text-xs font-medium text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <p className="mt-4 text-center text-[12px] leading-relaxed text-navy-500">
                سه ایراد مهم و پیشنهادهای عملی را تا پایان روز کاری در واتساپ دریافت می‌کنید.
              </p>

              <div className="mt-4 text-center">
                <a
                  href="#sample-report"
                  onClick={() =>
                    pushGtmEvent("cta_click", {
                      location: "doctors_hero_sample_report",
                      page: "doctors",
                    })
                  }
                  className="text-sm font-bold text-sky-700 transition-colors hover:text-sky-800"
                >
                  مشاهده نمونه گزارش
                </a>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <DoctorsReportPreview compact />
          </div>
        </div>
      </div>
    </section>
  );
}

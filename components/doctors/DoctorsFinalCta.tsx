"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";

const isValidIranianMobile = (value: string): boolean => {
  const digits = value.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)).replace(/\D/g, "");
  return /^09\d{9}$/.test(digits);
};

const toLatinDigits = (value: string) =>
  value.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)).replace(/\D/g, "");

export default function DoctorsFinalCta() {
  const router = useRouter();
  const [identity, setIdentity] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (identity.trim().length < 2) {
      setError("نام پزشک، کلینیک یا اینستاگرام را وارد کنید.");
      return;
    }
    if (!isValidIranianMobile(phone)) {
      setError("شماره موبایل را درست وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const digits = toLatinDigits(phone);
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "doctors_final_audit",
          page: "/doctors",
          name: identity.trim(),
          contact: digits,
          goal: "clinic_audit",
          plan: "free_report",
          channel: "doctors_landing",
          detail: `clinic_identity: ${identity.trim()}`,
          consent: true,
          referrer: document.referrer || null,
          company: "",
          ...getUtmParams(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(
          data.error === "rate_limited"
            ? "درخواست‌های زیاد. چند دقیقه بعد دوباره تلاش کنید."
            : "ثبت ناموفق بود. دوباره تلاش کنید."
        );
        return;
      }
      pushGtmEvent("generate_lead", {
        source: "doctors_final_audit",
        goal: "clinic_audit",
        page: "doctors",
      });
      router.push("/tashkor?from=doctors_audit");
    } catch {
      setError("خطا در ارتباط. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="final-cta" className="pb-20 sm:pb-28">
      <div className="container-mx container-px">
        <div className="mx-auto max-w-xl rounded-3xl border border-sky-200 bg-gradient-to-b from-sky-50 to-white p-8 text-center shadow-soft sm:p-10">
          <h2 className="text-xl font-extrabold text-navy-900 sm:text-2xl">
            بررسی رایگان وضعیت مطب شما
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-navy-500">
            سه ایراد مهم و پیشنهادهای عملی را تا پایان روز کاری در واتساپ دریافت می‌کنید.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-right" noValidate>
            <input
              type="text"
              placeholder="نام پزشک، کلینیک یا آدرس اینستاگرام"
              value={identity}
              onChange={(e) => {
                setIdentity(e.target.value);
                if (error) setError(null);
              }}
              disabled={loading}
              className="w-full rounded-xl border border-navy-100 bg-white px-4 py-3 text-center text-sm outline-none transition focus:border-sky-400"
            />
            <input
              type="tel"
              inputMode="numeric"
              dir="ltr"
              placeholder="شماره موبایل یا واتساپ"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (error) setError(null);
              }}
              disabled={loading}
              className="w-full rounded-xl border border-navy-100 bg-white px-4 py-3 text-center text-sm outline-none transition focus:border-sky-400"
            />
            {error ? (
              <p className="text-center text-xs font-medium text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-sky-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "در حال ثبت..." : "گزارش رایگان مطبم را بفرستید"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

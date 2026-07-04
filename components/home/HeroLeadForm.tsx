"use client";

import { useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";

const isValidIranianMobile = (value: string): boolean => {
  const digits = value.replace(/\D/g, "");
  return /^09\d{9}$/.test(digits);
};

export default function HeroLeadForm() {
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
      const digits = phone.replace(/\D/g, "");
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "hero_form",
          page: "/",
          contact: digits,
          channel: "homepage_hero",
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          company: "",
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        if (data.error === "rate_limited") {
          setError("درخواست‌های زیاد. چند دقیقه بعد دوباره تلاش کنید.");
        } else {
          setError("ثبت درخواست ناموفق بود. دوباره تلاش کنید.");
        }
        return;
      }

      pushGtmEvent("lead_submit", { source: "hero_form", page: "index" });
      setSuccess(true);
      setPhone("");
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="mt-5 w-full max-w-md rounded-2xl border border-green-100 bg-white p-4 shadow-soft sm:p-5"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm font-medium text-green-700">
          درخواست شما ثبت شد. تیم آرایه با شما تماس می‌گیرد.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 w-full max-w-md">
      <p className="mb-2.5 text-sm text-navy-500">
        شماره‌تان را بگذارید؛ برای مشاوره رایگان با شما تماس می‌گیریم.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 rounded-2xl border border-navy-100 bg-white p-2 shadow-soft sm:flex-row sm:items-center"
        noValidate
      >
        <label htmlFor="hero-phone" className="sr-only">
          شماره موبایل
        </label>
        <input
          id="hero-phone"
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
          disabled={loading}
          className="w-full flex-1 rounded-xl bg-navy-50/50 px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-navy-200 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-navy-800 hover:shadow-glow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "در حال ارسال..." : "مشاوره رایگان"}
        </button>
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />
      </form>

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <p className="mt-2 text-xs text-navy-400">
        بدون اسپم؛ فقط برای هماهنگی مشاوره پروژه.
      </p>
    </div>
  );
}

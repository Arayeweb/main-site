"use client";

import { useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import { IconCheck, IconPhone } from "@/components/icons";
import type { SpecialtyKey } from "@/lib/demoData";
import { SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/siteContact";

const isValidIranianMobile = (value: string): boolean => {
  const digits = value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\D/g, "");
  return /^09\d{9}$/.test(digits);
};

interface DemoLeadFormProps {
  specialty: SpecialtyKey;
  specialtyLabel: string;
  packageKey: string | null;
  packageName: string | null;
  accentClasses: {
    bg: string;
    hoverBg: string;
    ring: string;
    text: string;
  };
}

// The *real* lead-capture form on each demo page — this is what actually
// notifies Araaye's sales pipeline (POST /api/leads), following the same
// contract as components/home/HeroLeadForm.tsx and components/seo/SeoHero.tsx.
export default function DemoLeadForm({
  specialty,
  specialtyLabel,
  packageKey,
  packageName,
  accentClasses,
}: DemoLeadFormProps) {
  const [name, setName] = useState("");
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
      const digits = phone
        .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
        .replace(/\D/g, "");
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "demo_tool",
          page: `/demo/${specialty}`,
          name: name.trim(),
          contact: digits,
          goal: "order_demo_site",
          plan: packageKey,
          channel: "demo_landing",
          detail: `specialty: ${specialtyLabel}${packageName ? ` | package: ${packageName}` : ""}`,
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
            : "ثبت درخواست ناموفق بود. دوباره تلاش کنید یا تماس بگیرید."
        );
        return;
      }
      pushGtmEvent("generate_lead", { source: "demo_tool", specialty, plan: packageKey ?? "none", page: "demo" });
      setSuccess(true);
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        id="lead-form"
        className="scroll-mt-24 rounded-3xl border border-navy-100 bg-white p-6 text-center shadow-card sm:p-8"
        role="status"
        aria-live="polite"
      >
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${accentClasses.bg} text-white`}>
          <IconCheck size={26} />
        </div>
        <h3 className="text-lg font-extrabold text-navy-900">درخواستتان ثبت شد ✓</h3>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-navy-500">
          تیم آرایه ظرف چند ساعت کاری با شما تماس می‌گیرد تا درباره ساخت سایتی مثل این نمونه، برای مطب شما صحبت کند.
        </p>
      </div>
    );
  }

  return (
    <div
      id="lead-form"
      className="scroll-mt-24 rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-8"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label htmlFor="demo-lead-name" className="mb-1.5 block text-[13px] font-bold text-navy-700">
            نام و نام‌خانوادگی
          </label>
          <input
            id="demo-lead-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام شما"
            className={`w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-sm text-navy-900 outline-none transition focus:bg-white ${accentClasses.ring}`}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="demo-lead-phone" className="mb-1.5 block text-[13px] font-bold text-navy-700">
            شماره موبایل
          </label>
          <input
            id="demo-lead-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            dir="ltr"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (error) setError(null);
            }}
            placeholder="09xxxxxxxxx"
            className={`w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-left text-sm text-navy-900 outline-none transition focus:bg-white ${accentClasses.ring}`}
          />
        </div>

        {error ? (
          <p className="mb-3 text-xs font-bold text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-xl px-6 py-3.5 text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-60 ${accentClasses.bg} ${accentClasses.hoverBg}`}
        >
          {loading ? "در حال ارسال..." : "سفارش این سایت برای مطب من"}
        </button>

        <a
          href={SITE_PHONE_TEL}
          onClick={() => pushGtmEvent("phone_click", { location: "demo_lead_form", specialty })}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 px-6 py-3 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
        >
          <IconPhone size={16} />
          ترجیح می‌دهم اول صحبت کنم — {SITE_PHONE_DISPLAY}
        </a>
        <p className="mt-3 text-center text-[11px] text-navy-400">بدون اسپم؛ فقط برای هماهنگی همکاری.</p>
      </form>
    </div>
  );
}

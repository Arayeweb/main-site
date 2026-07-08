"use client";

import { useMemo, useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import { IconCheck, IconPhone } from "@/components/icons";
import { SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/siteContact";

function toLatinDigits(s: string) {
  return s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

function isValidIranianMobile(value: string): boolean {
  const digits = toLatinDigits(value).replace(/\D/g, "");
  return /^09\d{9}$/.test(digits);
}

function normalizeIranPhone(value: string): string | null {
  if (!isValidIranianMobile(value)) return null;
  const digits = toLatinDigits(value).replace(/\D/g, "");
  // API انتظار شماره با پیش‌شماره ۰ (مثل 09xxxxxxxxx) را دارد.
  return digits;
}

function normalizeWebsiteUrl(raw: string): string | null {
  const v = String(raw || "").trim();
  if (!v) return null;
  const withProtocol = v.includes("://") ? v : `https://${v}`;
  try {
    // eslint-disable-next-line no-new
    new URL(withProtocol);
    return withProtocol;
  } catch {
    return null;
  }
}

export default function IndustryAuditForm({
  serviceType,
  slug,
}: {
  serviceType: "seo" | "website";
  slug: string;
}) {
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const goal = serviceType === "seo" ? "seo_audit_free" : "website_audit_free";
  const channel = serviceType === "seo" ? "seo_landing" : "website_landing";

  const normalizedWebsiteHint = useMemo(() => normalizeWebsiteUrl(website), [website]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const p = normalizeIranPhone(phone);
    if (!p) {
      setError("شماره موبایل را درست وارد کنید.");
      return;
    }

    const site = normalizeWebsiteUrl(website);
    if (!site) {
      setError("آدرس سایت را درست وارد کنید (مثل example.com).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: `industry_audit_${serviceType}`,
          page: `/${serviceType}/${slug}`,
          contact: p,
          goal,
          plan: "free_audit",
          channel,
          company: "",
          detail: `industry=${slug} | service=${serviceType} | website=${site}`,
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          ...getUtmParams(),
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError("ثبت درخواست ناموفق بود. دوباره تلاش کنید.");
        return;
      }

      pushGtmEvent("generate_lead", { source: "industry_audit", page: `/${serviceType}/${slug}` });
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
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-700">
          <IconCheck size={30} />
        </div>
        <h3 className="text-lg font-extrabold text-navy-900">درخواستت ثبت شد ✓</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-navy-500">
          تیم آرایه بررسی رایگان رو شروع می‌کنه و برای هماهنگی تماس می‌گیره.
        </p>
      </div>
    );
  }

  return (
    <div id="lead-form" className="scroll-mt-24">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-8"
        noValidate
      >
        <div className="mb-5 text-center">
          <div className="text-sm font-extrabold text-navy-900">مشاوره رایگان + بررسی سایت</div>
          <div className="mt-1 text-xs text-navy-400">بدون اسپم؛ فقط برای هماهنگی بررسی.</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="audit-website" className="mb-1.5 block text-[13px] font-bold text-navy-700">
              آدرس سایت *
            </label>
            <input
              id="audit-website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="مثلاً example.com"
              inputMode="url"
              dir="ltr"
              className="w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-left text-sm text-navy-900 outline-none transition focus:border-teal-400 focus:bg-white"
            />
            {normalizedWebsiteHint ? (
              <div className="mt-2 text-[11px] font-bold text-teal-700">آدرس تشخیص داده شد</div>
            ) : null}
          </div>

          <div>
            <label htmlFor="audit-phone" className="mb-1.5 block text-[13px] font-bold text-navy-700">
              موبایل *
            </label>
            <input
              id="audit-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xxxxxxxxx"
              inputMode="tel"
              dir="ltr"
              className="w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-left text-sm text-navy-900 outline-none transition focus:border-teal-400 focus:bg-white"
            />
          </div>
        </div>

        <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

        {error ? (
          <p className="mt-3 text-xs font-bold text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "در حال ارسال..." : "ارسال برای تحلیل رایگان"}
        </button>

        <a
          href={SITE_PHONE_TEL}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 px-6 py-3 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
          onClick={() => pushGtmEvent("phone_click", { location: "industry_audit_form" })}
        >
          <IconPhone size={16} />
          ترجیح می‌دهم اول صحبت کنم — {SITE_PHONE_DISPLAY}
        </a>
      </form>
    </div>
  );
}


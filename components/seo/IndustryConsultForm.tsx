"use client";

import { useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import { industryOrganicSource } from "@/lib/seo/programmaticPages";
import type { IndustrySlug } from "@/lib/seo/industries";
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
  return toLatinDigits(value).replace(/\D/g, "");
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

export default function IndustryConsultForm({
  serviceType,
  slug,
  variant = "section",
  submitLabel = "درخواست مشاوره",
}: {
  serviceType: "seo" | "website";
  slug: IndustrySlug;
  variant?: "hero" | "section";
  submitLabel?: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const goal = serviceType === "seo" ? "seo_consultation" : "website_consultation";
  const channel = serviceType === "seo" ? "seo_landing" : "website_landing";
  const pagePath = `/${serviceType}/${slug}`;
  const organicSource = industryOrganicSource(serviceType, slug);

  const trackPayload = {
    page: pagePath,
    landingPage: pagePath,
    product: serviceType,
    industry: slug,
    source: organicSource,
    channel,
    ...getUtmParams(),
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const p = normalizeIranPhone(phone);
    if (!p) {
      setError("شماره موبایل را درست وارد کنید.");
      return;
    }

    const site = website.trim() ? normalizeWebsiteUrl(website) : null;
    if (website.trim() && !site) {
      setError("آدرس سایت را درست وارد کنید (مثل example.com).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: organicSource,
          page: pagePath,
          contact: p,
          goal,
          plan: "consultation",
          channel,
          company: name.trim(),
          detail: [
            `industry=${slug}`,
            `service=${serviceType}`,
            site ? `website=${site}` : null,
          ]
            .filter(Boolean)
            .join(" | "),
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          ...getUtmParams(),
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError("ثبت درخواست ناموفق بود. دوباره تلاش کنید.");
        return;
      }

      pushGtmEvent("lead_submit", { ...trackPayload, cta: "industry_consult_form" });
      pushGtmEvent("generate_lead", { source: organicSource, page: pagePath });
      setSuccess(true);
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  const formAnchorId = variant === "hero" ? "consult-form" : "consult-form-bottom";

  if (success) {
    return (
      <div
        id={formAnchorId}
        className="scroll-mt-24 rounded-3xl border border-navy-100 bg-white p-6 text-center shadow-soft sm:p-8"
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-700">
          <IconCheck size={30} />
        </div>
        <h3 className="text-lg font-extrabold text-navy-900">درخواست شما ثبت شد</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-navy-500">
          کارشناس فروش آرایه برای هماهنگی مشاوره و پیش‌فاکتور با شما تماس می‌گیرد.
        </p>
      </div>
    );
  }

  const formShell =
    variant === "hero"
      ? "rounded-2xl border-0 bg-transparent p-0 shadow-none"
      : "mx-auto max-w-2xl rounded-3xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8";

  return (
    <div id={formAnchorId} className="scroll-mt-24">
      <form onSubmit={handleSubmit} className={formShell} noValidate>
        <div className={variant === "hero" ? "mb-4 text-right" : "mb-5 text-center"}>
          <div className="text-sm font-extrabold text-navy-900">
            {variant === "hero" ? "مشاوره و پیش‌فاکتور" : "شروع همکاری با آرایه"}
          </div>
          <div className="mt-1 text-xs text-navy-400">
            برای بررسی نیاز شما تماس می‌گیریم — بدون گزارش رایگان عمومی.
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <label htmlFor="consult-name" className="mb-1.5 block text-[13px] font-bold text-navy-700">
              نام یا نام کسب‌وکار
            </label>
            <input
              id="consult-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً دفتر وکالت احمدی"
              className="w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="consult-phone" className="mb-1.5 block text-[13px] font-bold text-navy-700">
              موبایل *
            </label>
            <input
              id="consult-phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (!phone && e.target.value) {
                  pushGtmEvent("form_start", { ...trackPayload, field: "phone" });
                }
              }}
              placeholder="09xxxxxxxxx"
              inputMode="tel"
              dir="ltr"
              className="w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-left text-sm text-navy-900 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="consult-website" className="mb-1.5 block text-[13px] font-bold text-navy-700">
              آدرس سایت {serviceType === "seo" ? "(در صورت وجود)" : "(اختیاری)"}
            </label>
            <input
              id="consult-website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="مثلاً example.com"
              inputMode="url"
              dir="ltr"
              className="w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-left text-sm text-navy-900 outline-none transition focus:border-sky-400 focus:bg-white"
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
          className="mt-5 w-full rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "در حال ارسال..." : submitLabel}
        </button>

        <a
          href={SITE_PHONE_TEL}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 px-6 py-3 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
          onClick={() => pushGtmEvent("call_click", { ...trackPayload, location: "industry_consult_form" })}
        >
          <IconPhone size={16} />
          تماس مستقیم — {SITE_PHONE_DISPLAY}
        </a>
      </form>
    </div>
  );
}

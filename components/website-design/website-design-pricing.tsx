"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconCheck, IconClose } from "@/components/icons";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import {
  formatWebsiteDesignPrice,
  WEBSITE_DESIGN_PAGE,
  websiteDesignPricingExtras,
  websiteDesignPricingPlans,
  type WebsiteDesignPricingPlan,
} from "@/data/website-design";

const ACCENT = "#3157F6";

const inputClassName =
  "w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-teal-400 focus:bg-white disabled:opacity-60";

function toLatinDigits(value: string) {
  return value
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

function track(event: string, extra: Record<string, string | number | undefined> = {}) {
  pushGtmEvent(event, {
    page: WEBSITE_DESIGN_PAGE,
    timestamp: Date.now(),
    ...extra,
  });
}

function PricingMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold text-navy-400">{label}</dt>
      <dd className="mt-1 text-[13px] font-semibold text-navy-800">{value}</dd>
    </div>
  );
}

function EstimateModal({
  plan,
  onClose,
}: {
  plan: WebsiteDesignPricingPlan;
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("input, textarea")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("لطفاً نام کامل را وارد کنید.");
      return;
    }

    const normalizedPhone = normalizeIranPhone(phone);
    if (!normalizedPhone) {
      setError("شماره موبایل را درست وارد کنید.");
      return;
    }

    if (!businessName.trim()) {
      setError("لطفاً نام کسب‌وکار را وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "website-design-estimate",
          page: WEBSITE_DESIGN_PAGE,
          name: fullName.trim(),
          contact: normalizedPhone,
          goal: "درخواست برآورد",
          sitetype: plan.title,
          budget: String(plan.priceFrom),
          channel: "website_design_pricing",
          detail: [
            `plan=${plan.id}`,
            `business=${businessName.trim()}`,
            message.trim() ? `message=${message.trim()}` : null,
          ]
            .filter(Boolean)
            .join(" | "),
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          company: "",
          ...getUtmParams(),
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        if (data.error === "rate_limited") {
          setError("درخواست‌های زیاد. چند دقیقه بعد دوباره تلاش کنید.");
        } else if (data.error === "invalid_contact") {
          setError("شماره موبایل را درست وارد کنید.");
        } else {
          setError("ثبت درخواست ناموفق بود. دوباره تلاش کنید.");
        }
        return;
      }

      track("website_design_estimate_submit", { plan: plan.id });
      setSuccess(true);
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy-900/50 p-4 sm:items-center"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wd-estimate-title"
        className="w-full max-w-lg rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-navy-400">درخواست برآورد</p>
            <h3 id="wd-estimate-title" className="mt-1 text-lg font-extrabold text-navy-900">
              {plan.title}
            </h3>
            <p className="mt-1 text-sm text-navy-500">
              شروع از {formatWebsiteDesignPrice(plan.priceFrom)} تومان
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700"
            aria-label="بستن"
          >
            <IconClose size={18} />
          </button>
        </div>

        {success ? (
          <div className="mt-6 text-center" role="status" aria-live="polite">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <IconCheck size={30} />
            </div>
            <p className="text-sm leading-relaxed text-navy-600">
              درخواست شما ثبت شد. پس از بررسی نیاز پروژه، پیش‌فاکتور برای شما ارسال می‌شود.
            </p>
            <button type="button" onClick={onClose} className="btn-primary mt-6 w-full">
              بستن
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="wd-estimate-name" className="mb-1.5 block text-[13px] font-bold text-navy-700">
                نام کامل *
              </label>
              <input
                id="wd-estimate-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                disabled={loading}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="wd-estimate-phone" className="mb-1.5 block text-[13px] font-bold text-navy-700">
                شماره موبایل *
              </label>
              <input
                id="wd-estimate-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                dir="ltr"
                placeholder="09xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                className={`${inputClassName} text-start`}
              />
            </div>

            <div>
              <label
                htmlFor="wd-estimate-business"
                className="mb-1.5 block text-[13px] font-bold text-navy-700"
              >
                نام کسب‌وکار *
              </label>
              <input
                id="wd-estimate-business"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={loading}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="wd-estimate-message" className="mb-1.5 block text-[13px] font-bold text-navy-700">
                توضیح کوتاه پروژه
              </label>
              <textarea
                id="wd-estimate-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                disabled={loading}
                placeholder="تعداد صفحات، امکانات خاص یا زمان موردنیاز..."
                className={`${inputClassName} resize-y`}
              />
            </div>

            <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

            {error ? (
              <p className="text-sm font-bold text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "در حال ارسال..." : "ارسال درخواست برآورد"}
            </button>

            <p className="text-center text-[12px] leading-relaxed text-navy-400">
              پس از بررسی، پیش‌فاکتور دقیق با جزئیات صفحات و امکانات ارسال می‌شود.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function WebsiteDesignPricing() {
  const [selectedPlan, setSelectedPlan] = useState<WebsiteDesignPricingPlan | null>(null);

  const openEstimate = (plan: WebsiteDesignPricingPlan) => {
    track("website_design_estimate_open", { plan: plan.id });
    setSelectedPlan(plan);
  };

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="container-mx container-px">
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="inline-flex items-center rounded-full px-3.5 py-1 text-xs font-bold"
            style={{ backgroundColor: "#EEF2FF", color: ACCENT }}
          >
            هزینه طراحی سایت
          </span>
          <h2 className="mt-4 text-2xl font-extrabold leading-snug tracking-tight text-navy-900 sm:text-3xl">
            متناسب با چیزی که واقعاً نیاز دارید
          </h2>
          <p className="mt-4 text-[15px] leading-[1.85] text-navy-500 sm:text-base">
            قبل از شروع، صفحات، امکانات، زمان تحویل و مبلغ نهایی مشخص می‌شود تا وسط پروژه
            هزینه مبهمی اضافه نشود.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-[1100px] gap-5 lg:mt-12 lg:grid-cols-3">
          {websiteDesignPricingPlans.map((plan) => (
            <article
              key={plan.id}
              className="flex flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-soft"
            >
              <h3 className="text-lg font-extrabold text-navy-900">{plan.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">{plan.audience}</p>

              <p className="mt-5 text-2xl font-extrabold text-navy-900">
                شروع از{" "}
                <span style={{ color: ACCENT }}>{formatWebsiteDesignPrice(plan.priceFrom)}</span>{" "}
                <span className="text-sm font-bold text-navy-500">تومان</span>
              </p>

              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-navy-700">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: ACCENT }}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <dl className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-[#E8EDFF] bg-navy-50/30 p-4">
                <PricingMeta label="زمان تقریبی" value={plan.timeline} />
                <PricingMeta label="اصلاحات" value={plan.revisions} />
                <div className="col-span-2">
                  <PricingMeta label="پشتیبانی" value={plan.support} />
                </div>
              </dl>

              <button
                type="button"
                onClick={() => openEstimate(plan)}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157F6] focus-visible:ring-offset-2"
                style={{ backgroundColor: ACCENT }}
              >
                درخواست برآورد
              </button>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-[1100px] rounded-2xl border border-[#E8EDFF] bg-navy-50/30 p-6 sm:p-8">
          <h3 className="text-base font-extrabold text-navy-900">مواردی که شفاف اعلام می‌شوند</h3>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold text-navy-400">دامنه و هاست</p>
              <p className="mt-1.5 text-sm leading-relaxed text-navy-600">
                {websiteDesignPricingExtras.domainHosting}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-navy-400">تولید محتوا و ورود اطلاعات</p>
              <p className="mt-1.5 text-sm leading-relaxed text-navy-600">
                {websiteDesignPricingExtras.contentProduction}
              </p>
            </div>
          </div>
          <div className="mt-6 border-t border-[#E8EDFF] pt-6">
            <p className="text-[11px] font-bold text-navy-400">امکاناتی با هزینه جدا</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {websiteDesignPricingExtras.separateFeatures.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-navy-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-300" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-navy-500">
            قیمت نهایی پس از مشخص‌شدن صفحات، امکانات و محتوای موردنیاز اعلام می‌شود؛ مبلغ
            «شروع از» فقط نقطه شروع برآورد است.
          </p>
        </div>

        <div className="mx-auto mt-8 flex max-w-[1100px] flex-col items-center justify-between gap-3 rounded-xl border border-[#E8EDFF] bg-white px-5 py-4 text-center sm:flex-row sm:text-right">
          <p className="text-sm font-semibold text-navy-700">
            فقط یک صفحه برای تبلیغات می‌خواهید؟ AdReady انتخاب مناسب‌تری است.
          </p>
          <Link
            href="/adready"
            onClick={() => track("website_design_adready_click", { location: "pricing_bar" })}
            className="inline-flex shrink-0 items-center text-sm font-bold transition-colors hover:opacity-80"
            style={{ color: ACCENT }}
          >
            مشاهده AdReady
            <span aria-hidden="true" className="ms-1.5">
              ←
            </span>
          </Link>
        </div>
      </div>

      {selectedPlan ? (
        <EstimateModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      ) : null}
    </section>
  );
}

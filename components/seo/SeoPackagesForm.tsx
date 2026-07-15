"use client";

import { useEffect, useRef, useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import {
  seoPackages,
  formatPackagePrice,
  formatSeoPlanPrice,
  getSeoPackage,
  seoAuditDeductionNote,
  seoOffPageDisclaimer,
  seoTechnicalDisclaimer,
  seoPricingDisclaimers,
  type SeoPackage,
  type SeoPackageKey,
} from "@/lib/seoData";
import { SEO_PLAN_SELECT_EVENT } from "@/lib/seoPlanSelection";
import { trackSeoEvent } from "@/lib/seoAnalytics";
import { IconCheck, IconPhone } from "@/components/icons";
import { SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/siteContact";
import SeoPackageCompare from "./SeoPackageCompare";

const toLatinDigits = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

const isPhone = (v: string) => /^(\+98|0098|0)?9\d{9}$/.test(toLatinDigits(v).replace(/[\s\-()]/g, ""));
const isTelegram = (v: string) => /^@[a-zA-Z0-9_]{5,32}$/.test(v.trim());

function normalizeContact(raw: string): { kind: "phone" | "telegram" | "invalid"; value: string } {
  const v = String(raw || "").trim();
  if (isPhone(v)) {
    const digits = toLatinDigits(v).replace(/[\s\-()]/g, "");
    return { kind: "phone", value: "0" + digits.replace(/^(\+98|0098|0)?/, "") };
  }
  if (isTelegram(v)) return { kind: "telegram", value: v.toLowerCase() };
  return { kind: "invalid", value: v };
}

const oncePackages = seoPackages.filter((p) => p.pricePeriod === "once");
const monthlyPackages = seoPackages.filter((p) => p.pricePeriod === "month");
const enterprisePackage = getSeoPackage("enterprise");

type PaymentState = "success" | "failed" | "error" | null;
type FormMode = "package" | "quick";

export default function SeoPackagesForm() {
  const [selected, setSelected] = useState<SeoPackageKey>("growth");
  const [formMode, setFormMode] = useState<FormMode>("package");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bizInput, setBizInput] = useState("");
  const [bizName, setBizName] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payment, setPayment] = useState<PaymentState>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const pricingTracked = useRef(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("payment");
    if (p === "success" || p === "failed" || p === "error") {
      setPayment(p);
      if (p === "success") pushGtmEvent("purchase", { page: "seo" });
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  useEffect(() => {
    const onSelectPlan = (e: Event) => {
      const detail = (e as CustomEvent<{ plan: SeoPackageKey; source?: string }>).detail;
      if (!detail?.plan) return;
      choosePackage(detail.plan, "quick");
    };
    window.addEventListener(SEO_PLAN_SELECT_EVENT, onSelectPlan);
    return () => window.removeEventListener(SEO_PLAN_SELECT_EVENT, onSelectPlan);
  }, []);

  useEffect(() => {
    const el = document.getElementById("packages");
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !pricingTracked.current) {
          pricingTracked.current = true;
          trackSeoEvent("seo_pricing_view");
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pkg = getSeoPackage(selected);

  const choosePackage = (key: SeoPackageKey, mode: FormMode = "package") => {
    setSelected(key);
    setFormMode(mode);
    setStep(mode === "quick" ? 2 : 2);
    setError(null);
    trackSeoEvent("seo_plan_selected", { selected_plan: key });
    pushGtmEvent("pkg_selected", { package: key, page: "seo" });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const business = formMode === "quick" ? bizInput.trim() : bizName.trim();
    if (!business) {
      setError(formMode === "quick" ? "نام کسب‌وکار یا آدرس سایت را وارد کنید." : "لطفاً نام کسب‌وکار را وارد کنید.");
      return;
    }
    if (formMode === "quick" && !bizName.trim()) {
      setError("نام را وارد کنید.");
      return;
    }
    const c = normalizeContact(contact);
    if (c.kind === "invalid") {
      setError("شماره موبایل یا آیدی تلگرام معتبر وارد کنید.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: formMode === "quick" ? "seo_package_quick" : "seo_multistep",
          page: "/seo",
          name: formMode === "quick" ? bizName.trim() : bizName.trim(),
          contact: c.value,
          goal: "seo_service",
          plan: selected,
          budget: String(pkg.price),
          channel: "seo_landing",
          detail:
            `package: ${selected} | name: ${pkg.name} | price: ${pkg.price}` +
            (formMode === "quick" ? ` | input: ${business}` : ""),
          referrer: document.referrer || null,
          company: formMode === "quick" ? business : "",
          ...getUtmParams(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(
          data.error === "rate_limited"
            ? "درخواست‌های زیاد. چند دقیقه بعد دوباره تلاش کنید."
            : "مشکلی در ارسال پیش آمد. دوباره تلاش کنید یا تماس بگیرید."
        );
        return;
      }
      trackSeoEvent("seo_lead_submit", { selected_plan: selected });
      pushGtmEvent("generate_lead", { source: "seo_multistep", plan: selected, page: "seo" });
      setStep(3);
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  const startCheckout = async () => {
    setPaying(true);
    setError(null);
    pushGtmEvent("begin_checkout", { package: selected, page: "seo" });
    try {
      const res = await fetch("/api/seo/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package: selected,
          amount: pkg.price,
          name: (formMode === "quick" ? bizInput : bizName).trim(),
          contact: normalizeContact(contact).value,
          website: formMode === "quick" ? bizInput.trim() : null,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; redirectUrl?: string };
      if (data.ok && data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      throw new Error("checkout_failed");
    } catch {
      setError("مشکلی در اتصال به درگاه پرداخت پیش آمد. دوباره تلاش کنید یا تماس بگیرید.");
      setPaying(false);
    }
  };

  const renderFeatureList = (plan: SeoPackage) => {
    const items = plan.monthlyScope ?? plan.features;
    return (
      <ul className="seo-pricing-card-features">
        {items.slice(0, 6).map((feature) => (
          <li key={feature}>
            <IconCheck size={14} className="seo-pricing-check" aria-hidden />
            {feature}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section id="packages" className="seo-pricing section-py scroll-mt-24">
      <div className="container-mx container-px">
        <div className="seo-pricing-header">
          <span className="seo-section-tag">راهکارها و قیمت‌ها</span>
          <h2>پکیج‌ها و قیمت‌های سئو آرایه</h2>
          <p>از تحلیل یک‌باره تا همکاری ماهانه — متناسب با وضعیت و هدف کسب‌وکار.</p>
        </div>

        <div className="seo-pricing-disclaimer-box">
          <p>{seoOffPageDisclaimer}</p>
          <p>{seoTechnicalDisclaimer}</p>
        </div>

        {payment ? (
          <div
            className={`seo-pricing-alert ${
              payment === "success" ? "seo-pricing-alert--ok" : "seo-pricing-alert--err"
            }`}
            role="status"
          >
            {payment === "success"
              ? "پرداخت با موفقیت انجام شد ✓ تیم آرایه در کمتر از ۲ ساعت کاری با شما تماس می‌گیرد."
              : `پرداخت انجام نشد. می‌توانید دوباره تلاش کنید یا با ${SITE_PHONE_DISPLAY} تماس بگیرید.`}
          </div>
        ) : null}

        <p className="seo-pricing-group-label">پیشنهادهای یک‌باره</p>
        <div className="seo-pricing-once-grid">
          {oncePackages.map((plan) => (
            <article
              key={plan.key}
              className={`seo-pricing-once ${selected === plan.key ? "is-selected" : ""}`}
            >
              <div className="seo-pricing-once-main">
                <div className="seo-pricing-once-copy">
                  <h3>
                    {plan.name}
                    <span className="seo-pricing-once-price"> — {formatSeoPlanPrice(plan)}</span>
                  </h3>
                  <p>{plan.description}</p>
                  {plan.disclaimer ? (
                    <p className="seo-pricing-once-disclaimer">{plan.disclaimer}</p>
                  ) : null}
                </div>
                <ul className="seo-pricing-once-features">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => choosePackage(plan.key, "quick")}
                className="seo-btn-primary seo-pricing-once-btn"
              >
                {plan.ctaLabel}
              </button>
            </article>
          ))}
        </div>

        {oncePackages.some((p) => p.key === "audit") ? (
          <p className="seo-pricing-audit-note">{seoAuditDeductionNote}</p>
        ) : null}

        <p className="seo-pricing-group-label">همکاری ماهانه</p>
        <div className="seo-pricing-monthly">
          {monthlyPackages
            .filter((p) => p.key !== "enterprise")
            .map((plan) => {
              const isSelected = selected === plan.key;
              const isGrowth = plan.key === "growth";
              return (
                <article
                  key={plan.key}
                  className={`seo-pricing-card ${isGrowth ? "seo-pricing-card--growth" : ""} ${
                    isSelected ? "is-selected" : ""
                  }`}
                >
                  {plan.badge ? <span className="seo-pricing-card-badge">{plan.badge}</span> : null}
                  <div className="seo-pricing-card-head">
                    <h3>{plan.name}</h3>
                    <p className="seo-pricing-card-price">{formatSeoPlanPrice(plan)}</p>
                  </div>
                  {plan.recommendedDuration ? (
                    <p className="seo-pricing-card-duration">{plan.recommendedDuration}</p>
                  ) : null}
                  <p className="seo-pricing-card-desc">{plan.suitableFor ?? plan.description}</p>
                  {renderFeatureList(plan)}
                  {plan.notIncluded ? (
                    <details className="seo-pricing-not-included">
                      <summary>شامل نمی‌شود</summary>
                      <ul>
                        {plan.notIncluded.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => choosePackage(plan.key, "quick")}
                    className={`seo-pricing-card-btn ${isSelected ? "is-active" : ""}`}
                  >
                    {plan.ctaLabel}
                  </button>
                </article>
              );
            })}
        </div>

        <article className="seo-pricing-enterprise">
          <div>
            <h3>{enterprisePackage.name}</h3>
            <p className="seo-pricing-enterprise-price">{formatSeoPlanPrice(enterprisePackage)}</p>
            <p>{enterprisePackage.description}</p>
            <ul className="seo-pricing-enterprise-features">
              {enterprisePackage.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => choosePackage("enterprise", "quick")}
            className="seo-btn-secondary"
          >
            {enterprisePackage.ctaLabel}
          </button>
        </article>

        <SeoPackageCompare />

        <ul className="seo-pricing-disclaimers">
          {seoPricingDisclaimers.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div ref={formRef} id="lead-form" className="seo-pricing-form-wrap">
          <div className="seo-pricing-form">
            <div className="seo-pricing-form-progress">
              <div className="seo-pricing-form-bar">
                <div style={{ width: `${(step / 3) * 100}%` }} />
              </div>
              <span>{step === 3 ? "تکمیل شد ✓" : `مرحله ${step} از ۳`}</span>
            </div>

            {step === 1 ? (
              <div className="seo-pricing-form-step">
                <h3>
                  پلن انتخابی: <span>{pkg.name}</span>
                </h3>
                <p>برای ادامه، مشخصات را وارد کنید.</p>
                <button type="button" onClick={() => setStep(2)} className="seo-btn-primary">
                  ادامه با {pkg.name}
                </button>
              </div>
            ) : null}

            {step === 2 ? (
              <form onSubmit={handleSubmit} noValidate className="seo-pricing-form-step">
                <h3>
                  {formMode === "quick" ? "ثبت درخواست" : "مشخصات کسب‌وکار"}
                </h3>
                <p className="seo-pricing-form-plan-note">
                  پلن انتخاب‌شده: <strong>{pkg.name}</strong>
                </p>

                {formMode === "quick" ? (
                  <>
                    <label htmlFor="seo-biz-input">نام کسب‌وکار یا آدرس سایت *</label>
                    <input
                      id="seo-biz-input"
                      type="text"
                      value={bizInput}
                      onChange={(e) => setBizInput(e.target.value)}
                      placeholder="مثلاً clinic.ir یا نام کلینیک"
                    />
                    <label htmlFor="seo-quick-name">نام *</label>
                    <input
                      id="seo-quick-name"
                      type="text"
                      value={bizName}
                      onChange={(e) => setBizName(e.target.value)}
                      placeholder="نام شما"
                      autoComplete="name"
                    />
                  </>
                ) : (
                  <>
                    <label htmlFor="seo-biz-name">نام کسب‌وکار *</label>
                    <input
                      id="seo-biz-name"
                      type="text"
                      value={bizName}
                      onChange={(e) => setBizName(e.target.value)}
                      placeholder="مثلاً کلینیک دندانپزشکی مهر"
                    />
                  </>
                )}

                <label htmlFor="seo-contact">موبایل یا آیدی تلگرام *</label>
                <input
                  id="seo-contact"
                  type="text"
                  dir="ltr"
                  inputMode="tel"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="09xxxxxxxxx یا @username"
                />

                {error ? (
                  <p className="seo-pricing-form-error" role="alert">
                    {error}
                  </p>
                ) : null}

                <div className="seo-pricing-form-actions">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="seo-btn-secondary"
                  >
                    بازگشت
                  </button>
                  <button type="submit" disabled={submitting} className="seo-btn-primary">
                    {submitting ? "در حال ثبت..." : "ثبت درخواست"}
                  </button>
                </div>
              </form>
            ) : null}

            {step === 3 ? (
              <div className="seo-pricing-form-step seo-pricing-form-step--success">
                <div className="seo-pricing-success-icon">
                  <IconCheck size={30} />
                </div>
                <h3>درخواستت ثبت شد</h3>
                <p>
                  پلن <b>{pkg.name}</b> را انتخاب کردی.
                  {pkg.checkoutEnabled
                    ? " برای شروع، پرداخت آنلاین را انجام بده یا منتظر تماس تیم ما باش."
                    : " کارشناس ما در کمتر از ۲ ساعت کاری تماس می‌گیرد."}
                </p>

                <div className="seo-pricing-summary">
                  <div>
                    <span>پلن</span>
                    <b>{pkg.name}</b>
                  </div>
                  <div>
                    <span>{pkg.checkoutEnabled ? "مبلغ قابل پرداخت" : "قیمت"}</span>
                    <b>{formatPackagePrice(pkg)}</b>
                  </div>
                </div>

                {error ? (
                  <p className="seo-pricing-form-error" role="alert">
                    {error}
                  </p>
                ) : null}

                {pkg.checkoutEnabled ? (
                  <button
                    type="button"
                    onClick={startCheckout}
                    disabled={paying}
                    className="seo-btn-primary"
                  >
                    {paying
                      ? "در حال انتقال به درگاه پرداخت..."
                      : `پرداخت آنلاین ${formatPackagePrice(pkg)}`}
                  </button>
                ) : null}

                <a
                  href={SITE_PHONE_TEL}
                  onClick={() => {
                    trackSeoEvent("seo_phone_click");
                    pushGtmEvent("phone_click", { location: "seo_form_success", page: "seo" });
                  }}
                  className="seo-pricing-phone-link"
                >
                  <IconPhone size={16} />
                  تماس — {SITE_PHONE_DISPLAY}
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

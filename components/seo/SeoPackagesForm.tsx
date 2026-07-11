"use client";

import { useEffect, useRef, useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import {
  seoPackages,
  formatPackagePrice,
  formatSeoPlanPrice,
  getSeoPackage,
  type SeoPackage,
  type SeoPackageKey,
} from "@/lib/seoData";
import { IconCheck, IconPhone } from "@/components/icons";
import { SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/siteContact";

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

const gmapPackage = getSeoPackage("gmap");
const monthlyPackages = seoPackages.filter(
  (p) => p.pricePeriod === "month" && p.key !== "custom"
) as SeoPackage[];

type PaymentState = "success" | "failed" | "error" | null;

export default function SeoPackagesForm() {
  const [selected, setSelected] = useState<SeoPackageKey>("growth");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bizName, setBizName] = useState("");
  const [website, setWebsite] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payment, setPayment] = useState<PaymentState>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("payment");
    if (p === "success" || p === "failed" || p === "error") {
      setPayment(p);
      if (p === "success") {
        pushGtmEvent("purchase", { page: "seo" });
      }
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const pkg = getSeoPackage(selected);
  const pkgMeta = pkg;

  const choosePackage = (key: SeoPackageKey) => {
    setSelected(key);
    setStep(2);
    setError(null);
    pushGtmEvent("pkg_selected", {
      package: key,
      page: "seo",
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!bizName.trim()) {
      setError("لطفاً نام کسب‌وکار را وارد کنید.");
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
          source: "seo_multistep",
          page: "/seo",
          name: bizName.trim(),
          contact: c.value,
          goal: "seo_service",
          plan: selected,
          budget: String(pkg.price),
          channel: "seo_landing",
          detail:
            `package: ${selected} | name: ${pkg.name} | price: ${pkg.price}` +
            (website.trim() ? ` | website: ${website.trim()}` : ""),
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
            : "مشکلی در ارسال پیش آمد. دوباره تلاش کنید یا تماس بگیرید."
        );
        return;
      }
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
          name: bizName.trim(),
          contact: normalizeContact(contact).value,
          website: website.trim() || null,
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

  return (
    <section id="packages" className="seo-pricing section-py scroll-mt-24">
      <div className="container-mx container-px">
        <div className="seo-pricing-header">
          <span className="seo-section-tag">راهکارها و قیمت‌ها</span>
          <h2>متناسب با وضعیت فعلی‌تان شروع کنید</h2>
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

        <p className="seo-pricing-group-label">مسیر یک‌باره</p>
        <article
          className={`seo-pricing-once ${selected === "gmap" ? "is-selected" : ""}`}
        >
          <div className="seo-pricing-once-main">
            <div className="seo-pricing-once-copy">
              <h3>
                {gmapPackage.name}
                <span className="seo-pricing-once-price">
                  {" "}
                  — {formatSeoPlanPrice(gmapPackage)}
                </span>
              </h3>
              <p>{gmapPackage.description}</p>
            </div>
            <ul className="seo-pricing-once-features">
              {gmapPackage.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => choosePackage("gmap")}
            className="seo-btn-primary seo-pricing-once-btn"
          >
            {selected === "gmap" ? "انتخاب شد ✓" : "درخواست ثبت در گوگل"}
          </button>
        </article>

        <p className="seo-pricing-group-label">همکاری ماهانه</p>
        <div className="seo-pricing-monthly">
          {monthlyPackages.map((plan) => {
            const isSelected = selected === plan.key;
            const isGrowth = plan.key === "growth";
            return (
              <article
                key={plan.key}
                className={`seo-pricing-card ${isGrowth ? "seo-pricing-card--growth" : ""} ${
                  isSelected ? "is-selected" : ""
                }`}
              >
                <div className="seo-pricing-card-head">
                  <h3>{plan.name}</h3>
                  <p className="seo-pricing-card-price">{formatSeoPlanPrice(plan)}</p>
                </div>
                <p className="seo-pricing-card-desc">{plan.description}</p>
                <ul className="seo-pricing-card-features">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <IconCheck size={14} className="seo-pricing-check" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => choosePackage(plan.key)}
                  className={`seo-pricing-card-btn ${isSelected ? "is-active" : ""}`}
                >
                  {isSelected ? "انتخاب شد ✓" : "گفت‌وگو درباره این پلن"}
                </button>
              </article>
            );
          })}
        </div>

        <p className="seo-pricing-custom-note">
          برای پروژه‌های گسترده‌تر، برنامه اختصاصی از ماهانه ۲۹.۹ میلیون تومان تنظیم
          می‌شود.
        </p>

        <div ref={formRef} id="lead-form" className="seo-pricing-form-wrap">
          <div className="seo-pricing-form">
            <div className="seo-pricing-form-progress">
              <div className="seo-pricing-form-bar">
                <div style={{ width: `${(step / 3) * 100}%` }} />
              </div>
              <span>
                {step === 3 ? "تکمیل شد ✓" : `مرحله ${step === 1 ? "۱" : "۲"} از ۳`}
              </span>
            </div>

            {step === 1 ? (
              <div className="seo-pricing-form-step">
                <h3>
                  پلن انتخابی: <span>{pkg.name}</span>
                </h3>
                <p>برای ادامه، مشخصات کسب‌وکار را وارد کنید.</p>
                <button type="button" onClick={() => setStep(2)} className="seo-btn-primary">
                  ادامه با {pkg.name}
                </button>
              </div>
            ) : null}

            {step === 2 ? (
              <form onSubmit={handleSubmit} noValidate className="seo-pricing-form-step">
                <h3>مشخصات کسب‌وکار</h3>

                <label htmlFor="seo-biz-name">نام کسب‌وکار *</label>
                <input
                  id="seo-biz-name"
                  type="text"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  placeholder="مثلاً کلینیک دندانپزشکی مهر"
                />

                <label htmlFor="seo-website">
                  آدرس سایت <span className="seo-pricing-optional">(اختیاری)</span>
                </label>
                <input
                  id="seo-website"
                  type="url"
                  dir="ltr"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="example.com"
                />

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
                  <button type="button" onClick={() => setStep(1)} className="seo-btn-secondary">
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
                  {pkgMeta.checkoutEnabled
                    ? " برای شروع، پرداخت آنلاین را انجام بده یا منتظر تماس تیم ما باش."
                    : " کارشناس ما در کمتر از ۲ ساعت کاری تماس می‌گیرد."}
                </p>

                <div className="seo-pricing-summary">
                  <div>
                    <span>پلن</span>
                    <b>{pkg.name}</b>
                  </div>
                  <div>
                    <span>{pkgMeta.checkoutEnabled ? "مبلغ قابل پرداخت" : "قیمت"}</span>
                    <b>{formatPackagePrice(pkgMeta)}</b>
                  </div>
                </div>

                {error ? (
                  <p className="seo-pricing-form-error" role="alert">
                    {error}
                  </p>
                ) : null}

                {pkgMeta.checkoutEnabled ? (
                  <button
                    type="button"
                    onClick={startCheckout}
                    disabled={paying}
                    className="seo-btn-primary"
                  >
                    {paying
                      ? "در حال انتقال به درگاه پرداخت..."
                      : `پرداخت آنلاین ${formatPackagePrice(pkgMeta)}`}
                  </button>
                ) : null}

                <a
                  href={SITE_PHONE_TEL}
                  onClick={() =>
                    pushGtmEvent("phone_click", { location: "seo_form_success", page: "seo" })
                  }
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

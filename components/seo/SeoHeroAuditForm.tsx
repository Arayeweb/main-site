"use client";

import { useEffect, useState } from "react";
import { looksLikeWebsite } from "@/lib/seoBusinessInput";
import { getUtmParams } from "@/lib/utm";
import { trackSeoEvent } from "@/lib/seoAnalytics";
import { SEO_AUDIT_PREFILL_EVENT } from "@/lib/seoPlanSelection";
import { IconCheck } from "@/components/icons";

const GOALS = [
  { value: "calls", label: "افزایش تماس و درخواست" },
  { value: "sales", label: "افزایش فروش سایت" },
  { value: "maps", label: "دیده‌شدن در Google Maps" },
  { value: "organic", label: "رشد ورودی ارگانیک" },
  { value: "unsure", label: "هنوز مطمئن نیستم" },
] as const;

const STATUSES = [
  { value: "no_site", label: "هنوز سایت ندارم" },
  { value: "low_traffic", label: "سایت دارم اما ورودی کمی دارم" },
  { value: "traffic_no_leads", label: "ورودی داریم اما مشتری کم است" },
  { value: "done_seo", label: "قبلاً سئو انجام داده‌ایم" },
  { value: "active_seo", label: "پروژه فعال سئو داریم" },
] as const;

const toLatinDigits = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

function isPhone(v: string) {
  return /^(\+98|0098|0)?9\d{9}$/.test(toLatinDigits(v).replace(/[\s\-()]/g, ""));
}

type GoalValue = (typeof GOALS)[number]["value"];
type StatusValue = (typeof STATUSES)[number]["value"];

export default function SeoHeroAuditForm() {
  const [step, setStep] = useState(1);
  const [businessInput, setBusinessInput] = useState("");
  const [goal, setGoal] = useState<GoalValue | "">("");
  const [status, setStatus] = useState<StatusValue | "">("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const onPrefill = (e: Event) => {
      const value = (e as CustomEvent<{ value: string }>).detail?.value;
      if (value) {
        setBusinessInput(value);
        setStep(1);
      }
    };
    window.addEventListener(SEO_AUDIT_PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(SEO_AUDIT_PREFILL_EVENT, onPrefill);
  }, []);

  const totalSteps = 5;

  const nextFromBusiness = () => {
    if (!businessInput.trim()) {
      setError("نام کسب‌وکار یا آدرس سایت را وارد کنید.");
      return;
    }
    setError(null);
    trackSeoEvent("seo_audit_start", { business_type: businessInput.trim() });
    setStep(2);
  };

  const selectGoal = (value: GoalValue) => {
    setGoal(value);
    trackSeoEvent("seo_goal_selected", { goal: value });
    setStep(3);
  };

  const selectStatus = (value: StatusValue) => {
    setStatus(value);
    trackSeoEvent("seo_status_selected", { current_status: value });
    setStep(4);
  };

  const nextFromIndustry = () => {
    if (!industry.trim()) {
      setError("حوزه فعالیت را وارد کنید.");
      return;
    }
    setError(null);
    setStep(5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("نام را وارد کنید.");
      return;
    }
    if (!isPhone(phone)) {
      setError("شماره موبایل معتبر وارد کنید.");
      return;
    }
    if (!businessName.trim()) {
      setError("نام کسب‌وکار را وارد کنید.");
      return;
    }

    const digits = toLatinDigits(phone).replace(/\D/g, "");
    const contact = "0" + digits.replace(/^0?/, "");

    setSubmitting(true);
    try {
      const isWebsite = looksLikeWebsite(businessInput);
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "seo_hero_audit",
          page: "/seo",
          name: name.trim(),
          contact,
          goal: "seo_audit_initial",
          plan: "audit_initial",
          channel: "seo_landing",
          company: businessName.trim(),
          intent: industry.trim(),
          detail: [
            isWebsite ? `website: ${businessInput.trim()}` : `business: ${businessInput.trim()}`,
            `goal: ${goal}`,
            `status: ${status}`,
            city.trim() ? `city: ${city.trim()}` : null,
          ]
            .filter(Boolean)
            .join(" | "),
          referrer: document.referrer || null,
          ...getUtmParams(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError("مشکلی در ارسال پیش آمد. دوباره تلاش کنید.");
        return;
      }
      trackSeoEvent("seo_audit_submit", {
        goal: goal || undefined,
        current_status: status || undefined,
        business_type: industry.trim(),
      });
      trackSeoEvent("seo_lead_submit", {
        goal: goal || undefined,
        current_status: status || undefined,
        business_type: industry.trim(),
      });
      setSuccess(true);
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="seo-hero-audit seo-hero-audit--success" role="status">
        <div className="seo-hero-audit-success-icon">
          <IconCheck size={28} />
        </div>
        <p className="seo-hero-audit-success-title">درخواست بررسی اولیه ثبت شد</p>
        <p className="seo-hero-audit-success-text">
          تیم آرایه وضعیت سایت، صفحات هدف و فرصت‌های اصلی رشد را بررسی می‌کند.
        </p>
      </div>
    );
  }

  return (
    <div id="audit-form" className="seo-hero-audit scroll-mt-24">
      <div className="seo-hero-audit-progress">
        <div className="seo-hero-audit-bar">
          <div style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>
        <span>مرحله {step} از {totalSteps}</span>
      </div>

      {step === 1 ? (
        <div className="seo-hero-audit-step">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              nextFromBusiness();
            }}
            className="seo-hero-search"
          >
            <label htmlFor="seo-hero-query" className="sr-only">
              نام کسب‌وکار یا آدرس سایت
            </label>
            <input
              id="seo-hero-query"
              type="text"
              value={businessInput}
              onChange={(e) => {
                setBusinessInput(e.target.value);
                if (error) setError(null);
              }}
              placeholder="نام کسب‌وکار یا آدرس سایت"
              className="seo-hero-search-input"
              autoComplete="organization"
            />
            <button type="submit" className="seo-hero-search-btn">
              بررسی وضعیت سئو
            </button>
          </form>
          <p className="seo-hero-search-note">برای شروع، همین یک اطلاعات کافی است.</p>
          {error ? (
            <p className="seo-hero-audit-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="seo-hero-audit-step">
          <p className="seo-hero-audit-question">مهم‌ترین هدف شما چیست؟</p>
          <div className="seo-hero-audit-options">
            {GOALS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="seo-hero-audit-option"
                onClick={() => selectGoal(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button type="button" className="seo-hero-audit-back" onClick={() => setStep(1)}>
            بازگشت
          </button>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="seo-hero-audit-step">
          <p className="seo-hero-audit-question">وضعیت فعلی شما چیست؟</p>
          <div className="seo-hero-audit-options">
            {STATUSES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="seo-hero-audit-option"
                onClick={() => selectStatus(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button type="button" className="seo-hero-audit-back" onClick={() => setStep(2)}>
            بازگشت
          </button>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="seo-hero-audit-step">
          <p className="seo-hero-audit-question">حوزه فعالیت و شهر هدف</p>
          <label htmlFor="seo-industry" className="sr-only">
            حوزه فعالیت
          </label>
          <input
            id="seo-industry"
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="حوزه فعالیت — مثلاً کلینیک پوست"
            className="seo-hero-audit-field"
          />
          <label htmlFor="seo-city" className="sr-only">
            شهر هدف
          </label>
          <input
            id="seo-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="شهر هدف (اختیاری)"
            className="seo-hero-audit-field"
          />
          {error ? (
            <p className="seo-hero-audit-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="seo-hero-audit-actions">
            <button type="button" className="seo-hero-audit-back" onClick={() => setStep(3)}>
              بازگشت
            </button>
            <button type="button" className="seo-btn-primary" onClick={nextFromIndustry}>
              ادامه
            </button>
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <form onSubmit={handleSubmit} className="seo-hero-audit-step">
          <p className="seo-hero-audit-question">اطلاعات تماس</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام *"
            className="seo-hero-audit-field"
            autoComplete="name"
          />
          <input
            type="tel"
            dir="ltr"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="شماره موبایل *"
            className="seo-hero-audit-field"
            autoComplete="tel"
          />
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="نام کسب‌وکار *"
            className="seo-hero-audit-field"
            autoComplete="organization"
          />
          {error ? (
            <p className="seo-hero-audit-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="seo-hero-audit-actions">
            <button type="button" className="seo-hero-audit-back" onClick={() => setStep(4)}>
              بازگشت
            </button>
            <button type="submit" disabled={submitting} className="seo-btn-primary">
              {submitting ? "در حال ثبت..." : "دریافت بررسی اولیه"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

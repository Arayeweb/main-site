"use client";

import { useEffect, useMemo, useState } from "react";
import { looksLikeWebsite } from "@/lib/seoBusinessInput";
import { getUtmParams } from "@/lib/utm";
import { trackSeoEvent } from "@/lib/seoAnalytics";
import { SEO_AUDIT_PREFILL_EVENT } from "@/lib/seoPlanSelection";
import { IconCheck, IconPhone } from "@/components/icons";
import { SITE_PHONE_TEL, siteWhatsAppUrl } from "@/lib/siteContact";

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

const TIME_SLOTS = [
  { value: "10-12", label: "۱۰ تا ۱۲" },
  { value: "12-14", label: "۱۲ تا ۱۴" },
  { value: "14-16", label: "۱۴ تا ۱۶" },
  { value: "16-18", label: "۱۶ تا ۱۸" },
  { value: "18-20", label: "۱۸ تا ۲۰" },
] as const;

const toLatinDigits = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

function isPhone(v: string) {
  return /^(\+98|0098|0)?9\d{9}$/.test(toLatinDigits(v).replace(/[\s\-()]/g, ""));
}

function getNextDays(count: number) {
  const days: { iso: string; weekday: string; dayMonth: string; isToday: boolean }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setHours(12, 0, 0, 0);
    d.setDate(now.getDate() + i);
    days.push({
      iso: d.toISOString().slice(0, 10),
      weekday: d.toLocaleDateString("fa-IR", { weekday: "short" }),
      dayMonth: d.toLocaleDateString("fa-IR", { day: "numeric", month: "short" }),
      isToday: i === 0,
    });
  }
  return days;
}

type GoalValue = (typeof GOALS)[number]["value"];
type StatusValue = (typeof STATUSES)[number]["value"];
type ContactChannel = "call" | "whatsapp";
type SuccessPhase = "choice" | "schedule" | "done";

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
  const [successPhase, setSuccessPhase] = useState<SuccessPhase>("choice");
  const [contactChannel, setContactChannel] = useState<ContactChannel | null>(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const days = useMemo(() => getNextDays(7), []);

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
      setSuccessPhase("choice");
      setContactChannel(null);
      setSelectedDay("");
      setSelectedTime("");
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  const buildWhatsAppMessage = () =>
    [
      "سلام، درخواست بررسی اولیه سئو ثبت کردم.",
      `نام: ${name.trim()}`,
      `کسب‌وکار: ${businessName.trim()}`,
      businessInput.trim() ? `سایت/نام: ${businessInput.trim()}` : null,
      industry.trim() ? `حوزه: ${industry.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");

  const chooseChannel = (channel: ContactChannel) => {
    setContactChannel(channel);
    setError(null);
    trackSeoEvent(channel === "call" ? "seo_phone_click" : "seo_whatsapp_click", {
      goal: goal || undefined,
      business_type: industry.trim(),
    });

    if (channel === "whatsapp") {
      setSuccessPhase("done");
      return;
    }

    setSuccessPhase("schedule");
  };

  const confirmSchedule = async () => {
    if (!selectedDay || !selectedTime) {
      setError("روز و ساعت مناسب را انتخاب کنید.");
      return;
    }
    setError(null);
    setScheduleSaving(true);

    const dayLabel = days.find((d) => d.iso === selectedDay);
    const timeLabel = TIME_SLOTS.find((t) => t.value === selectedTime)?.label ?? selectedTime;
    const dayFa = dayLabel
      ? `${dayLabel.isToday ? "امروز" : dayLabel.weekday} ${dayLabel.dayMonth}`
      : selectedDay;

    try {
      const digits = toLatinDigits(phone).replace(/\D/g, "");
      const contact = "0" + digits.replace(/^0?/, "");
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "seo_hero_schedule",
          page: "/seo",
          name: name.trim(),
          contact,
          goal: "seo_callback",
          plan: "audit_initial",
          channel: "phone",
          company: businessName.trim(),
          detail: [
            `preferred_day: ${selectedDay}`,
            `preferred_day_fa: ${dayFa}`,
            `preferred_time: ${selectedTime}`,
            `preferred_time_fa: ${timeLabel}`,
            `contact_pref: call`,
          ].join(" | "),
          referrer: document.referrer || null,
          ...getUtmParams(),
        }),
      });
      trackSeoEvent("seo_lead_submit", {
        goal: "call",
        current_status: `${selectedDay}_${selectedTime}`,
        business_type: industry.trim(),
      });
    } catch {
      // scheduling note is best-effort
    } finally {
      setScheduleSaving(false);
      setSuccessPhase("done");
    }
  };

  if (success) {
    if (successPhase === "done") {
      const dayLabel = days.find((d) => d.iso === selectedDay);
      const timeLabel = TIME_SLOTS.find((t) => t.value === selectedTime)?.label ?? selectedTime;
      const dayFa = dayLabel
        ? `${dayLabel.isToday ? "امروز" : dayLabel.weekday} ${dayLabel.dayMonth}`
        : selectedDay;

      return (
        <div className="seo-hero-audit seo-hero-audit--success" role="status">
          <div className="seo-hero-audit-success-icon">
            <IconCheck size={28} />
          </div>
          <p className="seo-hero-audit-success-title">
            {contactChannel === "whatsapp" ? "آماده گفتگو در واتساپ" : "زمان‌تان ثبت شد"}
          </p>
          <p className="seo-hero-audit-success-text">
            {contactChannel === "whatsapp"
              ? "گفتگو در واتساپ باز شد. اگر صفحه باز نشد، دوباره از دکمه زیر اقدام کنید."
              : `تیم آرایه در ${dayFa}، ساعت ${timeLabel} با شما تماس می‌گیرد.`}
          </p>
          {contactChannel === "whatsapp" ? (
            <a
              href={siteWhatsAppUrl(buildWhatsAppMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="seo-btn-primary seo-hero-audit-channel-btn"
            >
              باز کردن واتساپ
            </a>
          ) : (
            <a href={SITE_PHONE_TEL} className="seo-btn-secondary seo-hero-audit-channel-btn">
              <IconPhone size={16} />
              تماس مستقیم
            </a>
          )}
        </div>
      );
    }

    if (successPhase === "schedule") {
      return (
        <div className="seo-hero-audit seo-hero-audit--success seo-hero-audit--schedule">
          <p className="seo-hero-audit-success-title">چه روز و ساعتی راحت‌ترید؟</p>
          <p className="seo-hero-audit-success-text">
            زمان مناسب تماس را انتخاب کنید تا همان بازه با شما هماهنگ شویم.
          </p>

          <p className="seo-hero-audit-cal-label">روز</p>
          <div className="seo-hero-audit-days" role="listbox" aria-label="انتخاب روز">
            {days.map((day) => (
              <button
                key={day.iso}
                type="button"
                role="option"
                aria-selected={selectedDay === day.iso}
                className={`seo-hero-audit-day ${selectedDay === day.iso ? "is-selected" : ""}`}
                onClick={() => {
                  setSelectedDay(day.iso);
                  if (error) setError(null);
                }}
              >
                <span className="seo-hero-audit-day-week">
                  {day.isToday ? "امروز" : day.weekday}
                </span>
                <span className="seo-hero-audit-day-date">{day.dayMonth}</span>
              </button>
            ))}
          </div>

          <p className="seo-hero-audit-cal-label">ساعت</p>
          <div className="seo-hero-audit-times" role="listbox" aria-label="انتخاب ساعت">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.value}
                type="button"
                role="option"
                aria-selected={selectedTime === slot.value}
                className={`seo-hero-audit-time ${selectedTime === slot.value ? "is-selected" : ""}`}
                onClick={() => {
                  setSelectedTime(slot.value);
                  if (error) setError(null);
                }}
              >
                {slot.label}
              </button>
            ))}
          </div>

          {error ? (
            <p className="seo-hero-audit-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="seo-hero-audit-actions seo-hero-audit-actions--center">
            <button
              type="button"
              className="seo-hero-audit-back"
              onClick={() => {
                setSuccessPhase("choice");
                setError(null);
              }}
            >
              بازگشت
            </button>
            <button
              type="button"
              className="seo-btn-primary"
              disabled={scheduleSaving}
              onClick={confirmSchedule}
            >
              {scheduleSaving ? "در حال ثبت..." : "تأیید زمان تماس"}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="seo-hero-audit seo-hero-audit--success" role="status">
        <div className="seo-hero-audit-success-icon">
          <IconCheck size={28} />
        </div>
        <p className="seo-hero-audit-success-title">درخواست بررسی اولیه ثبت شد</p>
        <p className="seo-hero-audit-success-text">
          چطور ادامه دهیم؟ تماس بگیریم یا در واتساپ هماهنگی کنیم.
        </p>
        <div className="seo-hero-audit-channels">
          <button
            type="button"
            className="seo-btn-primary seo-hero-audit-channel-btn"
            onClick={() => chooseChannel("call")}
          >
            <IconPhone size={16} />
            درخواست تماس
          </button>
          <a
            href={siteWhatsAppUrl(buildWhatsAppMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="seo-btn-secondary seo-hero-audit-channel-btn"
            onClick={() => chooseChannel("whatsapp")}
          >
            پیام در واتساپ
          </a>
        </div>
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

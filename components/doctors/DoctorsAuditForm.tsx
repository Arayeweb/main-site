"use client";

import { useEffect, useRef, useState } from "react";
import { getUtmParams } from "@/lib/utm";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";
import {
  DOCTORS_SLA,
  DOCTORS_SUCCESS_MESSAGE,
  buildDoctorsLeadDetail,
  doctorPresenceOptions,
  doctorPrimaryGoalOptions,
  type DoctorPresenceKey,
  type DoctorPrimaryGoalKey,
} from "@/lib/doctorsData";
import { DOCTORS_AUDIT_PREFILL_EVENT } from "@/lib/doctorsScroll";
import { IconCheck } from "@/components/icons";

const toLatinDigits = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/\D/g, "");

function isValidIranianMobile(value: string): boolean {
  return /^09\d{9}$/.test(toLatinDigits(value));
}

type DoctorsAuditFormProps = {
  source: string;
  showSampleLink?: boolean;
};

export default function DoctorsAuditForm({ source, showSampleLink = true }: DoctorsAuditFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [identity, setIdentity] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPresence, setCurrentPresence] = useState<DoctorPresenceKey | "">("");
  const [primaryGoal, setPrimaryGoal] = useState<DoctorPrimaryGoalKey | "">("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const startedRef = useRef(false);
  const liveRef = useRef<HTMLDivElement>(null);

  const markFormStarted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackDoctorsEvent("doctors_audit_form_start", { source });
  };

  useEffect(() => {
    const onPrefill = (e: Event) => {
      const value = (e as CustomEvent<{ value: string }>).detail?.value;
      if (value) {
        setIdentity(value);
        setStep(1);
        setSuccess(false);
      }
    };
    window.addEventListener(DOCTORS_AUDIT_PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(DOCTORS_AUDIT_PREFILL_EVENT, onPrefill);
  }, []);

  useEffect(() => {
    liveRef.current?.focus();
  }, [step, success]);

  const goToPhone = (e: React.FormEvent) => {
    e.preventDefault();
    markFormStarted();
    setError(null);
    if (identity.trim().length < 2) {
      setError("نام پزشک، کلینیک یا آدرس اینستاگرام را وارد کنید.");
      return;
    }
    trackDoctorsEvent("doctors_audit_step1_complete", { source });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (success || loading) return;

    setError(null);

    if (identity.trim().length < 2) {
      setError("نام پزشک، کلینیک یا آدرس اینستاگرام را وارد کنید.");
      setStep(1);
      return;
    }
    if (!isValidIranianMobile(phone)) {
      setError("شماره موبایل یا واتساپ را درست وارد کنید.");
      return;
    }

    setLoading(true);
    trackDoctorsEvent("doctors_audit_submit", {
      source,
      current_presence: currentPresence || undefined,
      primary_goal: primaryGoal || undefined,
    });

    try {
      const digits = toLatinDigits(phone);
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          page: "/doctors",
          name: identity.trim(),
          contact: digits,
          goal: "clinic_audit",
          plan: "free_report",
          channel: "doctors_landing",
          detail: buildDoctorsLeadDetail(identity, currentPresence, primaryGoal),
          consent: true,
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          company: "",
          ...getUtmParams(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        const msg =
          data.error === "rate_limited"
            ? "درخواست‌های زیاد. چند دقیقه بعد دوباره تلاش کنید."
            : "ثبت درخواست ناموفق بود. دوباره تلاش کنید.";
        setError(msg);
        trackDoctorsEvent("doctors_audit_error", { source, error: data.error || "submit_failed" });
        return;
      }
      trackDoctorsEvent("doctors_audit_success", {
        source,
        current_presence: currentPresence || undefined,
        primary_goal: primaryGoal || undefined,
      });
      trackDoctorsEvent("generate_lead", {
        source,
        goal: "clinic_audit",
        page: "doctors",
        current_presence: currentPresence || undefined,
        primary_goal: primaryGoal || undefined,
      });
      setSuccess(true);
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
      trackDoctorsEvent("doctors_audit_error", { source, error: "network" });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="rounded-3xl border border-sky-100 bg-white p-5 text-center shadow-card sm:p-6"
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-600">
          <IconCheck size={28} />
        </div>
        <p className="text-base font-extrabold text-sky-700">درخواست ثبت شد</p>
        <p className="mt-3 text-sm leading-relaxed text-navy-600">{DOCTORS_SUCCESS_MESSAGE}</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-card sm:p-6">
      <div ref={liveRef} tabIndex={-1} className="sr-only" aria-live="polite">
        {step === 1 ? "مرحله اول: نام پزشک یا کلینیک" : "مرحله دوم: شماره تماس و سؤالات اختیاری"}
      </div>

      {step === 1 ? (
        <form onSubmit={goToPhone} className="space-y-3" noValidate>
          <label htmlFor="doctors-audit-identity" className="mb-1 block text-[13px] font-bold text-navy-700">
            نام پزشک، کلینیک، سایت یا اینستاگرام
          </label>
          <input
            id="doctors-audit-identity"
            type="text"
            autoComplete="organization"
            placeholder="مثلاً دکتر احمدی یا instagram.com/..."
            value={identity}
            onFocus={markFormStarted}
            onChange={(e) => {
              setIdentity(e.target.value);
              if (error) setError(null);
            }}
            className="w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3.5 text-sm text-navy-900 outline-none transition focus:border-sky-400 focus:bg-white"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-sky-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98]"
          >
            ادامه
          </button>
          <p className="text-center text-[11px] text-navy-400">مرحله ۱ از ۲</p>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <p className="rounded-xl bg-sky-50 px-3 py-2 text-center text-xs text-navy-600">
            {identity}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mr-2 font-bold text-sky-700 hover:underline"
            >
              ویرایش
            </button>
          </p>

          <div>
            <label htmlFor="doctors-audit-phone" className="mb-1 block text-[13px] font-bold text-navy-700">
              شماره موبایل یا واتساپ
            </label>
            <input
              id="doctors-audit-phone"
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
              className="w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3.5 text-center text-sm text-navy-900 outline-none transition focus:border-sky-400 focus:bg-white disabled:opacity-60"
            />
          </div>

          <fieldset>
            <legend className="mb-2 block text-[12px] font-bold text-navy-700">
              الان چه چیزی دارید؟ <span className="font-normal text-navy-400">(اختیاری)</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {doctorPresenceOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() =>
                    setCurrentPresence((prev) => (prev === opt.key ? "" : opt.key))
                  }
                  className={`rounded-xl border px-3 py-2 text-[11px] font-bold transition-all ${
                    currentPresence === opt.key
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-navy-100 bg-navy-50/50 text-navy-600 hover:border-sky-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 block text-[12px] font-bold text-navy-700">
              مهم‌ترین هدفتان چیست؟ <span className="font-normal text-navy-400">(اختیاری)</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {doctorPrimaryGoalOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setPrimaryGoal((prev) => (prev === opt.key ? "" : opt.key))}
                  className={`rounded-xl border px-3 py-2 text-[11px] font-bold transition-all ${
                    primaryGoal === opt.key
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-navy-100 bg-navy-50/50 text-navy-600 hover:border-sky-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "در حال ثبت..." : "گزارش رایگان مطبم را بفرستید"}
          </button>
          <p className="text-center text-[11px] text-navy-400">مرحله ۲ از ۲</p>
        </form>
      )}

      {error ? (
        <p className="mt-3 text-center text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <p className="mt-4 text-center text-[12px] leading-relaxed text-navy-500">{DOCTORS_SLA}</p>

      <p className="mt-2 text-center text-[11px] leading-relaxed text-navy-400">
        وب‌سایت لازم نیست · اجرای پیشنهادها اختیاری است · بدون تماس فروش اجباری
      </p>

      {showSampleLink ? (
        <div className="mt-4 text-center">
          <a
            href="#sample-report"
            onClick={() => trackDoctorsEvent("doctors_sample_report_view", { source: "form_link" })}
            className="text-sm font-bold text-sky-700 transition-colors hover:text-sky-800"
          >
            مشاهده نمونه گزارش
          </a>
        </div>
      ) : null}
    </div>
  );
}

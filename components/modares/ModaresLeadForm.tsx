"use client";

import { useEffect, useRef, useState } from "react";
import type { ModaresVariant } from "@/lib/modaresData";
import {
  buildModaresLeadPayload,
  modaresWhatsAppUrl,
  submitModaresLead,
} from "@/lib/modaresLead";
import { modaresAnalyticsBase, trackModaresEvent } from "@/lib/modaresAnalytics";
import { isPhone, toLatin } from "@/lib/validateContact";

type FormStatus = "idle" | "loading" | "success";

export type ModaresLeadFormProps = {
  variant: ModaresVariant;
  anchorId: string;
  fieldId: string;
  phoneId: string;
  source: "modares_hero" | "modares_final";
  className?: string;
};

const SUBMIT_ERROR = "ثبت درخواست انجام نشد؛ دوباره تلاش کنید.";
const WHATSAPP_AUTO_OPEN_MS = 1500;

export default function ModaresLeadForm({
  variant,
  anchorId,
  fieldId,
  phoneId,
  source,
  className = "",
}: ModaresLeadFormProps) {
  const [field, setField] = useState("");
  const [phone, setPhone] = useState("");
  const [submittedField, setSubmittedField] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const formStartTracked = useRef(false);
  const whatsappAutoOpened = useRef(false);

  const fieldErrorId = `${fieldId}-error`;
  const phoneErrorId = `${phoneId}-error`;
  const analyticsBase = modaresAnalyticsBase(variant);

  const trackFormStart = () => {
    if (formStartTracked.current) return;
    formStartTracked.current = true;
    trackModaresEvent("teachers_form_start", {
      ...analyticsBase,
      form_location: source,
      teaching_field: field.trim() || undefined,
    });
  };

  const openWhatsApp = (autoOpen = false) => {
    if (!submittedField) return;
    trackModaresEvent("teachers_whatsapp_click", {
      ...analyticsBase,
      form_location: source,
      teaching_field: submittedField,
      auto_open: autoOpen,
    });
    window.open(modaresWhatsAppUrl(submittedField), "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    if (status !== "success" || !submittedField || whatsappAutoOpened.current) return;

    const timer = window.setTimeout(() => {
      whatsappAutoOpened.current = true;
      openWhatsApp(true);
    }, WHATSAPP_AUTO_OPEN_MS);

    return () => window.clearTimeout(timer);
  }, [status, submittedField]);

  const validate = (): boolean => {
    let valid = true;
    setFieldError(null);
    setPhoneError(null);
    setFormError(null);

    if (field.trim().length < 2) {
      setFieldError("حوزه تدریس را وارد کنید.");
      valid = false;
    }

    if (!isPhone(phone)) {
      setPhoneError("شماره موبایل معتبر وارد کنید.");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    setFormError(null);

    const teachingField = field.trim();
    const payload = buildModaresLeadPayload({
      teachingField,
      contact: phone,
      variant,
    });

    try {
      const result = await submitModaresLead(payload);

      if (!result.ok) {
        trackModaresEvent("teachers_lead_error", {
          ...analyticsBase,
          form_location: source,
          teaching_field: teachingField,
          error: result.error,
        });
        setStatus("idle");
        setFormError(
          result.error === "rate_limited"
            ? "درخواست‌های زیاد. چند دقیقه بعد دوباره تلاش کنید."
            : SUBMIT_ERROR,
        );
        return;
      }

      trackModaresEvent("teachers_lead_submit", {
        ...analyticsBase,
        form_location: source,
        teaching_field: teachingField,
        duplicate: result.duplicate,
      });

      setSubmittedField(teachingField);
      whatsappAutoOpened.current = false;
      setStatus("success");
      setField("");
      setPhone("");
    } catch {
      trackModaresEvent("teachers_lead_error", {
        ...analyticsBase,
        form_location: source,
        teaching_field: teachingField,
        error: "network",
      });
      setStatus("idle");
      setFormError(SUBMIT_ERROR);
    }
  };

  return (
    <div
      id={anchorId}
      data-modares-form
      className={`scroll-mt-20 rounded-2xl border border-navy-100 bg-white p-3.5 shadow-soft sm:p-5 ${className}`}
    >
      {status === "success" ? (
        <div
          className="rounded-xl border border-green-100 bg-green-50/60 px-4 py-5 text-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-bold text-green-800">درخواست شما ثبت شد.</p>
          <p className="mt-2 text-xs leading-relaxed text-green-700 sm:text-sm">
            برای دریافت سریع‌تر نمونه، گفتگو را در واتساپ ادامه دهید.
          </p>
          <button
            type="button"
            onClick={() => openWhatsApp(false)}
            className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-cyan-700 active:scale-[0.98]"
          >
            ادامه در واتساپ
          </button>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setSubmittedField("");
              whatsappAutoOpened.current = false;
            }}
            className="mt-3 block w-full text-xs font-bold text-cyan-700 hover:underline"
          >
            ثبت درخواست جدید
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-2.5 sm:space-y-3">
          <div>
            <label htmlFor={fieldId} className="mb-1.5 block text-xs font-bold text-navy-700 sm:text-sm">
              چه چیزی تدریس می‌کنید؟
            </label>
            <input
              id={fieldId}
              type="text"
              value={field}
              onFocus={trackFormStart}
              onChange={(e) => {
                setField(e.target.value);
                if (fieldError) setFieldError(null);
                if (formError) setFormError(null);
              }}
              placeholder="مثلاً زبان انگلیسی، ریاضی یا موسیقی"
              disabled={status === "loading"}
              aria-invalid={fieldError ? "true" : undefined}
              aria-describedby={fieldError ? fieldErrorId : undefined}
              className="w-full rounded-xl border border-navy-100 bg-navy-50/40 px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-cyan-400 focus:bg-white focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:opacity-60"
            />
            {fieldError && (
              <p id={fieldErrorId} className="mt-1.5 text-xs text-red-600" role="alert">
                {fieldError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={phoneId} className="mb-1.5 block text-xs font-bold text-navy-700 sm:text-sm">
              شماره موبایل
            </label>
            <input
              id={phoneId}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              value={phone}
              onFocus={trackFormStart}
              onChange={(e) => {
                const normalized = toLatin(e.target.value).replace(/[^\d+]/g, "");
                setPhone(normalized.slice(0, 14));
                if (phoneError) setPhoneError(null);
                if (formError) setFormError(null);
              }}
              placeholder="۰۹۱۲۱۲۳۴۵۶۷"
              disabled={status === "loading"}
              aria-invalid={phoneError ? "true" : undefined}
              aria-describedby={phoneError ? phoneErrorId : undefined}
              className="w-full rounded-xl border border-navy-100 bg-navy-50/40 px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-cyan-400 focus:bg-white focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:opacity-60"
            />
            {phoneError && (
              <p id={phoneErrorId} className="mt-1.5 text-xs text-red-600" role="alert">
                {phoneError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 motion-reduce:transform-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "در حال ارسال..." : "نمونه مرتبط را در واتساپ بفرستید"}
          </button>

          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          {formError && (
            <p className="text-center text-xs text-red-600" role="alert">
              {formError}
            </p>
          )}

          <p className="text-center text-[11px] leading-relaxed text-navy-400 sm:text-xs">
            با ثبت شماره، موافقت می‌کنید آرایه فقط درباره همین درخواست از طریق واتساپ با شما در
            ارتباط باشد.
          </p>
          <p className="text-center text-[11px] font-medium text-navy-500 sm:text-xs">
            بدون تماس تلفنی و بدون پیام‌های غیرمرتبط
          </p>
        </form>
      )}
    </div>
  );
}

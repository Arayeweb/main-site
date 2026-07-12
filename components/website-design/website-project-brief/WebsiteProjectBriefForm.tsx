"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import BriefRecommendationResult from "./BriefRecommendationResult";
import { getRecommendationPresentation } from "@/lib/websiteBrief/recommendationPresentation";
import type { RecommendedService } from "@/lib/websiteBrief/types";
import {
  type BriefStep,
  type BriefFormValues,
  type SubmitResult,
  useBriefDraft,
  validateStep,
  buildSubmitPayload,
  clearBriefDraft,
  getConfirmationBranch,
  inputClassName,
  cardOptionClass,
  acquisitionChannelOptions,
  advertisingStatusOptions,
  bookingTypeOptions,
  contentReadinessOptions,
  currentAssetOptions,
  customerGuidanceNeedOptions,
  customerScopeOptions,
  estimatedProductCountOptions,
  googleLeadStatusOptions,
  googleMapsStatusOptions,
  leadFollowupStatusOptions,
  primaryBusinessProblemOptions,
  primaryConversionGoalOptions,
  requiredSectionOptions,
} from "./briefFormUtils";
import { confirmationFieldForBranch } from "@/lib/websiteBrief/confirmation";
import { LOCAL_SCOPES, MAX_REQUIRED_SECTIONS } from "@/lib/websiteBrief/constants";
import type { RequiredSection } from "@/lib/websiteBrief/types";

const STEP_TITLES: Record<BriefStep, string> = {
  1: "شناخت کسب‌وکار",
  2: "نتیجه‌ای که از سایت می‌خواهید",
  3: "وضعیت فعلی کسب‌وکار",
  4: "مهم‌ترین مانع فعلی",
  5: "آمادگی و اطلاعات تماس",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-red-600" role="alert">
      {message}
    </p>
  );
}

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-navy-800">
      {children}
      {required ? <span className="text-red-500 mr-1">*</span> : null}
    </label>
  );
}

export default function WebsiteProjectBriefForm() {
  const { step, setStep, values, patchValues, submissionToken } = useBriefDraft();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [interestSaving, setInterestSaving] = useState(false);
  const [interestChoice, setInterestChoice] = useState<boolean | null>(null);
  const [interestMessage, setInterestMessage] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const submittedRef = useRef(false);

  const confirmationBranch = useMemo(() => getConfirmationBranch(values), [values]);
  const confirmationField = useMemo(
    () => confirmationFieldForBranch(confirmationBranch),
    [confirmationBranch]
  );

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      pushGtmEvent("website_brief_started", { step: 1, page: "/website-design/brief" });
    }
  }, []);

  useEffect(() => {
    pushGtmEvent("website_brief_step_viewed", { step, page: "/website-design/brief" });
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const toggleMulti = (
    key: "required_sections" | "acquisition_channels" | "current_assets",
    value: string,
    max: number,
    exclusive?: string
  ) => {
    const current = values[key] as string[];
    if (exclusive && value === exclusive) {
      patchValues({ [key]: [exclusive] } as Partial<BriefFormValues>);
      return;
    }
    let next = current.filter((v) => v !== exclusive);
    if (next.includes(value)) {
      next = next.filter((v) => v !== value);
    } else if (next.length < max) {
      next = [...next, value];
    }
    patchValues({ [key]: next } as Partial<BriefFormValues>);
  };

  const clearConfirmationFields = () => {
    patchValues({
      google_maps_status: "",
      google_lead_status: "",
      advertising_status: "",
      customer_guidance_need: "",
      lead_followup_status: "",
    });
  };

  const goNext = () => {
    const errors = validateStep(step, values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      pushGtmEvent("website_brief_validation_error", { step, page: "/website-design/brief" });
      return;
    }
    pushGtmEvent("website_brief_step_completed", { step, page: "/website-design/brief" });
    setStep((s) => Math.min(5, s + 1) as BriefStep);
    setFieldErrors({});
  };

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1) as BriefStep);
    setFieldErrors({});
  };

  const handleSubmit = async () => {
    if (submittedRef.current || submitting) return;
    const errors = validateStep(5, values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      pushGtmEvent("website_brief_validation_error", { step: 5, page: "/website-design/brief" });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    submittedRef.current = true;

    try {
      const res = await fetch("/api/website-project-briefs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": submissionToken,
        },
        body: JSON.stringify(buildSubmitPayload(values, submissionToken)),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        submittedRef.current = false;
        if (data.error === "rate_limited") {
          setSubmitError("درخواست‌های زیاد. چند دقیقه بعد دوباره تلاش کنید.");
        } else if (data.errors?.length) {
          const map: Record<string, string> = {};
          for (const e of data.errors) map[e.field] = e.message;
          setFieldErrors(map);
          setSubmitError("لطفاً موارد مشخص‌شده را اصلاح کنید.");
        } else {
          setSubmitError("مشکلی در ثبت اطلاعات پیش آمد. لطفاً دوباره تلاش کنید.");
        }
        return;
      }

      clearBriefDraft();
      pushGtmEvent("website_brief_submitted", {
        step: 5,
        page: "/website-design/brief",
        recommended_service: data.recommendedService,
      });
      setResult({
        submissionId: data.submissionId,
        recommendedService: data.recommendedService,
        recommendationMessage: data.recommendationMessage,
        recommendationReasonCode: data.recommendationReasonCode,
        serviceLabel: data.serviceLabel,
      });
      pushGtmEvent("recommendation_viewed", {
        page: "/website-design/brief",
        recommended_service: data.recommendedService,
      });
    } catch {
      submittedRef.current = false;
      setSubmitError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveInterest = async (interested: boolean) => {
    if (!result || interestSaving || interestChoice !== null) return;
    setInterestSaving(true);
    try {
      const res = await fetch(`/api/website-project-briefs/${result.submissionId}/recommendation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interested }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setInterestMessage("ثبت پاسخ شما انجام نشد. لطفاً دوباره تلاش کنید.");
        return;
      }
      setInterestChoice(interested);
      pushGtmEvent(interested ? "recommendation_accepted" : "recommendation_declined", {
        page: "/website-design/brief",
        recommended_service: result.recommendedService,
      });
      const pres = getRecommendationPresentation(
        result.recommendedService as RecommendedService,
        result.recommendationMessage,
        result.serviceLabel
      );
      setInterestMessage(interested ? pres.acceptedMessage : pres.declinedMessage);
    } catch {
      setInterestMessage("خطا در ارتباط. لطفاً دوباره تلاش کنید.");
    } finally {
      setInterestSaving(false);
    }
  };

  if (result) {
    return (
      <div ref={topRef}>
        <BriefRecommendationResult
          result={result}
          interestChoice={interestChoice}
          interestSaving={interestSaving}
          interestMessage={interestMessage}
          onAccept={() => void saveInterest(true)}
          onDecline={() => void saveInterest(false)}
        />
      </div>
    );
  }

  return (
    <div ref={topRef} className="mx-auto max-w-xl px-4 py-8 sm:py-10" dir="rtl">
      <header className="mb-8 text-center sm:mb-10">
        <h1 className="text-2xl font-bold text-navy-900 sm:text-3xl">فرم کوتاه شروع پروژه طراحی سایت</h1>
        <p className="mt-3 text-sm leading-7 text-navy-600 sm:text-base">
          برای اینکه سایت شما متناسب با کسب‌وکار، مشتریان و هدف اصلی‌تان طراحی شود، لطفاً به چند سؤال کوتاه
          پاسخ دهید.
        </p>
        <p className="mt-2 text-xs text-navy-500">زمان تقریبی تکمیل: حدود ۲ دقیقه</p>
      </header>

      <div
        className="mb-6"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={5}
        aria-label={`مرحله ${step} از ۵`}
      >
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-navy-600">
          <span>مرحله {step} از ۵</span>
          <span>{STEP_TITLES[step]}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-navy-100">
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <form
        className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm sm:p-7"
        onSubmit={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
            e.preventDefault();
          }
        }}
      >
        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="business_name" required>
                نام کسب‌وکار یا برند شما چیست؟
              </Label>
              <input
                id="business_name"
                className={inputClassName}
                value={values.business_name}
                maxLength={150}
                onChange={(e) => patchValues({ business_name: e.target.value })}
              />
              <FieldError message={fieldErrors.business_name} />
            </div>
            <div>
              <Label htmlFor="business_summary" required>
                در یک جمله بگویید چه کاری انجام می‌دهید و مهم‌ترین خدمت یا محصولتان چیست؟
              </Label>
              <textarea
                id="business_summary"
                className={`${inputClassName} min-h-[100px] resize-y`}
                value={values.business_summary}
                maxLength={250}
                onChange={(e) => patchValues({ business_summary: e.target.value })}
              />
              <p className="mt-1 text-xs text-navy-400">{values.business_summary.length}/250</p>
              <p className="mt-1 text-xs text-navy-500">
                برای مثال: خدمات تخصصی پوست و زیبایی ارائه می‌دهیم و تمرکز اصلی ما روی درمان لک و جوان‌سازی است.
              </p>
              <FieldError message={fieldErrors.business_summary} />
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-navy-800">
                مشتریان شما بیشتر از کدام محدوده هستند؟ <span className="text-red-500">*</span>
              </legend>
              <div className="space-y-2">
                {customerScopeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={cardOptionClass(values.customer_scope === opt.value)}
                    onClick={() => {
                      patchValues({
                        customer_scope: opt.value,
                        primary_location: LOCAL_SCOPES.includes(opt.value) ? values.primary_location : "",
                      });
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <FieldError message={fieldErrors.customer_scope} />
            </fieldset>
            {values.customer_scope && LOCAL_SCOPES.includes(values.customer_scope) ? (
              <div className="animate-in fade-in duration-200">
                <Label htmlFor="primary_location" required>
                  شهر یا محدوده اصلی فعالیت شما کجاست؟
                </Label>
                <input
                  id="primary_location"
                  className={inputClassName}
                  value={values.primary_location}
                  maxLength={150}
                  onChange={(e) => patchValues({ primary_location: e.target.value })}
                />
                <FieldError message={fieldErrors.primary_location} />
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-6">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-navy-800">
                مهم‌ترین کاری که دوست دارید بازدیدکننده در سایت انجام دهد چیست؟{" "}
                <span className="text-red-500">*</span>
              </legend>
              <div className="space-y-2">
                {primaryConversionGoalOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={cardOptionClass(values.primary_conversion_goal === opt.value)}
                    onClick={() => patchValues({ primary_conversion_goal: opt.value })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <FieldError message={fieldErrors.primary_conversion_goal} />
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-navy-800">
                برای نسخه اول سایت، کدام بخش‌ها ضروری هستند؟ (حداکثر ۵ مورد){" "}
                <span className="text-red-500">*</span>
              </legend>
              <div className="space-y-2">
                {requiredSectionOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={cardOptionClass(values.required_sections.includes(opt.value))}
                    onClick={() => {
                      toggleMulti("required_sections", opt.value, MAX_REQUIRED_SECTIONS, "needs_araaye_advice");
                      const next = opt.value === "needs_araaye_advice"
                        ? ["needs_araaye_advice" as RequiredSection]
                        : values.required_sections.includes("needs_araaye_advice")
                          ? [opt.value as RequiredSection]
                          : values.required_sections.includes(opt.value)
                            ? values.required_sections.filter((v) => v !== opt.value)
                            : values.required_sections.length < MAX_REQUIRED_SECTIONS
                              ? [...values.required_sections, opt.value as RequiredSection]
                              : values.required_sections;
                      patchValues({
                        required_sections: next,
                        booking_type: next.includes("appointment_booking") ? values.booking_type : "",
                        estimated_product_count: next.includes("ecommerce_payment")
                          ? values.estimated_product_count
                          : "",
                        required_languages: next.includes("multilingual") ? values.required_languages : "",
                      });
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <FieldError message={fieldErrors.required_sections} />
            </fieldset>
            {values.required_sections.includes("appointment_booking") ? (
              <fieldset className="animate-in fade-in duration-200">
                <legend className="mb-2 text-sm font-medium text-navy-800">رزرو موردنظر شما چگونه است؟</legend>
                <div className="space-y-2">
                  {bookingTypeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={cardOptionClass(values.booking_type === opt.value)}
                      onClick={() => patchValues({ booking_type: opt.value })}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <FieldError message={fieldErrors.booking_type} />
              </fieldset>
            ) : null}
            {values.required_sections.includes("ecommerce_payment") ? (
              <fieldset className="animate-in fade-in duration-200">
                <legend className="mb-2 text-sm font-medium text-navy-800">
                  تقریباً چند محصول در سایت قرار می‌گیرد؟
                </legend>
                <div className="space-y-2">
                  {estimatedProductCountOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={cardOptionClass(values.estimated_product_count === opt.value)}
                      onClick={() => patchValues({ estimated_product_count: opt.value })}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <FieldError message={fieldErrors.estimated_product_count} />
              </fieldset>
            ) : null}
            {values.required_sections.includes("multilingual") ? (
              <div className="animate-in fade-in duration-200">
                <Label htmlFor="required_languages" required>
                  سایت به چه زبان‌هایی نیاز دارد؟
                </Label>
                <input
                  id="required_languages"
                  className={inputClassName}
                  value={values.required_languages}
                  maxLength={150}
                  onChange={(e) => patchValues({ required_languages: e.target.value })}
                />
                <FieldError message={fieldErrors.required_languages} />
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-6">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-navy-800">
                مشتریان جدید در حال حاضر بیشتر از چه طریقی شما را پیدا می‌کنند؟ (حداکثر ۲ مورد){" "}
                <span className="text-red-500">*</span>
              </legend>
              <div className="space-y-2">
                {acquisitionChannelOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={cardOptionClass(values.acquisition_channels.includes(opt.value))}
                    onClick={() => toggleMulti("acquisition_channels", opt.value, 2, "no_consistent_channel")}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <FieldError message={fieldErrors.acquisition_channels} />
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-navy-800">
                در حال حاضر کدام موارد را در اختیار دارید؟ <span className="text-red-500">*</span>
              </legend>
              <div className="space-y-2">
                {currentAssetOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={cardOptionClass(values.current_assets.includes(opt.value))}
                    onClick={() => {
                      toggleMulti("current_assets", opt.value, 20, "none");
                      const hasSite = opt.value === "active_website"
                        ? !values.current_assets.includes("active_website")
                        : values.current_assets.includes("active_website") && opt.value !== "none";
                      patchValues({
                        current_website_url: hasSite ? values.current_website_url : "",
                      });
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <FieldError message={fieldErrors.current_assets} />
            </fieldset>
            {values.current_assets.includes("active_website") ? (
              <div className="animate-in fade-in duration-200">
                <Label htmlFor="current_website_url">آدرس سایت فعلی را وارد کنید.</Label>
                <input
                  id="current_website_url"
                  type="url"
                  inputMode="url"
                  className={inputClassName}
                  dir="ltr"
                  placeholder="example.com"
                  value={values.current_website_url}
                  onChange={(e) => patchValues({ current_website_url: e.target.value })}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-6">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-navy-800">
                کدام جمله بیشتر شبیه وضعیت فعلی کسب‌وکار شماست؟ <span className="text-red-500">*</span>
              </legend>
              <div className="space-y-2">
                {primaryBusinessProblemOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={cardOptionClass(values.primary_business_problem === opt.value)}
                    onClick={() => {
                      patchValues({ primary_business_problem: opt.value });
                      clearConfirmationFields();
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <FieldError message={fieldErrors.primary_business_problem} />
            </fieldset>

            {confirmationField === "google_maps_status" ? (
              <ConfirmField
                legend="وضعیت فعلی اطلاعات کسب‌وکارتان در Google Maps چگونه است؟"
                options={googleMapsStatusOptions}
                value={values.google_maps_status}
                onChange={(v) => patchValues({ google_maps_status: v as typeof values.google_maps_status })}
                error={fieldErrors.google_maps_status}
              />
            ) : null}
            {confirmationField === "google_lead_status" ? (
              <ConfirmField
                legend="آیا در حال حاضر از جست‌وجوی گوگل تماس یا درخواست قابل‌توجهی دریافت می‌کنید؟"
                options={googleLeadStatusOptions}
                value={values.google_lead_status}
                onChange={(v) => patchValues({ google_lead_status: v as typeof values.google_lead_status })}
                error={fieldErrors.google_lead_status}
              />
            ) : null}
            {confirmationField === "advertising_status" ? (
              <ConfirmField
                legend="وضعیت تبلیغات اینترنتی شما چگونه است؟"
                options={advertisingStatusOptions}
                value={values.advertising_status}
                onChange={(v) => patchValues({ advertising_status: v as typeof values.advertising_status })}
                error={fieldErrors.advertising_status}
              />
            ) : null}
            {confirmationField === "customer_guidance_need" ? (
              <ConfirmField
                legend="بیشتر مشتریان قبل از تماس یا خرید چه کمکی نیاز دارند؟"
                options={customerGuidanceNeedOptions}
                value={values.customer_guidance_need}
                onChange={(v) => patchValues({ customer_guidance_need: v as typeof values.customer_guidance_need })}
                error={fieldErrors.customer_guidance_need}
              />
            ) : null}
            {confirmationField === "lead_followup_status" ? (
              <ConfirmField
                legend="درخواست‌های مشتریان در حال حاضر چگونه ثبت و پیگیری می‌شوند؟"
                options={leadFollowupStatusOptions}
                value={values.lead_followup_status}
                onChange={(v) => patchValues({ lead_followup_status: v as typeof values.lead_followup_status })}
                error={fieldErrors.lead_followup_status}
              />
            ) : null}
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-6">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-navy-800">
                برای شروع پروژه در چه وضعیتی هستید؟ <span className="text-red-500">*</span>
              </legend>
              <div className="space-y-2">
                {contentReadinessOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={cardOptionClass(values.content_readiness === opt.value)}
                    onClick={() => patchValues({ content_readiness: opt.value })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <FieldError message={fieldErrors.content_readiness} />
            </fieldset>
            <div>
              <Label htmlFor="contact_name" required>
                نام و نام خانوادگی
              </Label>
              <input
                id="contact_name"
                className={inputClassName}
                value={values.contact_name}
                maxLength={100}
                onChange={(e) => patchValues({ contact_name: e.target.value })}
              />
              <FieldError message={fieldErrors.contact_name} />
            </div>
            <div>
              <Label htmlFor="contact_phone" required>
                شماره موبایل یا واتساپ
              </Label>
              <input
                id="contact_phone"
                type="tel"
                inputMode="tel"
                className={inputClassName}
                dir="ltr"
                value={values.contact_phone}
                onChange={(e) => patchValues({ contact_phone: e.target.value })}
              />
              <FieldError message={fieldErrors.contact_phone} />
            </div>
            <div>
              <Label htmlFor="additional_notes">توضیح دیگری درباره پروژه دارید؟</Label>
              <textarea
                id="additional_notes"
                className={`${inputClassName} min-h-[88px] resize-y`}
                value={values.additional_notes}
                maxLength={500}
                onChange={(e) => patchValues({ additional_notes: e.target.value })}
              />
              <p className="mt-1 text-xs text-navy-400">{values.additional_notes.length}/500</p>
            </div>
          </div>
        ) : null}

        {submitError ? (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {step > 1 ? (
            <button type="button" onClick={goBack} className="btn-secondary px-6 py-3 text-sm">
              بازگشت
            </button>
          ) : (
            <span />
          )}
          {step < 5 ? (
            <button type="button" onClick={goNext} className="btn-primary px-6 py-3 text-sm sm:ms-auto">
              ادامه
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleSubmit()}
              className="btn-primary px-6 py-3 text-sm disabled:opacity-60 sm:ms-auto"
            >
              {submitting ? "در حال ثبت..." : "ثبت اطلاعات و مشاهده پیشنهاد"}
            </button>
          )}
        </div>

        <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
      </form>
    </div>
  );
}

function ConfirmField<T extends string>({
  legend,
  options,
  value,
  onChange,
  error,
}: {
  legend: string;
  options: { value: T; label: string }[];
  value: string;
  onChange: (v: T) => void;
  error?: string;
}) {
  return (
    <fieldset className="animate-in fade-in duration-200 rounded-xl border border-teal-100 bg-teal-50/30 p-4">
      <legend className="mb-3 text-sm font-medium text-navy-800">{legend}</legend>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={cardOptionClass(value === opt.value)}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}

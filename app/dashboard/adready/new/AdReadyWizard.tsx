"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  CircleHelp,
  GraduationCap,
  HeartPulse,
  LayoutTemplate,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Rocket,
  Save,
  ShoppingBag,
  Sparkles,
  Store,
  Target,
} from "lucide-react";
import type { CampaignPage } from "@/lib/adready";
import {
  validateCampaignPageContent,
  type CampaignPageContent,
} from "@/lib/adreadyContent";
import { pushGtmEvent } from "@/lib/gtm";
import { buildAdReadyLoginUrl } from "@/lib/adreadyAuth";

type FormState = {
  campaignGoal: string;
  businessName: string;
  businessType: string;
  city: string;
  websiteOrInstagram: string;
  contactPhone: string;
  whatsappNumber: string;
  telegramUsername: string;
  productOrServiceName: string;
  shortDescription: string;
  priceRange: string;
  mainBenefit: string;
  targetAudience: string;
  campaignChannel: string;
  campaignTone: string;
  templateKey: string;
};

type ApiEnvelope = {
  ok?: boolean;
  error?: string;
  reused?: boolean;
  campaignPage?: CampaignPage;
  generatedContent?: unknown;
};

const INITIAL_FORM: FormState = {
  campaignGoal: "",
  businessName: "",
  businessType: "",
  city: "",
  websiteOrInstagram: "",
  contactPhone: "",
  whatsappNumber: "",
  telegramUsername: "",
  productOrServiceName: "",
  shortDescription: "",
  priceRange: "",
  mainBenefit: "",
  targetAudience: "",
  campaignChannel: "",
  campaignTone: "",
  templateKey: "",
};

const GOALS = [
  "جذب لید",
  "فروش محصول",
  "رزرو مشاوره",
  "ثبت‌نام دوره",
  "معرفی خدمت",
  "ثبت‌نام رویداد",
  "دریافت تماس",
  "تست پیشنهاد",
] as const;

const CHANNELS = [
  ["Google", "گوگل"],
  ["Yektanet", "یکتانت"],
  ["Telegram", "تلگرام"],
  ["Instagram", "اینستاگرام"],
  ["Rubika", "روبیکا"],
  ["Bale", "بله"],
  ["Other", "سایر"],
] as const;

const TONES = [
  ["serious", "جدی"],
  ["friendly", "صمیمی"],
  ["luxury", "لوکس"],
  ["direct", "مستقیم"],
  ["educational", "آموزشی"],
] as const;

const STEPS = [
  "هدف کمپین",
  "کسب‌وکار",
  "پیشنهاد",
  "تولید با AI",
  "قالب",
  "پیش‌نمایش",
] as const;

const TEMPLATES = [
  {
    key: "clean-service",
    title: "Clean Service",
    description: "شفاف و مینیمال برای معرفی و فروش خدمات",
    icon: BadgeCheck,
    swatch: "mint",
  },
  {
    key: "local-business",
    title: "Local Business",
    description: "مناسب کسب‌وکارهای محلی و تماس سریع",
    icon: Store,
    swatch: "amber",
  },
  {
    key: "online-shop",
    title: "Online Shop",
    description: "محصول‌محور با تأکید روی مزایا و خرید",
    icon: ShoppingBag,
    swatch: "coral",
  },
  {
    key: "clinic",
    title: "Clinic",
    description: "آرام و حرفه‌ای برای کلینیک و پزشک",
    icon: HeartPulse,
    swatch: "sky",
  },
  {
    key: "education",
    title: "Education",
    description: "ساختار آموزشی برای دوره و ثبت‌نام",
    icon: GraduationCap,
    swatch: "violet",
  },
  {
    key: "saas",
    title: "SaaS",
    description: "مدرن و دقیق برای محصول نرم‌افزاری",
    icon: Rocket,
    swatch: "navy",
  },
] as const;

function campaignPayload(form: FormState) {
  return {
    title: `${form.businessName} — ${form.productOrServiceName}`.slice(0, 200),
    goal: form.campaignGoal,
    businessName: form.businessName,
    businessType: form.businessType,
    city: form.city,
    websiteOrInstagram: form.websiteOrInstagram,
    contactPhone: form.contactPhone,
    whatsappNumber: form.whatsappNumber,
    telegramUsername: form.telegramUsername,
    productOrServiceName: form.productOrServiceName,
    shortDescription: form.shortDescription,
    priceRange: form.priceRange,
    mainBenefit: form.mainBenefit,
    targetAudience: form.targetAudience,
    campaignChannel: form.campaignChannel,
    campaignTone: form.campaignTone,
  };
}

function errorMessage(code?: string) {
  switch (code) {
    case "ai_error":
      return "ارتباط با سرویس هوش مصنوعی برقرار نشد. کمی بعد دوباره تلاش کنید.";
    case "invalid_ai_output":
      return "خروجی AI ساختار معتبر نداشت. چیزی ذخیره نشد؛ دوباره تلاش کنید.";
    case "save_failed":
      return "محتوا تولید شد اما ذخیره نشد. برای جلوگیری از دوباره‌کاری، دوباره تلاش کنید.";
    case "incomplete_campaign":
      return "اطلاعات ضروری کمپین کامل نیست. به مراحل قبل برگردید.";
    case "generatedContent_server_managed":
      return "محتوای AI فقط باید توسط سرور ذخیره شود.";
    default:
      return "عملیات انجام نشد. اتصال اینترنت را بررسی و دوباره تلاش کنید.";
  }
}

export default function AdReadyWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [draftId, setDraftId] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<CampaignPageContent | null>(
    null
  );
  const [busy, setBusy] = useState<"saving" | "generating" | "finishing" | null>(
    null
  );
  const [requestError, setRequestError] = useState("");
  const [finalSaved, setFinalSaved] = useState(false);

  useEffect(() => {
    pushGtmEvent("adready_wizard_start");
  }, []);

  const progress = useMemo(
    () => Math.round(((step + 1) / STEPS.length) * 100),
    [step]
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setRequestError("");
    setFinalSaved(false);
  }

  function requireFields(fields: Array<keyof FormState>) {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    for (const field of fields) {
      if (!form[field].trim()) nextErrors[field] = "این فیلد الزامی است.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function redirectToLogin() {
    window.location.assign(
      buildAdReadyLoginUrl({ mode: "register", next: "/dashboard/adready/new" }),
    );
  }

  async function apiRequest(url: string, init?: RequestInit): Promise<ApiEnvelope> {
    const response = await fetch(url, {
      credentials: "same-origin",
      cache: "no-store",
      ...init,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
    if (response.status === 401) {
      redirectToLogin();
      throw new Error("unauthorized");
    }
    const data = (await response.json().catch(() => ({}))) as ApiEnvelope;
    if (!response.ok || !data.ok) {
      throw new Error(data.error || "request_failed");
    }
    return data;
  }

  async function saveDraft() {
    const payload = campaignPayload(form);
    const data = draftId
      ? await apiRequest(`/api/adready/campaigns/${draftId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      : await apiRequest("/api/adready/campaigns", {
          method: "POST",
          body: JSON.stringify(payload),
        });
    const id = data.campaignPage?.id || draftId;
    if (!id) throw new Error("missing_campaign");
    if (!draftId) {
      setDraftId(id);
      pushGtmEvent("adready_draft_created", { campaign_id: id });
    }
    return id;
  }

  function nextSimple(event: FormEvent, fields: Array<keyof FormState>) {
    event.preventDefault();
    if (!requireFields(fields)) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  async function saveOfferAndContinue(event: FormEvent) {
    event.preventDefault();
    if (
      !requireFields([
        "productOrServiceName",
        "shortDescription",
        "mainBenefit",
        "targetAudience",
        "campaignChannel",
        "campaignTone",
      ])
    ) {
      return;
    }

    setBusy("saving");
    setRequestError("");
    try {
      await saveDraft();
      setStep(3);
    } catch (error) {
      if ((error as Error).message !== "unauthorized") {
        setRequestError(errorMessage((error as Error).message));
      }
    } finally {
      setBusy(null);
    }
  }

  async function readSavedContent(id: string) {
    const data = await apiRequest(`/api/adready/campaigns/${id}`);
    const validation = validateCampaignPageContent(data.campaignPage?.generatedContent);
    if (!validation.success) throw new Error("invalid_saved_content");
    return validation.data;
  }

  async function generateContent() {
    setBusy("generating");
    setRequestError("");
    pushGtmEvent("adready_ai_generate_click", {
      campaign_id: draftId || undefined,
    });
    try {
      const id = await saveDraft();
      const result = await apiRequest(`/api/adready/campaigns/${id}/generate`, {
        method: "POST",
      });
      const content = await readSavedContent(id);
      setGeneratedContent(content);
      pushGtmEvent("adready_ai_generate_success", {
        campaign_id: id,
        reused: result.reused === true,
      });
      setStep(4);
    } catch (error) {
      if ((error as Error).message !== "unauthorized") {
        const code = (error as Error).message;
        setRequestError(errorMessage(code));
        pushGtmEvent("adready_ai_generate_error", {
          campaign_id: draftId || undefined,
          error_code: code,
        });
      }
    } finally {
      setBusy(null);
    }
  }

  async function selectTemplate(templateKey: string) {
    update("templateKey", templateKey);
    if (!draftId) return;
    try {
      await apiRequest(`/api/adready/campaigns/${draftId}`, {
        method: "PATCH",
        body: JSON.stringify({ templateKey }),
      });
      pushGtmEvent("adready_template_selected", {
        campaign_id: draftId,
        template_key: templateKey,
      });
    } catch (error) {
      if ((error as Error).message !== "unauthorized") {
        setRequestError(errorMessage((error as Error).message));
      }
    }
  }

  async function openPreview() {
    if (!form.templateKey || !draftId || !generatedContent) return;
    setBusy("saving");
    setRequestError("");
    try {
      await apiRequest(`/api/adready/campaigns/${draftId}`, {
        method: "PATCH",
        body: JSON.stringify({ ...campaignPayload(form), templateKey: form.templateKey }),
      });
      setStep(5);
      pushGtmEvent("adready_preview_view", { campaign_id: draftId });
    } catch (error) {
      if ((error as Error).message !== "unauthorized") {
        setRequestError(errorMessage((error as Error).message));
      }
    } finally {
      setBusy(null);
    }
  }

  async function finishDraft() {
    if (!draftId || !generatedContent || !form.templateKey) return;
    setBusy("finishing");
    setRequestError("");
    try {
      await apiRequest(`/api/adready/campaigns/${draftId}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...campaignPayload(form),
          templateKey: form.templateKey,
          status: "preview",
        }),
      });
      setFinalSaved(true);
      window.location.assign(`/dashboard/adready/pages/${draftId}`);
    } catch (error) {
      if ((error as Error).message !== "unauthorized") {
        setRequestError(errorMessage((error as Error).message));
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="arw-shell" dir="rtl">
      <header className="arw-topbar">
        <Link className="arw-brand" href="/adready" aria-label="کمپین‌ساز آرایه">
          <span className="arw-brand-mark">
            <Sparkles size={18} />
          </span>
          <span>
            <strong>کمپین‌ساز آرایه</strong>
            <small>ساخت پیش‌نویس کمپین</small>
          </span>
        </Link>
        <span className="arw-draft-badge">
          <span />
          {draftId ? "پیش‌نویس ذخیره شده" : "پیش‌نویس جدید"}
        </span>
      </header>

      <main className="arw-main">
        <section className="arw-progress" aria-label="مراحل ساخت کمپین">
          <div className="arw-progress-head">
            <span>
              مرحله {step + 1} از {STEPS.length}
            </span>
            <strong>{STEPS[step]}</strong>
          </div>
          <div className="arw-progress-track" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <ol className="arw-step-list">
            {STEPS.map((label, index) => (
              <li
                key={label}
                className={`${index === step ? "is-current" : ""} ${
                  index < step ? "is-done" : ""
                }`}
                aria-current={index === step ? "step" : undefined}
              >
                <span>{index < step ? <Check size={14} /> : index + 1}</span>
                <small>{label}</small>
              </li>
            ))}
          </ol>
        </section>

        <section className={`arw-card ${step === 5 ? "arw-card-preview" : ""}`}>
          {step === 0 && (
            <form onSubmit={(event) => nextSimple(event, ["campaignGoal"])}>
              <StepHeading
                eyebrow="شروع کمپین"
                title="می‌خواهید این کمپین چه کاری انجام دهد؟"
                description="یک هدف اصلی انتخاب کنید تا متن و ساختار صفحه روی همان نتیجه متمرکز شود."
                icon={<Target size={21} />}
              />
              <div className="arw-choice-grid arw-goal-grid">
                {GOALS.map((goal) => (
                  <button
                    type="button"
                    key={goal}
                    className={form.campaignGoal === goal ? "is-selected" : ""}
                    onClick={() => update("campaignGoal", goal)}
                    aria-pressed={form.campaignGoal === goal}
                  >
                    <span className="arw-radio-dot" />
                    {goal}
                  </button>
                ))}
              </div>
              {errors.campaignGoal && (
                <p className="arw-field-error">{errors.campaignGoal}</p>
              )}
              <WizardActions primaryLabel="ادامه" />
            </form>
          )}

          {step === 1 && (
            <form
              onSubmit={(event) =>
                nextSimple(event, ["businessName", "businessType", "contactPhone"])
              }
            >
              <StepHeading
                eyebrow="شناخت کسب‌وکار"
                title="درباره کسب‌وکارتان بگویید"
                description="این اطلاعات برای شخصی‌سازی متن و نمایش راه‌های تماس استفاده می‌شود."
                icon={<Building2 size={21} />}
              />
              <div className="arw-fields">
                <Field
                  label="نام کسب‌وکار"
                  required
                  error={errors.businessName}
                  className="arw-field-wide"
                >
                  <input
                    value={form.businessName}
                    onChange={(event) => update("businessName", event.target.value)}
                    placeholder="مثلاً کلینیک مهر"
                    autoComplete="organization"
                  />
                </Field>
                <Field label="نوع کسب‌وکار" required error={errors.businessType}>
                  <input
                    value={form.businessType}
                    onChange={(event) => update("businessType", event.target.value)}
                    placeholder="مثلاً کلینیک زیبایی"
                  />
                </Field>
                <Field label="شهر" error={errors.city}>
                  <div className="arw-input-icon">
                    <MapPin size={17} />
                    <input
                      value={form.city}
                      onChange={(event) => update("city", event.target.value)}
                      placeholder="تهران"
                      autoComplete="address-level2"
                    />
                  </div>
                </Field>
                <Field
                  label="وب‌سایت یا اینستاگرام"
                  hint="اختیاری"
                  error={errors.websiteOrInstagram}
                >
                  <input
                    value={form.websiteOrInstagram}
                    onChange={(event) =>
                      update("websiteOrInstagram", event.target.value)
                    }
                    placeholder="example.com یا @brand"
                    dir="ltr"
                  />
                </Field>
                <Field label="شماره تماس" required error={errors.contactPhone}>
                  <input
                    value={form.contactPhone}
                    onChange={(event) => update("contactPhone", event.target.value)}
                    placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                    inputMode="tel"
                    autoComplete="tel"
                    dir="ltr"
                  />
                </Field>
                <Field label="شماره واتساپ" hint="اختیاری">
                  <input
                    value={form.whatsappNumber}
                    onChange={(event) => update("whatsappNumber", event.target.value)}
                    placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                    inputMode="tel"
                    dir="ltr"
                  />
                </Field>
                <Field label="نام کاربری تلگرام" hint="اختیاری">
                  <input
                    value={form.telegramUsername}
                    onChange={(event) =>
                      update("telegramUsername", event.target.value)
                    }
                    placeholder="@username"
                    dir="ltr"
                  />
                </Field>
              </div>
              <WizardActions primaryLabel="ادامه" onBack={() => setStep(0)} />
            </form>
          )}

          {step === 2 && (
            <form onSubmit={saveOfferAndContinue}>
              <StepHeading
                eyebrow="پیشنهاد کمپین"
                title="دقیقاً چه چیزی را پیشنهاد می‌کنید؟"
                description="جزئیات روشن، خروجی AI را کاربردی‌تر و متن فروش را متقاعدکننده‌تر می‌کند."
                icon={<Sparkles size={21} />}
              />
              <div className="arw-fields">
                <Field
                  label="نام محصول یا خدمت"
                  required
                  error={errors.productOrServiceName}
                >
                  <input
                    value={form.productOrServiceName}
                    onChange={(event) =>
                      update("productOrServiceName", event.target.value)
                    }
                    placeholder="مثلاً مشاوره اولیه پوست"
                  />
                </Field>
                <Field label="بازه قیمت" hint="اختیاری" error={errors.priceRange}>
                  <input
                    value={form.priceRange}
                    onChange={(event) => update("priceRange", event.target.value)}
                    placeholder="مثلاً از ۵۰۰ هزار تومان"
                  />
                </Field>
                <Field
                  label="توضیح کوتاه پیشنهاد"
                  required
                  error={errors.shortDescription}
                  className="arw-field-wide"
                >
                  <textarea
                    value={form.shortDescription}
                    onChange={(event) =>
                      update("shortDescription", event.target.value)
                    }
                    placeholder="در دو یا سه جمله بگویید مشتری چه چیزی دریافت می‌کند."
                    rows={4}
                  />
                </Field>
                <Field
                  label="مهم‌ترین مزیت"
                  required
                  error={errors.mainBenefit}
                >
                  <textarea
                    value={form.mainBenefit}
                    onChange={(event) => update("mainBenefit", event.target.value)}
                    placeholder="چرا مخاطب باید این پیشنهاد را انتخاب کند؟"
                    rows={3}
                  />
                </Field>
                <Field
                  label="مخاطب هدف"
                  required
                  error={errors.targetAudience}
                >
                  <textarea
                    value={form.targetAudience}
                    onChange={(event) =>
                      update("targetAudience", event.target.value)
                    }
                    placeholder="مثلاً مدیران کسب‌وکارهای محلی در تهران"
                    rows={3}
                  />
                </Field>
                <Field
                  label="کانال کمپین"
                  required
                  error={errors.campaignChannel}
                >
                  <select
                    value={form.campaignChannel}
                    onChange={(event) =>
                      update("campaignChannel", event.target.value)
                    }
                  >
                    <option value="">انتخاب کانال</option>
                    {CHANNELS.map(([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="لحن کمپین"
                  required
                  error={errors.campaignTone}
                >
                  <select
                    value={form.campaignTone}
                    onChange={(event) => update("campaignTone", event.target.value)}
                  >
                    <option value="">انتخاب لحن</option>
                    {TONES.map(([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <RequestError message={requestError} />
              <WizardActions
                primaryLabel={busy === "saving" ? "در حال ذخیره..." : "ذخیره و ادامه"}
                primaryIcon={
                  busy === "saving" ? (
                    <Loader2 className="arw-spin" size={17} />
                  ) : (
                    <Save size={17} />
                  )
                }
                disabled={busy !== null}
                onBack={() => setStep(1)}
              />
            </form>
          )}

          {step === 3 && (
            <div>
              <StepHeading
                eyebrow="تولید محتوای صفحه"
                title="پیش‌نویس آماده است؛ حالا AI را اجرا کنید"
                description="تولید فقط با کلیک شما شروع می‌شود. برای هر پیش‌نویس رایگان، یک خروجی کامل ذخیره خواهد شد."
                icon={<Sparkles size={21} />}
              />
              <div className="arw-ai-panel">
                <div className="arw-ai-orbit" aria-hidden="true">
                  <Sparkles size={30} />
                  <span />
                  <span />
                </div>
                <div>
                  <strong>
                    {generatedContent ? "محتوای کمپین آماده است" : "AI آرایه آماده تولید است"}
                  </strong>
                  <p>
                    {generatedContent
                      ? "خروجی ذخیره شده دوباره استفاده می‌شود و هزینه دیگری ایجاد نمی‌کند."
                      : "متن صفحه، پیشنهاد، FAQ، پاسخ به اعتراض و متن تبلیغ در یک مرحله ساخته می‌شود."}
                  </p>
                </div>
                {generatedContent ? (
                  <button className="arw-primary" onClick={() => setStep(4)}>
                    انتخاب قالب
                    <ArrowLeft size={17} />
                  </button>
                ) : (
                  <button
                    className="arw-primary arw-generate-button"
                    onClick={generateContent}
                    disabled={busy !== null}
                  >
                    {busy === "generating" ? (
                      <>
                        <Loader2 className="arw-spin" size={18} />
                        در حال ساخت محتوای کمپین...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        تولید صفحه با AI
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="arw-safety-note">
                <CheckCircle2 size={18} />
                <span>
                  خروجی قبل از ذخیره از نظر ساختار بررسی می‌شود و در صورت نامعتبر بودن،
                  یک بار خودکار اصلاح خواهد شد.
                </span>
              </div>
              <RequestError message={requestError} />
              <WizardActions
                hidePrimary
                onBack={() => setStep(2)}
                disabled={busy !== null}
              />
            </div>
          )}

          {step === 4 && (
            <div>
              <StepHeading
                eyebrow="ظاهر صفحه"
                title="یک قالب برای پیش‌نمایش انتخاب کنید"
                description="قالب فقط چیدمان و رنگ‌بندی را تغییر می‌دهد؛ محتوای ساخته‌شده ثابت می‌ماند."
                icon={<LayoutTemplate size={21} />}
              />
              <div className="arw-template-grid">
                {TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  const selected = form.templateKey === template.key;
                  return (
                    <button
                      type="button"
                      key={template.key}
                      className={`arw-template-card arw-swatch-${template.swatch} ${
                        selected ? "is-selected" : ""
                      }`}
                      onClick={() => selectTemplate(template.key)}
                      aria-pressed={selected}
                    >
                      <span className="arw-template-check">
                        {selected && <Check size={15} />}
                      </span>
                      <span className="arw-template-icon">
                        <Icon size={22} />
                      </span>
                      <strong>{template.title}</strong>
                      <small>{template.description}</small>
                      <span className="arw-template-mini">
                        <i />
                        <i />
                        <i />
                      </span>
                    </button>
                  );
                })}
              </div>
              {!form.templateKey && (
                <p className="arw-help-text">برای ادامه، یکی از قالب‌ها را انتخاب کنید.</p>
              )}
              <RequestError message={requestError} />
              <WizardActions
                primaryLabel={busy === "saving" ? "در حال ذخیره..." : "مشاهده پیش‌نمایش"}
                primaryIcon={<ChevronLeft size={18} />}
                onPrimary={openPreview}
                disabled={!form.templateKey || busy !== null}
                onBack={() => setStep(3)}
              />
            </div>
          )}

          {step === 5 && generatedContent && (
            <div>
              <div className="arw-preview-header">
                <StepHeading
                  eyebrow="پیش‌نمایش داخلی"
                  title="صفحه کمپین شما آماده بررسی است"
                  description="این نسخه داخل داشبورد نمایش داده می‌شود و هنوز عمومی نیست."
                  icon={<LayoutTemplate size={21} />}
                />
                <div className="arw-internal-note">
                  <CircleHelp size={18} />
                  این فقط پیش‌نمایش داخلی است. انتشار عمومی در مرحله بعد فعال می‌شود.
                </div>
              </div>
              <CampaignPreview
                content={generatedContent}
                form={form}
                templateKey={form.templateKey}
              />
              <RequestError message={requestError} />
              {finalSaved && (
                <div className="arw-final-success" role="status">
                  <CheckCircle2 size={21} />
                  <div>
                    <strong>پیش‌نویس نهایی ذخیره شد.</strong>
                    <span>
                      صفحه جزئیات کمپین در فاز بعد اضافه می‌شود؛ فعلاً پیش‌نمایش همین‌جا
                      در دسترس است.
                    </span>
                  </div>
                </div>
              )}
              <WizardActions
                primaryLabel={
                  finalSaved
                    ? "پیش‌نویس ذخیره شده"
                    : busy === "finishing"
                      ? "در حال ذخیره..."
                      : "ذخیره پیش‌نویس نهایی"
                }
                primaryIcon={
                  busy === "finishing" ? (
                    <Loader2 className="arw-spin" size={17} />
                  ) : finalSaved ? (
                    <Check size={17} />
                  ) : (
                    <Save size={17} />
                  )
                }
                onPrimary={finishDraft}
                disabled={busy !== null || finalSaved}
                onBack={() => setStep(4)}
              />
            </div>
          )}
        </section>

        <p className="arw-footer-note">
          اطلاعات شما فقط برای ساخت و ذخیره همین پیش‌نویس استفاده می‌شود.
        </p>
      </main>
    </div>
  );
}

function StepHeading({
  eyebrow,
  title,
  description,
  icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="arw-heading">
      <div className="arw-heading-icon">{icon}</div>
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  error,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`arw-field ${className} ${error ? "has-error" : ""}`}>
      <span>
        <strong>{label}</strong>
        {required ? <em>الزامی</em> : hint ? <small>{hint}</small> : null}
      </span>
      {children}
      {error && <b>{error}</b>}
    </label>
  );
}

function WizardActions({
  primaryLabel,
  primaryIcon,
  onPrimary,
  onBack,
  disabled,
  hidePrimary,
}: {
  primaryLabel?: string;
  primaryIcon?: ReactNode;
  onPrimary?: () => void;
  onBack?: () => void;
  disabled?: boolean;
  hidePrimary?: boolean;
}) {
  return (
    <div className="arw-actions">
      {!hidePrimary && (
        <button
          className="arw-primary"
          type={onPrimary ? "button" : "submit"}
          onClick={onPrimary}
          disabled={disabled}
        >
          {primaryIcon}
          {primaryLabel}
          {!primaryIcon && <ArrowLeft size={17} />}
        </button>
      )}
      {onBack && (
        <button
          className="arw-secondary"
          type="button"
          onClick={onBack}
          disabled={disabled}
        >
          <ArrowRight size={17} />
          مرحله قبل
        </button>
      )}
    </div>
  );
}

function RequestError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="arw-request-error" role="alert">
      {message}
    </div>
  );
}

function CampaignPreview({
  content,
  form,
  templateKey,
}: {
  content: CampaignPageContent;
  form: FormState;
  templateKey: string;
}) {
  return (
    <article className={`arw-preview arw-preview-${templateKey}`}>
      <section className="arw-preview-hero">
        <span className="arw-preview-kicker">{form.campaignGoal}</span>
        <h2>{content.headline}</h2>
        <p>{content.subheadline}</p>
        <button type="button">{content.ctaText}</button>
      </section>

      <section className="arw-preview-section arw-preview-split">
        <div>
          <span className="arw-preview-label">مسئله مخاطب</span>
          <h3>این پیشنهاد برای شماست اگر...</h3>
          <ul>
            {content.problemBullets.map((item) => (
              <li key={item}>
                <span>!</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="arw-benefit-panel">
          <span className="arw-preview-label">مزیت‌ها</span>
          <h3>چیزی که دریافت می‌کنید</h3>
          <ul>
            {content.benefits.map((item) => (
              <li key={item}>
                <CheckCircle2 size={18} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="arw-preview-section arw-offer-box">
        <div>
          <span className="arw-preview-label">پیشنهاد کمپین</span>
          <h3>{content.offerSection.title}</h3>
          <p>{content.offerSection.description}</p>
        </div>
        <ul>
          {content.offerSection.bullets.map((item) => (
            <li key={item}>
              <Check size={17} />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="arw-preview-section arw-lead-mock">
        <div>
          <span className="arw-preview-label">فرم لید</span>
          <h3>{content.formTitle}</h3>
          <p>برای دریافت اطلاعات بیشتر، مشخصات تماس را وارد کنید.</p>
        </div>
        <div className="arw-mock-form" aria-label="نمونه فرم لید">
          <input disabled placeholder="نام و نام خانوادگی" />
          <input disabled placeholder="شماره موبایل" />
          <button type="button">{content.ctaText}</button>
        </div>
      </section>

      <section className="arw-preview-section">
        <span className="arw-preview-label">پرسش‌های پرتکرار</span>
        <h3>قبل از اقدام شاید این سؤال‌ها را داشته باشید</h3>
        <div className="arw-faq-list">
          {content.faq.map((item, index) => (
            <details key={`${item.question}-${index}`} open={index === 0}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="arw-preview-section arw-contact-mock">
        <div>
          <span className="arw-preview-label">راه ارتباطی سریع</span>
          <h3>برای تصمیم‌گیری، مستقیم با ما در ارتباط باشید</h3>
        </div>
        <div>
          <button type="button">
            <MessageCircle size={17} />
            واتساپ
          </button>
          <button type="button">
            <MessageCircle size={17} />
            تلگرام
          </button>
          <button type="button">
            <Phone size={17} />
            تماس
          </button>
        </div>
      </section>

      <section className="arw-preview-section arw-ad-copy">
        <span className="arw-preview-label">زاویه‌های پیشنهادی تبلیغ</span>
        <h3>متن‌های آماده برای شروع کمپین</h3>
        <div>
          {content.adCopyAngles.map((item, index) => (
            <article key={`${item.angle}-${index}`}>
              <span>{item.channel}</span>
              <strong>{item.angle}</strong>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </article>
  );
}

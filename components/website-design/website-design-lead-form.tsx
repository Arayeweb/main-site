"use client";

import { useRef, useState } from "react";
import SectionHeader from "@/components/home/SectionHeader";
import { IconCheck, IconPhone } from "@/components/icons";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import { SITE_PHONE_DISPLAY, SITE_PHONE_TEL, siteWhatsAppUrl } from "@/lib/siteContact";
import {
  LEAD_FORM_ID,
  mainGoalOptions,
  projectTypeOptions,
  WEBSITE_DESIGN_PAGE,
} from "@/data/website-design";
import { trackWebsiteSeoEvent } from "@/lib/analytics/websiteSeoEvents";

const VISITOR_KEY = "ary_wd_vid";
const SUBMIT_COOLDOWN_MS = 30_000;

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

function getVisitorId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `wd-${Date.now()}`;
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return null;
  }
}

function analyticsPayload(extra: Record<string, string | number | boolean | undefined> = {}) {
  return {
    page: WEBSITE_DESIGN_PAGE,
    visitorId: getVisitorId() ?? undefined,
    timestamp: Date.now(),
    ...getUtmParams(),
    ...extra,
  };
}

function buildWhatsAppMessage(data: {
  fullName: string;
  phone: string;
  businessName: string;
  projectType: string;
  mainGoal: string;
  currentWebsite?: string;
  budget?: string;
  message?: string;
}) {
  const lines = [
    "سلام، از صفحه طراحی سایت آرایه پیام می‌دهم.",
    `نام: ${data.fullName}`,
    `شماره تماس: ${data.phone}`,
    `کسب‌وکار: ${data.businessName}`,
    `نوع پروژه: ${data.projectType}`,
    `هدف: ${data.mainGoal}`,
  ];
  if (data.currentWebsite) lines.push(`وب‌سایت فعلی: ${data.currentWebsite}`);
  if (data.budget) lines.push(`بودجه: ${data.budget}`);
  if (data.message) lines.push(`توضیحات: ${data.message}`);
  return lines.join("\n");
}

export default function WebsiteDesignLeadForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [currentWebsite, setCurrentWebsite] = useState("");
  const [projectType, setProjectType] = useState("");
  const [mainGoal, setMainGoal] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<{
    fullName: string;
    phone: string;
    businessName: string;
    projectType: string;
    mainGoal: string;
    currentWebsite: string;
    budget: string;
    message: string;
  } | null>(null);
  const formStartedRef = useRef(false);
  const lastSubmitRef = useRef(0);

  const trackFormStart = () => {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    pushGtmEvent("website_design_form_start", analyticsPayload());
    trackWebsiteSeoEvent("website_form_start", {
      page_path: WEBSITE_DESIGN_PAGE,
      page_type: "hub",
      primary_keyword: "طراحی سایت",
      offer: "custom",
      cta_position: "final",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const now = Date.now();
    if (now - lastSubmitRef.current < SUBMIT_COOLDOWN_MS) {
      setError("لطفاً چند لحظه صبر کنید و دوباره تلاش کنید.");
      return;
    }

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

    if (!projectType) {
      setError("لطفاً نوع پروژه را انتخاب کنید.");
      return;
    }

    if (!mainGoal) {
      setError("لطفاً هدف اصلی پروژه را انتخاب کنید.");
      return;
    }

    setLoading(true);
    lastSubmitRef.current = now;

    const detailParts = [
      `business=${businessName.trim()}`,
      currentWebsite.trim() ? `website=${currentWebsite.trim()}` : null,
      message.trim() ? `message=${message.trim()}` : null,
    ].filter(Boolean);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "website-design",
          page: WEBSITE_DESIGN_PAGE,
          name: fullName.trim(),
          contact: normalizedPhone,
          goal: mainGoal,
          sitetype: projectType,
          budget: budget.trim() || null,
          channel: "website_design_landing",
          detail: detailParts.join(" | "),
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

      pushGtmEvent("website_design_lead_submit", analyticsPayload({ projectType, mainGoal }));
      trackWebsiteSeoEvent("website_lead_submit", {
        page_path: WEBSITE_DESIGN_PAGE,
        page_type: "hub",
        primary_keyword: "طراحی سایت",
        offer: "custom",
        cta_position: "final",
      });
      pushGtmEvent("generate_lead", {
        source: "website_design_landing",
        page: "website-design",
        projectType,
        mainGoal,
      });
      setSubmittedLead({
        fullName: fullName.trim(),
        phone: normalizedPhone,
        businessName: businessName.trim(),
        projectType,
        mainGoal,
        currentWebsite: currentWebsite.trim(),
        budget: budget.trim(),
        message: message.trim(),
      });
      setSuccess(true);
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  if (success && submittedLead) {
    const whatsappHref = siteWhatsAppUrl(buildWhatsAppMessage(submittedLead));

    return (
      <section id={LEAD_FORM_ID} className="section-py scroll-mt-24 bg-white">
        <div className="container-mx container-px">
          <div
            className="mx-auto max-w-xl rounded-3xl border border-navy-100 bg-white p-8 text-center shadow-card"
            role="status"
            aria-live="polite"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF2FF] text-[#3157F6]">
              <IconCheck size={30} />
            </div>
            <p className="text-lg font-extrabold text-navy-900">درخواست شما ثبت شد</p>
            <p className="mt-2 text-sm leading-relaxed text-navy-500">
              برای ادامه سریع‌تر، یکی از این دو مسیر را انتخاب کنید:
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  pushGtmEvent("website_design_lead_whatsapp", analyticsPayload())
                }
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-bold text-white transition-opacity hover:opacity-95 sm:max-w-[220px]"
              >
                <span aria-hidden="true">💬</span>
                ادامه در واتساپ
              </a>
              <a
                href={SITE_PHONE_TEL}
                onClick={() => pushGtmEvent("website_design_lead_call", analyticsPayload())}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-4 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50 sm:max-w-[220px]"
              >
                <IconPhone size={16} aria-hidden="true" />
                تماس با {SITE_PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={LEAD_FORM_ID} className="section-py scroll-mt-24 bg-white">
      <div className="container-mx container-px">
        <SectionHeader
          badge="شروع پروژه"
          title="برآورد رایگان برای پروژه شما"
          subtitle="۴ فیلد اصلی کافی است. نیاز را بررسی می‌کنیم و مسیر مناسب (سایت فوری یا اختصاصی) را با محدوده قیمت اعلام می‌کنیم."
        />

        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-2xl rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-8"
          noValidate
        >
          <p className="mb-5 rounded-xl bg-teal-50/80 px-4 py-3 text-[13px] leading-relaxed text-teal-800">
            بدون تعهد مالی · پاسخ معمولاً در یک روز کاری · پیش‌فاکتور قبل از شروع ساخت
          </p>

          <ol className="mb-5 grid grid-cols-3 gap-2 text-center text-[11px] font-bold text-navy-500 sm:text-[12px]">
            <li className="rounded-lg border border-teal-100 bg-teal-50/50 px-2 py-2 text-teal-800">
              ۱. اطلاعات
            </li>
            <li className="rounded-lg border border-navy-100 bg-navy-50/40 px-2 py-2">۲. بررسی نیاز</li>
            <li className="rounded-lg border border-navy-100 bg-navy-50/40 px-2 py-2">۳. پیش‌فاکتور</li>
          </ol>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="wd-full-name" className="mb-1.5 block text-[13px] font-bold text-navy-700">
                نام کامل *
              </label>
              <input
                id="wd-full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onFocus={trackFormStart}
                autoComplete="name"
                disabled={loading}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="wd-phone" className="mb-1.5 block text-[13px] font-bold text-navy-700">
                شماره موبایل *
              </label>
              <input
                id="wd-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                dir="ltr"
                placeholder="09xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={trackFormStart}
                disabled={loading}
                className={`${inputClassName} text-start`}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="wd-business" className="mb-1.5 block text-[13px] font-bold text-navy-700">
                نام کسب‌وکار *
              </label>
              <input
                id="wd-business"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                onFocus={trackFormStart}
                disabled={loading}
                className={inputClassName}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="wd-website" className="mb-1.5 block text-[13px] font-bold text-navy-700">
                وب‌سایت فعلی <span className="font-medium text-navy-400">(اختیاری)</span>
              </label>
              <input
                id="wd-website"
                value={currentWebsite}
                onChange={(e) => setCurrentWebsite(e.target.value)}
                onFocus={trackFormStart}
                placeholder="example.com"
                inputMode="url"
                dir="ltr"
                disabled={loading}
                className={`${inputClassName} text-start`}
              />
            </div>

            <div>
              <label htmlFor="wd-project-type" className="mb-1.5 block text-[13px] font-bold text-navy-700">
                نوع پروژه *
              </label>
              <select
                id="wd-project-type"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                onFocus={trackFormStart}
                disabled={loading}
                className={inputClassName}
              >
                <option value="">انتخاب کنید</option>
                {projectTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="wd-main-goal" className="mb-1.5 block text-[13px] font-bold text-navy-700">
                هدف اصلی *
              </label>
              <select
                id="wd-main-goal"
                value={mainGoal}
                onChange={(e) => setMainGoal(e.target.value)}
                onFocus={trackFormStart}
                disabled={loading}
                className={inputClassName}
              >
                <option value="">انتخاب کنید</option>
                {mainGoalOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="wd-budget" className="mb-1.5 block text-[13px] font-bold text-navy-700">
                بودجه تقریبی <span className="font-medium text-navy-400">(اختیاری)</span>
              </label>
              <input
                id="wd-budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                onFocus={trackFormStart}
                disabled={loading}
                className={inputClassName}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="wd-message" className="mb-1.5 block text-[13px] font-bold text-navy-700">
                توضیحات <span className="font-medium text-navy-400">(اختیاری)</span>
              </label>
              <textarea
                id="wd-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={trackFormStart}
                rows={4}
                disabled={loading}
                className={`${inputClassName} resize-y`}
              />
            </div>
          </div>

          <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

          {error ? (
            <p className="mt-4 text-sm font-bold text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
            {loading ? "در حال ارسال..." : "دریافت برآورد رایگان"}
          </button>
          <p className="mt-2 text-center text-[12px] text-navy-400">
            فقط برای هماهنگی تماس استفاده می‌شود؛ اسپم نمی‌فرستیم.
          </p>

          <a
            href={SITE_PHONE_TEL}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 px-6 py-3 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
            onClick={() => pushGtmEvent("website_design_phone_click", analyticsPayload())}
          >
            <IconPhone size={16} aria-hidden="true" />
            {SITE_PHONE_DISPLAY}
          </a>
        </form>
      </div>
    </section>
  );
}

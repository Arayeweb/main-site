"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import {
  getCampaignTrackingContext,
  trackCampaignEvent,
} from "@/lib/adreadyTracking";
import styles from "./campaignPage.module.css";

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function CampaignLeadForm({
  slug,
  campaignPageId,
  title,
  ctaText,
  thankYouMessage,
  whatsappHref,
  onFormStart,
}: {
  slug: string;
  campaignPageId?: string;
  title: string;
  ctaText: string;
  thankYouMessage: string;
  whatsappHref?: string | null;
  onFormStart?: () => void;
}) {
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");
  const [formStarted, setFormStarted] = useState(false);

  function handleFormStart() {
    if (formStarted) return;
    setFormStarted(true);
    onFormStart?.();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") return;
    setState("submitting");
    setError("");

    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("fullName") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const message = String(form.get("message") || "").trim();

    if (fullName.length < 2) {
      setError("نام باید حداقل ۲ کاراکتر باشد.");
      setState("error");
      return;
    }

    const ctx = getCampaignTrackingContext();
    const payload = {
      slug,
      fullName,
      phone,
      message,
      visitorId: ctx.visitorId,
      sessionId: ctx.sessionId,
      pagePath: ctx.pagePath,
      referrer: ctx.referrer,
      utmSource: ctx.utmSource,
      utmMedium: ctx.utmMedium,
      utmCampaign: ctx.utmCampaign,
      utmContent: ctx.utmContent,
      utmTerm: ctx.utmTerm,
    };

    try {
      const response = await fetch("/api/adready/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "submit_failed");
      }

      trackCampaignEvent("campaign_lead_submit", {
        campaignPageId,
        slug,
        visitorId: ctx.visitorId,
        sessionId: ctx.sessionId,
        utm_source: ctx.utmSource,
        utm_medium: ctx.utmMedium,
        utm_campaign: ctx.utmCampaign,
        utm_content: ctx.utmContent,
        utm_term: ctx.utmTerm,
        page_path: ctx.pagePath,
        referrer: ctx.referrer,
      });

      setState("success");
      event.currentTarget.reset();
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : "submit_failed";
      setError(
        code === "invalid_lead"
          ? "نام و شماره موبایل معتبر را وارد کنید."
          : code === "duplicate_lead"
            ? "این شماره اخیراً ثبت شده. کمی بعد دوباره تلاش کنید."
            : code === "rate_limited"
              ? "تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید."
              : "ثبت درخواست انجام نشد. لطفاً دوباره تلاش کنید."
      );
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className={styles.leadSuccess} role="status">
        <CheckCircle2 size={28} />
        <strong>{thankYouMessage || "درخواست شما با موفقیت ثبت شد."}</strong>
        <span>به‌زودی برای ادامه هماهنگی با شما تماس گرفته می‌شود.</span>
        {whatsappHref && (
          <a
            className={styles.whatsappFollowUp}
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} />
            ادامه در واتساپ
          </a>
        )}
      </div>
    );
  }

  return (
    <form className={styles.leadForm} onSubmit={submit}>
      <div className={styles.formHeading}>
        <span>ثبت درخواست</span>
        <h2>{title || "برای دریافت اطلاعات فرم را تکمیل کنید"}</h2>
      </div>
      <label>
        <span>نام و نام خانوادگی</span>
        <input
          name="fullName"
          autoComplete="name"
          maxLength={200}
          required
          minLength={2}
          placeholder="نام شما"
          onFocus={handleFormStart}
        />
      </label>
      <label>
        <span>شماره موبایل</span>
        <input
          name="phone"
          autoComplete="tel"
          inputMode="tel"
          maxLength={24}
          required
          dir="ltr"
          placeholder="0912 123 4567"
          onFocus={handleFormStart}
        />
      </label>
      <label className={styles.messageField}>
        <span>پیام <small>اختیاری</small></span>
        <textarea
          name="message"
          maxLength={4000}
          rows={3}
          placeholder="اگر نکته‌ای هست اینجا بنویسید."
          onFocus={handleFormStart}
        />
      </label>
      {error && <p className={styles.formError}>{error}</p>}
      <button type="submit" disabled={state === "submitting"}>
        {state === "submitting" && <Loader2 className={styles.spin} size={18} />}
        {state === "submitting" ? "در حال ثبت..." : ctaText}
      </button>
      <small className={styles.formPrivacy}>
        اطلاعات شما فقط برای پیگیری همین درخواست استفاده می‌شود.
      </small>
    </form>
  );
}

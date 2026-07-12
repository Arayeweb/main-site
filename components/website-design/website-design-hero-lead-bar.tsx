"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IconCheck, IconClose } from "@/components/icons";
import { pushGtmEvent } from "@/lib/gtm";
import { siteWhatsAppUrl } from "@/lib/siteContact";
import { getUtmParams } from "@/lib/utm";
import { WEBSITE_DESIGN_PAGE } from "@/data/website-design";
import type { WebsiteDesignProjectType } from "@/lib/openSiteChat";

export const HERO_LEAD_BAR_ID = "website-design-hero-lead";
export const HERO_LEAD_BAR_OPEN_EVENT = "website-design-hero-lead-open";

const ACCENT = "#3157F6";

const PROJECT_OPTIONS: { id: WebsiteDesignProjectType; label: string }[] = [
  { id: "new", label: "سایت جدید می‌خواهم" },
  { id: "redesign", label: "سایت فعلی نیاز به بازطراحی دارد" },
];

const PROJECT_LABELS: Record<WebsiteDesignProjectType, string> = {
  new: "سایت جدید می‌خواهم",
  redesign: "سایت فعلی نیاز به بازطراحی دارد",
};

function toLatinDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

function normalizeIranPhone(value: string): string | null {
  const digits = toLatinDigits(value).replace(/\D/g, "");
  if (!/^09\d{9}$/.test(digits)) return null;
  return digits;
}

function track(event: string, extra: Record<string, string | undefined> = {}) {
  pushGtmEvent(event, {
    page: WEBSITE_DESIGN_PAGE,
    timestamp: Date.now(),
    ...getUtmParams(),
    ...extra,
  });
}

function LeadBarContent({
  projectType,
  setProjectType,
  phone,
  setPhone,
  error,
  loading,
  onSubmit,
  layout,
}: {
  projectType: WebsiteDesignProjectType | null;
  setProjectType: (value: WebsiteDesignProjectType) => void;
  phone: string;
  setPhone: (value: string) => void;
  error: string | null;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  layout: "desktop" | "mobile";
}) {
  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <p
        className={`text-center font-extrabold text-navy-900 ${
          layout === "mobile" ? "text-[15px] leading-snug" : "text-base sm:text-lg"
        }`}
      >
        برای سایت خودتان از کجا شروع کنیم؟
      </p>

      <div
        className={`mt-4 flex gap-2 ${layout === "mobile" ? "flex-col" : "flex-col sm:flex-row"}`}
      >
        {PROJECT_OPTIONS.map((option) => {
          const selected = projectType === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setProjectType(option.id);
                track("website_design_hero_intent", { projectType: option.id });
              }}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-[13px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157F6] focus-visible:ring-offset-2 ${
                selected
                  ? "border-[#3157F6] bg-[#EEF2FF] text-[#3157F6]"
                  : "border-navy-100 bg-navy-50/40 text-navy-700 hover:border-[#C5D0FF]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className={`mt-4 flex gap-2 ${layout === "mobile" ? "flex-col" : "items-center"}`}>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          dir="ltr"
          placeholder="شماره موبایل"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={`rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-[#3157F6] focus:bg-white ${
            layout === "mobile" ? "w-full text-start" : "min-w-0 flex-1 text-start"
          }`}
        />
        <button
          type="submit"
          disabled={loading}
          className={`inline-flex shrink-0 items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157F6] focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${
            layout === "mobile" ? "h-12 w-full" : "h-[46px]"
          }`}
          style={{ backgroundColor: ACCENT }}
        >
          {loading ? "در حال ثبت..." : "گفت‌وگو درباره سایت"}
        </button>
      </div>

      {error ? (
        <p className="mt-3 text-center text-[13px] font-bold text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-3 text-center">
        <a
          href={siteWhatsAppUrl("سلام، از صفحه طراحی سایت آرایه پیام می‌دهم.")}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("website_design_hero_whatsapp", { location: "hero_lead_bar" })}
          className="text-[12px] font-bold text-navy-500 transition-colors hover:text-[#3157F6]"
        >
          ترجیح می‌دهم در واتساپ پیام بدهم
        </a>
      </div>
    </form>
  );
}

function LeadBarSuccess({ layout }: { layout: "desktop" | "mobile" }) {
  return (
    <div
      className={`text-center ${layout === "mobile" ? "py-2" : "py-3"}`}
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF2FF] text-[#3157F6]">
        <IconCheck size={22} />
      </div>
      <p className="text-base font-extrabold text-navy-900">درخواست شما ثبت شد</p>
      <p className="mt-2 text-[13px] leading-relaxed text-navy-500">
        به‌زودی برای بررسی پروژه با شما تماس می‌گیریم.
      </p>
    </div>
  );
}

export default function WebsiteDesignHeroLeadBar() {
  const [projectType, setProjectType] = useState<WebsiteDesignProjectType | null>(null);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const openMobile = () => setMobileOpen(true);
    window.addEventListener(HERO_LEAD_BAR_OPEN_EVENT, openMobile);
    return () => window.removeEventListener(HERO_LEAD_BAR_OPEN_EVENT, openMobile);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!projectType) {
      setError("لطفاً یکی از گزینه‌ها را انتخاب کنید.");
      return;
    }

    const normalizedPhone = normalizeIranPhone(phone);
    if (!normalizedPhone) {
      setError("شماره موبایل را درست وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "website-design-hero",
          page: WEBSITE_DESIGN_PAGE,
          contact: normalizedPhone,
          intent: projectType,
          sitetype: projectType,
          goal: PROJECT_LABELS[projectType],
          channel: "website_design_hero",
          detail: `projectType=${PROJECT_LABELS[projectType]}`,
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

      track("website_design_hero_lead_submit", {
        projectType,
        contact: normalizedPhone,
      });
      pushGtmEvent("generate_lead", {
        source: "website_design_hero",
        page: "website-design",
        projectType,
      });
      setSuccess(true);
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  const sharedProps = {
    projectType,
    setProjectType,
    phone,
    setPhone,
    error,
    loading,
    onSubmit: handleSubmit,
  };

  return (
    <>
      <div id={HERO_LEAD_BAR_ID} className="relative z-10 mx-auto w-full max-w-[900px]">
        <div className="rounded-2xl border border-navy-100 bg-white px-6 py-5 shadow-[0_16px_48px_rgba(49,87,246,0.12)]">
          {success ? (
            <LeadBarSuccess layout="desktop" />
          ) : (
            <LeadBarContent layout="desktop" {...sharedProps} />
          )}
        </div>
      </div>

      {mounted && mobileOpen
        ? createPortal(
            <div
              id={`${HERO_LEAD_BAR_ID}-mobile`}
              role="dialog"
              aria-label="درخواست مشاوره طراحی سایت"
              className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_rgba(16,42,67,0.12)] md:hidden"
            >
              <div className="relative mb-3 flex items-center justify-center">
                <div className="h-1 w-10 rounded-full bg-navy-200" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    track("website_design_hero_lead_close", { location: "mobile_sheet" });
                  }}
                  className="absolute end-0 flex h-9 w-9 items-center justify-center rounded-full text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700"
                  aria-label="بستن"
                >
                  <IconClose size={18} />
                </button>
              </div>
              {success ? (
                <LeadBarSuccess layout="mobile" />
              ) : (
                <LeadBarContent layout="mobile" {...sharedProps} />
              )}
            </div>,
            document.body
          )
        : null}
    </>
  );
}

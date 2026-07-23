"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IconCheck, IconClose, IconPhone } from "@/components/icons";
import { pushGtmEvent } from "@/lib/gtm";
import { SITE_PHONE_DISPLAY, SITE_PHONE_TEL, siteWhatsAppUrl } from "@/lib/siteContact";
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

function buildWhatsAppMessage(projectType: WebsiteDesignProjectType, phone: string) {
  return [
    "سلام، از صفحه طراحی سایت آرایه پیام می‌دهم.",
    `نیاز: ${PROJECT_LABELS[projectType]}`,
    `شماره تماس: ${phone}`,
  ].join("\n");
}

export function openWebsiteDesignLead(source = "unknown") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(HERO_LEAD_BAR_OPEN_EVENT, { detail: { source } })
  );
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
  layout: "desktop" | "mobile" | "modal";
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
        className={`mt-4 flex gap-2 ${layout === "mobile" || layout === "modal" ? "flex-col" : "flex-col sm:flex-row"}`}
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

      <div
        className={`mt-4 flex gap-2 ${layout === "mobile" || layout === "modal" ? "flex-col" : "items-center"}`}
      >
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          dir="ltr"
          placeholder="شماره موبایل"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={`rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-[#3157F6] focus:bg-white ${
            layout === "mobile" || layout === "modal"
              ? "w-full text-start"
              : "min-w-0 flex-1 text-start"
          }`}
        />
        <button
          type="submit"
          disabled={loading}
          className={`inline-flex shrink-0 items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3157F6] focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${
            layout === "mobile" || layout === "modal" ? "h-12 w-full" : "h-[46px]"
          }`}
          style={{ backgroundColor: ACCENT }}
        >
          {loading ? "در حال ثبت..." : "دریافت تماس مشاوره"}
        </button>
      </div>

      {error ? (
        <p className="mt-3 text-center text-[13px] font-bold text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function LeadBarSuccess({
  layout,
  projectType,
  phone,
  onClose,
}: {
  layout: "desktop" | "mobile" | "modal";
  projectType: WebsiteDesignProjectType;
  phone: string;
  onClose?: () => void;
}) {
  const whatsappHref = siteWhatsAppUrl(buildWhatsAppMessage(projectType, phone));

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
        برای ادامه سریع‌تر، یکی از این دو مسیر را انتخاب کنید:
      </p>

      <div className={`mt-5 flex gap-2 ${layout === "desktop" ? "flex-row justify-center" : "flex-col"}`}>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            track("website_design_hero_whatsapp", {
              location: layout === "modal" ? "lead_modal" : "hero_lead_bar",
              projectType,
            })
          }
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-bold text-white transition-opacity hover:opacity-95 sm:max-w-[220px]"
        >
          <span aria-hidden="true">💬</span>
          ادامه در واتساپ
        </a>
        <a
          href={SITE_PHONE_TEL}
          onClick={() =>
            track("website_design_hero_call", {
              location: layout === "modal" ? "lead_modal" : "hero_lead_bar",
              projectType,
            })
          }
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-4 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50 sm:max-w-[220px]"
        >
          <IconPhone size={16} aria-hidden="true" />
          تماس با {SITE_PHONE_DISPLAY}
        </a>
      </div>

      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-[12px] font-bold text-navy-400 transition-colors hover:text-navy-600"
        >
          بستن
        </button>
      ) : null}
    </div>
  );
}

export default function WebsiteDesignHeroLeadBar() {
  const [projectType, setProjectType] = useState<WebsiteDesignProjectType | null>(null);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedProjectType, setSubmittedProjectType] = useState<WebsiteDesignProjectType | null>(
    null
  );
  const [submittedPhone, setSubmittedPhone] = useState("");
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [openSource, setOpenSource] = useState("unknown");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const openLeadCapture = (event: Event) => {
      const detail = (event as CustomEvent<{ source?: string }>).detail;
      const source = detail?.source || "unknown";
      setOpenSource(source);
      const isHeroSource = source === "website_design_hero";
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      if (!isHeroSource || !isDesktop) {
        setModalOpen(true);
      }
      track("website_design_hero_lead_open", { source });
    };
    window.addEventListener(HERO_LEAD_BAR_OPEN_EVENT, openLeadCapture);
    return () => window.removeEventListener(HERO_LEAD_BAR_OPEN_EVENT, openLeadCapture);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModalOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [modalOpen]);

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
          detail: `projectType=${PROJECT_LABELS[projectType]} | openSource=${openSource}`,
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
        openSource,
      });
      pushGtmEvent("generate_lead", {
        source: "website_design_hero",
        page: "website-design",
        projectType,
      });
      setSubmittedProjectType(projectType);
      setSubmittedPhone(normalizedPhone);
      setSuccess(true);
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    track("website_design_hero_lead_close", { location: "lead_modal", source: openSource });
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

  const successProjectType = submittedProjectType ?? projectType;
  const successPhone = submittedPhone || phone;

  return (
    <>
      <div id={HERO_LEAD_BAR_ID} className="relative z-10 mx-auto w-full max-w-[900px]">
        <div className="rounded-2xl border border-navy-100 bg-white px-6 py-5 shadow-[0_16px_48px_rgba(49,87,246,0.12)]">
          {success && successProjectType ? (
            <LeadBarSuccess
              layout="desktop"
              projectType={successProjectType}
              phone={successPhone}
            />
          ) : (
            <LeadBarContent layout="desktop" {...sharedProps} />
          )}
        </div>
      </div>

      {mounted && modalOpen
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="درخواست مشاوره طراحی سایت"
              className="fixed inset-0 z-50 flex items-end justify-center bg-navy-900/45 p-0 sm:items-center sm:p-4"
              onClick={(event) => {
                if (event.target === event.currentTarget) closeModal();
              }}
            >
              <div
                id={`${HERO_LEAD_BAR_ID}-modal`}
                className="relative w-full max-w-md rounded-t-2xl border border-navy-100 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-2xl sm:rounded-2xl sm:px-6 sm:py-5"
              >
                <button
                  type="button"
                  onClick={closeModal}
                  className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700"
                  aria-label="بستن"
                >
                  <IconClose size={18} />
                </button>

                <div className="mt-2">
                  {success && successProjectType ? (
                    <LeadBarSuccess
                      layout="modal"
                      projectType={successProjectType}
                      phone={successPhone}
                      onClose={closeModal}
                    />
                  ) : (
                    <LeadBarContent layout="modal" {...sharedProps} />
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

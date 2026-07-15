import type { ModaresVariant } from "@/lib/modaresData";
import { getUtmParams } from "@/lib/utm";
import { siteWhatsAppUrl } from "@/lib/siteContact";
import { normalizeContact } from "@/lib/validateContact";

export type ModaresPlan = "professional" | "course_sales";

export const MODARES_LEAD_GOAL = "teacher_website";
export const MODARES_LEAD_CHANNEL = "teachers_landing";
export const MODARES_LEAD_SOURCE = "teachers_sms";

export function modaresPlanForVariant(variant: ModaresVariant): ModaresPlan {
  return variant === "courses" ? "course_sales" : "professional";
}

export function modaresVariantLabel(variant: ModaresVariant): string {
  if (variant === "courses") return "courses";
  if (variant === "students") return "students";
  return "default";
}

export type ModaresLeadPayload = {
  goal: string;
  page: string;
  plan: ModaresPlan;
  detail: string;
  source: string;
  channel: string;
  company: string;
  consent: boolean;
  contact: string;
  referrer: string | null;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
};

export function buildModaresLeadPayload(params: {
  teachingField: string;
  contact: string;
  variant: ModaresVariant;
  referrer?: string | null;
  utm?: Record<string, string>;
}): ModaresLeadPayload {
  const normalized = normalizeContact(params.contact);
  const utm =
    params.utm ??
    (typeof window !== "undefined" ? getUtmParams() : {});

  return {
    goal: MODARES_LEAD_GOAL,
    page: "/modares",
    plan: modaresPlanForVariant(params.variant),
    detail: `teaching_field: ${params.teachingField.trim()}; variant: ${modaresVariantLabel(params.variant)}`,
    source: MODARES_LEAD_SOURCE,
    channel: MODARES_LEAD_CHANNEL,
    company: "",
    consent: true,
    contact: normalized.kind === "phone" ? normalized.value : params.contact,
    referrer:
      params.referrer ??
      (typeof document !== "undefined" ? document.referrer || null : null),
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    utm_content: utm.utm_content,
  };
}

export function buildModaresWhatsAppMessage(teachingField: string): string {
  return `سلام، برای سایت مدرس درخواست ثبت کردم. حوزه تدریس من ${teachingField.trim()} است. لطفاً نمونه مرتبط و قیمت را ارسال کنید.`;
}

export function modaresWhatsAppUrl(teachingField: string): string {
  return siteWhatsAppUrl(buildModaresWhatsAppMessage(teachingField));
}

export type ModaresLeadSubmitResult =
  | { ok: true; duplicate?: boolean }
  | { ok: false; error: string };

export async function submitModaresLead(
  payload: ModaresLeadPayload,
): Promise<ModaresLeadSubmitResult> {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as { ok?: boolean; duplicate?: boolean; error?: string };

  if (!res.ok || !data.ok) {
    if (data.error === "rate_limited") {
      return { ok: false, error: "rate_limited" };
    }
    return { ok: false, error: data.error || "submit_failed" };
  }

  return { ok: true, duplicate: data.duplicate };
}

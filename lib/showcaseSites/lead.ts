"use client";

import { getUtmParams } from "@/lib/utm";
import type { ShowcaseLeadSource } from "./types";

const VISITOR_KEY = "ary_showcase_vid";

export function isValidIranianMobile(value: string): boolean {
  const digits = value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\D/g, "");
  return /^09\d{9}$/.test(digits);
}

export function normalizeIranianMobile(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\D/g, "");
}

export function getShowcaseVisitorId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sv-${Date.now()}`;
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return null;
  }
}

export type ShowcaseLeadPayload = {
  source: ShowcaseLeadSource;
  page: string;
  name: string;
  contact: string;
  goal: string;
  detail?: string;
  channel?: string;
};

export type ShowcaseLeadResult =
  | { ok: true }
  | { ok: false; error: "validation" | "rate_limited" | "server" | "network"; message: string };

export async function submitShowcaseLead(
  payload: ShowcaseLeadPayload,
): Promise<ShowcaseLeadResult> {
  if (!isValidIranianMobile(payload.contact)) {
    return { ok: false, error: "validation", message: "شماره موبایل را درست وارد کنید." };
  }

  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: payload.source,
        page: payload.page,
        name: payload.name.trim(),
        contact: normalizeIranianMobile(payload.contact),
        goal: payload.goal,
        detail: payload.detail,
        channel: payload.channel ?? "showcase_form",
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
        company: "",
        visitorId: getShowcaseVisitorId(),
        ...getUtmParams(),
      }),
    });

    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      if (data.error === "rate_limited") {
        return {
          ok: false,
          error: "rate_limited",
          message: "درخواست‌های زیاد. چند دقیقه بعد دوباره تلاش کنید.",
        };
      }
      return {
        ok: false,
        error: "server",
        message: "ثبت درخواست ناموفق بود. دوباره تلاش کنید.",
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "network",
      message: "خطا در ارتباط. اتصال اینترنت را بررسی کنید.",
    };
  }
}

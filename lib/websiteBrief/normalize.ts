import { toLatin } from "@/lib/validateContact";

/** نرمال‌سازی شماره موبایل به فرمت +989xxxxxxxxx */
export function normalizeBriefPhone(raw: string): string | null {
  const digits = toLatin(raw).replace(/[\s\-()]/g, "");
  if (/^\+989\d{9}$/.test(digits)) return digits;
  if (/^09\d{9}$/.test(digits)) return `+98${digits.slice(1)}`;
  if (/^989\d{9}$/.test(digits)) return `+${digits}`;
  if (/^00989\d{9}$/.test(digits)) return `+98${digits.slice(4)}`;
  return null;
}

/** نرمال‌سازی URL سایت — https:// در صورت نبود اضافه می‌شود */
export function normalizeWebsiteUrl(raw: string | null | undefined): string | null {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (!url.hostname) return null;
    return withProtocol.slice(0, 500);
  } catch {
    return null;
  }
}

export function sanitizeText(raw: string, maxLen: number): string {
  return String(raw ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLen);
}

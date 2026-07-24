import { toLatin } from "@/lib/validateContact";

/** Normalize Iranian mobile numbers to E.164 (+98…). */
export function normalizePhoneE164(raw: string): string | null {
  const digits = toLatin(raw).replace(/[\s\-()]/g, "");
  if (!/^(\+98|0098|98|0)?9\d{9}$/.test(digits)) return null;
  const national = digits.replace(/^(\+98|0098|98|0)/, "");
  if (!/^9\d{9}$/.test(national)) return null;
  return `+98${national}`;
}

/** Display form 09xxxxxxxxx from E.164. */
export function phoneE164ToLocal(phoneE164: string): string {
  const digits = phoneE164.replace(/\D/g, "");
  if (digits.startsWith("98") && digits.length === 12) {
    return `0${digits.slice(2)}`;
  }
  return phoneE164;
}

/** Mask for UI: 0912•••7180 (never full number on invite page). */
export function maskPhoneForInvite(phoneE164: string): string {
  const local = phoneE164ToLocal(phoneE164);
  if (local.length < 10) return "••••••••••";
  return `${local.slice(0, 4)}•••${local.slice(-4)}`;
}

/**
 * Stable synthetic Auth email for phone-only Growth Hub users.
 * Enables SSR password session after OTP without sharing AI auth tables.
 */
export function phoneToAuthEmail(phoneE164: string): string {
  const digits = phoneE164.replace(/\D/g, "");
  return `${digits}@phone.growth-hub.local`;
}

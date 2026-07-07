/** معادل‌های ساده کردیت برای UI */
import { FREE_SIGNUP_CREDITS } from "./aiPricingConfig";
import { MAX_GUEST_BATTLES, MAX_GUEST_DIRECT } from "./aiGuest";

export { MAX_GUEST_BATTLES, MAX_GUEST_DIRECT };

export function creditsToChatEstimate(credits: number): string {
  const n = Math.max(0, Math.floor(credits));
  return n.toLocaleString("fa-IR");
}

export function formatFreeAllowanceGuest(battles: number, direct: number): string {
  return `${direct.toLocaleString("fa-IR")} پیام چت + ${battles.toLocaleString("fa-IR")} نبرد رایگان`;
}

export function formatStarterCredits(credits: number): string {
  return `≈ ${creditsToChatEstimate(credits)} پرسش سریع · ≈ ${Math.floor(credits / 10)} تصویر · ≈ ${Math.floor(credits / 60)} ویدیو کوتاه`;
}

export const FREE_PLAN_EQUIVALENTS = {
  guestDirect: MAX_GUEST_DIRECT,
  guestBattles: MAX_GUEST_BATTLES,
  signupBonus: `${FREE_SIGNUP_CREDITS.toLocaleString("fa-IR")} کردیت`,
} as const;

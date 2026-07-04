// =========================================================
// Promo + Referral resolver — Araaye Arena checkout
// =========================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import { AI_PACKAGES } from "./aiPackages";

export const REFERRAL_BUYER_DISCOUNT_PERCENT = 10;
export const REFERRAL_REFERRER_CREDITS = 10;
export const MIN_CHECKOUT_TOMAN = 1000;

export type CodeType = "promo" | "referral" | null;

export interface ResolveCodeResult {
  type: CodeType;
  listAmountToman: number;
  discountToman: number;
  finalAmountToman: number;
  promoCode?: string;
  referralCode?: string;
  referrerUserId?: string;
  label?: string;
}

export type ResolveCodeError = { error: string; message?: string };

function normalizeCode(raw: string | null | undefined): string {
  return String(raw ?? "")
    .trim()
    .toUpperCase();
}

function clampFinal(list: number, discount: number): number {
  return Math.max(MIN_CHECKOUT_TOMAN, list - discount);
}

/** promo/referral را resolve می‌کند — بدون ایجاد سفارش */
export async function resolveCode(
  supabase: SupabaseClient,
  codeRaw: string | null | undefined,
  userId: string,
  packageId: string
): Promise<ResolveCodeResult | ResolveCodeError> {
  const pkg = AI_PACKAGES[packageId];
  if (!pkg) return { error: "invalid_package" };

  const listAmountToman = pkg.priceToman;
  const code = normalizeCode(codeRaw);

  if (!code) {
    return {
      type: null,
      listAmountToman,
      discountToman: 0,
      finalAmountToman: listAmountToman,
    };
  }

  // --- Promo code ---
  const { data: promo } = await supabase
    .from("ai_promo_codes")
    .select("id, code, kind, value, max_uses, used_count, expires_at, active")
    .eq("code", code)
    .maybeSingle();

  if (promo) {
    if (!promo.active) return { error: "code_inactive", message: "این کد غیرفعال است." };
    if (promo.expires_at && new Date(promo.expires_at as string) < new Date()) {
      return { error: "code_expired", message: "مهلت این کد تمام شده." };
    }
    if ((promo.used_count as number) >= (promo.max_uses as number)) {
      return { error: "code_exhausted", message: "سقف استفاده از این کد پر شده." };
    }

    let discountToman = 0;
    if (promo.kind === "percent") {
      discountToman = Math.floor(listAmountToman * (Number(promo.value) / 100));
    } else {
      discountToman = Math.min(listAmountToman - MIN_CHECKOUT_TOMAN, Number(promo.value));
    }

    return {
      type: "promo",
      listAmountToman,
      discountToman,
      finalAmountToman: clampFinal(listAmountToman, discountToman),
      promoCode: promo.code as string,
      label: `کد تخفیف ${promo.code}`,
    };
  }

  // --- Referral code (AI-XXXXXX) ---
  const { data: ref } = await supabase
    .from("ai_referral_codes")
    .select("id, code, user_id")
    .eq("code", code)
    .maybeSingle();

  if (ref) {
    if (ref.user_id === userId) {
      return { error: "self_referral", message: "نمی‌توانی از کد معرفی خودت استفاده کنی." };
    }

    const discountToman = Math.floor(listAmountToman * (REFERRAL_BUYER_DISCOUNT_PERCENT / 100));

    return {
      type: "referral",
      listAmountToman,
      discountToman,
      finalAmountToman: clampFinal(listAmountToman, discountToman),
      referralCode: ref.code as string,
      referrerUserId: ref.user_id as string,
      label: `معرفی ${ref.code}`,
    };
  }

  return { error: "invalid_code", message: "کد معتبر نیست." };
}

/** کد معرفی یکتا AI-XXXXXX می‌سازد */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `AI-${suffix}`;
}

/** slug اشتراک‌گذاری URL-safe (۸ کاراکتر) */
export function generateShareSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < 8; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

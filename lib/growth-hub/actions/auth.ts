"use server";

import { getGrowthHubServerClient } from "@/lib/growth-hub/supabase/server";
import { signInSchema } from "@/lib/growth-hub/validation";
import { normalizePhoneE164 } from "@/lib/growth-hub/phone";
import {
  ensurePhoneAuthUser,
  sendGrowthHubPhoneOtp,
  verifyGrowthHubPhoneOtp,
} from "@/lib/growth-hub/phoneOtp";
import { z } from "zod";
import { safeNextPath } from "@/lib/growth-hub/redirect";

export type AuthActionResult =
  | { ok: true; next?: string; cooldownSec?: number }
  | { ok: false; error: string; retryAfterSec?: number };

/** Legacy email + password sign-in (kept for existing accounts). */
export async function signInAction(input: unknown): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است." };
  }

  const supabase = getGrowthHubServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, error: "ایمیل یا رمز عبور نادرست است." };
  }
  return { ok: true };
}

export async function signUpAction(input: unknown): Promise<AuthActionResult> {
  return {
    ok: false,
    error: "ثبت‌نام فقط از طریق دعوت و کد تأیید موبایل امکان‌پذیر است.",
  };
}

export async function signOutAction(): Promise<AuthActionResult> {
  const supabase = getGrowthHubServerClient();
  await supabase.auth.signOut();
  return { ok: true };
}

const phoneSchema = z.object({
  phone: z.string().trim().min(10).max(20),
});

const phoneOtpSchema = z.object({
  phone: z.string().trim().min(10).max(20),
  code: z.string().trim().regex(/^\d{6}$/, "کد تأیید باید ۶ رقم باشد."),
  next: z.string().optional(),
});

/** Returning-user login: OTP to an existing Growth Hub phone profile. */
export async function sendLoginOtpAction(input: unknown): Promise<AuthActionResult> {
  const parsed = phoneSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "شماره موبایل نامعتبر است." };
  const phoneE164 = normalizePhoneE164(parsed.data.phone);
  if (!phoneE164) return { ok: false, error: "شماره موبایل نامعتبر است." };

  const { getSupabaseAdmin } = await import("@/lib/supabase");
  const admin = getSupabaseAdmin();
  const { data: profile } = await admin
    .from("gh_profiles")
    .select("id")
    .eq("phone", phoneE164)
    .maybeSingle();

  if (!profile) {
    return {
      ok: false,
      error: "برای ورود اولیه باید از لینک دعوت استفاده کنید.",
    };
  }

  const sent = await sendGrowthHubPhoneOtp({
    phoneE164,
    purpose: "login",
  });
  if (!sent.ok) {
    return { ok: false, error: sent.error, retryAfterSec: sent.retryAfterSec };
  }
  return { ok: true, cooldownSec: sent.cooldownSec };
}

export async function verifyLoginOtpAction(input: unknown): Promise<AuthActionResult> {
  const parsed = phoneOtpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است." };
  }
  const phoneE164 = normalizePhoneE164(parsed.data.phone);
  if (!phoneE164) return { ok: false, error: "شماره موبایل نامعتبر است." };

  const verified = await verifyGrowthHubPhoneOtp({
    phoneE164,
    purpose: "login",
    code: parsed.data.code,
  });
  if (!verified.ok) return verified;

  const authUser = await ensurePhoneAuthUser(phoneE164);
  if (!authUser.ok) return authUser;

  const supabase = getGrowthHubServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: authUser.email,
    password: authUser.password,
  });
  if (error) {
    return { ok: false, error: "ورود ناموفق بود." };
  }

  return { ok: true, next: safeNextPath(parsed.data.next) };
}

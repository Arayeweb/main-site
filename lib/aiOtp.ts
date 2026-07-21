import { createHmac, randomInt, timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isE2eMode } from "@/lib/e2eMode";
import { getKavenegarApiKey, sendKavenegarLookup } from "@/lib/kavenegar";

export type AiOtpPurpose = "login" | "register" | "reset" | "auth";

export const AI_OTP_PURPOSES: readonly AiOtpPurpose[] = [
  "login",
  "register",
  "reset",
  "auth",
] as const;

export const AI_OTP_TTL_MS = 5 * 60 * 1000;
/** حداقل فاصله بین دو ارسال کد برای یک شماره */
export const AI_OTP_RESEND_COOLDOWN_MS = 2 * 60 * 1000;
/** حداکثر تلاش اشتباه برای یک کد (بعدش باید کد جدید بگیرد) */
export const AI_OTP_MAX_ATTEMPTS = 3;
/** سقف ارسال کد برای یک شماره در یک ساعت */
export const AI_OTP_MAX_SENDS_PER_HOUR = 5;
export const AI_OTP_LENGTH = 5;
/** سقف تلاش verify از یک IP در هر دقیقه */
export const AI_OTP_VERIFY_PER_MINUTE = 3;
/** سقف درخواست send از یک IP در هر دقیقه */
export const AI_OTP_SEND_PER_MINUTE = 3;
/** Fixed code when E2E_MODE=1 (never sent via SMS). */
export const AI_OTP_E2E_CODE = "11111";

function otpSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET required for OTP hashing");
  }
  return `ai-otp:${s}`;
}

export function isAiOtpPurpose(v: unknown): v is AiOtpPurpose {
  return typeof v === "string" && (AI_OTP_PURPOSES as readonly string[]).includes(v);
}

export function generateAiOtpCode(): string {
  if (isE2eMode()) return AI_OTP_E2E_CODE;
  const max = 10 ** AI_OTP_LENGTH;
  const n = randomInt(0, max);
  return String(n).padStart(AI_OTP_LENGTH, "0");
}

export function hashAiOtpCode(phone: string, purpose: AiOtpPurpose, code: string): string {
  return createHmac("sha256", otpSecret())
    .update(`${phone}|${purpose}|${code}`)
    .digest("hex");
}

export function verifyAiOtpCodeHash(
  phone: string,
  purpose: AiOtpPurpose,
  code: string,
  storedHash: string
): boolean {
  const expected = hashAiOtpCode(phone, purpose, code);
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(storedHash, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function normalizeAiOtpCode(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, AI_OTP_LENGTH);
}

type ChallengeRow = {
  id: string;
  phone: string;
  purpose: string;
  code_hash: string;
  attempts: number;
  expires_at: string;
  consumed_at: string | null;
  created_at: string;
};

export type CreateAiOtpResult =
  | {
      ok: true;
      challengeId: string;
      expiresAt: string;
      resendAfterSec: number;
      /** Only set when SMS was skipped (dev without key / e2e). */
      debugCode?: string;
    }
  | { ok: false; error: string; retryAfterSec?: number };

export async function createAndSendAiOtp(
  supabase: SupabaseClient,
  input: { phone: string; purpose: AiOtpPurpose }
): Promise<CreateAiOtpResult> {
  const { phone, purpose } = input;
  const now = Date.now();
  const hourAgo = new Date(now - 60 * 60 * 1000).toISOString();

  const { data: recent, error: recentErr } = await supabase
    .from("ai_otp_challenges")
    .select("id, created_at")
    .eq("phone", phone)
    .eq("purpose", purpose)
    .gte("created_at", hourAgo)
    .order("created_at", { ascending: false })
    .limit(AI_OTP_MAX_SENDS_PER_HOUR);

  if (recentErr) {
    console.error("[aiOtp] recent lookup", recentErr);
    return { ok: false, error: "server_error" };
  }

  const rows = (recent ?? []) as Array<{ id: string; created_at: string }>;
  if (rows.length >= AI_OTP_MAX_SENDS_PER_HOUR) {
    return { ok: false, error: "otp_send_limit", retryAfterSec: 3600 };
  }

  const latest = rows[0];
  if (latest) {
    const age = now - new Date(latest.created_at).getTime();
    if (age < AI_OTP_RESEND_COOLDOWN_MS) {
      return {
        ok: false,
        error: "otp_cooldown",
        retryAfterSec: Math.ceil((AI_OTP_RESEND_COOLDOWN_MS - age) / 1000),
      };
    }
  }

  const code = generateAiOtpCode();
  const code_hash = hashAiOtpCode(phone, purpose, code);
  const expires_at = new Date(now + AI_OTP_TTL_MS).toISOString();

  const { data: inserted, error: insertErr } = await supabase
    .from("ai_otp_challenges")
    .insert({ phone, purpose, code_hash, expires_at })
    .select("id, expires_at")
    .single();

  if (insertErr || !inserted) {
    console.error("[aiOtp] insert", insertErr);
    return { ok: false, error: "server_error" };
  }

  const skipSms = isE2eMode() || !getKavenegarApiKey();
  if (skipSms) {
    if (!isE2eMode()) {
      console.info(`[aiOtp] SMS skipped (no KAVENEGAR_API_KEY). code=${code} phone=${phone}`);
    }
    return {
      ok: true,
      challengeId: inserted.id as string,
      expiresAt: inserted.expires_at as string,
      resendAfterSec: Math.ceil(AI_OTP_RESEND_COOLDOWN_MS / 1000),
      debugCode:
        process.env.NODE_ENV !== "production" || isE2eMode() ? code : undefined,
    };
  }

  const sent = await sendKavenegarLookup({ receptor: phone, token: code });
  if (!sent.ok) {
    await supabase.from("ai_otp_challenges").delete().eq("id", inserted.id);
    return { ok: false, error: sent.error };
  }

  return {
    ok: true,
    challengeId: inserted.id as string,
    expiresAt: inserted.expires_at as string,
    resendAfterSec: Math.ceil(AI_OTP_RESEND_COOLDOWN_MS / 1000),
  };
}

export type ConsumeAiOtpResult =
  | { ok: true; challengeId: string }
  | { ok: false; error: string };

export async function consumeAiOtp(
  supabase: SupabaseClient,
  input: { phone: string; purpose: AiOtpPurpose; code: string }
): Promise<ConsumeAiOtpResult> {
  const code = normalizeAiOtpCode(input.code);
  if (code.length !== AI_OTP_LENGTH) {
    return { ok: false, error: "invalid_otp" };
  }

  const { data: row, error } = await supabase
    .from("ai_otp_challenges")
    .select("id, phone, purpose, code_hash, attempts, expires_at, consumed_at, created_at")
    .eq("phone", input.phone)
    .eq("purpose", input.purpose)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[aiOtp] consume lookup", error);
    return { ok: false, error: "server_error" };
  }

  const challenge = row as ChallengeRow | null;
  if (!challenge) {
    return { ok: false, error: "otp_not_found" };
  }

  if (new Date(challenge.expires_at).getTime() <= Date.now()) {
    return { ok: false, error: "otp_expired" };
  }

  if (challenge.attempts >= AI_OTP_MAX_ATTEMPTS) {
    return { ok: false, error: "otp_locked" };
  }

  const valid = verifyAiOtpCodeHash(
    input.phone,
    input.purpose,
    code,
    challenge.code_hash
  );

  if (!valid) {
    await supabase
      .from("ai_otp_challenges")
      .update({ attempts: challenge.attempts + 1 })
      .eq("id", challenge.id);
    return { ok: false, error: "invalid_otp" };
  }

  const { error: consumeErr } = await supabase
    .from("ai_otp_challenges")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", challenge.id)
    .is("consumed_at", null);

  if (consumeErr) {
    console.error("[aiOtp] consume update", consumeErr);
    return { ok: false, error: "server_error" };
  }

  return { ok: true, challengeId: challenge.id };
}

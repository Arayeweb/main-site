import "server-only";

import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendKavenegarLookup } from "@/lib/kavenegar";
import { phoneE164ToLocal, phoneToAuthEmail } from "@/lib/growth-hub/phone";
import { generateInviteToken } from "@/lib/growth-hub/inviteToken";

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;
const MAX_SEND_PER_PHONE = 3;

const sendHits = new Map<string, number[]>();

function rateLimited(key: string, max: number): boolean {
  const now = Date.now();
  const arr = (sendHits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= max) {
    sendHits.set(key, arr);
    return true;
  }
  arr.push(now);
  sendHits.set(key, arr);
  return false;
}

function hashOtp(code: string): string {
  return createHash("sha256").update(code, "utf8").digest("hex");
}

function safeEqualHash(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

function generateOtpCode(): string {
  return String(randomInt(100000, 999999));
}

export type GhOtpPurpose = "invite_accept" | "login";

export async function sendGrowthHubPhoneOtp(params: {
  phoneE164: string;
  purpose: GhOtpPurpose;
  inviteId?: string;
}): Promise<{ ok: true; cooldownSec: number } | { ok: false; error: string; retryAfterSec?: number }> {
  const { phoneE164, purpose, inviteId } = params;
  if (purpose === "invite_accept" && !inviteId) {
    return { ok: false, error: "دعوت نامعتبر است." };
  }
  if (rateLimited(`otp:${phoneE164}`, MAX_SEND_PER_PHONE)) {
    return { ok: false, error: "تعداد درخواست بیش از حد است. کمی بعد دوباره تلاش کنید.", retryAfterSec: 60 };
  }

  const admin = getSupabaseAdmin();

  // Cooldown: refuse if a fresh unconsumed challenge exists.
  const { data: recent } = await admin
    .from("gh_phone_otp_challenges")
    .select("id, created_at")
    .eq("phone_e164", phoneE164)
    .eq("purpose", purpose)
    .is("consumed_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recent?.created_at) {
    const age = Date.now() - new Date(recent.created_at).getTime();
    if (age < RESEND_COOLDOWN_MS) {
      return {
        ok: false,
        error: "لطفاً قبل از ارسال مجدد کمی صبر کنید.",
        retryAfterSec: Math.ceil((RESEND_COOLDOWN_MS - age) / 1000),
      };
    }
  }

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();

  const { error: insertErr } = await admin.from("gh_phone_otp_challenges").insert({
    phone_e164: phoneE164,
    purpose,
    invite_id: purpose === "invite_accept" ? inviteId! : null,
    code_hash: hashOtp(code),
    attempts: 0,
    max_attempts: MAX_ATTEMPTS,
    expires_at: expiresAt,
  });

  if (insertErr) {
    console.error("[gh/otp] insert", insertErr.message);
    return { ok: false, error: "ارسال کد ناموفق بود." };
  }

  const sms = await sendKavenegarLookup({
    receptor: phoneE164ToLocal(phoneE164),
    token: code,
  });

  if (!sms.ok) {
    console.error("[gh/otp] kavenegar", sms.error);
    return { ok: false, error: "ارسال پیامک ناموفق بود. لطفاً دوباره تلاش کنید." };
  }

  return { ok: true, cooldownSec: Math.floor(RESEND_COOLDOWN_MS / 1000) };
}

export async function verifyGrowthHubPhoneOtp(params: {
  phoneE164: string;
  purpose: GhOtpPurpose;
  code: string;
  inviteId?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const code = params.code.replace(/\D/g, "");
  if (code.length !== 6) {
    return { ok: false, error: "کد تأیید نامعتبر است." };
  }

  const admin = getSupabaseAdmin();
  let query = admin
    .from("gh_phone_otp_challenges")
    .select("id, code_hash, attempts, max_attempts, expires_at, invite_id, consumed_at")
    .eq("phone_e164", params.phoneE164)
    .eq("purpose", params.purpose)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  if (params.purpose === "invite_accept" && params.inviteId) {
    query = query.eq("invite_id", params.inviteId);
  }

  const { data: challenge, error } = await query.maybeSingle();
  if (error || !challenge) {
    return { ok: false, error: "کد تأیید یافت نشد یا منقضی شده است." };
  }
  if (new Date(challenge.expires_at).getTime() <= Date.now()) {
    return { ok: false, error: "کد تأیید منقضی شده است." };
  }
  if (challenge.attempts >= challenge.max_attempts) {
    return { ok: false, error: "تعداد تلاش بیش از حد است. کد جدید دریافت کنید." };
  }

  const match = safeEqualHash(challenge.code_hash, hashOtp(code));
  if (!match) {
    await admin
      .from("gh_phone_otp_challenges")
      .update({ attempts: challenge.attempts + 1 })
      .eq("id", challenge.id);
    return { ok: false, error: "کد تأیید نادرست است." };
  }

  await admin
    .from("gh_phone_otp_challenges")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", challenge.id);

  return { ok: true };
}

/** Create or refresh a phone Auth user and return credentials for SSR sign-in. */
export async function ensurePhoneAuthUser(phoneE164: string): Promise<
  | { ok: true; email: string; password: string; userId: string }
  | { ok: false; error: string }
> {
  const admin = getSupabaseAdmin();
  const email = phoneToAuthEmail(phoneE164);
  const password = generateInviteToken();

  // Prefer existing Growth Hub profile bound to this phone.
  const { data: profile } = await admin
    .from("gh_profiles")
    .select("id")
    .eq("phone", phoneE164)
    .maybeSingle();

  if (profile?.id) {
    const { error: updErr } = await admin.auth.admin.updateUserById(profile.id, {
      password,
      phone: phoneE164,
      phone_confirm: true,
      email,
      email_confirm: true,
    });
    if (updErr) {
      console.error("[gh/otp] updateUser", updErr.message);
      return { ok: false, error: "ورود ناموفق بود." };
    }
    return { ok: true, email, password, userId: profile.id };
  }

  const created = await admin.auth.admin.createUser({
    email,
    password,
    phone: phoneE164,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: { gh_phone_auth: true },
  });

  if (!created.error && created.data.user?.id) {
    await admin.from("gh_profiles").upsert({
      id: created.data.user.id,
      phone: phoneE164,
    });
    return { ok: true, email, password, userId: created.data.user.id };
  }

  const already =
    /already|registered|exists|duplicate/i.test(created.error?.message ?? "") ||
    created.error?.status === 422;

  if (!already) {
    console.error("[gh/otp] createUser", created.error?.message);
    return { ok: false, error: "ساخت حساب ناموفق بود." };
  }

  // Email collision without profile row: rotate via list filter (bounded).
  const { data: listed, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) {
    console.error("[gh/otp] listUsers", listErr.message);
    return { ok: false, error: "ورود ناموفق بود." };
  }

  const existing =
    listed.users.find((u) => u.email === email) ||
    listed.users.find((u) => u.phone === phoneE164);

  if (!existing) {
    return { ok: false, error: "حساب پیدا نشد. دوباره تلاش کنید." };
  }

  const { error: updErr } = await admin.auth.admin.updateUserById(existing.id, {
    password,
    phone: phoneE164,
    phone_confirm: true,
    email_confirm: true,
  });
  if (updErr) {
    console.error("[gh/otp] updateUser", updErr.message);
    return { ok: false, error: "ورود ناموفق بود." };
  }

  await admin.from("gh_profiles").upsert({
    id: existing.id,
    phone: phoneE164,
  });

  return { ok: true, email, password, userId: existing.id };
}

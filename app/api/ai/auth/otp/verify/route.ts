import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";
import { hashPassword } from "@/lib/aiAuth";
import { createAiUserAccount } from "@/lib/aiAuthRegister";
import {
  clientIpFromRequest,
  issueAISessionCookie,
} from "@/lib/aiDeviceSessions";
import {
  AI_OTP_VERIFY_PER_MINUTE,
  consumeAiOtp,
  isAiOtpPurpose,
  type AiOtpPurpose,
} from "@/lib/aiOtp";
import { normalizeContact } from "@/lib/validateContact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function rateLimited(key: string, max: number): { limited: boolean; retryAfterSec: number } {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= max) {
    const oldest = arr[0] ?? now;
    return {
      limited: true,
      retryAfterSec: Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000)),
    };
  }
  arr.push(now);
  hits.set(key, arr);
  return { limited: false, retryAfterSec: 0 };
}

function str(v: unknown, max = 200): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

/**
 * POST /api/ai/auth/otp/verify
 * purpose=auth:     { phone, code } — login or passwordless register
 * purpose=login:    { phone, code }
 * purpose=register: { phone, code, password, utm_*? }
 * purpose=reset:    { phone, code, password }
 */
export async function POST(req: NextRequest) {
  const ip = clientIpFromRequest(req);
  const ipLimit = rateLimited(`verify:ip:${ip}`, AI_OTP_VERIFY_PER_MINUTE);
  if (ipLimit.limited) {
    return jsonNoStore(
      { ok: false, error: "rate_limited", retryAfterSec: ipLimit.retryAfterSec },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const rawPhone = str(body.phone, 20);
  const code = str(body.code, 12);
  const purposeRaw = str(body.purpose, 20);
  const password = str(body.password, 200);

  if (!rawPhone || !code || !purposeRaw) {
    return jsonNoStore({ ok: false, error: "missing_fields" }, { status: 422 });
  }
  if (!isAiOtpPurpose(purposeRaw)) {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }
  const purpose: AiOtpPurpose = purposeRaw;

  if ((purpose === "register" || purpose === "reset") && !password) {
    return jsonNoStore({ ok: false, error: "missing_fields" }, { status: 422 });
  }
  if (password && password.length < 6) {
    return jsonNoStore({ ok: false, error: "password_too_short" }, { status: 422 });
  }

  const { kind, value: phone } = normalizeContact(rawPhone);
  if (kind !== "phone") {
    return jsonNoStore({ ok: false, error: "invalid_phone" }, { status: 422 });
  }

  const phoneLimit = rateLimited(`verify:phone:${phone}`, AI_OTP_VERIFY_PER_MINUTE);
  if (phoneLimit.limited) {
    return jsonNoStore(
      { ok: false, error: "rate_limited", retryAfterSec: phoneLimit.retryAfterSec },
      { status: 429 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const consumed = await consumeAiOtp(supabase, { phone, purpose, code });
    if (!consumed.ok) {
      const status =
        consumed.error === "invalid_otp" ||
        consumed.error === "otp_expired" ||
        consumed.error === "otp_not_found" ||
        consumed.error === "otp_locked"
          ? 401
          : 500;
      return jsonNoStore({ ok: false, error: consumed.error }, { status });
    }

    async function finishLogin(userId: string, plan: string, credits: unknown) {
      await supabase
        .from("ai_users")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", userId);
      const res = jsonNoStore({
        ok: true,
        isNewUser: false,
        user: { id: userId, plan, credits },
      });
      await issueAISessionCookie(res, req, userId, plan);
      return res;
    }

    if (purpose === "auth" || purpose === "login") {
      const { data, error } = await supabase
        .from("ai_users")
        .select("id, plan, credits")
        .eq("phone", phone)
        .maybeSingle();
      if (error) {
        console.error("[api/ai/auth/otp/verify login]", error);
        return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
      }

      if (data) {
        return finishLogin(data.id as string, data.plan as string, data.credits);
      }

      if (purpose === "login") {
        return jsonNoStore({ ok: false, error: "phone_not_found" }, { status: 404 });
      }

      const created = await createAiUserAccount(supabase, {
        phone,
        password: randomBytes(24).toString("base64url"),
        utm: {
          utm_source: str(body.utm_source, 200),
          utm_medium: str(body.utm_medium, 200),
          utm_campaign: str(body.utm_campaign, 200),
        },
        req,
      });
      if (!created.ok) {
        const status = created.error === "phone_taken" ? 409 : 500;
        return jsonNoStore({ ok: false, error: created.error }, { status });
      }
      const res = jsonNoStore({
        ok: true,
        isNewUser: true,
        user: {
          id: created.user.id,
          plan: created.user.plan,
          credits: created.user.credits,
        },
        referralCode: created.user.referralCode,
      });
      await issueAISessionCookie(res, req, created.user.id, created.user.plan);
      return res;
    }

    if (purpose === "register") {
      const created = await createAiUserAccount(supabase, {
        phone,
        password: password!,
        utm: {
          utm_source: str(body.utm_source, 200),
          utm_medium: str(body.utm_medium, 200),
          utm_campaign: str(body.utm_campaign, 200),
        },
        req,
      });
      if (!created.ok) {
        const status = created.error === "phone_taken" ? 409 : 500;
        return jsonNoStore({ ok: false, error: created.error }, { status });
      }
      const res = jsonNoStore({
        ok: true,
        isNewUser: true,
        user: {
          id: created.user.id,
          plan: created.user.plan,
          credits: created.user.credits,
        },
        referralCode: created.user.referralCode,
      });
      await issueAISessionCookie(res, req, created.user.id, created.user.plan);
      return res;
    }

    const { data: user, error: userErr } = await supabase
      .from("ai_users")
      .select("id, plan, credits")
      .eq("phone", phone)
      .maybeSingle();
    if (userErr) {
      console.error("[api/ai/auth/otp/verify reset]", userErr);
      return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
    }
    if (!user) {
      return jsonNoStore({ ok: false, error: "phone_not_found" }, { status: 404 });
    }

    const { error: updErr } = await supabase
      .from("ai_users")
      .update({
        password_hash: hashPassword(password!),
        last_login_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (updErr) {
      console.error("[api/ai/auth/otp/verify reset update]", updErr);
      return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
    }

    const res = jsonNoStore({
      ok: true,
      isNewUser: false,
      user: { id: user.id, plan: user.plan, credits: user.credits },
    });
    await issueAISessionCookie(res, req, user.id as string, user.plan as string);
    return res;
  } catch (e) {
    console.error("[api/ai/auth/otp/verify]", e);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
}

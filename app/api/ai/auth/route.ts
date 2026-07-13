import { NextRequest, NextResponse } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  AI_COOKIE,
  getAISession,
  hashPassword,
  signAIToken,
  verifyPassword,
  type AISession,
} from "@/lib/aiAuth";
import { findActiveContentSalesOrder, maskPhone } from "@/lib/contentSalesOrder";
import { isE2eMode } from "@/lib/e2eMode";
import { withPublicTimeout } from "@/lib/publicDataFetch";
import { generateReferralCode } from "@/lib/aiPromo";
import { normalizeContact } from "@/lib/validateContact";
import { getGuestState, MAX_GUEST_BATTLES, MAX_GUEST_DIRECT } from "@/lib/aiGuest";
import { FREE_SIGNUP_CREDITS } from "@/lib/aiPricingConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function str(v: unknown, max = 200): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

function setAICookie(res: NextResponse, token: string) {
  res.cookies.set(AI_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // ۳۰ روز
  });
}

function sessionAuthFallback(session: AISession) {
  return jsonNoStore({
    ok: true,
    authed: true,
    user: {
      id: session.userId,
      plan: session.plan,
    },
    hasContentSalesBundle: false,
  });
}

// ثبت‌نام
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return jsonNoStore({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const rawPhone = str(body.phone, 20);
  const password = str(body.password, 200);

  if (!rawPhone || !password) {
    return jsonNoStore({ ok: false, error: "missing_fields" }, { status: 422 });
  }
  if (password.length < 6) {
    return jsonNoStore({ ok: false, error: "password_too_short" }, { status: 422 });
  }

  const { kind, value: phone } = normalizeContact(rawPhone);
  if (kind !== "phone") {
    return jsonNoStore({ ok: false, error: "invalid_phone" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // بررسی تکراری نبودن
    const { data: existing } = await supabase
      .from("ai_users")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (existing) {
      return jsonNoStore({ ok: false, error: "phone_taken" }, { status: 409 });
    }

    const password_hash = hashPassword(password);

    const utmSource = str(body.utm_source, 200);
    const utmMedium = str(body.utm_medium, 200);
    const utmCampaign = str(body.utm_campaign, 200);

    const { data: user, error } = await supabase
      .from("ai_users")
      .insert({
        phone,
        password_hash,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
      })
      .select("id, plan, credits")
      .single();

    if (error || !user) {
      console.error("[api/ai/auth POST]", error);
      if ((error as { code?: string } | null)?.code === "23505") {
        return jsonNoStore({ ok: false, error: "phone_taken" }, { status: 409 });
      }
      return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
    }

    const signupExpiresAt = new Date();
    signupExpiresAt.setUTCFullYear(signupExpiresAt.getUTCFullYear() + 1);
    const { error: lotError } = await supabase.from("ai_credit_lots").insert({
      user_id: user.id,
      source: "signup_bonus",
      amount: FREE_SIGNUP_CREDITS,
      remaining: FREE_SIGNUP_CREDITS,
      expires_at: signupExpiresAt.toISOString(),
      metadata: {
        guest_token: getGuestState(req)?.token ?? null,
        signup_bonus_granted: true,
      },
    });
    const { error: ledgerError } = lotError
      ? { error: lotError }
      : await supabase.from("ai_credit_ledger").insert({
          user_id: user.id,
          delta: FREE_SIGNUP_CREDITS,
          balance_after: FREE_SIGNUP_CREDITS,
          reason: "signup_bonus",
          note: "initial signup credit grant",
        });
    if (lotError || ledgerError) {
      console.error("[api/ai/auth POST] signup credit grant failed");
      await supabase.from("ai_users").delete().eq("id", user.id);
      return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
    }

    // ساخت کد معرفی AI-XXXXXX
    let referralCode: string | null = null;
    for (let attempt = 0; attempt < 8; attempt++) {
      const code = generateReferralCode();
      const { error: refErr } = await supabase.from("ai_referral_codes").insert({
        user_id: user.id,
        code,
      });
      if (!refErr) {
        referralCode = code;
        break;
      }
    }

    const res = jsonNoStore({
      ok: true,
      user: { id: user.id, plan: user.plan, credits: user.credits },
      referralCode,
    });
    setAICookie(res, signAIToken(user.id as string, user.plan as string));
    return res;
  } catch (e) {
    console.error("[api/ai/auth POST]", e);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// ورود
export async function PUT(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return jsonNoStore({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const rawPhone = str(body.phone, 20);
  const password = str(body.password, 200);

  if (!rawPhone || !password) {
    return jsonNoStore({ ok: false, error: "missing_fields" }, { status: 422 });
  }

  const { kind, value: phone } = normalizeContact(rawPhone);
  if (kind !== "phone") {
    return jsonNoStore({ ok: false, error: "invalid_phone" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("ai_users")
      .select("id, plan, credits, password_hash")
      .eq("phone", phone)
      .maybeSingle();

    if (error) {
      console.error("[api/ai/auth PUT]", error);
      return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
    }

    if (!data || !verifyPassword(password, data.password_hash as string)) {
      return jsonNoStore({ ok: false, error: "invalid_credentials" }, { status: 401 });
    }

    await supabase
      .from("ai_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.id);

    const res = jsonNoStore({
      ok: true,
      user: { id: data.id, plan: data.plan, credits: data.credits },
    });
    setAICookie(res, signAIToken(data.id as string, data.plan as string));
    return res;
  } catch (e) {
    console.error("[api/ai/auth PUT]", e);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// بررسی نشست
export async function GET(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    const guest = getGuestState(req);
    const guestBattlesRemaining = guest?.remaining ?? MAX_GUEST_BATTLES;
    const guestDirectRemaining = guest?.directRemaining ?? MAX_GUEST_DIRECT;
    return jsonNoStore({
      ok: true,
      authed: false,
      guestBattlesRemaining,
      guestDirectRemaining,
    });
  }

  try {
    const supabase = getSupabaseAdmin();
    const [userResult, bundleOrder] = await Promise.all([
      withPublicTimeout(
        supabase
          .from("ai_users")
          .select("id, plan, credits, phone")
          .eq("id", session.userId)
          .maybeSingle(),
        "auth/session-user"
      ),
      isE2eMode()
        ? Promise.resolve(null)
        : withPublicTimeout(
            findActiveContentSalesOrder(supabase, { aiUserId: session.userId }),
            "auth/content-bundle"
          ),
    ]);

    if (userResult === null) return sessionAuthFallback(session);

    const data = userResult.data;
    if (!data) return jsonNoStore({ ok: true, authed: false });

    return jsonNoStore({
      ok: true,
      authed: true,
      user: {
        id: data.id,
        plan: data.plan,
        credits: data.credits,
        phoneMasked: maskPhone(data.phone as string),
      },
      hasContentSalesBundle: !!bundleOrder,
      contentSalesAppUrl: bundleOrder ? "/ai/content-sales/app" : null,
    });
  } catch {
    return sessionAuthFallback(session);
  }
}

// خروج
export async function DELETE() {
  const res = jsonNoStore({ ok: true });
  res.cookies.set(AI_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

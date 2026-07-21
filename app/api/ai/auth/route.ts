import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyPassword, getAISession, type AISession } from "@/lib/aiAuth";
import { createAiUserAccount } from "@/lib/aiAuthRegister";
import {
  clearAICookie,
  clientIpFromRequest,
  getActiveAISession,
  issueAISessionCookie,
  revokeCurrentDeviceSession,
} from "@/lib/aiDeviceSessions";
import { findActiveContentSalesOrder, maskPhone } from "@/lib/contentSalesOrder";
import { isE2eMode } from "@/lib/e2eMode";
import { withPublicTimeout } from "@/lib/publicDataFetch";
import { normalizeContact } from "@/lib/validateContact";
import { getGuestState, MAX_GUEST_BATTLES, MAX_GUEST_DIRECT } from "@/lib/aiGuest";

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

function str(v: unknown, max = 200): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
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
  const ip = clientIpFromRequest(req);
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

    const { data: existing } = await supabase
      .from("ai_users")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (existing) {
      return jsonNoStore({ ok: false, error: "phone_taken" }, { status: 409 });
    }

    const created = await createAiUserAccount(supabase, {
      phone,
      password,
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
      user: {
        id: created.user.id,
        plan: created.user.plan,
        credits: created.user.credits,
      },
      referralCode: created.user.referralCode,
    });
    await issueAISessionCookie(res, req, created.user.id, created.user.plan);
    return res;
  } catch (e) {
    console.error("[api/ai/auth POST]", e);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// ورود
export async function PUT(req: NextRequest) {
  const ip = clientIpFromRequest(req);
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
    await issueAISessionCookie(res, req, data.id as string, data.plan as string);
    return res;
  } catch (e) {
    console.error("[api/ai/auth PUT]", e);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// بررسی نشست
export async function GET(req: NextRequest) {
  const raw = getAISession(req);
  const session = await getActiveAISession(req);
  if (!session) {
    const guest = getGuestState(req);
    const guestBattlesRemaining = guest?.remaining ?? MAX_GUEST_BATTLES;
    const guestDirectRemaining = guest?.directRemaining ?? MAX_GUEST_DIRECT;
    const res = jsonNoStore({
      ok: true,
      authed: false,
      guestBattlesRemaining,
      guestDirectRemaining,
    });
    // توکن معتبر ولی نشست revoke شده → کوکی را پاک کن
    if (raw?.sessionId) clearAICookie(res);
    return res;
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
export async function DELETE(req: NextRequest) {
  const session = await getActiveAISession(req);
  await revokeCurrentDeviceSession(session);
  const res = jsonNoStore({ ok: true });
  clearAICookie(res);
  return res;
}

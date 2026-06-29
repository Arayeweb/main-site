import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  AI_COOKIE,
  getAISession,
  hashPassword,
  signAIToken,
  verifyPassword,
} from "@/lib/aiAuth";
import { normalizeContact } from "@/lib/validateContact";

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

// ثبت‌نام
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const rawPhone = str(body.phone, 20);
  const password = str(body.password, 200);

  if (!rawPhone || !password) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 422 });
  }
  if (password.length < 6) {
    return NextResponse.json({ ok: false, error: "password_too_short" }, { status: 422 });
  }

  const { kind, value: phone } = normalizeContact(rawPhone);
  if (kind !== "phone") {
    return NextResponse.json({ ok: false, error: "invalid_phone" }, { status: 422 });
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
      return NextResponse.json({ ok: false, error: "phone_taken" }, { status: 409 });
    }

    const password_hash = hashPassword(password);

    const { data: user, error } = await supabase
      .from("ai_users")
      .insert({ phone, password_hash })
      .select("id, plan, credits")
      .single();

    if (error || !user) {
      console.error("[api/ai/auth POST]", error);
      return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
    }

    const res = NextResponse.json({
      ok: true,
      user: { id: user.id, plan: user.plan, credits: user.credits },
    });
    setAICookie(res, signAIToken(user.id as string, user.plan as string));
    return res;
  } catch (e) {
    console.error("[api/ai/auth POST]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// ورود
export async function PUT(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const rawPhone = str(body.phone, 20);
  const password = str(body.password, 200);

  if (!rawPhone || !password) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 422 });
  }

  const { kind, value: phone } = normalizeContact(rawPhone);
  if (kind !== "phone") {
    return NextResponse.json({ ok: false, error: "invalid_phone" }, { status: 422 });
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
      return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
    }

    if (!data || !verifyPassword(password, data.password_hash as string)) {
      return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
    }

    await supabase
      .from("ai_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.id);

    const res = NextResponse.json({
      ok: true,
      user: { id: data.id, plan: data.plan, credits: data.credits },
    });
    setAICookie(res, signAIToken(data.id as string, data.plan as string));
    return res;
  } catch (e) {
    console.error("[api/ai/auth PUT]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// بررسی نشست
export async function GET(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: true, authed: false });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("ai_users")
      .select("id, plan, credits, brainstorm_demos")
      .eq("id", session.userId)
      .maybeSingle();

    if (!data) return NextResponse.json({ ok: true, authed: false });

    return NextResponse.json({
      ok: true,
      authed: true,
      user: {
        id: data.id,
        plan: data.plan,
        credits: data.credits,
        brainstorm_demos: data.brainstorm_demos,
      },
    });
  } catch {
    return NextResponse.json({ ok: true, authed: false });
  }
}

// خروج
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AI_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

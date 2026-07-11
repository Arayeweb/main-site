import { NextRequest, NextResponse } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  ADREADY_COOKIE,
  getAdReadySession,
  hashPassword,
  signAdReadyToken,
  verifyPassword,
} from "@/lib/adreadySession";
import { maskPhone } from "@/lib/contentSalesOrder";
import { withPublicTimeout } from "@/lib/publicDataFetch";
import { normalizeContact } from "@/lib/validateContact";
import {
  ensureAdReadyUserFromAi,
  findAiUserForBridge,
  normalizeAdReadyUserStatus,
} from "@/lib/adreadyUserBridge";

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

function setAdReadyCookie(res: NextResponse, token: string) {
  res.cookies.set(ADREADY_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

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

    const { data: existing } = await supabase
      .from("adready_users")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (existing) {
      return jsonNoStore({ ok: false, error: "phone_taken" }, { status: 409 });
    }

    const aiUser = await findAiUserForBridge(supabase, phone);
    if (aiUser) {
      if (!verifyPassword(password, aiUser.password_hash)) {
        return jsonNoStore({ ok: false, error: "phone_taken" }, { status: 409 });
      }
      const bridged = await ensureAdReadyUserFromAi(supabase, aiUser);
      if (!bridged) {
        return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
      }
      const res = jsonNoStore({
        ok: true,
        user: { id: bridged.id },
      });
      setAdReadyCookie(res, signAdReadyToken(bridged.id));
      return res;
    }

    const password_hash = hashPassword(password);
    const utmSource = str(body.utm_source, 200);
    const utmMedium = str(body.utm_medium, 200);
    const utmCampaign = str(body.utm_campaign, 200);

    const { data: user, error } = await supabase
      .from("adready_users")
      .insert({
        phone,
        password_hash,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
      })
      .select("id")
      .single();

    if (error || !user) {
      console.error("[api/adready/auth POST]", error);
      return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
    }

    const res = jsonNoStore({
      ok: true,
      user: { id: user.id },
    });
    setAdReadyCookie(res, signAdReadyToken(user.id as string));
    return res;
  } catch (e) {
    console.error("[api/adready/auth POST]", e);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
}

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
      .from("adready_users")
      .select("id, password_hash, status")
      .eq("phone", phone)
      .maybeSingle();

    if (error) {
      console.error("[api/adready/auth PUT]", error);
      return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
    }

    let userId: string | null = null;

    if (
      data &&
      data.status === "active" &&
      verifyPassword(password, data.password_hash as string)
    ) {
      userId = data.id as string;
    } else {
      const aiUser = await findAiUserForBridge(supabase, phone);
      if (
        aiUser &&
        verifyPassword(password, aiUser.password_hash) &&
        normalizeAdReadyUserStatus(aiUser.status) === "active"
      ) {
        const bridged = await ensureAdReadyUserFromAi(supabase, aiUser);
        userId = bridged?.id ?? null;
      }
    }

    if (!userId) {
      return jsonNoStore({ ok: false, error: "invalid_credentials" }, { status: 401 });
    }

    await supabase
      .from("adready_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", userId);

    const res = jsonNoStore({
      ok: true,
      user: { id: userId },
    });
    setAdReadyCookie(res, signAdReadyToken(userId));
    return res;
  } catch (e) {
    console.error("[api/adready/auth PUT]", e);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = getAdReadySession(req);
  if (!session) {
    return jsonNoStore({ ok: true, authed: false });
  }

  try {
    const supabase = getSupabaseAdmin();
    const userResult = await withPublicTimeout(
      supabase
        .from("adready_users")
        .select("id, phone, status")
        .eq("id", session.userId)
        .maybeSingle(),
      "adready-auth/session-user"
    );

    const data = userResult?.data;
    if (!data || data.status !== "active") {
      return jsonNoStore({ ok: true, authed: false });
    }

    return jsonNoStore({
      ok: true,
      authed: true,
      user: {
        id: data.id,
        phoneMasked: maskPhone(data.phone as string),
      },
    });
  } catch {
    return jsonNoStore({ ok: true, authed: false });
  }
}

export async function DELETE() {
  const res = jsonNoStore({ ok: true });
  res.cookies.set(ADREADY_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

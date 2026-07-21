import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";
import { clientIpFromRequest } from "@/lib/aiDeviceSessions";
import { isAiOtpPurpose, createAndSendAiOtp, type AiOtpPurpose } from "@/lib/aiOtp";
import { normalizeContact } from "@/lib/validateContact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
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

/**
 * POST /api/ai/auth/otp/send
 * body: { phone, purpose: 'login' | 'register' | 'reset' }
 */
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
  const purposeRaw = str(body.purpose, 20);
  if (!rawPhone || !purposeRaw) {
    return jsonNoStore({ ok: false, error: "missing_fields" }, { status: 422 });
  }
  if (!isAiOtpPurpose(purposeRaw)) {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }
  const purpose: AiOtpPurpose = purposeRaw;

  const { kind, value: phone } = normalizeContact(rawPhone);
  if (kind !== "phone") {
    return jsonNoStore({ ok: false, error: "invalid_phone" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: existing, error: userErr } = await supabase
      .from("ai_users")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (userErr) {
      console.error("[api/ai/auth/otp/send]", userErr);
      return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
    }

    if (purpose === "register" && existing) {
      return jsonNoStore({ ok: false, error: "phone_taken" }, { status: 409 });
    }
    if ((purpose === "login" || purpose === "reset") && !existing) {
      return jsonNoStore({ ok: false, error: "phone_not_found" }, { status: 404 });
    }

    const result = await createAndSendAiOtp(supabase, { phone, purpose });
    if (!result.ok) {
      const status =
        result.error === "otp_cooldown" || result.error === "otp_send_limit"
          ? 429
          : result.error === "invalid_phone"
            ? 422
            : 502;
      return jsonNoStore(
        {
          ok: false,
          error: result.error,
          retryAfterSec: result.retryAfterSec,
        },
        { status }
      );
    }

    const res: Record<string, unknown> = {
      ok: true,
      expiresAt: result.expiresAt,
      resendAfterSec: result.resendAfterSec,
    };
    if (result.debugCode) res.debugCode = result.debugCode;
    return jsonNoStore(res);
  } catch (e) {
    console.error("[api/ai/auth/otp/send]", e);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
}

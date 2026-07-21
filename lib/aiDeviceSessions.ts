import type { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  AI_COOKIE,
  getAISession,
  newDeviceSessionId,
  signAIToken,
  type AISession,
} from "@/lib/aiAuth";

const TOUCH_MIN_INTERVAL_MS = 5 * 60 * 1000;

export type DeviceKind = "desktop" | "mobile" | "tablet" | "unknown";

export type DeviceSessionRow = {
  id: string;
  created_at: string;
  last_seen_at: string;
  user_agent: string | null;
  ip: string | null;
  device_label: string;
  device_kind: DeviceKind;
  is_current: boolean;
};

export function clientIpFromRequest(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim().slice(0, 64);
  return (req.headers.get("x-real-ip") || "unknown").slice(0, 64);
}

/** برچسب و نوع دستگاه از User-Agent — ساده و خوانا برای کاربر فارسی‌زبان. */
export function parseDeviceFromUa(uaRaw: string | null | undefined): {
  label: string;
  kind: DeviceKind;
} {
  const ua = (uaRaw || "").trim();
  if (!ua) return { label: "دستگاه ناشناس", kind: "unknown" };

  const lower = ua.toLowerCase();
  let kind: DeviceKind = "desktop";
  if (/ipad|tablet|kindle|silk|playbook/.test(lower)) kind = "tablet";
  else if (/mobi|iphone|android.*mobile|windows phone/.test(lower)) kind = "mobile";

  let browser = "مرورگر";
  if (/edg\//.test(lower)) browser = "Edge";
  else if (/chrome\//.test(lower) && !/edg\//.test(lower)) browser = "Chrome";
  else if (/safari\//.test(lower) && !/chrome\//.test(lower)) browser = "Safari";
  else if (/firefox\//.test(lower)) browser = "Firefox";
  else if (/opr\//.test(lower) || /opera/.test(lower)) browser = "Opera";

  let os = "";
  if (/iphone|ipad|ipod/.test(lower)) os = "iOS";
  else if (/android/.test(lower)) os = "Android";
  else if (/mac os x|macintosh/.test(lower)) os = "macOS";
  else if (/windows/.test(lower)) os = "Windows";
  else if (/linux/.test(lower)) os = "Linux";

  const place =
    kind === "mobile" ? "موبایل" : kind === "tablet" ? "تبلت" : "دسکتاپ";
  const label = os ? `${browser} روی ${os}` : `${browser} — ${place}`;
  return { label, kind };
}

export function setAICookie(res: NextResponse, token: string) {
  res.cookies.set(AI_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function clearAICookie(res: NextResponse) {
  res.cookies.set(AI_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/**
 * ردیف نشست دستگاه می‌سازد و توکن کوکی با sid برمی‌گرداند.
 * اگر insert شکست بخورد، توکن بدون sid صادر می‌شود (backward-compatible).
 */
export async function issueAISessionCookie(
  res: NextResponse,
  req: NextRequest,
  userId: string,
  plan: string
): Promise<string> {
  const sessionId = newDeviceSessionId();
  const ua = req.headers.get("user-agent");
  const { label, kind } = parseDeviceFromUa(ua);
  const ip = clientIpFromRequest(req);

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("ai_device_sessions").insert({
      id: sessionId,
      user_id: userId,
      user_agent: ua ? ua.slice(0, 500) : null,
      ip,
      device_label: label,
      device_kind: kind,
    });
    if (error) {
      console.error("[aiDeviceSessions] insert failed:", error);
      const token = signAIToken(userId, plan);
      setAICookie(res, token);
      return token;
    }
  } catch (e) {
    console.error("[aiDeviceSessions] insert error:", e);
    const token = signAIToken(userId, plan);
    setAICookie(res, token);
    return token;
  }

  const token = signAIToken(userId, plan, { sessionId });
  setAICookie(res, token);
  return token;
}

/** توکن را verify می‌کند و در صورت وجود sid، revoke نبودن را از DB چک می‌کند. */
export async function getActiveAISession(
  req: NextRequest
): Promise<AISession | null> {
  const session = getAISession(req);
  if (!session) return null;
  if (!session.sessionId) return session;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("ai_device_sessions")
      .select("id, revoked_at, last_seen_at")
      .eq("id", session.sessionId)
      .eq("user_id", session.userId)
      .maybeSingle();

    if (error) {
      console.error("[aiDeviceSessions] active check failed:", error);
      return session; // fail-open برای پایداری سرویس
    }
    if (!data || data.revoked_at) return null;

    const lastSeen = data.last_seen_at
      ? new Date(data.last_seen_at as string).getTime()
      : 0;
    if (Date.now() - lastSeen > TOUCH_MIN_INTERVAL_MS) {
      void supabase
        .from("ai_device_sessions")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", session.sessionId)
        .then(({ error: touchErr }) => {
          if (touchErr) {
            console.error("[aiDeviceSessions] touch failed:", touchErr);
          }
        });
    }

    return session;
  } catch (e) {
    console.error("[aiDeviceSessions] active check error:", e);
    return session;
  }
}

export async function listDeviceSessions(
  userId: string,
  currentSessionId?: string | null
): Promise<DeviceSessionRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ai_device_sessions")
    .select(
      "id, created_at, last_seen_at, user_agent, ip, device_label, device_kind"
    )
    .eq("user_id", userId)
    .is("revoked_at", null)
    .order("last_seen_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[aiDeviceSessions] list failed:", error);
    throw error;
  }

  return (data || []).map((row) => ({
    id: row.id as string,
    created_at: row.created_at as string,
    last_seen_at: row.last_seen_at as string,
    user_agent: (row.user_agent as string) || null,
    ip: (row.ip as string) || null,
    device_label: (row.device_label as string) || "دستگاه ناشناس",
    device_kind: (row.device_kind as DeviceKind) || "unknown",
    is_current: Boolean(currentSessionId && row.id === currentSessionId),
  }));
}

export async function revokeDeviceSession(
  userId: string,
  sessionId: string
): Promise<"ok" | "not_found" | "error"> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ai_device_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", userId)
    .is("revoked_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[aiDeviceSessions] revoke failed:", error);
    return "error";
  }
  if (!data) return "not_found";
  return "ok";
}

export async function revokeOtherDeviceSessions(
  userId: string,
  keepSessionId: string | null | undefined
): Promise<number> {
  const supabase = getSupabaseAdmin();
  let q = supabase
    .from("ai_device_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("revoked_at", null);

  if (keepSessionId) {
    q = q.neq("id", keepSessionId);
  }

  const { data, error } = await q.select("id");
  if (error) {
    console.error("[aiDeviceSessions] revokeOthers failed:", error);
    throw error;
  }
  return data?.length ?? 0;
}

export async function revokeCurrentDeviceSession(
  session: AISession | null
): Promise<void> {
  if (!session?.sessionId) return;
  await revokeDeviceSession(session.userId, session.sessionId);
}

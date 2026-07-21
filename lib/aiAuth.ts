import { createHmac, timingSafeEqual, randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { hashPassword, verifyPassword } from "./auth";

// =========================================================
// احراز هویت کاربران اتاق فکر هوشمند آرایه (araaye.com/ai)
// توکن HMAC با همان مکانیزم admin — اما payload و cookie جدا.
// =========================================================

export const AI_COOKIE = "ary_ai_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // ۳۰ روز

export interface AISession {
  userId: string;
  plan: string;
  exp: number;
  /** شناسه ردیف ai_device_sessions — برای توکن‌های قدیمی ممکن است نباشد */
  sessionId?: string;
}

function aiSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "ADMIN_SESSION_SECRET باید در .env.local تنظیم شود (حداقل ۱۶ کاراکتر)."
    );
  }
  // پیشوند ai: برای متمایز کردن از توکن‌های admin
  return `ai:${s}`;
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export type SignAITokenOptions = {
  ttlMs?: number;
  sessionId?: string;
};

/** توکن نشست امضاشده برای کاربر AI می‌سازد. */
export function signAIToken(
  userId: string,
  plan: string,
  ttlMsOrOptions: number | SignAITokenOptions = SESSION_TTL_MS
): string {
  const opts: SignAITokenOptions =
    typeof ttlMsOrOptions === "number"
      ? { ttlMs: ttlMsOrOptions }
      : ttlMsOrOptions;
  const ttlMs = opts.ttlMs ?? SESSION_TTL_MS;
  const payload: Record<string, unknown> = {
    sub: userId,
    plan,
    exp: Date.now() + ttlMs,
  };
  if (opts.sessionId) payload.sid = opts.sessionId;
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = createHmac("sha256", aiSecret()).update(body).digest("hex");
  return `${body}.${sig}`;
}

/** شناسه نشست دستگاه تازه (قبل از insert در DB). */
export function newDeviceSessionId(): string {
  return randomUUID();
}

/** توکن AI را تأیید و payload را برمی‌گرداند (بدون چک revoke در DB). */
export function verifyAIToken(
  token: string | undefined | null
): AISession | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let expected: string;
  try {
    expected = createHmac("sha256", aiSecret()).update(body).digest("hex");
  } catch {
    return null;
  }
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64").toString("utf8")
    ) as Record<string, unknown>;
    if (
      typeof payload.sub !== "string" ||
      typeof payload.plan !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Date.now()
    ) {
      return null;
    }
    const session: AISession = {
      userId: payload.sub,
      plan: payload.plan,
      exp: payload.exp,
    };
    if (typeof payload.sid === "string" && payload.sid.length > 0) {
      session.sessionId = payload.sid;
    }
    return session;
  } catch {
    return null;
  }
}

/** نشست AI را از کوکی request می‌خواند (بدون چک revoke). */
export function getAISession(req: NextRequest): AISession | null {
  return verifyAIToken(req.cookies.get(AI_COOKIE)?.value);
}

export { hashPassword, verifyPassword };

import {
  scryptSync,
  randomBytes,
  timingSafeEqual,
  createHmac,
} from "crypto";
import { NextRequest } from "next/server";

// =========================================================
// رمز عبور پروژه‌ها (scrypt) + توکن نشست کاربران پنل (HMAC)
// همه با crypto داخلی Node؛ بدون وابستگی نیتیو.
// =========================================================

const SCRYPT_KEYLEN = 64;

/** رمز را با salt تصادفی هش می‌کند → "scrypt$<saltHex>$<hashHex>". */
export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(String(plain), salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

/** رمز ورودی را با مقدار ذخیره‌شده به‌صورت timing-safe مقایسه می‌کند. */
export function verifyPassword(plain: string, stored: string): boolean {
  if (!stored) return false;
  const parts = String(stored).split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  try {
    const salt = Buffer.from(parts[1], "hex");
    const expected = Buffer.from(parts[2], "hex");
    const actual = scryptSync(String(plain), salt, expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

// ---------- توکن نشست کاربران پنل ----------
// قالب: base64url(payloadJSON).hmacHex ؛ payload شامل sub، role، exp (ms).

// نقش‌های پنل آژانس: admin | sales | support
// نقش‌های پنل عملیات Araaye AI (app/admin/ai-ops): ai_superadmin | ai_finance | ai_support | ai_ops
export type AdminRole =
  | "admin"
  | "sales"
  | "support"
  | "ai_superadmin"
  | "ai_finance"
  | "ai_support"
  | "ai_ops";
export const ROLES: AdminRole[] = [
  "admin",
  "sales",
  "support",
  "ai_superadmin",
  "ai_finance",
  "ai_support",
  "ai_ops",
];

export const AI_OPS_ROLES: AdminRole[] = ["ai_superadmin", "ai_finance", "ai_support", "ai_ops"];

export interface AdminSession {
  userId: string;
  role: AdminRole;
  exp: number;
}

function adminSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "ADMIN_SESSION_SECRET باید در .env.local تنظیم شود (حداقل ۱۶ کاراکتر)."
    );
  }
  return s;
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // ۱۲ ساعت

/** توکن نشست امضاشده برای کاربر پنل می‌سازد. */
export function signUserToken(
  userId: string,
  role: AdminRole,
  ttlMs: number = SESSION_TTL_MS
): string {
  const payload = JSON.stringify({
    sub: userId,
    role,
    exp: Date.now() + ttlMs,
  });
  const body = b64url(Buffer.from(payload, "utf8"));
  const sig = createHmac("sha256", adminSecret()).update(body).digest("hex");
  return `${body}.${sig}`;
}

/** صحت، انقضا و نقش توکن نشست را بررسی می‌کند. */
export function verifyUserToken(
  token: string | undefined | null
): AdminSession | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let expected: string;
  try {
    expected = createHmac("sha256", adminSecret()).update(body).digest("hex");
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
      !ROLES.includes(payload.role as AdminRole) ||
      typeof payload.exp !== "number" ||
      payload.exp <= Date.now()
    ) {
      return null;
    }
    return { userId: payload.sub, role: payload.role as AdminRole, exp: payload.exp };
  } catch {
    return null;
  }
}

/** نشست فعلی را از کوکی می‌خواند. */
export function getSession(req: NextRequest): AdminSession | null {
  return verifyUserToken(req.cookies.get(ADMIN_COOKIE)?.value);
}

/** آیا نشست حداقل یکی از نقش‌های مورد نظر را دارد؟ */
export function hasRole(
  session: AdminSession | null,
  roles: AdminRole[]
): boolean {
  if (!session) return false;
  return roles.includes(session.role);
}

/** نشست را می‌خواند؛ اگر مجوز نداشت 401 برمی‌گرداند. */
export function requireRole(
  req: NextRequest,
  roles: AdminRole[]
): AdminSession | Response {
  const session = getSession(req);
  if (!session || !roles.includes(session.role)) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}

/** رمز ادمین fallback را با ADMIN_PASSWORD (به‌صورت timing-safe) چک می‌کند. */
export function checkAdminPassword(plain: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD باید در .env.local تنظیم شود.");
  }
  const a = Buffer.from(String(plain));
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const ADMIN_COOKIE = "ary_admin";

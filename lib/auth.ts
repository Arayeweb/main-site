import {
  scryptSync,
  randomBytes,
  timingSafeEqual,
  createHmac,
} from "crypto";

// =========================================================
// رمز عبور پروژه‌ها (scrypt) + توکن نشست ادمین (HMAC)
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

// ---------- توکن نشست ادمین ----------
// قالب: base64url(payloadJSON).hmacHex ؛ payload شامل exp (ms).

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

/** توکن نشست امضاشده برای ادمین می‌سازد. */
export function signAdminToken(ttlMs: number = SESSION_TTL_MS): string {
  const payload = JSON.stringify({ role: "admin", exp: Date.now() + ttlMs });
  const body = b64url(Buffer.from(payload, "utf8"));
  const sig = createHmac("sha256", adminSecret()).update(body).digest("hex");
  return `${body}.${sig}`;
}

/** صحت و انقضای توکن نشست ادمین را بررسی می‌کند. */
export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let expected: string;
  try {
    expected = createHmac("sha256", adminSecret()).update(body).digest("hex");
  } catch {
    return false;
  }
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64").toString("utf8"));
    return payload.role === "admin" && typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

/** رمز ادمین را با ADMIN_PASSWORD (به‌صورت timing-safe) چک می‌کند. */
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

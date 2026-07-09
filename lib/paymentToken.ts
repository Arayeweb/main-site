import { createHmac, timingSafeEqual } from "crypto";

function paymentSecret(): string | null {
  const s = process.env.PAYMENT_SERVICE_SECRET?.trim();
  return s || null;
}

/** HMAC token proving Zibal verify ran on payment.araaye.com (phase 2). */
export function signPaymentVerifyToken(trackId: string, amount: number): string {
  const secret = paymentSecret();
  if (!secret) throw new Error("PAYMENT_SERVICE_SECRET not configured");
  return createHmac("sha256", secret).update(`${trackId}:${amount}`).digest("hex");
}

export function verifyPaymentVerifyToken(
  trackId: string,
  amount: number,
  token: string
): boolean {
  const secret = paymentSecret();
  if (!secret || !token) return false;
  try {
    const expected = signPaymentVerifyToken(trackId, amount);
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(token, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

import { createHmac } from "crypto";

export function signPaymentVerifyToken(trackId, amount) {
  const secret = process.env.PAYMENT_SERVICE_SECRET?.trim();
  if (!secret) throw new Error("PAYMENT_SERVICE_SECRET not configured");
  return createHmac("sha256", secret).update(`${trackId}:${amount}`).digest("hex");
}

import { timingSafeEqual } from "crypto";

const SECRET = process.env.PAYMENT_SERVICE_SECRET?.trim();

export function requirePaymentSecret(req, res, next) {
  if (!SECRET) {
    console.error("[payment-service] PAYMENT_SERVICE_SECRET not set");
    return res.status(503).json({ ok: false, error: "service_misconfigured" });
  }

  const provided = req.get("X-Payment-Secret")?.trim();
  if (!provided) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  try {
    const a = Buffer.from(SECRET);
    const b = Buffer.from(provided);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }
  } catch {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  next();
}

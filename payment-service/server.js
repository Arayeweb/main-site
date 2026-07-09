import express from "express";
import { zibalRequest, zibalVerify } from "./lib/zibal.js";
import { requirePaymentSecret } from "./lib/auth.js";
import { handleZibalCallback } from "./lib/callbacks.js";

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(express.json({ limit: "32kb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "araaye-payment-service",
    zibalMerchant: process.env.ZIBAL_MERCHANT ? "configured" : "missing",
    siteUrl: process.env.SITE_URL || "https://araaye.com",
  });
});

app.post("/zibal/request", requirePaymentSecret, async (req, res) => {
  const { amountToman, callbackUrl, description, orderId, mobile } = req.body ?? {};
  if (!amountToman || !callbackUrl || !description || !orderId) {
    return res.status(422).json({ ok: false, error: "missing_fields" });
  }

  const result = await zibalRequest({
    amountToman: Number(amountToman),
    callbackUrl: String(callbackUrl),
    description: String(description),
    orderId: String(orderId),
    mobile: mobile != null ? String(mobile) : undefined,
  });

  const status = result.ok ? 200 : 502;
  return res.status(status).json(result);
});

app.post("/zibal/verify", requirePaymentSecret, async (req, res) => {
  const trackId = req.body?.trackId;
  if (!trackId) {
    return res.status(422).json({ ok: false, error: "missing_trackId" });
  }

  const result = await zibalVerify(String(trackId));
  return res.json(result);
});

/** Phase 2 — Zibal browser redirect lands here, then forwards to araaye.com with signed token */
app.get("/callback/:product", (req, res) => handleZibalCallback(req, res));

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: "not_found" });
});

app.listen(PORT, () => {
  console.log(`[payment-service] listening on :${PORT}`);
});

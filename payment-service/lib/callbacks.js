import { zibalVerify } from "./zibal.js";
import { signPaymentVerifyToken } from "./token.js";

const SITE_URL = (process.env.SITE_URL || "https://araaye.com").replace(/\/$/, "");

/** Product → Vercel verify path + user-facing redirect targets */
const PRODUCTS = {
  ai: {
    verifyPath: "/api/ai/verify",
    failUrl: "/ai/pricing?payment=failed",
    errorUrl: "/ai/pricing?payment=error",
  },
  "content-sales": {
    verifyPath: "/api/ai/content-sales/verify",
    failUrl: "/ai/content-sales?payment=failed",
    errorUrl: "/ai/content-sales?payment=error",
  },
  seo: {
    verifyPath: "/api/seo/verify",
    failUrl: "/seo?payment=failed",
    errorUrl: "/seo?payment=error",
  },
  doctors: {
    verifyPath: "/api/doctors/verify",
    failUrl: "/doctors?payment=failed",
    errorUrl: "/doctors?payment=error",
  },
  googlesabt: {
    verifyPath: "/api/googlesabt/verify",
    failUrl: "/googlesabt?payment=failed",
    errorUrl: "/googlesabt?payment=error",
  },
  telegram: {
    verifyPath: "/api/telegram/payment/zibal/callback",
    failUrl: null,
    errorUrl: null,
  },
};

function redirect(res, url) {
  res.set("Cache-Control", "no-store");
  return res.redirect(302, url);
}

export async function handleZibalCallback(req, res) {
  const product = req.params.product;
  const cfg = PRODUCTS[product];
  if (!cfg) {
    return res.status(404).json({ ok: false, error: "unknown_product" });
  }

  const trackId = req.query.trackId;
  const status = req.query.status;
  const success = req.query.success;

  if (!trackId) {
    if (cfg.errorUrl) return redirect(res, `${SITE_URL}${cfg.errorUrl}`);
    return res.status(400).send("missing trackId");
  }

  if (status === "NOK" || success === "false") {
    if (cfg.failUrl) {
      const u = new URL(`${SITE_URL}${cfg.failUrl}`);
      u.searchParams.set("trackId", trackId);
      return redirect(res, u.toString());
    }
    const u = new URL(`${SITE_URL}${cfg.verifyPath}`);
    u.searchParams.set("trackId", trackId);
    u.searchParams.set("status", "NOK");
    return redirect(res, u.toString());
  }

  const verify = await zibalVerify(trackId);
  if (!verify.ok || !verify.paid) {
    if (cfg.failUrl) {
      const u = new URL(`${SITE_URL}${cfg.failUrl}`);
      u.searchParams.set("trackId", trackId);
      return redirect(res, u.toString());
    }
    const u = new URL(`${SITE_URL}${cfg.verifyPath}`);
    u.searchParams.set("trackId", trackId);
    u.searchParams.set("success", "false");
    return redirect(res, u.toString());
  }

  const amount = verify.amount ?? 0;
  let ptoken;
  try {
    ptoken = signPaymentVerifyToken(trackId, amount);
  } catch (e) {
    console.error("[payment-service] token sign failed:", e);
    if (cfg.errorUrl) return redirect(res, `${SITE_URL}${cfg.errorUrl}`);
    return res.status(500).send("payment token error");
  }

  const u = new URL(`${SITE_URL}${cfg.verifyPath}`);
  u.searchParams.set("trackId", trackId);
  u.searchParams.set("amount", String(amount));
  u.searchParams.set("ptoken", ptoken);
  if (status) u.searchParams.set("status", status);
  if (success) u.searchParams.set("success", success);

  return redirect(res, u.toString());
}

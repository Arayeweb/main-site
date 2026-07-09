// =========================================================
// درگاه پرداخت زیبال — helper مشترک
// ZIBAL_MERCHANT="zibal" برای sandbox/test
// PAYMENT_SERVICE_URL → proxy به VPS ایرانی (فاز ۱)
// =========================================================

import { verifyPaymentVerifyToken } from "@/lib/paymentToken";

const ZIBAL_MERCHANT = process.env.ZIBAL_MERCHANT || "zibal";
const ZIBAL_API = "https://api.zibal.ir/v1";
export const ZIBAL_GATEWAY = "https://gateway.zibal.ir/start";

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL?.replace(/\/$/, "");
const PAYMENT_SERVICE_SECRET = process.env.PAYMENT_SERVICE_SECRET?.trim();

export function isPaymentServiceProxyEnabled(): boolean {
  return Boolean(PAYMENT_SERVICE_URL && PAYMENT_SERVICE_SECRET);
}

export interface ZibalRequestResult {
  ok: boolean;
  trackId?: string;
  redirectUrl?: string;
  error?: string;
}

export interface ZibalVerifyResult {
  ok: boolean;
  paid: boolean;
  alreadyVerified?: boolean;
  amount?: number;
  orderId?: string;
  result?: number;
}

async function zibalRequestDirect(opts: {
  amountToman: number;
  callbackUrl: string;
  description: string;
  orderId: string;
  mobile?: string;
}): Promise<ZibalRequestResult> {
  try {
    const res = await fetch(`${ZIBAL_API}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: ZIBAL_MERCHANT,
        amount: opts.amountToman,
        callbackUrl: opts.callbackUrl,
        description: opts.description,
        orderId: opts.orderId,
        mobile: opts.mobile,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      console.error("[zibal] request error:", res.status, data);
      return { ok: false, error: "gateway_error" };
    }
    if (data.result !== 100 || !data.trackId) {
      console.error("[zibal] request rejected:", data);
      return { ok: false, error: String(data.message || data.result) };
    }

    const trackId = String(data.trackId);
    return { ok: true, trackId, redirectUrl: `${ZIBAL_GATEWAY}/${trackId}` };
  } catch (e) {
    console.error("[zibal] request exception:", e);
    return { ok: false, error: "server_error" };
  }
}

async function zibalVerifyDirect(trackId: string): Promise<ZibalVerifyResult> {
  try {
    const res = await fetch(`${ZIBAL_API}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchant: ZIBAL_MERCHANT, trackId }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      console.error("[zibal] verify error:", res.status, data);
      return { ok: false, paid: false };
    }

    if (data.result === 100 || data.result === 201) {
      return {
        ok: true,
        paid: true,
        alreadyVerified: data.result === 201,
        amount: Number(data.amount || 0),
        orderId: data.orderId ? String(data.orderId) : undefined,
        result: data.result,
      };
    }
    return { ok: true, paid: false, result: data.result };
  } catch (e) {
    console.error("[zibal] verify exception:", e);
    return { ok: false, paid: false };
  }
}

async function paymentServiceFetch(
  path: string,
  body: Record<string, unknown>
): Promise<Response | null> {
  if (!PAYMENT_SERVICE_URL || !PAYMENT_SERVICE_SECRET) return null;
  try {
    return await fetch(`${PAYMENT_SERVICE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Payment-Secret": PAYMENT_SERVICE_SECRET,
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error("[zibal] payment-service fetch failed:", e);
    return null;
  }
}

async function zibalRequestViaProxy(opts: {
  amountToman: number;
  callbackUrl: string;
  description: string;
  orderId: string;
  mobile?: string;
}): Promise<ZibalRequestResult> {
  const res = await paymentServiceFetch("/zibal/request", opts);
  if (!res) return { ok: false, error: "payment_service_unreachable" };

  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    console.error("[zibal] proxy request error:", res.status, data);
    return { ok: false, error: "payment_service_error" };
  }
  return data as ZibalRequestResult;
}

async function zibalVerifyViaProxy(trackId: string): Promise<ZibalVerifyResult> {
  const res = await paymentServiceFetch("/zibal/verify", { trackId });
  if (!res) return { ok: false, paid: false };

  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    console.error("[zibal] proxy verify error:", res.status, data);
    return { ok: false, paid: false };
  }
  return data as ZibalVerifyResult;
}

export async function zibalRequest(opts: {
  amountToman: number;
  callbackUrl: string;
  description: string;
  orderId: string;
  mobile?: string;
}): Promise<ZibalRequestResult> {
  if (isPaymentServiceProxyEnabled()) {
    return zibalRequestViaProxy(opts);
  }
  return zibalRequestDirect(opts);
}

export async function zibalVerify(trackId: string): Promise<ZibalVerifyResult> {
  if (isPaymentServiceProxyEnabled()) {
    return zibalVerifyViaProxy(trackId);
  }
  return zibalVerifyDirect(trackId);
}

/**
 * Verify payment — trusts VPS-signed token when phase-2 callbacks are used,
 * otherwise calls zibalVerify (direct or via proxy).
 */
export async function resolveZibalVerify(
  trackId: string,
  searchParams: URLSearchParams
): Promise<ZibalVerifyResult> {
  const ptoken = searchParams.get("ptoken");
  const amountRaw = searchParams.get("amount");
  if (ptoken && amountRaw) {
    const amount = Number(amountRaw);
    if (Number.isFinite(amount) && verifyPaymentVerifyToken(trackId, amount, ptoken)) {
      return { ok: true, paid: true, amount, alreadyVerified: false };
    }
    return { ok: false, paid: false };
  }
  return zibalVerify(trackId);
}

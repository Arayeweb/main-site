// =========================================================
// درگاه پرداخت زیبال — helper مشترک
// ZIBAL_MERCHANT="zibal" برای sandbox/test
// =========================================================

const ZIBAL_MERCHANT = process.env.ZIBAL_MERCHANT || "zibal";
const ZIBAL_API = "https://api.zibal.ir/v1";
export const ZIBAL_GATEWAY = "https://gateway.zibal.ir/start";

export interface ZibalRequestResult {
  ok: boolean;
  trackId?: string;
  redirectUrl?: string;
  error?: string;
}

export async function zibalRequest(opts: {
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

export interface ZibalVerifyResult {
  ok: boolean;
  paid: boolean;
  alreadyVerified?: boolean;
  amount?: number;
  orderId?: string;
  result?: number;
}

export async function zibalVerify(trackId: string): Promise<ZibalVerifyResult> {
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

    // result 100 = verified, 201 = already verified
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

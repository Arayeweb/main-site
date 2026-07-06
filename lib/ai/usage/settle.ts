// =========================================================
// تسویه پس از run — هزینه واقعی از روی تماس‌های موفق محاسبه
// و مازاد رزرو refund می‌شود. تماس fail‌شده هزینه ندارد.
// =========================================================

import { settleCredits, refundCredits } from "@/lib/billing/credits";

export type CallSettlement = {
  model: string;
  credits: number;
  succeeded: boolean;
};

export type SettleResult = {
  ok: true;
  chargedCredits: number;
  refundedCredits: number;
  creditsRemaining: number | null;
} | {
  ok: false;
  error: "settlement_failed";
  chargedCredits: 0;
  refundedCredits: 0;
  creditsRemaining: null;
};

/**
 * محاسبه هزینه واقعی: فقط تماس‌های موفق charge می‌شوند.
 */
export function computeActualCredits(calls: CallSettlement[]): number {
  return calls.filter((c) => c.succeeded).reduce((sum, c) => sum + c.credits, 0);
}

export function isSettlementInvariantValid(
  reserved: number,
  charged: number,
  refunded: number
): boolean {
  return (
    reserved >= 0 &&
    charged >= 0 &&
    refunded >= 0 &&
    charged <= reserved &&
    reserved === charged + refunded
  );
}

/**
 * تسویه run — اگر هیچ خروجی موفقی نبود، کل رزرو refund می‌شود.
 */
export async function settleRun(
  userId: string,
  runId: string,
  reserved: number,
  calls: CallSettlement[]
): Promise<SettleResult> {
  const actual = Math.min(computeActualCredits(calls), reserved);

  if (actual === 0) {
    const refunded = reserved;
    if (!isSettlementInvariantValid(reserved, 0, refunded)) {
      return {
        ok: false,
        error: "settlement_failed",
        chargedCredits: 0,
        refundedCredits: 0,
        creditsRemaining: null,
      };
    }
    const refund = await refundCredits(userId, reserved, runId, "no successful output");
    if (!refund.ok) {
      return {
        ok: false,
        error: "settlement_failed",
        chargedCredits: 0,
        refundedCredits: 0,
        creditsRemaining: null,
      };
    }
    return {
      ok: true,
      chargedCredits: 0,
      refundedCredits: refunded,
      creditsRemaining: refund.balance,
    };
  }

  const refunded = reserved - actual;
  if (!isSettlementInvariantValid(reserved, actual, refunded)) {
    return {
      ok: false,
      error: "settlement_failed",
      chargedCredits: 0,
      refundedCredits: 0,
      creditsRemaining: null,
    };
  }

  const settled = await settleCredits(userId, runId, reserved, actual);
  if (!settled.ok) {
    return {
      ok: false,
      error: "settlement_failed",
      chargedCredits: 0,
      refundedCredits: 0,
      creditsRemaining: null,
    };
  }
  return {
    ok: true,
    chargedCredits: actual,
    refundedCredits: refunded,
    creditsRemaining: settled.balance,
  };
}

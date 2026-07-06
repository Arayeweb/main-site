// =========================================================
// عملیات اتمیک کردیت — reserve / settle / refund
// روی توابع Postgres (migration 20260715) اجرا می‌شود تا race condition
// در کسر اعتبار از بین برود.
// =========================================================

import { getSupabaseAdmin } from "@/lib/supabase";

export type ReserveResult =
  | { ok: true; balance: number }
  | { ok: false; error: "insufficient_credits" | "server_error" };

export type PrepareRunResult =
  | {
      ok: true;
      runId: string;
      conversationId: string;
      plan: string;
      creditsRemaining: number;
    }
  | { ok: false; error: "insufficient_credits" | "user_not_found" | "server_error" };

export type CreditMutationResult =
  | { ok: true; balance: number }
  | { ok: false; error: "server_error" };

/**
 * رزرو اتمیک اعتبار قبل از شروع run.
 * اگر موجودی کافی نباشد fail می‌شود بدون هیچ تغییری.
 */
/**
 * Atomically creates ai_runs row and reserves credits in one Postgres RPC.
 * Preferred path for /api/ai/runs prepare — one round-trip vs insert + reserve.
 */
export async function prepareRunAndReserveCredits(input: {
  userId: string;
  runId: string;
  mode: string;
  conversationId: string;
  reservedCredits: number;
  metadata: Record<string, unknown>;
}): Promise<PrepareRunResult> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("ai_prepare_run_and_reserve_credits", {
    p_user_id: input.userId,
    p_run_id: input.runId,
    p_mode: input.mode,
    p_conversation_id: input.conversationId,
    p_reserved_credits: input.reservedCredits,
    p_metadata: input.metadata,
  });

  if (error) {
    console.error("[billing/credits] prepare_run failed:", error);
    const msg = String(error.message ?? "");
    if (msg.includes("user_not_found")) return { ok: false, error: "user_not_found" };
    return { ok: false, error: "server_error" };
  }

  const row = data as Record<string, unknown> | null;
  if (!row || row.ok === false) {
    const err = row?.error === "insufficient_credits" ? "insufficient_credits" : "server_error";
    return { ok: false, error: err as "insufficient_credits" | "server_error" };
  }

  return {
    ok: true,
    runId: String(row.run_id),
    conversationId: String(row.conversation_id),
    plan: String(row.plan ?? "free"),
    creditsRemaining: Number(row.credits_remaining),
  };
}

export async function reserveCredits(
  userId: string,
  amount: number,
  runId: string
): Promise<ReserveResult> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("ai_reserve_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_run_id: runId,
  });

  if (error) {
    console.error("[billing/credits] reserve failed:", error);
    return { ok: false, error: "server_error" };
  }
  if (data === null || data === undefined) {
    return { ok: false, error: "insufficient_credits" };
  }
  return { ok: true, balance: data as number };
}

/**
 * تسویه پس از run: هزینه واقعی charge و مازاد رزرو refund می‌شود.
 * موجودی نهایی را برمی‌گرداند (در خطا null).
 */
export async function settleCredits(
  userId: string,
  runId: string,
  reserved: number,
  actual: number
): Promise<CreditMutationResult> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("ai_settle_credits", {
    p_user_id: userId,
    p_run_id: runId,
    p_reserved: reserved,
    p_actual: Math.min(actual, reserved),
  });

  if (error) {
    console.error("[billing/credits] settle failed:", error);
    return { ok: false, error: "server_error" };
  }
  return { ok: true, balance: data as number };
}

/**
 * refund کامل — وقتی run قبل از هر خروجی fail شود.
 */
export async function refundCredits(
  userId: string,
  amount: number,
  runId: string,
  note = "run failed before output"
): Promise<CreditMutationResult> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("ai_refund_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_run_id: runId,
    p_note: note,
  });

  if (error) {
    console.error("[billing/credits] refund failed:", error);
    return { ok: false, error: "server_error" };
  }
  return { ok: true, balance: data as number };
}

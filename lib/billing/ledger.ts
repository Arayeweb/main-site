// =========================================================
// نوشتن دستی در ledger — برای رویدادهایی خارج از reserve/settle
// (topup، subscription_grant، admin_adjustment و …)
// reserve/charge/refund از توابع اتمیک lib/billing/credits.ts می‌آیند.
// =========================================================

import { getSupabaseAdmin } from "@/lib/supabase";

export type LedgerReason =
  | "reserve"
  | "charge"
  | "refund"
  | "topup"
  | "subscription_grant"
  | "admin_adjustment"
  | "referral_bonus"
  | "image_refund"
  | "video_refund"
  | "usage";

export type LedgerEntry = {
  userId: string;
  delta: number;
  balanceAfter?: number | null;
  reason: LedgerReason;
  note?: string;
  runId?: string | null;
  relatedOrderId?: string | null;
  adminId?: string | null;
};

export async function writeLedgerEntry(entry: LedgerEntry): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const row: Record<string, unknown> = {
    user_id: entry.userId,
    delta: entry.delta,
    reason: entry.reason,
  };
  if (entry.balanceAfter != null) row.balance_after = entry.balanceAfter;
  if (entry.note) row.note = entry.note;
  if (entry.runId) row.run_id = entry.runId;
  if (entry.relatedOrderId) row.related_order_id = entry.relatedOrderId;
  if (entry.adminId) row.admin_id = entry.adminId;

  const { error } = await supabase.from("ai_credit_ledger").insert(row);
  if (error) {
    console.error("[billing/ledger] insert failed:", error);
    return false;
  }
  return true;
}

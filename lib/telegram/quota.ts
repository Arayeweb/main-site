// =========================================================
// Free daily message quota
// =========================================================

import { getSupabaseAdmin } from "@/lib/supabase";
import { getTelegramConfig } from "./config";

export type QuotaStatus = {
  ok: boolean;
  canUse: boolean;
  remaining: number;
  limit: number;
  used: number;
  userId?: string;
  error?: string;
};

export async function getFreeQuotaStatus(telegramId: number): Promise<QuotaStatus> {
  const { freeDailyLimit, firstDayLimit } = getTelegramConfig();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("telegram_get_free_quota", {
    p_telegram_id: telegramId,
    p_daily_limit: freeDailyLimit,
    p_first_day_limit: firstDayLimit,
  });

  if (error) {
    console.error("[telegram/quota] get failed:", error.message);
    return { ok: false, canUse: false, remaining: 0, limit: freeDailyLimit, used: 0, error: error.message };
  }

  const r = data as {
    ok: boolean;
    error?: string;
    user_id?: string;
    can_use?: boolean;
    remaining?: number;
    limit?: number;
    used?: number;
  };

  if (!r.ok) {
    return { ok: false, canUse: false, remaining: 0, limit: freeDailyLimit, used: 0, error: r.error };
  }

  return {
    ok: true,
    canUse: Boolean(r.can_use),
    remaining: r.remaining ?? 0,
    limit: r.limit ?? freeDailyLimit,
    used: r.used ?? 0,
    userId: r.user_id,
  };
}

export async function consumeFreeQuota(telegramUserId: string): Promise<boolean> {
  const { freeDailyLimit, firstDayLimit } = getTelegramConfig();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("telegram_consume_free_quota", {
    p_telegram_user_id: telegramUserId,
    p_daily_limit: freeDailyLimit,
    p_first_day_limit: firstDayLimit,
  });
  if (error) {
    console.error("[telegram/quota] consume failed:", error.message);
    return false;
  }
  return Boolean((data as { ok?: boolean })?.ok);
}

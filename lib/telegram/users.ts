// =========================================================
// Telegram user upsert and persistence
// =========================================================

import { getSupabaseAdmin } from "@/lib/supabase";
import { textPreview } from "./sanitize";
import type { StartPayload, TelegramUserRow } from "./types";

export async function upsertTelegramUser(
  telegramId: number,
  profile: {
    username?: string;
    first_name?: string;
    last_name?: string;
  },
  startPayload?: StartPayload
): Promise<TelegramUserRow | null> {
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from("telegram_users")
    .select("*")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  const stateData: Record<string, unknown> = {};
  if (startPayload?.campaign) stateData.campaign = startPayload.campaign;
  if (startPayload?.source) stateData.source = startPayload.source;
  if (startPayload?.ref) stateData.ref = startPayload.ref;

  if (existing) {
    const mergedState = {
      ...(existing.state_data as Record<string, unknown>),
      ...stateData,
    };
    const { data, error } = await supabase
      .from("telegram_users")
      .update({
        username: profile.username ?? existing.username,
        first_name: profile.first_name ?? existing.first_name,
        last_name: profile.last_name ?? existing.last_name,
        state_data: mergedState,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) {
      console.error("[telegram/users] update failed:", error.message);
      return null;
    }
    return data as TelegramUserRow;
  }

  const { data, error } = await supabase
    .from("telegram_users")
    .insert({
      telegram_id: telegramId,
      username: profile.username || null,
      first_name: profile.first_name || null,
      last_name: profile.last_name || null,
      state_data: stateData,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[telegram/users] insert failed:", error.message);
    return null;
  }
  return data as TelegramUserRow;
}

export async function getTelegramUserByTelegramId(
  telegramId: number
): Promise<TelegramUserRow | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("telegram_users")
    .select("*")
    .eq("telegram_id", telegramId)
    .maybeSingle();
  return (data as TelegramUserRow) || null;
}

export async function saveTelegramMessage(opts: {
  telegramUserId: string;
  direction: "in" | "out";
  messageType?: string;
  text: string;
  aiRunId?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  await supabase.from("telegram_messages").insert({
    telegram_user_id: opts.telegramUserId,
    direction: opts.direction,
    message_type: opts.messageType || "text",
    text_preview: textPreview(opts.text),
    ai_run_id: opts.aiRunId || null,
  });
}

export async function incrementWebClicks(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("telegram_users")
    .select("total_web_clicks")
    .eq("id", userId)
    .single();
  if (!data) return;
  await supabase
    .from("telegram_users")
    .update({ total_web_clicks: (data.total_web_clicks as number) + 1 })
    .eq("id", userId);
}

export async function updateUserPhone(userId: string, phone: string) {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("telegram_users")
    .update({ phone, updated_at: new Date().toISOString() })
    .eq("id", userId);
}

export async function setMembershipFlags(
  userId: string,
  joinedMain: boolean,
  joinedSales: boolean
) {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("telegram_users")
    .update({
      joined_required_channel: joinedMain,
      joined_sales_channel: joinedSales,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

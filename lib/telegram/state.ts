// =========================================================
// FSM state and Telegram-side chat context
// =========================================================

import { getSupabaseAdmin } from "@/lib/supabase";
import { getTelegramConfig } from "./config";
import type { ChatContextEntry, TelegramUserState } from "./types";

export async function setState(
  userId: string,
  state: TelegramUserState,
  stateData?: Record<string, unknown>
) {
  const supabase = getSupabaseAdmin();
  const patch: Record<string, unknown> = {
    state,
    updated_at: new Date().toISOString(),
  };
  if (stateData) {
    const { data } = await supabase
      .from("telegram_users")
      .select("state_data")
      .eq("id", userId)
      .single();
    patch.state_data = { ...(data?.state_data as object), ...stateData };
  }
  await supabase.from("telegram_users").update(patch).eq("id", userId);
}

export async function getStateData(userId: string): Promise<Record<string, unknown>> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("telegram_users")
    .select("state_data")
    .eq("id", userId)
    .single();
  return (data?.state_data as Record<string, unknown>) || {};
}

export async function appendChatContext(
  userId: string,
  role: "user" | "assistant",
  content: string
) {
  const { maxChatContextPairs } = getTelegramConfig();
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("telegram_users")
    .select("chat_context")
    .eq("id", userId)
    .single();
  const ctx = ((data?.chat_context as ChatContextEntry[]) || []).slice();
  ctx.push({ role, content });
  const maxEntries = maxChatContextPairs * 2;
  const trimmed = ctx.length > maxEntries ? ctx.slice(-maxEntries) : ctx;
  await supabase
    .from("telegram_users")
    .update({ chat_context: trimmed, updated_at: new Date().toISOString() })
    .eq("id", userId);
}

export async function getChatContext(userId: string): Promise<ChatContextEntry[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("telegram_users")
    .select("chat_context")
    .eq("id", userId)
    .single();
  return (data?.chat_context as ChatContextEntry[]) || [];
}

export async function clearChatContext(userId: string) {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("telegram_users")
    .update({
      chat_context: [],
      state: "idle",
      state_data: {},
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

export async function setChatRunning(userId: string, running: boolean) {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("telegram_users")
    .update({ is_chat_running: running, updated_at: new Date().toISOString() })
    .eq("id", userId);
}

export async function isChatRunning(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("telegram_users")
    .select("is_chat_running")
    .eq("id", userId)
    .single();
  return Boolean(data?.is_chat_running);
}

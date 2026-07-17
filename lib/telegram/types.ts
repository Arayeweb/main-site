// =========================================================
// Telegram user types
// =========================================================

export type TelegramUserState = "idle" | "chat" | "awaiting_phone" | "confirm_order";

export interface TelegramUserRow {
  id: string;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  araaye_user_id: string | null;
  joined_required_channel: boolean;
  joined_sales_channel: boolean;
  free_daily_used: number;
  free_daily_reset_at: string | null;
  free_image_used: boolean;
  total_messages: number;
  total_web_clicks: number;
  total_payments: number;
  state: TelegramUserState;
  state_data: Record<string, unknown>;
  chat_context: ChatContextEntry[];
  is_chat_running: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatContextEntry {
  role: "user" | "assistant";
  content: string;
}

export interface StartPayload {
  source?: string;
  campaign?: string;
  ref?: string;
}

export function parseStartPayload(text: string): StartPayload {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) return {};
  const payload = parts[1];
  if (payload.startsWith("ref_")) return { ref: payload.slice(4), campaign: payload.slice(4) };
  if (payload.startsWith("ad_")) return { source: "ad", campaign: payload.slice(3) };
  if (payload.startsWith("post_")) return { source: "post", campaign: payload.slice(5) };
  return { campaign: payload };
}

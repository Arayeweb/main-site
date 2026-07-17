// =========================================================
// Telegram funnel event tracking
// =========================================================

import { getSupabaseAdmin } from "@/lib/supabase";

export type TelegramEventName =
  | "bot_started"
  | "forced_join_shown"
  | "forced_join_completed"
  | "first_message_sent"
  | "ai_response_sent"
  | "free_limit_reached"
  | "compare_link_clicked"
  | "council_link_clicked"
  | "pricing_opened"
  | "package_selected"
  | "phone_submitted"
  | "payment_link_created"
  | "payment_success"
  | "payment_failed"
  | "support_clicked"
  | "clear_clicked"
  | "image_mode_opened"
  | "image_no_credits"
  | "image_failed"
  | "image_sent"
  | "free_image_sent";

export async function trackEvent(
  event: TelegramEventName,
  opts: {
    telegramUserId?: string | null;
    telegramId?: number | null;
    metadata?: Record<string, unknown>;
  } = {}
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("telegram_events").insert({
      telegram_user_id: opts.telegramUserId || null,
      telegram_id: opts.telegramId ?? null,
      event,
      metadata: opts.metadata || {},
    });
  } catch (e) {
    console.error("[telegram/events] track failed:", event, e);
  }
}

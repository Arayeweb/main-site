/**
 * In-memory telegram tables + RPC stubs for tests
 */

import { InMemorySupabase } from "./supabaseMock";

const TEHRAN_DAY = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

export function createTelegramSupabase() {
  const db = new InMemorySupabase({
    telegram_users: [],
    telegram_messages: [],
    telegram_events: [],
    telegram_payment_orders: [],
    ai_users: [],
    ai_credit_ledger: [],
  });

  const client = {
    from: (table: string) => db.from(table),
    rpc: async (fn: string, args: Record<string, unknown>) => {
      if (fn === "telegram_get_free_quota") {
        const tid = args.p_telegram_id as number;
        const daily = args.p_daily_limit as number;
        const firstDay = args.p_first_day_limit as number;
        const users = db.tables.telegram_users || [];
        const u = users.find((r) => r.telegram_id === tid);
        if (!u) return { data: { ok: false, error: "user_not_found" }, error: null };
        const created = (u.created_at as string)?.slice(0, 10);
        const limit = created === TEHRAN_DAY() ? firstDay : daily;
        const used = (u.free_daily_used as number) || 0;
        return {
          data: {
            ok: true,
            user_id: u.id,
            used,
            limit,
            remaining: Math.max(0, limit - used),
            can_use: used < limit,
          },
          error: null,
        };
      }
      if (fn === "telegram_consume_free_quota") {
        const uid = args.p_telegram_user_id as string;
        const daily = args.p_daily_limit as number;
        const firstDay = args.p_first_day_limit as number;
        const users = db.tables.telegram_users || [];
        const u = users.find((r) => r.id === uid);
        if (!u) return { data: { ok: false, error: "user_not_found" }, error: null };
        const created = (u.created_at as string)?.slice(0, 10);
        const limit = created === TEHRAN_DAY() ? firstDay : daily;
        const used = (u.free_daily_used as number) || 0;
        if (used >= limit) return { data: { ok: false, error: "limit_reached" }, error: null };
        u.free_daily_used = used + 1;
        u.total_messages = ((u.total_messages as number) || 0) + 1;
        return { data: { ok: true, used: used + 1, limit, remaining: limit - used - 1 }, error: null };
      }
      if (fn === "telegram_settle_payment_order") {
        const orderId = args.p_order_id as string;
        const araayeId = args.p_araaye_user_id as string;
        const paid = args.p_paid_amount as number;
        const orders = db.tables.telegram_payment_orders || [];
        const order = orders.find((o) => o.id === orderId);
        if (!order) return { data: { ok: false, error: "order_not_found" }, error: null };
        if (order.status === "paid") {
          return { data: { ok: true, already_paid: true, credits_granted: order.credits }, error: null };
        }
        if (Math.abs(paid - (order.amount_toman as number)) > 10) {
          return { data: { ok: false, error: "amount_mismatch" }, error: null };
        }
        order.status = "paid";
        order.paid_at = new Date().toISOString();
        const aiUsers = db.tables.ai_users || [];
        const user = aiUsers.find((u) => u.id === araayeId);
        if (!user) return { data: { ok: false, error: "user_not_found" }, error: null };
        user.credits = ((user.credits as number) || 0) + (order.credits as number);
        return {
          data: {
            ok: true,
            already_paid: false,
            credits_granted: order.credits,
            araaye_user_id: araayeId,
            balance_after: user.credits,
          },
          error: null,
        };
      }
      return { data: null, error: { message: `unknown rpc ${fn}` } };
    },
  };

  return { db, client };
}

export function seedTelegramUser(
  db: InMemorySupabase,
  opts: {
    id?: string;
    telegram_id: number;
    joined?: boolean;
    free_daily_used?: number;
    araaye_user_id?: string | null;
    state?: string;
    phone?: string;
    total_messages?: number;
    created_at?: string;
    selectedModelId?: string;
  }
) {
  type TelegramChatTurn = { role: "user" | "assistant"; content: string };
  const stateData: Record<string, unknown> = opts.selectedModelId
    ? {
        selectedModelId: opts.selectedModelId,
        mode: "quick_chat",
        selectedModel: opts.selectedModelId,
        selectedAt: new Date().toISOString(),
      }
    : {};
  const row = {
    id: opts.id || `tg-${opts.telegram_id}`,
    telegram_id: opts.telegram_id,
    username: null,
    first_name: "Test",
    last_name: null,
    phone: opts.phone || null,
    araaye_user_id: opts.araaye_user_id ?? null,
    joined_required_channel: opts.joined ?? true,
    joined_sales_channel: opts.joined ?? true,
    free_daily_used: opts.free_daily_used ?? 0,
    free_daily_reset_at: new Date(Date.now() + 86400000).toISOString(),
    total_messages: opts.total_messages ?? 0,
    total_web_clicks: 0,
    total_payments: 0,
    state: opts.state || "idle",
    state_data: stateData,
    chat_context: [] as TelegramChatTurn[],
    is_chat_running: false,
    created_at: opts.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.tables.telegram_users.push(row);
  return row;
}

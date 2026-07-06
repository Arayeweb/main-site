import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeRequest } from "../helpers/request";
import { createTelegramSupabase, seedTelegramUser } from "../mocks/telegramSupabase";
import type { ModelStreamEvent } from "@/lib/ai/providers/interface";

const sendMessage = vi.fn().mockResolvedValue({ ok: true });
const getChatMember = vi.fn().mockResolvedValue({ ok: true, joined: true });
const mockStreamChat = vi.fn();
const zibalRequest = vi.fn();

vi.mock("@/lib/telegram/api", () => ({
  sendMessage: (...args: unknown[]) => sendMessage(...args),
  getChatMember: (...args: unknown[]) => getChatMember(...args),
  answerCallbackQuery: vi.fn().mockResolvedValue({ ok: true }),
  setMyCommands: vi.fn().mockResolvedValue({ ok: true }),
  escapeHtml: (s: string) => s,
}));

vi.mock("@/lib/ai/providers/openrouter", () => ({
  openRouterProvider: {
    id: "openrouter",
    streamChat: (...args: unknown[]) => mockStreamChat(...args),
  },
}));

vi.mock("@/lib/zibal", () => ({
  zibalRequest: (...args: unknown[]) => zibalRequest(...args),
  zibalVerify: vi.fn().mockResolvedValue({ ok: true, paid: true, amount: 299000 }),
  ZIBAL_GATEWAY: "https://gateway.zibal.ir/start",
}));

let tgDb: ReturnType<typeof createTelegramSupabase>;

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => tgDb.client,
}));

vi.mock("@/lib/auth", () => ({
  hashPassword: (p: string) => `hash:${p}`,
}));

vi.mock("@/lib/aiPromo", () => ({
  generateReferralCode: () => "AI-TEST01",
}));

import { POST as webhookPost } from "@/app/api/telegram/webhook/route";
import { activatePaymentOrder } from "@/lib/telegram/payment";

async function* okStream(): AsyncGenerator<ModelStreamEvent> {
  yield { type: "delta", text: "جواب" };
  yield {
    type: "done",
    text: "جواب",
    inputTokens: 1,
    outputTokens: 2,
    cachedTokens: 0,
    costUsd: 0,
    ttftMs: 1,
    latencyMs: 2,
  };
}

async function* failStream(): AsyncGenerator<ModelStreamEvent> {
  yield { type: "error", errorCode: "provider_error", message: "fail" };
}

describe("telegram webhook — integration", () => {
  beforeEach(() => {
    tgDb = createTelegramSupabase();
    sendMessage.mockClear();
    mockStreamChat.mockReset().mockImplementation(() => okStream());
    zibalRequest.mockReset().mockResolvedValue({
      ok: true,
      trackId: "zibal-track",
      redirectUrl: "https://gateway.zibal.ir/start/zibal-track",
    });
    process.env.TELEGRAM_WEBHOOK_SECRET = "test-secret";
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.TELEGRAM_REQUIRED_CHANNEL_ID = "";
    process.env.TELEGRAM_REQUIRED_SALES_CHANNEL_ID = "";
    process.env.TELEGRAM_FREE_DAILY_LIMIT = "3";
    process.env.ZIBAL_MERCHANT = "zibal";
    process.env.NEXT_PUBLIC_SITE_URL = "https://araaye.com";
  });

  it("1. webhook validates secret", async () => {
    const bad = await webhookPost(
      makeRequest("/api/telegram/webhook", {
        method: "POST",
        body: { update_id: 1 },
        headers: { "x-telegram-bot-api-secret-token": "wrong" },
      })
    );
    expect(bad.status).toBe(401);

    const good = await webhookPost(
      makeRequest("/api/telegram/webhook", {
        method: "POST",
        body: { update_id: 1, message: { message_id: 1, chat: { id: 1 }, text: "/start", from: { id: 1 } } },
        headers: { "x-telegram-bot-api-secret-token": "test-secret" },
      })
    );
    expect(good.status).toBe(200);
  });

  it("2. Telegram update text routes to chat", async () => {
    seedTelegramUser(tgDb.db, { telegram_id: 20, state: "chat" });
    const res = await webhookPost(
      makeRequest("/api/telegram/webhook", {
        method: "POST",
        headers: { "x-telegram-bot-api-secret-token": "test-secret" },
        body: {
          update_id: 2,
          message: {
            message_id: 2,
            chat: { id: 200 },
            from: { id: 20, first_name: "U" },
            text: "سوال تست",
          },
        },
      })
    );
    expect(res.status).toBe(200);
    expect(mockStreamChat).toHaveBeenCalled();
  });

  it("3. Direct provider called only after quota check — no quota no call", async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    seedTelegramUser(tgDb.db, {
      telegram_id: 21,
      free_daily_used: 3,
      araaye_user_id: null,
      created_at: yesterday,
    });
    await webhookPost(
      makeRequest("/api/telegram/webhook", {
        method: "POST",
        headers: { "x-telegram-bot-api-secret-token": "test-secret" },
        body: {
          update_id: 3,
          message: {
            message_id: 3,
            chat: { id: 201 },
            from: { id: 21 },
            text: "بعد از سهمیه",
          },
        },
      })
    );
    expect(mockStreamChat).not.toHaveBeenCalled();
  });

  it("4. provider failure sends friendly error", async () => {
    mockStreamChat.mockImplementation(() => failStream());
    seedTelegramUser(tgDb.db, { telegram_id: 22, state: "chat" });
    await webhookPost(
      makeRequest("/api/telegram/webhook", {
        method: "POST",
        headers: { "x-telegram-bot-api-secret-token": "test-secret" },
        body: {
          update_id: 4,
          message: {
            message_id: 4,
            chat: { id: 202 },
            from: { id: 22 },
            text: "خطا",
          },
        },
      })
    );
    const text = sendMessage.mock.calls.map((c) => c[1]).join(" ");
    expect(text).toContain("کمی کند");
  });

  it("5. compare command returns web link", async () => {
    seedTelegramUser(tgDb.db, { telegram_id: 23 });
    await webhookPost(
      makeRequest("/api/telegram/webhook", {
        method: "POST",
        headers: { "x-telegram-bot-api-secret-token": "test-secret" },
        body: {
          update_id: 5,
          message: {
            message_id: 5,
            chat: { id: 203 },
            from: { id: 23 },
            text: "/compare",
          },
        },
      })
    );
    const text = sendMessage.mock.calls.map((c) => c[1]).join(" ");
    expect(text).toContain("mode=compare");
    expect(text).toContain("utm_source=telegram_bot");
  });

  it("6. pricing flow creates Zibal link if configured", async () => {
    seedTelegramUser(tgDb.db, { telegram_id: 24, id: "tg-pay" });
    tgDb.db.tables.telegram_payment_orders.push({
      id: "ord-zibal",
      telegram_user_id: "tg-pay",
      package_id: "base",
      amount_toman: 299000,
      credits: 400,
      phone: "09124444444",
      status: "pending",
      zibal_track_id: null,
      created_at: new Date().toISOString(),
      paid_at: null,
    });
    tgDb.db.tables.ai_users.push({
      id: "ai-pay",
      phone: "09124444444",
      credits: 0,
      plan: "free",
      password_hash: "h",
    });

    const result = await activatePaymentOrder({
      orderId: "ord-zibal",
      telegramUserId: "tg-pay",
      telegramId: 24,
      phone: "09124444444",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.redirectUrl).toContain("zibal");
    expect(zibalRequest).toHaveBeenCalled();
  });
});

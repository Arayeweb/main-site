import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseStartPayload } from "@/lib/telegram/types";
import { textPreview } from "@/lib/telegram/sanitize";
import { TELEGRAM_PACKAGES, getTelegramPackage } from "@/lib/telegram/packages";
import { pricingMessage, maskPhone } from "@/lib/telegram/copy";
import { normalizeContact } from "@/lib/validateContact";
import { clearChatContext } from "@/lib/telegram/state";
import { createTelegramSupabase, seedTelegramUser } from "../mocks/telegramSupabase";
import { settlePaymentByTrackId } from "@/lib/telegram/payment";

const sendMessage = vi.fn().mockResolvedValue({ ok: true, result: { message_id: 9001 } });
const editMessageText = vi.fn().mockResolvedValue({ ok: true });
const editMessageReplyMarkup = vi.fn().mockResolvedValue({ ok: true });
const sendTypingAction = vi.fn().mockResolvedValue({ ok: true });
const sendUploadPhotoAction = vi.fn().mockResolvedValue({ ok: true });
const sendPhoto = vi.fn().mockResolvedValue({ ok: true });
const getChatMember = vi.fn().mockResolvedValue({ ok: true, joined: true });
const answerCallbackQuery = vi.fn().mockResolvedValue({ ok: true });

vi.mock("@/lib/telegram/api", () => ({
  sendMessage: (...args: unknown[]) => sendMessage(...args),
  editMessageText: (...args: unknown[]) => editMessageText(...args),
  editMessageReplyMarkup: (...args: unknown[]) => editMessageReplyMarkup(...args),
  sendTypingAction: (...args: unknown[]) => sendTypingAction(...args),
  sendUploadPhotoAction: (...args: unknown[]) => sendUploadPhotoAction(...args),
  sendPhoto: (...args: unknown[]) => sendPhoto(...args),
  getChatMember: (...args: unknown[]) => getChatMember(...args),
  answerCallbackQuery: (...args: unknown[]) => answerCallbackQuery(...args),
  setMyCommands: vi.fn().mockResolvedValue({ ok: true }),
  escapeHtml: (s: string) => s,
}));

const mockStreamChat = vi.fn();
const mockRunTelegramImageGen = vi.fn();
const mockRunTelegramFreeImageGen = vi.fn();

vi.mock("@/lib/telegram/imageGen", () => ({
  runTelegramImageGen: (...args: unknown[]) => mockRunTelegramImageGen(...args),
  runTelegramFreeImageGen: (...args: unknown[]) => mockRunTelegramFreeImageGen(...args),
  telegramImageCreditCost: () => 20,
  TELEGRAM_IMAGE_MODEL: "image-lite",
}));

vi.mock("@/lib/ai/providers/openrouter", () => ({
  openRouterProvider: {
    id: "openrouter",
    streamChat: (...args: unknown[]) => mockStreamChat(...args),
  },
}));

vi.mock("@/lib/zibal", () => ({
  zibalRequest: vi.fn().mockResolvedValue({
    ok: true,
    trackId: "track-1",
    redirectUrl: "https://gateway.zibal.ir/start/track-1",
  }),
  zibalVerify: vi.fn().mockResolvedValue({
    ok: true,
    paid: true,
    amount: 299000,
  }),
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

import {
  handleStart,
  handleTextMessage,
  handleTelegramUpdate,
  handleCommand,
  handleCallback,
} from "@/lib/telegram/handler";
import { getFreeQuotaStatus } from "@/lib/telegram/quota";
import { modelPickerMessage } from "@/lib/telegram/chatModels";
import { getModel } from "@/lib/aiModels";

async function* successStream(text = "پاسخ تست") {
  yield { type: "delta", text };
  yield {
    type: "done",
    text,
    inputTokens: 1,
    outputTokens: 2,
    cachedTokens: 0,
    costUsd: 0,
    ttftMs: 1,
    latencyMs: 2,
  };
}

async function* hangingStream() {
  await new Promise((r) => setTimeout(r, 50));
  yield { type: "delta", text: "" };
}

describe("telegram acquisition — unit", () => {
  beforeEach(() => {
    tgDb = createTelegramSupabase();
    sendMessage.mockClear();
    editMessageText.mockClear();
    editMessageReplyMarkup.mockClear();
    sendTypingAction.mockClear();
    sendUploadPhotoAction.mockClear();
    sendPhoto.mockClear();
    getChatMember.mockReset().mockResolvedValue({ ok: true, joined: true });
    sendMessage.mockResolvedValue({ ok: true, result: { message_id: 9001 } });
    editMessageText.mockResolvedValue({ ok: true });
    editMessageReplyMarkup.mockResolvedValue({ ok: true });
    mockStreamChat.mockReset().mockImplementation(() => successStream());
    mockRunTelegramImageGen.mockReset().mockResolvedValue({
      ok: true,
      imageUrl: "https://example.com/image.png",
      jobId: "job-img-1",
      creditsRemaining: 40,
    });
    mockRunTelegramFreeImageGen.mockReset().mockResolvedValue({
      ok: true,
      imageUrl: "https://example.com/free-image.png",
      jobId: "job-free-1",
    });
    process.env.TELEGRAM_REQUIRED_CHANNEL_ID = "";
    process.env.TELEGRAM_REQUIRED_SALES_CHANNEL_ID = "";
    process.env.TELEGRAM_FREE_DAILY_LIMIT = "3";
    process.env.ZIBAL_MERCHANT = "zibal";
    process.env.NEXT_PUBLIC_SITE_URL = "https://araaye.com";
    process.env.TELEGRAM_PROVIDER_TIMEOUT_MS = "10";
  });

  it("1. /start creates telegram_user", async () => {
    await handleStart(100, 42, { id: 42, first_name: "Ali" }, "/start");
    expect(tgDb.db.tables.telegram_users.length).toBe(1);
    expect(tgDb.db.tables.telegram_users[0].telegram_id).toBe(42);
    expect(sendMessage).toHaveBeenCalled();
  });

  it("2. forced join blocks non-member", async () => {
    process.env.TELEGRAM_REQUIRED_CHANNEL_ID = "@araaye";
    getChatMember.mockResolvedValueOnce({ ok: true, joined: false });
    await handleStart(100, 7, { id: 7, first_name: "Sara" }, "/start");
    const text = sendMessage.mock.calls.map((c) => c[1]).join(" ");
    expect(text).toContain("عضو");
    expect(tgDb.db.tables.telegram_events.some((e) => e.event === "forced_join_shown")).toBe(true);
  });

  it("3. joined user receives welcome", async () => {
    await handleStart(100, 8, { id: 8, first_name: "Reza" }, "/start");
    const text = sendMessage.mock.calls.map((c) => c[1]).join(" ");
    expect(text).toContain("به آرایه خوش آمدی");
  });

  it("4. free daily limit works", async () => {
    seedTelegramUser(tgDb.db, { telegram_id: 10, free_daily_used: 0 });
    const status = await getFreeQuotaStatus(10);
    expect(status.ok).toBe(true);
    expect(status.canUse).toBe(true);
    expect(status.remaining).toBeGreaterThan(0);
  });

  it("5. free limit exceeded on non-greeting shows pricing CTA", async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    seedTelegramUser(tgDb.db, {
      telegram_id: 11,
      free_daily_used: 3,
      araaye_user_id: null,
      created_at: yesterday,
      state: "chat",
      selectedModelId: "economy",
    });
    await handleTextMessage(100, 11, tgDb.db.tables.telegram_users[0] as never, "سوال");
    const text = [...sendMessage.mock.calls, ...editMessageText.mock.calls]
      .map((c) => c[2] ?? c[1])
      .join(" ");
    expect(text).toContain("سهمیه رایگان");
    expect(mockStreamChat).not.toHaveBeenCalled();
  });

  it("6. pricing packages render (unified with web)", () => {
    const msg = pricingMessage();
    expect(msg).toContain("بسته شروع");
    expect(msg).toContain("۹۹");
    expect(getTelegramPackage("plus")?.credits).toBe(260);
    expect(getTelegramPackage("base")?.credits).toBe(260);
    expect(Object.keys(TELEGRAM_PACKAGES).length).toBe(4);
  });

  it("7. phone validation works", () => {
    const valid = normalizeContact("09123456789");
    expect(valid.kind).toBe("phone");
    const invalid = normalizeContact("123");
    expect(invalid.kind).toBe("invalid");
    expect(maskPhone("09123456789")).toContain("xxxx");
  });

  it("8. payment order is created", async () => {
    seedTelegramUser(tgDb.db, { telegram_id: 12, state: "confirm_order" });
    const user = tgDb.db.tables.telegram_users[0];
    tgDb.db.tables.telegram_payment_orders.push({
      id: "order-1",
      telegram_user_id: user.id,
      package_id: "base",
      amount_toman: 299000,
      credits: 400,
      phone: "09121111111",
      status: "pending",
      zibal_track_id: null,
      created_at: new Date().toISOString(),
      paid_at: null,
    });
    expect(tgDb.db.tables.telegram_payment_orders.length).toBe(1);
  });

  it("9. credits are not granted before payment verification", async () => {
    tgDb.db.tables.ai_users.push({
      id: "ai-1",
      phone: "09122222222",
      credits: 5,
      plan: "free",
      password_hash: "x",
    });
    tgDb.db.tables.telegram_payment_orders.push({
      id: "order-2",
      telegram_user_id: "tg-1",
      package_id: "base",
      amount_toman: 299000,
      credits: 400,
      phone: "09122222222",
      status: "pending",
      zibal_track_id: "track-pending",
      created_at: new Date().toISOString(),
      paid_at: null,
    });
    seedTelegramUser(tgDb.db, { id: "tg-1", telegram_id: 99 });
    expect(tgDb.db.tables.ai_users[0].credits).toBe(5);
  });

  it("10. duplicate payment callback is idempotent", async () => {
    tgDb.db.tables.ai_users.push({
      id: "ai-2",
      phone: "09123333333",
      credits: 10,
      plan: "free",
      password_hash: "x",
    });
    tgDb.db.tables.telegram_payment_orders.push({
      id: "order-3",
      telegram_user_id: "tg-2",
      package_id: "base",
      amount_toman: 299000,
      credits: 400,
      phone: "09123333333",
      status: "paid",
      zibal_track_id: "track-paid",
      created_at: new Date().toISOString(),
      paid_at: new Date().toISOString(),
    });
    seedTelegramUser(tgDb.db, { id: "tg-2", telegram_id: 88, phone: "09123333333" });

    const r1 = await settlePaymentByTrackId("track-paid", "OK", "true");
    expect(r1.ok).toBe(true);
    expect(r1.alreadyPaid).toBe(true);
    expect(tgDb.db.tables.ai_users[0].credits).toBe(10);
  });

  it("11. clear resets Telegram context only", async () => {
    seedTelegramUser(tgDb.db, { telegram_id: 13 });
    const user = tgDb.db.tables.telegram_users[0];
    user.chat_context = [{ role: "user", content: "hi" }];
    tgDb.db.tables.telegram_payment_orders.push({
      id: "order-keep",
      telegram_user_id: user.id,
      package_id: "base",
      amount_toman: 1,
      credits: 1,
      status: "paid",
    });
    await clearChatContext(user.id as string);
    const updated = tgDb.db.tables.telegram_users[0];
    expect(updated.chat_context).toEqual([]);
    expect(tgDb.db.tables.telegram_payment_orders.length).toBe(1);
  });

  it("12. unsupported media returns web CTA", async () => {
    seedTelegramUser(tgDb.db, { telegram_id: 14 });
    await handleTelegramUpdate({
      update_id: 1,
      message: {
        message_id: 1,
        chat: { id: 100 },
        from: { id: 14, first_name: "M" },
        photo: [{}],
      },
    });
    const text = sendMessage.mock.calls[0]?.[1] as string;
    expect(text).toContain("فعلاً داخل تلگرام فقط چت متنی");
  });

  it("13. start payload campaign is tracked", () => {
    const p = parseStartPayload("/start ad_channel1");
    expect(p.source).toBe("ad");
    expect(p.campaign).toBe("channel1");
    const p2 = parseStartPayload("/start ref_summer");
    expect(p2.ref).toBe("summer");
  });

  it("textPreview truncates long prompts", () => {
    const long = "a".repeat(200);
    expect(textPreview(long, 50).length).toBeLessThanOrEqual(51);
  });

  it("14. چت سریع shows model picker", async () => {
    seedTelegramUser(tgDb.db, { telegram_id: 15 });
    const user = tgDb.db.tables.telegram_users[0] as never;
    await handleCommand(100, 15, user, "cmd_chat");
    const text = sendMessage.mock.calls.map((c) => c[1]).join(" ");
    expect(text).toContain(modelPickerMessage().slice(0, 20));
    const keyboard = sendMessage.mock.calls[0]?.[2]?.reply_markup?.inline_keyboard;
    expect(keyboard?.length).toBe(5);
    expect(keyboard?.[0]?.[0]?.callback_data).toBe("model_economy");
    expect(keyboard?.[2]?.[0]?.callback_data).toBe("model_precise");
  });

  it("15. chat state without model asks for picker", async () => {
    seedTelegramUser(tgDb.db, { telegram_id: 16, state: "chat" });
    const user = tgDb.db.tables.telegram_users[0] as never;
    await handleTextMessage(100, 16, user, "سلام");
    const text = sendMessage.mock.calls.map((c) => c[1]).join(" ");
    expect(text).toContain("مدل انتخاب کن");
    expect(mockStreamChat).not.toHaveBeenCalled();
  });

  it("16. premium model without credits shows pricing CTA", async () => {
    seedTelegramUser(tgDb.db, { telegram_id: 17, state: "chat" });
    const user = tgDb.db.tables.telegram_users[0] as never;
    await handleCallback(100, 17, user, "model_precise", "cb-1", 55);
    const text = [...sendMessage.mock.calls, ...editMessageText.mock.calls]
      .map((c) => c[2] ?? c[1])
      .join(" ");
    expect(text).toContain("پولی");
    expect(text).toContain("اعتبار");
    expect(editMessageReplyMarkup).toHaveBeenCalled();
  });

  it("17. greeting با مدل انتخاب‌شده از خود مدل پاسخ می‌گیرد (بدون shortcut ثابت)", async () => {
    seedTelegramUser(tgDb.db, { telegram_id: 30, state: "chat", selectedModelId: "economy" });
    const user = tgDb.db.tables.telegram_users[0] as never;
    await handleTextMessage(100, 30, user, "سلام");
    expect(mockStreamChat).toHaveBeenCalled();
    expect(sendMessage.mock.calls.some((c) => String(c[1]).includes("آماده‌ام"))).toBe(false);
  });

  it("18. مدل سریع به provider model سریع map می‌شود", () => {
    expect(getModel("economy")?.routeId).toBe("deepseek/deepseek-chat-v3.1");
    expect(getModel("fast")?.routeId).toBe("openai/gpt-4o-mini");
    expect(getModel("precise")?.routeId).toBe("openai/gpt-4o");
    expect(getModel("critic")?.routeId).toBe("anthropic/claude-sonnet-4");
  });

  it("19. typing قبل از provider ارسال می‌شود", async () => {
    seedTelegramUser(tgDb.db, { telegram_id: 31, state: "chat", selectedModelId: "economy" });
    const user = tgDb.db.tables.telegram_users[0] as never;
    await handleTextMessage(100, 31, user, "سوال تست");
    expect(sendTypingAction).toHaveBeenCalled();
    expect(sendTypingAction.mock.invocationCallOrder[0]).toBeLessThan(
      mockStreamChat.mock.invocationCallOrder[0]
    );
  });

  it("20. timeout or provider error edits loading message", async () => {
    mockStreamChat.mockReset().mockImplementation(() => hangingStream());
    seedTelegramUser(tgDb.db, { telegram_id: 32, state: "chat", selectedModelId: "economy" });
    const user = tgDb.db.tables.telegram_users[0] as never;
    await handleTextMessage(100, 32, user, "سوال timeout");
    const text = [...sendMessage.mock.calls, ...editMessageText.mock.calls]
      .map((c) => c[2] ?? c[1])
      .join(" ");
    expect(text).toMatch(/کند شده|مشکلی پیش اومد/);
    expect(sendMessage).toHaveBeenCalledWith(100, expect.stringContaining("دارم فکر"));
    expect(editMessageText).toHaveBeenCalled();
  });

  it("21. AI response edits loading message instead of sending a second answer", async () => {
    seedTelegramUser(tgDb.db, { telegram_id: 33, state: "chat", selectedModelId: "economy" });
    const user = tgDb.db.tables.telegram_users[0] as never;
    await handleTextMessage(100, 33, user, "سوال تست");
    expect(sendMessage).toHaveBeenCalledWith(100, expect.stringContaining("دارم فکر"));
    expect(editMessageText).toHaveBeenCalledWith(
      100,
      9001,
      "پاسخ تست",
      expect.anything()
    );
    const answerOnlyMessages = sendMessage.mock.calls.filter(
      (c) => String(c[1]) === "پاسخ تست"
    );
    expect(answerOnlyMessages.length).toBe(0);
  });

  it("22. model selection clears inline keyboard and saves state", async () => {
    seedTelegramUser(tgDb.db, { telegram_id: 34, state: "chat" });
    const user = tgDb.db.tables.telegram_users[0] as never;
    await handleCallback(100, 34, user, "model_fast", "cb-2", 77);
    const updated = tgDb.db.tables.telegram_users[0];
    const stateData = updated.state_data as Record<string, unknown>;
    expect(stateData.selectedModelId).toBe("fast");
    expect(stateData.mode).toBe("quick_chat");
    expect(stateData.selectedModel).toBe("fast");
    expect(stateData.selectedAt).toBeTruthy();
    expect(editMessageText).toHaveBeenCalledWith(
      100,
      77,
      expect.stringContaining("GPT-4o mini"),
      { reply_markup: { inline_keyboard: [] } }
    );
  });

  it("23. back to menu edits existing message", async () => {
    seedTelegramUser(tgDb.db, { telegram_id: 35 });
    const user = tgDb.db.tables.telegram_users[0] as never;
    await handleCommand(100, 35, user, "cmd_menu", 88);
    expect(editMessageText).toHaveBeenCalledWith(
      100,
      88,
      "منوی اصلی:",
      expect.objectContaining({ reply_markup: expect.any(Object) })
    );
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("24. edit failure falls back to sendMessage", async () => {
    editMessageText.mockResolvedValueOnce({ ok: false, description: "message cant be edited" });
    seedTelegramUser(tgDb.db, { telegram_id: 36, state: "chat", selectedModelId: "economy" });
    const user = tgDb.db.tables.telegram_users[0] as never;
    await handleTextMessage(100, 36, user, "سوال fallback");
    expect(sendMessage).toHaveBeenCalledWith(100, "پاسخ تست", expect.anything());
  });

  it("25. /image enters image mode", async () => {
    seedTelegramUser(tgDb.db, { telegram_id: 40 });
    const user = tgDb.db.tables.telegram_users[0] as never;
    await handleCommand(100, 40, user, "/image");
    const updated = tgDb.db.tables.telegram_users[0];
    expect((updated.state_data as Record<string, unknown>).mode).toBe("image");
    const text = sendMessage.mock.calls.map((c) => c[1]).join(" ");
    expect(text).toContain("ساخت تصویر");
    expect(text).toContain("رایگان");
  });

  it("26. first image is free without credits", async () => {
    seedTelegramUser(tgDb.db, {
      telegram_id: 41,
      state: "chat",
      mode: "image",
      free_image_used: false,
    });
    const user = tgDb.db.tables.telegram_users[0] as never;
    await handleTextMessage(100, 41, user, "یک گربه نارنجی");
    expect(mockRunTelegramFreeImageGen).toHaveBeenCalledWith({
      telegramUserId: user.id,
      prompt: "یک گربه نارنجی",
    });
    expect(mockRunTelegramImageGen).not.toHaveBeenCalled();
    expect(sendPhoto).toHaveBeenCalledWith(
      100,
      "https://example.com/free-image.png",
      "یک گربه نارنجی"
    );
    expect(tgDb.db.tables.telegram_users[0].free_image_used).toBe(true);
  });

  it("27. image prompt with credits sends photo after free used", async () => {
    tgDb.db.tables.ai_users.push({
      id: "ai-img",
      phone: "09124444444",
      credits: 50,
      plan: "free",
      password_hash: "x",
    });
    seedTelegramUser(tgDb.db, {
      telegram_id: 41,
      state: "chat",
      mode: "image",
      araaye_user_id: "ai-img",
      free_image_used: true,
    });
    const user = tgDb.db.tables.telegram_users[0] as never;
    await handleTextMessage(100, 41, user, "یک گربه نارنجی");
    expect(mockRunTelegramImageGen).toHaveBeenCalledWith({
      araayeUserId: "ai-img",
      prompt: "یک گربه نارنجی",
    });
    expect(sendPhoto).toHaveBeenCalledWith(
      100,
      "https://example.com/image.png",
      "یک گربه نارنجی"
    );
    expect(mockStreamChat).not.toHaveBeenCalled();
  });

  it("28. image prompt without credits after free used does not generate", async () => {
    tgDb.db.tables.ai_users.push({
      id: "ai-poor",
      phone: "09125555555",
      credits: 5,
      plan: "free",
      password_hash: "x",
    });
    seedTelegramUser(tgDb.db, {
      telegram_id: 42,
      state: "chat",
      mode: "image",
      araaye_user_id: "ai-poor",
      free_image_used: true,
    });
    const user = tgDb.db.tables.telegram_users[0] as never;
    await handleTextMessage(100, 42, user, "یک درخت");
    expect(mockRunTelegramImageGen).not.toHaveBeenCalled();
    expect(mockRunTelegramFreeImageGen).not.toHaveBeenCalled();
    expect(sendPhoto).not.toHaveBeenCalled();
    const text = [...sendMessage.mock.calls, ...editMessageText.mock.calls]
      .map((c) => c[2] ?? c[1])
      .join(" ");
    expect(text).toContain("رایگان");
  });

  it("29. image path does not consume free chat quota", async () => {
    tgDb.db.tables.ai_users.push({
      id: "ai-img2",
      phone: "09126666666",
      credits: 50,
      plan: "free",
      password_hash: "x",
    });
    seedTelegramUser(tgDb.db, {
      telegram_id: 43,
      state: "chat",
      mode: "image",
      araaye_user_id: "ai-img2",
      free_image_used: true,
      free_daily_used: 0,
    });
    const user = tgDb.db.tables.telegram_users[0] as never;
    await handleTextMessage(100, 43, user, "یک کوه");
    expect(tgDb.db.tables.telegram_users[0].free_daily_used).toBe(0);
    expect(mockRunTelegramImageGen).toHaveBeenCalled();
  });
});

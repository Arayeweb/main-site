// =========================================================
// Main Telegram update router — acquisition funnel
// =========================================================

import { normalizeContact } from "@/lib/validateContact";
import { sendMessage, answerCallbackQuery, setMyCommands, sendTypingAction, sendUploadPhotoAction, sendPhoto, editMessageText } from "./api";
import { COPY, orderConfirm, maskPhone, pricingMessage } from "./copy";
import { trackEvent } from "./events";
import { checkRequiredMembership } from "./membership";
import {
  forcedJoinKeyboard,
  mainMenuKeyboard,
  modelPickerKeyboard,
  limitReachedKeyboard,
  compareCtaKeyboard,
  pricingKeyboard,
  phoneShareKeyboard,
  orderConfirmKeyboard,
  paymentUrlKeyboard,
  mediaWebCtaKeyboard,
  imageWebCtaKeyboard,
} from "./keyboards";
import {
  createPartialEditor,
  deliverBotResponse,
  editOrSendMessage,
  removeInlineKeyboard,
  sendLoadingMessage,
} from "./messages";
import type { InlineKeyboard } from "./api";
import {
  upsertTelegramUser,
  saveTelegramMessage,
  incrementWebClicks,
  updateUserPhone,
} from "./users";
import { getFreeQuotaStatus, consumeFreeQuota, getFreeImageStatus, consumeFreeImage } from "./quota";
import {
  setState,
  getStateData,
  appendChatContext,
  getChatContext,
  clearChatContext,
  setChatRunning,
  isChatRunning,
} from "./state";
import { runFreeDirectChat } from "./freeChat";
import { runPaidDirectChat } from "./paidChat";
import {
  getAraayeCredits,
  ensureAraayeUser,
  linkAraayeUser,
} from "./accounts";
import {
  createPendingOrderForConfirm,
  activatePaymentOrder,
} from "./payment";
import { getTelegramPackage } from "./packages";
import {
  getTelegramChatModel,
  creditCostForTelegramModel,
  modelPickerMessage,
  modelSelectedMessage,
} from "./chatModels";
import { getTelegramConfig, compareWebUrl, councilWebUrl } from "./config";
import { parseStartPayload } from "./types";
import type { TelegramUserRow } from "./types";
import { getModel } from "@/lib/aiModels";
import {
  runTelegramImageGen,
  runTelegramFreeImageGen,
  telegramImageCreditCost,
} from "./imageGen";

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: {
    id: string;
    from: TelegramUser;
    message?: { message_id: number; chat: { id: number } };
    data?: string;
  };
}

interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

interface TelegramMessage {
  message_id: number;
  chat: { id: number };
  from?: TelegramUser;
  text?: string;
  contact?: { phone_number: string; user_id?: number };
  photo?: unknown[];
  document?: unknown;
  voice?: unknown;
  video?: unknown;
}

let commandsRegistered = false;

function modelStateData(modelId: string): Record<string, unknown> {
  return {
    selectedModelId: modelId,
    mode: "quick_chat",
    selectedModel: modelId,
    selectedAt: new Date().toISOString(),
  };
}

function imageStateData(): Record<string, unknown> {
  return {
    mode: "image",
    selectedModelId: null,
    selectedAt: new Date().toISOString(),
  };
}

async function sendOrEditMenuMessage(
  chatId: number,
  messageId: number | undefined,
  text: string,
  reply_markup?: InlineKeyboard
) {
  await editOrSendMessage(chatId, messageId, text, reply_markup ? { reply_markup } : {});
}

async function editCallbackMessage(
  chatId: number,
  messageId: number | undefined,
  text: string,
  reply_markup?: InlineKeyboard
) {
  if (messageId) {
    await editMessageText(chatId, messageId, text, reply_markup ? { reply_markup } : {});
    return;
  }
  await sendMessage(chatId, text, reply_markup ? { reply_markup } : {});
}

function isPerfEnabled(): boolean {
  return process.env.TELEGRAM_PERF_LOGS === "1";
}

function perfLog(label: string, payload: Record<string, unknown>) {
  if (!isPerfEnabled()) return;
  console.log(`[telegram/perf] ${label}`, payload);
}

async function ensureCommands() {
  if (commandsRegistered) return;
  commandsRegistered = true;
  try {
    await setMyCommands();
  } catch {
    /* BotFather commands optional in dev */
  }
}

async function requireMembership(
  chatId: number,
  telegramId: number,
  user: TelegramUserRow
): Promise<boolean> {
  const membership = await checkRequiredMembership(telegramId, user.id);
  if (!membership.ok) {
    await sendMessage(chatId, COPY.membershipRetry, {
      reply_markup: forcedJoinKeyboard(),
    });
    return false;
  }
  if (!membership.allJoined) {
    await trackEvent("forced_join_shown", {
      telegramUserId: user.id,
      telegramId,
    });
    await sendMessage(chatId, COPY.forcedJoin, {
      reply_markup: forcedJoinKeyboard(),
    });
    return false;
  }
  return true;
}

async function showModelPicker(
  chatId: number,
  userId: string,
  messageId?: number
) {
  await setState(userId, "chat", { selectedModelId: null, mode: "quick_chat" });
  await sendOrEditMenuMessage(chatId, messageId, modelPickerMessage(), modelPickerKeyboard());
}

async function showImageMode(
  chatId: number,
  userId: string,
  messageId?: number
) {
  const cost = telegramImageCreditCost();
  await setState(userId, "chat", imageStateData());
  await sendOrEditMenuMessage(
    chatId,
    messageId,
    COPY.imageModePrompt(cost),
    imageWebCtaKeyboard()
  );
}

async function sendWelcome(chatId: number, _user: TelegramUserRow) {
  await sendMessage(chatId, COPY.welcome, { reply_markup: mainMenuKeyboard() });
}

export async function handleStart(
  chatId: number,
  telegramId: number,
  profile: TelegramUser,
  startText: string
) {
  await ensureCommands();
  const payload = parseStartPayload(startText);
  const user = await upsertTelegramUser(telegramId, profile, payload);
  if (!user) {
    await sendMessage(chatId, COPY.aiSlow);
    return;
  }

  await trackEvent("bot_started", {
    telegramUserId: user.id,
    telegramId,
    metadata: { ...payload, command: "/start" },
  });

  const membership = await checkRequiredMembership(telegramId, user.id);
  if (!membership.ok) {
    await sendMessage(chatId, COPY.membershipRetry, {
      reply_markup: forcedJoinKeyboard(),
    });
    return;
  }
  if (!membership.allJoined) {
    await trackEvent("forced_join_shown", {
      telegramUserId: user.id,
      telegramId,
    });
    await sendMessage(chatId, COPY.forcedJoin, {
      reply_markup: forcedJoinKeyboard(),
    });
    return;
  }

  await trackEvent("forced_join_completed", {
    telegramUserId: user.id,
    telegramId,
  });
  await sendWelcome(chatId, user);
}

export async function handleCommand(
  chatId: number,
  telegramId: number,
  user: TelegramUserRow,
  cmd: string,
  messageId?: number
) {
  const { supportUsername, siteUrl } = getTelegramConfig();

  switch (cmd) {
    case "/chat":
    case "cmd_chat":
      await showModelPicker(chatId, user.id, messageId);
      break;
    case "/image":
    case "cmd_image":
      await trackEvent("image_mode_opened", {
        telegramUserId: user.id,
        telegramId,
      });
      await showImageMode(chatId, user.id, messageId);
      break;
    case "/compare":
    case "compare":
      await trackEvent("compare_link_clicked", {
        telegramUserId: user.id,
        telegramId,
        metadata: { command: cmd },
      });
      await incrementWebClicks(user.id);
      await sendOrEditMenuMessage(
        chatId,
        messageId,
        `مقایسه چند مدل در نسخه وب:\n${compareWebUrl()}`,
        compareCtaKeyboard()
      );
      break;
    case "/council":
    case "council":
      await trackEvent("council_link_clicked", {
        telegramUserId: user.id,
        telegramId,
        metadata: { command: cmd },
      });
      await incrementWebClicks(user.id);
      await sendOrEditMenuMessage(
        chatId,
        messageId,
        `همفکری چند مدل در نسخه وب:\n${councilWebUrl()}`,
        undefined
      );
      break;
    case "/pricing":
    case "cmd_pricing":
      await trackEvent("pricing_opened", {
        telegramUserId: user.id,
        telegramId,
      });
      await sendOrEditMenuMessage(chatId, messageId, pricingMessage(), pricingKeyboard());
      break;
    case "/support":
    case "cmd_support":
      await trackEvent("support_clicked", {
        telegramUserId: user.id,
        telegramId,
      });
      await sendOrEditMenuMessage(
        chatId,
        messageId,
        COPY.support(supportUsername, siteUrl)
      );
      break;
    case "/clear":
    case "cmd_clear":
      await clearChatContext(user.id);
      await trackEvent("clear_clicked", {
        telegramUserId: user.id,
        telegramId,
      });
      await sendOrEditMenuMessage(chatId, messageId, COPY.clearDone);
      break;
    case "cmd_menu":
      await sendOrEditMenuMessage(chatId, messageId, "منوی اصلی:", mainMenuKeyboard());
      break;
    default:
      break;
  }
}

export async function handleCallback(
  chatId: number,
  telegramId: number,
  user: TelegramUserRow,
  data: string,
  callbackQueryId: string,
  messageId?: number
) {
  await answerCallbackQuery(callbackQueryId);

  if (data === "joined_check") {
    const membership = await checkRequiredMembership(telegramId, user.id);
    if (!membership.ok) {
      await editCallbackMessage(chatId, messageId, COPY.membershipRetry, forcedJoinKeyboard());
      return;
    }
    if (!membership.allJoined) {
      await editCallbackMessage(chatId, messageId, COPY.notJoined, forcedJoinKeyboard());
      return;
    }
    await trackEvent("forced_join_completed", {
      telegramUserId: user.id,
      telegramId,
    });
    if (messageId) {
      await editCallbackMessage(chatId, messageId, COPY.welcome, mainMenuKeyboard());
    } else {
      await sendWelcome(chatId, user);
    }
    return;
  }

  if (data.startsWith("model_")) {
    const modelId = data.slice(6);
    const model = getTelegramChatModel(modelId);
    if (!model) return;

    if (model.tier === "premium") {
      const cost = creditCostForTelegramModel(modelId);
      let credits = 0;
      if (user.araaye_user_id) {
        credits = await getAraayeCredits(user.araaye_user_id);
      }
      if (credits < cost) {
        await removeInlineKeyboard(chatId, messageId);
        await editCallbackMessage(
          chatId,
          messageId,
          COPY.premiumModelNoCredits(model.label, cost),
          limitReachedKeyboard()
        );
        return;
      }
    }

    await setState(user.id, "chat", modelStateData(modelId));
    perfLog("model_selected", {
      selected_model_key: modelId,
      actual_provider_model_id: getModel(modelId)?.routeId ?? modelId,
      provider_name: "openrouter",
      tier: model.tier,
    });
    await editCallbackMessage(
      chatId,
      messageId,
      modelSelectedMessage(model),
      { inline_keyboard: [] }
    );
    return;
  }

  if (data.startsWith("buy_")) {
    const packageId = data.slice(4);
    const pkg = getTelegramPackage(packageId);
    if (!pkg) return;
    await trackEvent("package_selected", {
      telegramUserId: user.id,
      telegramId,
      metadata: { package_id: packageId },
    });
    await setState(user.id, "awaiting_phone", { pendingPackageId: packageId });
    await removeInlineKeyboard(chatId, messageId);
    await sendMessage(chatId, COPY.phonePrompt, {
      reply_markup: phoneShareKeyboard(),
    });
    return;
  }

  if (data.startsWith("pay_")) {
    const orderId = data.slice(4);
    const stateData = await getStateData(user.id);
    const phone = (stateData.phone as string) || user.phone;
    if (!phone) {
      await removeInlineKeyboard(chatId, messageId);
      await sendMessage(chatId, COPY.phonePrompt, {
        reply_markup: phoneShareKeyboard(),
      });
      return;
    }
    const result = await activatePaymentOrder({
      orderId,
      telegramUserId: user.id,
      telegramId,
      phone,
    });
    if (!result.ok) {
      await editCallbackMessage(chatId, messageId, COPY.paymentLinkError);
      await removeInlineKeyboard(chatId, messageId);
      return;
    }
    await editCallbackMessage(
      chatId,
      messageId,
      "برای پرداخت روی دکمه زیر بزن:",
      paymentUrlKeyboard(result.redirectUrl)
    );
    await setState(user.id, "idle");
    return;
  }

  if (data.startsWith("cmd_") || data === "compare") {
    await handleCommand(chatId, telegramId, user, data, messageId);
  }
}

export async function handlePhoneInput(
  chatId: number,
  telegramId: number,
  user: TelegramUserRow,
  phoneRaw: string
) {
  const { kind, value: phone } = normalizeContact(phoneRaw);
  if (kind !== "phone") {
    await sendMessage(chatId, COPY.phoneInvalid);
    return;
  }

  await updateUserPhone(user.id, phone);
  await trackEvent("phone_submitted", {
    telegramUserId: user.id,
    telegramId,
    metadata: { phone_masked: maskPhone(phone) },
  });

  const stateData = await getStateData(user.id);
  const packageId = (stateData.pendingPackageId as string) || "starter";
  const pkg = getTelegramPackage(packageId);
  if (!pkg) {
    await sendMessage(chatId, COPY.paymentLinkError);
    return;
  }

  const araayeUserId = await ensureAraayeUser(phone);
  if (araayeUserId) await linkAraayeUser(user.id, araayeUserId);

  const orderId = await createPendingOrderForConfirm({
    telegramUserId: user.id,
    packageId,
    phone,
  });
  if (!orderId) {
    await sendMessage(chatId, COPY.paymentLinkError);
    return;
  }

  await setState(user.id, "confirm_order", {
    pendingPackageId: packageId,
    phone,
    pendingOrderId: orderId,
  });

  await sendMessage(chatId, orderConfirm(pkg, maskPhone(phone)), {
    reply_markup: orderConfirmKeyboard(orderId),
  });
}

export async function handleImageTextMessage(
  chatId: number,
  telegramId: number,
  user: TelegramUserRow,
  text: string
) {
  const { maxFreeMessageChars } = getTelegramConfig();
  const creditCost = telegramImageCreditCost();

  if (user.state === "confirm_order") {
    await sendMessage(chatId, "لطفاً خرید را تأیید کن یا به منو برگرد.");
    return;
  }

  if (text.length > maxFreeMessageChars) {
    await sendMessage(chatId, COPY.textTooLong, { reply_markup: imageWebCtaKeyboard() });
    return;
  }

  if (await isChatRunning(user.id)) {
    await sendMessage(chatId, COPY.parallelRun);
    return;
  }

  await setChatRunning(user.id, true);
  let loadingMessageId: number | null = null;

  try {
    void sendUploadPhotoAction(chatId);
    loadingMessageId = await sendLoadingMessage(chatId, "⏳ دارم تصویر می‌سازم...");

    const freeImage = await getFreeImageStatus(user.id);
    const useFreeImage = freeImage.canUse;
    let usedFreeImage = false;
    let result:
      | Awaited<ReturnType<typeof runTelegramImageGen>>
      | Awaited<ReturnType<typeof runTelegramFreeImageGen>>;

    if (useFreeImage) {
      result = await runTelegramFreeImageGen({
        telegramUserId: user.id,
        prompt: text,
      });
      if (result.ok) {
        const consumed = await consumeFreeImage(user.id);
        if (!consumed) {
          await deliverBotResponse(
            chatId,
            loadingMessageId,
            COPY.imageFreeUsed(creditCost),
            { reply_markup: limitReachedKeyboard() }
          );
          return;
        }
        usedFreeImage = true;
      }
    } else {
      if (!user.araaye_user_id) {
        await deliverBotResponse(
          chatId,
          loadingMessageId,
          COPY.imageFreeUsed(creditCost),
          { reply_markup: limitReachedKeyboard() }
        );
        await trackEvent("image_no_credits", {
          telegramUserId: user.id,
          telegramId,
        });
        return;
      }

      const credits = await getAraayeCredits(user.araaye_user_id);
      if (credits < creditCost) {
        await deliverBotResponse(
          chatId,
          loadingMessageId,
          COPY.imageFreeUsed(creditCost),
          { reply_markup: limitReachedKeyboard() }
        );
        await trackEvent("image_no_credits", {
          telegramUserId: user.id,
          telegramId,
          metadata: { credits, required: creditCost },
        });
        return;
      }

      result = await runTelegramImageGen({
        araayeUserId: user.araaye_user_id,
        prompt: text,
      });
    }

    if (!result.ok) {
      await deliverBotResponse(
        chatId,
        loadingMessageId,
        COPY.imageFailed,
        { reply_markup: imageWebCtaKeyboard() }
      );
      await trackEvent("image_failed", {
        telegramUserId: user.id,
        telegramId,
        metadata: { error: result.error },
      });
      return;
    }

    await saveTelegramMessage({
      telegramUserId: user.id,
      direction: "in",
      text,
    });
    await saveTelegramMessage({
      telegramUserId: user.id,
      direction: "out",
      text: COPY.imageSuccess,
      aiRunId: result.jobId,
    });

    if (loadingMessageId) {
      await editMessageText(chatId, loadingMessageId, COPY.imageSuccess);
    }
    await sendPhoto(chatId, result.imageUrl, text.slice(0, 200));

    await trackEvent(usedFreeImage ? "free_image_sent" : "image_sent", {
      telegramUserId: user.id,
      telegramId,
      metadata: {
        job_id: result.jobId,
        free: usedFreeImage,
        credits_remaining: "creditsRemaining" in result ? result.creditsRemaining : undefined,
      },
    });
  } finally {
    await setChatRunning(user.id, false);
  }
}

export async function handleTextMessage(
  chatId: number,
  telegramId: number,
  user: TelegramUserRow,
  text: string
) {
  const startedAt = Date.now();
  const marks: Record<string, number> = { message_received_ms: 0 };
  const { maxFreeMessageChars } = getTelegramConfig();

  if (text.startsWith("/")) {
    const cmd = text.split(/\s+/)[0].toLowerCase();
    if (cmd === "/start") {
      await handleStart(chatId, telegramId, {
        id: telegramId,
        username: user.username || undefined,
        first_name: user.first_name || undefined,
      }, text);
      return;
    }
    if (!(await requireMembership(chatId, telegramId, user))) return;
    await handleCommand(chatId, telegramId, user, cmd);
    return;
  }

  if (user.state === "awaiting_phone") {
    await handlePhoneInput(chatId, telegramId, user, text);
    return;
  }

  if (!(await requireMembership(chatId, telegramId, user))) return;

  if (text.length > maxFreeMessageChars) {
    await sendMessage(chatId, COPY.textTooLong, { reply_markup: mediaWebCtaKeyboard() });
    return;
  }

  const stateData = await getStateData(user.id);
  marks.session_load_ms = Date.now() - startedAt;
  const mode = stateData.mode as string | undefined;

  if (mode === "image") {
    await handleImageTextMessage(chatId, telegramId, user, text);
    return;
  }

  const selectedModelId = stateData.selectedModelId as string | undefined;

  // مسیر واحد: تا وقتی مدلی انتخاب نشده، همیشه انتخابگر مدل نشان داده می‌شود
  // (نه پاسخ خودکار با economy).
  if (!selectedModelId) {
    await sendMessage(chatId, COPY.modelRequired, {
      reply_markup: modelPickerKeyboard(),
    });
    return;
  }

  if (user.state === "confirm_order") {
    await sendMessage(chatId, "لطفاً خرید را تأیید کن یا به منو برگرد.");
    return;
  }

  if (await isChatRunning(user.id)) {
    await sendMessage(chatId, COPY.parallelRun);
    return;
  }

  await setChatRunning(user.id, true);

  let loadingMessageId: number | null = null;

  try {
    const modelId = selectedModelId;
    const model = getTelegramChatModel(modelId);
    const modelInfo = getModel(modelId);

    // حس سرعت: بلافاصله typing + پیام بارگذاری، قبل از خواندن‌های DB و مدل.
    void sendTypingAction(chatId);
    loadingMessageId = await sendLoadingMessage(chatId);
    marks.loading_sent_ms = Date.now() - startedAt;

    // خواندن سهمیه و تاریخچه به‌صورت موازی تا زمان تا اولین توکن کمتر شود.
    const readStart = Date.now();
    const [quota, history] = await Promise.all([
      getFreeQuotaStatus(telegramId),
      getChatContext(user.id),
    ]);
    marks.quota_credit_check_ms = Date.now() - readStart;
    marks.history_load_ms = Date.now() - readStart;
    const historyForPrompt = history.slice(-4);

    let responseText = "";
    let aiRunId: string | null = null;
    let usedFree = false;
    let promptTokens = 0;
    let completionTokens = 0;
    let providerTtftMs: number | null = null;
    let providerTotalMs = 0;
    const fallbackUsed = false;
    let timeoutUsed = getTelegramConfig().freeChatTimeoutMs;
    const providerName = "openrouter";
    const creditCost = creditCostForTelegramModel(modelId);
    const useFreeTier = model?.tier === "free" && quota.ok && quota.canUse;

    const reportAiError = async (message: string, keyboard?: InlineKeyboard) => {
      await deliverBotResponse(chatId, loadingMessageId, message, keyboard ? { reply_markup: keyboard } : {});
    };

    if (!useFreeTier) {
      if (model?.tier === "premium") {
        let credits = 0;
        if (user.araaye_user_id) {
          credits = await getAraayeCredits(user.araaye_user_id);
        }
        if (credits < creditCost) {
          await reportAiError(COPY.premiumModelNoCredits(model.label, creditCost), limitReachedKeyboard());
          await trackEvent("free_limit_reached", {
            telegramUserId: user.id,
            telegramId,
          });
          return;
        }
      } else if (!user.araaye_user_id) {
        await reportAiError(COPY.freeLimitReached, limitReachedKeyboard());
        await trackEvent("free_limit_reached", {
          telegramUserId: user.id,
          telegramId,
        });
        return;
      } else {
        const credits = await getAraayeCredits(user.araaye_user_id);
        if (credits < creditCost) {
          await reportAiError(COPY.freeLimitReached, limitReachedKeyboard());
          await trackEvent("free_limit_reached", {
            telegramUserId: user.id,
            telegramId,
          });
          return;
        }
      }
    }

    const partial = createPartialEditor(chatId, loadingMessageId);

    if (useFreeTier) {
      marks.provider_request_start_ms = Date.now() - startedAt;
      const result = await runFreeDirectChat(text, historyForPrompt, modelId, partial.onDelta);
      if (!result.ok) {
        if (result.error === "timeout") {
          await reportAiError("الان پاسخ‌دهی مدل کند شده. چند لحظه بعد دوباره بفرست.");
        } else {
          await reportAiError(COPY.aiSlow);
        }
        return;
      }
      providerTtftMs = result.providerTtftMs;
      providerTotalMs = result.providerTotalMs;
      promptTokens = result.promptTokens;
      completionTokens = result.completionTokens;
      timeoutUsed = result.timeoutUsed;
      const consumed = await consumeFreeQuota(user.id);
      if (!consumed) {
        await reportAiError(COPY.freeLimitReached, limitReachedKeyboard());
        await trackEvent("free_limit_reached", {
          telegramUserId: user.id,
          telegramId,
        });
        return;
      }
      responseText = result.text;
      usedFree = true;
    } else if (user.araaye_user_id) {
      marks.provider_request_start_ms = Date.now() - startedAt;
      const result = await runPaidDirectChat({
        araayeUserId: user.araaye_user_id,
        prompt: text,
        history: historyForPrompt,
        modelId,
        onDelta: partial.onDelta,
      });
      if (!result.ok) {
        if (result.error === "insufficient_credits") {
          await reportAiError(COPY.freeLimitReached, limitReachedKeyboard());
          await trackEvent("free_limit_reached", {
            telegramUserId: user.id,
            telegramId,
          });
        } else if (result.error === "plan_upgrade_required") {
          await reportAiError(
            COPY.premiumModelNoCredits(model?.label || modelId, creditCost),
            limitReachedKeyboard()
          );
        } else if (result.error === "timeout") {
          await reportAiError("الان پاسخ‌دهی مدل کند شده. چند لحظه بعد دوباره بفرست.");
        } else {
          await reportAiError(COPY.aiSlow);
        }
        return;
      }
      responseText = result.text;
      aiRunId = result.runId;
      providerTtftMs = result.providerTtftMs;
      providerTotalMs = result.providerTotalMs;
      promptTokens = result.promptTokens;
      completionTokens = result.completionTokens;
      timeoutUsed = result.timeoutUsed;
    } else {
      await reportAiError(COPY.freeLimitReached, limitReachedKeyboard());
      await trackEvent("free_limit_reached", {
        telegramUserId: user.id,
        telegramId,
      });
      return;
    }

    const dbSaveStart = Date.now();
    await saveTelegramMessage({
      telegramUserId: user.id,
      direction: "in",
      text,
    });

    const isFirst = user.total_messages === 0;
    if (isFirst) {
      await trackEvent("first_message_sent", {
        telegramUserId: user.id,
        telegramId,
      });
    }

    await saveTelegramMessage({
      telegramUserId: user.id,
      direction: "out",
      text: responseText,
      aiRunId,
    });

    await appendChatContext(user.id, "user", text);
    await appendChatContext(user.id, "assistant", responseText);
    marks.db_save_ms = Date.now() - dbSaveStart;

    const sendStart = Date.now();
    await deliverBotResponse(chatId, loadingMessageId, responseText);
    marks.telegram_send_ms = Date.now() - sendStart;
    marks.post_process_ms = Date.now() - sendStart;
    marks.provider_total_ms = providerTotalMs;
    marks.total_ms = Date.now() - startedAt;
    const firstEditAt = partial.firstEditAt();
    perfLog("chat_message", {
      ...marks,
      parse_update_ms: 0,
      first_edit_ms: firstEditAt !== null ? firstEditAt - startedAt : null,
      provider_ttft_ms: providerTtftMs,
      selected_model_key: modelId,
      actual_provider_model_id: modelInfo?.routeId ?? modelId,
      provider_name: providerName,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      max_tokens: model?.tier === "free" ? 450 : 600,
      history_messages_count: historyForPrompt.length,
      fallback_used: fallbackUsed,
      timeout_used: timeoutUsed,
      loading_message_id: loadingMessageId,
    });
    void trackEvent("ai_response_sent", {
      telegramUserId: user.id,
      telegramId,
      metadata: { free: usedFree, model_id: modelId },
    });

    if (user.state !== "chat") {
      await setState(user.id, "chat", modelStateData(modelId));
    }
  } finally {
    await setChatRunning(user.id, false);
  }
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  if (update.callback_query) {
    const cq = update.callback_query;
    const chatId = cq.message?.chat.id;
    const telegramId = cq.from.id;
    if (!chatId || !cq.data) return;

    const user = await upsertTelegramUser(telegramId, cq.from);
    if (!user) return;
    await handleCallback(chatId, telegramId, user, cq.data, cq.id, cq.message?.message_id);
    return;
  }

  const msg = update.message;
  if (!msg) return;

  const chatId = msg.chat.id;
  const telegramId = msg.from?.id || chatId;
  const profile = msg.from || { id: telegramId };

  const user = await upsertTelegramUser(telegramId, profile);
  if (!user) return;

  if (msg.photo || msg.document || msg.voice || msg.video) {
    const stateData = await getStateData(user.id);
    if (stateData.mode === "image") {
      await sendMessage(chatId, COPY.imageTextOnly, {
        reply_markup: imageWebCtaKeyboard(),
      });
      return;
    }
    await sendMessage(chatId, COPY.mediaUnsupported, {
      reply_markup: mediaWebCtaKeyboard(),
    });
    return;
  }

  if (msg.contact?.phone_number) {
    if (user.state === "awaiting_phone" || user.state === "confirm_order") {
      await handlePhoneInput(chatId, telegramId, user, msg.contact.phone_number);
    }
    return;
  }

  const text = msg.text?.trim() || "";
  if (!text) return;

  await handleTextMessage(chatId, telegramId, user, text);
}

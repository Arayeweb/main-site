// =========================================================
// Main Telegram update router — acquisition funnel
// =========================================================

import { normalizeContact } from "@/lib/validateContact";
import { sendMessage, answerCallbackQuery, setMyCommands } from "./api";
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
} from "./keyboards";
import {
  upsertTelegramUser,
  saveTelegramMessage,
  incrementWebClicks,
  updateUserPhone,
} from "./users";
import { getFreeQuotaStatus, consumeFreeQuota } from "./quota";
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

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: {
    id: string;
    from: TelegramUser;
    message?: { chat: { id: number } };
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

async function showModelPicker(chatId: number, userId: string) {
  await setState(userId, "chat", { selectedModelId: null });
  await sendMessage(chatId, modelPickerMessage(), {
    reply_markup: modelPickerKeyboard(),
  });
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
  cmd: string
) {
  const { supportUsername, siteUrl } = getTelegramConfig();

  switch (cmd) {
    case "/chat":
    case "cmd_chat":
      await showModelPicker(chatId, user.id);
      break;
    case "/compare":
    case "compare":
      await trackEvent("compare_link_clicked", {
        telegramUserId: user.id,
        telegramId,
        metadata: { command: cmd },
      });
      await incrementWebClicks(user.id);
      await sendMessage(chatId, `مقایسه چند مدل در نسخه وب:\n${compareWebUrl()}`, {
        reply_markup: compareCtaKeyboard(),
        disable_web_page_preview: false,
      });
      break;
    case "/council":
    case "council":
      await trackEvent("council_link_clicked", {
        telegramUserId: user.id,
        telegramId,
        metadata: { command: cmd },
      });
      await incrementWebClicks(user.id);
      await sendMessage(chatId, `همفکری چند مدل در نسخه وب:\n${councilWebUrl()}`, {
        disable_web_page_preview: false,
      });
      break;
    case "/pricing":
    case "cmd_pricing":
      await trackEvent("pricing_opened", {
        telegramUserId: user.id,
        telegramId,
      });
      await sendMessage(chatId, pricingMessage(), {
        reply_markup: pricingKeyboard(),
      });
      break;
    case "/support":
    case "cmd_support":
      await trackEvent("support_clicked", {
        telegramUserId: user.id,
        telegramId,
      });
      await sendMessage(chatId, COPY.support(supportUsername, siteUrl));
      break;
    case "/clear":
    case "cmd_clear":
      await clearChatContext(user.id);
      await trackEvent("clear_clicked", {
        telegramUserId: user.id,
        telegramId,
      });
      await sendMessage(chatId, COPY.clearDone);
      break;
    case "cmd_menu":
      await sendMessage(chatId, "منوی اصلی:", { reply_markup: mainMenuKeyboard() });
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
  callbackQueryId: string
) {
  await answerCallbackQuery(callbackQueryId);

  if (data === "joined_check") {
    const membership = await checkRequiredMembership(telegramId, user.id);
    if (!membership.ok) {
      await sendMessage(chatId, COPY.membershipRetry, {
        reply_markup: forcedJoinKeyboard(),
      });
      return;
    }
    if (!membership.allJoined) {
      await sendMessage(chatId, COPY.notJoined, {
        reply_markup: forcedJoinKeyboard(),
      });
      return;
    }
    await trackEvent("forced_join_completed", {
      telegramUserId: user.id,
      telegramId,
    });
    await sendWelcome(chatId, user);
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
        await sendMessage(chatId, COPY.premiumModelNoCredits(model.label, cost), {
          reply_markup: limitReachedKeyboard(),
        });
        return;
      }
    }

    await setState(user.id, "chat", { selectedModelId: modelId });
    await sendMessage(chatId, modelSelectedMessage(model));
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
      await sendMessage(chatId, COPY.paymentLinkError);
      return;
    }
    await sendMessage(chatId, "برای پرداخت روی دکمه زیر بزن:", {
      reply_markup: paymentUrlKeyboard(result.redirectUrl),
    });
    await setState(user.id, "idle");
    return;
  }

  if (data.startsWith("cmd_") || data === "compare") {
    await handleCommand(chatId, telegramId, user, data);
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
  const packageId = (stateData.pendingPackageId as string) || "base";
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

export async function handleTextMessage(
  chatId: number,
  telegramId: number,
  user: TelegramUserRow,
  text: string
) {
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
  const selectedModelId = stateData.selectedModelId as string | undefined;

  if (user.state === "chat" && !selectedModelId) {
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

  try {
    const modelId = (selectedModelId as string) || "economy";
    const model = getTelegramChatModel(modelId);
    const quota = await getFreeQuotaStatus(telegramId);
    let responseText = "";
    let aiRunId: string | null = null;
    let usedFree = false;
    const creditCost = creditCostForTelegramModel(modelId);
    const useFreeTier =
      model?.tier === "free" && quota.ok && quota.canUse;

    if (useFreeTier) {
      const history = await getChatContext(user.id);
      const result = await runFreeDirectChat(text, history, modelId);
      if (!result.ok) {
        await sendMessage(chatId, COPY.aiSlow);
        return;
      }
      const consumed = await consumeFreeQuota(user.id);
      if (!consumed) {
        await sendMessage(chatId, COPY.freeLimitReached, {
          reply_markup: limitReachedKeyboard(),
        });
        await trackEvent("free_limit_reached", {
          telegramUserId: user.id,
          telegramId,
        });
        return;
      }
      responseText = result.text;
      usedFree = true;
    } else if (user.araaye_user_id) {
      const credits = await getAraayeCredits(user.araaye_user_id);
      if (credits >= creditCost) {
        const history = await getChatContext(user.id);
        const result = await runPaidDirectChat({
          araayeUserId: user.araaye_user_id,
          prompt: text,
          history,
          modelId,
        });
        if (!result.ok) {
          if (result.error === "insufficient_credits") {
            await sendMessage(chatId, COPY.freeLimitReached, {
              reply_markup: limitReachedKeyboard(),
            });
            await trackEvent("free_limit_reached", {
              telegramUserId: user.id,
              telegramId,
            });
          } else if (result.error === "plan_upgrade_required") {
            await sendMessage(chatId, COPY.premiumModelNoCredits(
              model?.label || modelId,
              creditCost
            ), { reply_markup: limitReachedKeyboard() });
          } else {
            await sendMessage(chatId, COPY.aiSlow);
          }
          return;
        }
        responseText = result.text;
        aiRunId = result.runId;
      } else {
        if (model?.tier === "premium") {
          await sendMessage(chatId, COPY.premiumModelNoCredits(model.label, creditCost), {
            reply_markup: limitReachedKeyboard(),
          });
        } else {
          await sendMessage(chatId, COPY.freeLimitReached, {
            reply_markup: limitReachedKeyboard(),
          });
        }
        await trackEvent("free_limit_reached", {
          telegramUserId: user.id,
          telegramId,
        });
        return;
      }
    } else {
      if (model?.tier === "premium") {
        await sendMessage(chatId, COPY.premiumModelNoCredits(
          model.label,
          creditCost
        ), { reply_markup: limitReachedKeyboard() });
      } else {
        await sendMessage(chatId, COPY.freeLimitReached, {
          reply_markup: limitReachedKeyboard(),
        });
      }
      await trackEvent("free_limit_reached", {
        telegramUserId: user.id,
        telegramId,
      });
      return;
    }

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

    await sendMessage(chatId, responseText);
    await trackEvent("ai_response_sent", {
      telegramUserId: user.id,
      telegramId,
      metadata: { free: usedFree, model_id: modelId },
    });

    await sendMessage(chatId, COPY.compareCta, {
      reply_markup: compareCtaKeyboard(),
    });

    if (user.state !== "chat") {
      await setState(user.id, "chat");
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
    await handleCallback(chatId, telegramId, user, cq.data, cq.id);
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

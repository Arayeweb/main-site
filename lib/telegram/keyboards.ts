// =========================================================
// Inline and reply keyboards
// =========================================================

import { getTelegramConfig, compareWebUrl, councilWebUrl, webAppUrl } from "./config";
import type { InlineKeyboard, ReplyKeyboard } from "./api";
import { TELEGRAM_PACKAGE_LIST } from "./packages";
import { TELEGRAM_CHAT_MODELS } from "./chatModels";

export function forcedJoinKeyboard(): InlineKeyboard {
  const { requiredChannelId, salesChannelId } = getTelegramConfig();
  const rows: InlineKeyboard["inline_keyboard"] = [];
  if (requiredChannelId) {
    const url = requiredChannelId.startsWith("@")
      ? `https://t.me/${requiredChannelId.slice(1)}`
      : `https://t.me/c/${requiredChannelId.replace("-100", "")}`;
    rows.push([{ text: "عضویت در کانال آرایه", url }]);
  } else {
    rows.push([{ text: "عضویت در کانال آرایه", url: "https://t.me/araaye" }]);
  }
  if (salesChannelId) {
    const url = salesChannelId.startsWith("@")
      ? `https://t.me/${salesChannelId.slice(1)}`
      : `https://t.me/c/${salesChannelId.replace("-100", "")}`;
    rows.push([{ text: "عضویت در کانال فروش و اطلاع‌رسانی", url }]);
  } else {
    rows.push([{ text: "عضویت در کانال فروش و اطلاع‌رسانی", url: "https://t.me/araaye" }]);
  }
  rows.push([{ text: "عضو شدم", callback_data: "joined_check" }]);
  return { inline_keyboard: rows };
}

export function modelPickerKeyboard(): InlineKeyboard {
  return {
    inline_keyboard: [
      ...TELEGRAM_CHAT_MODELS.map((m) => [
        {
          text: `${m.label} — ${m.subtitle}`,
          callback_data: `model_${m.id}`,
        },
      ]),
      [{ text: "بازگشت", callback_data: "cmd_menu" }],
    ],
  };
}

export function mainMenuKeyboard(): InlineKeyboard {
  return {
    inline_keyboard: [
      [{ text: "چت سریع", callback_data: "cmd_chat" }],
      [{ text: "مقایسه چند مدل", url: compareWebUrl() }],
      [{ text: "همفکری چند مدل", url: councilWebUrl() }],
      [{ text: "خرید اعتبار", callback_data: "cmd_pricing" }],
      [{ text: "پشتیبانی", callback_data: "cmd_support" }],
      [{ text: "پاک کردن تاریخچه", callback_data: "cmd_clear" }],
    ],
  };
}

export function limitReachedKeyboard(): InlineKeyboard {
  return {
    inline_keyboard: [
      [{ text: "خرید اعتبار", callback_data: "cmd_pricing" }],
      [{ text: "ورود به نسخه وب", url: webAppUrl() }],
    ],
  };
}

export function compareCtaKeyboard(): InlineKeyboard {
  return {
    inline_keyboard: [[{ text: "مقایسه چند مدل در وب", url: compareWebUrl() }]],
  };
}

export function pricingKeyboard(): InlineKeyboard {
  return {
    inline_keyboard: [
      ...TELEGRAM_PACKAGE_LIST.map((pkg) => [
        { text: `خرید بسته ${pkg.name}`, callback_data: `buy_${pkg.id}` },
      ]),
      [{ text: "بازگشت", callback_data: "cmd_menu" }],
    ],
  };
}

export function phoneShareKeyboard(): ReplyKeyboard {
  return {
    keyboard: [[{ text: "اشتراک‌گذاری شماره تلفن", request_contact: true }]],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}

export function orderConfirmKeyboard(orderId: string): InlineKeyboard {
  return {
    inline_keyboard: [
      [{ text: "پرداخت", callback_data: `pay_${orderId}` }],
      [{ text: "بازگشت", callback_data: "cmd_pricing" }],
    ],
  };
}

export function paymentUrlKeyboard(url: string): InlineKeyboard {
  return {
    inline_keyboard: [[{ text: "پرداخت", url }]],
  };
}

export function mediaWebCtaKeyboard(): InlineKeyboard {
  return {
    inline_keyboard: [[{ text: "ورود به نسخه وب", url: webAppUrl() }]],
  };
}

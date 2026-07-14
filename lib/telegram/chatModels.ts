// =========================================================
// مدل‌های چت تلگرام — ۲ رایگان + ۲ پولی
// =========================================================

import { getModel } from "@/lib/aiModels";
import { creditsForModel } from "@/lib/ai/usage/estimate";

export type TelegramChatModelTier = "free" | "premium";

export interface TelegramChatModel {
  id: string;
  label: string;
  subtitle: string;
  tier: TelegramChatModelTier;
}

export const TELEGRAM_CHAT_MODELS: TelegramChatModel[] = [
  {
    id: "economy",
    label: "مدل بهینه",
    subtitle: "رایگان · DeepSeek",
    tier: "free",
  },
  {
    id: "fast",
    label: "مدل سریع",
    subtitle: "رایگان · GPT-4o mini",
    tier: "free",
  },
  {
    id: "precise",
    label: "مدل دقیق",
    subtitle: "پولی · GPT · ۶ اعتبار",
    tier: "premium",
  },
  {
    id: "critic",
    label: "مدل منتقد",
    subtitle: "پولی · Claude · ۶ اعتبار",
    tier: "premium",
  },
];

export function getTelegramChatModel(id: string): TelegramChatModel | null {
  return TELEGRAM_CHAT_MODELS.find((m) => m.id === id) || null;
}

export function creditCostForTelegramModel(id: string): number {
  const m = getModel(id);
  if (!m) return 1;
  return creditsForModel(m);
}

export function modelPickerMessage(): string {
  return `با کدوم مدل می‌خوای چت کنی؟

۲ مدل اول با سهمیه رایگان روزانه
۲ مدل آخر با اعتبار (خفن‌تر)`;
}

export function modelSelectedMessage(model: TelegramChatModel): string {
  const shortName = getModel(model.id)?.name || model.label;
  if (model.tier === "free") {
    return `${shortName} فعاله. سوالت را بفرست.`;
  }
  const cost = creditCostForTelegramModel(model.id);
  return `${shortName} فعاله (≈${cost} اعتبار هر پاسخ). سوالت را بفرست.`;
}

// =========================================================
// منطق کردیت و انتخاب مدل — Araaye Arena
// سه حالت:
//   battle       دو مدل ناشناس تصادفی → رأی → افشا
//   side_by_side دو مدل به انتخاب کاربر، نام‌ها از اول پیدا
//   direct       گفتگو با یک مدل مشخص
// =========================================================

import {
  COMPARE_MODELS,
  compareModelsByTier,
  getModel,
  type AIModelInfo,
  type ModelTier,
} from "./aiModels";
import { planRank, type AIPlan } from "./aiPackages";

export type ArenaMode = "battle" | "side_by_side" | "direct";
export type BattleTier = "economy" | "standard" | "premium";

/** هزینه کردیت هر نبرد ناشناس بر اساس tier */
export const BATTLE_CREDIT_COST: Record<BattleTier, number> = {
  economy: 1,
  standard: 2,
  premium: 4,
};

/** pool مدل‌های هر tier نبرد */
const TIER_POOLS: Record<BattleTier, ModelTier[]> = {
  economy: ["economy"],
  standard: ["economy", "mid"],
  premium: ["mid", "premium"],
};

/** حداقل پلن لازم برای استفاده مستقیم از یک مدل */
export const TIER_MIN_PLAN: Record<ModelTier, AIPlan> = {
  economy: "free",
  mid: "starter",
  premium: "pro",
};

/** هزینه کردیت یک جفت پاسخ از این مدل (مبنای side_by_side) */
const MODEL_PAIR_COST: Record<ModelTier, number> = {
  economy: 1,
  mid: 2,
  premium: 4,
};

/** هزینه کردیت یک پاسخ تکی (direct) */
const MODEL_SINGLE_COST: Record<ModelTier, number> = {
  economy: 1,
  mid: 1,
  premium: 2,
};

export function canUseModel(plan: string, model: AIModelInfo): boolean {
  return planRank(plan) >= planRank(TIER_MIN_PLAN[model.tier]);
}

/** حداقل پلن لازم برای هر حالت workspace */
export const MODE_MIN_PLAN: Record<ArenaMode, AIPlan> = {
  battle: "free",
  direct: "free",
  side_by_side: "starter",
};

export function canUseMode(plan: string, mode: ArenaMode): boolean {
  return planRank(plan) >= planRank(MODE_MIN_PLAN[mode]);
}

/** هزینه side_by_side: بر اساس گران‌ترین مدل انتخاب‌شده */
export function sideBySideCost(a: AIModelInfo, b: AIModelInfo): number {
  return Math.max(MODEL_PAIR_COST[a.tier], MODEL_PAIR_COST[b.tier]);
}

export function directCost(m: AIModelInfo): number {
  return MODEL_SINGLE_COST[m.tier];
}

/**
 * tier نبرد ناشناس را بر اساس پلن کاربر انتخاب می‌کند.
 * free → economy — starter → standard
 * pro → ۲۵٪ premium — business → ۴۰٪ premium (کنترل هزینه)
 */
export function pickBattleTier(plan: string): BattleTier {
  const rank = planRank(plan);
  if (rank <= 0) return "economy";
  if (rank === 1) return "standard";
  const r = Math.random();
  if (rank === 2) return r < 0.25 ? "premium" : "standard";
  return r < 0.4 ? "premium" : "standard";
}

/** دو مدل متفاوت از pool مقایسه/نبرد */
export function pickBattleModels(tier: BattleTier): [AIModelInfo, AIModelInfo] {
  const pool = compareModelsByTier(...TIER_POOLS[tier]);
  const list = pool.length >= 2 ? pool : COMPARE_MODELS;
  const i = Math.floor(Math.random() * list.length);
  let j = Math.floor(Math.random() * (list.length - 1));
  if (j >= i) j += 1;
  return [list[i], list[j]];
}

/** اعتبارسنجی شخصیت direct */
export function resolveUserModel(
  id: string | null | undefined,
  plan: string
): AIModelInfo | { error: "invalid_model" | "plan_upgrade_required" } {
  const m = id ? getModel(id) : undefined;
  if (!m || m.kind !== "direct") return { error: "invalid_model" };
  if (!canUseModel(plan, m)) return { error: "plan_upgrade_required" };
  return m;
}

/** اعتبارسنجی مدل مقایسه / side-by-side */
export function resolveCompareModel(
  id: string | null | undefined,
  plan: string
): AIModelInfo | { error: "invalid_model" | "plan_upgrade_required" } {
  const m = id ? getModel(id) : undefined;
  if (!m || m.kind !== "compare") return { error: "invalid_model" };
  if (!canUseModel(plan, m)) return { error: "plan_upgrade_required" };
  return m;
}

/** اعتبارسنجی مدل استودیو تصویر — جدا از چت */
export function resolveImageModel(
  id: string | null | undefined,
  plan: string
): AIModelInfo | { error: "invalid_model" | "plan_upgrade_required" } {
  const m = id ? getModel(id) : undefined;
  if (!m || m.kind !== "image") return { error: "invalid_model" };
  if (!canUseModel(plan, m)) return { error: "plan_upgrade_required" };
  return m;
}

/** سقف token خروجی هر مدل بر اساس tier — کنترل هزینه */
export const MODEL_MAX_TOKENS: Record<ModelTier, number> = {
  economy: 900,
  mid: 1100,
  premium: 1400,
};

/** سقف token نبرد ناشناس بر اساس tier نبرد */
export const TIER_MAX_TOKENS: Record<BattleTier, number> = {
  economy: 900,
  standard: 1100,
  premium: 1400,
};

/** هزینه ساخت تصویر بر اساس tier مدل */
export const IMAGE_GEN_CREDIT_COST: Record<ModelTier, number> = {
  economy: 3,
  mid: 3,
  premium: 5,
};

export function imageGenCost(m: AIModelInfo): number {
  return m.imageCreditCost ?? IMAGE_GEN_CREDIT_COST[m.tier] ?? 3;
}

export {
  videoGenCost,
  audioSpeechCost,
  transcribeCost,
  musicGenCost,
  resolveVideoModel,
  resolveAudioModel,
  resolveMusicModel,
  resolveTranscribeModel,
  validateVideoDuration,
  DEFAULT_VIDEO_DURATION_SEC,
} from "./aiMediaCredits";

/** سقف طول پرامپت (کاراکتر) */
export const MAX_PROMPT_CHARS = 4000;

/** آستانه هشدار هزینه یک نبرد (USD) — فقط log، سرویس قطع نمی‌شود */
export const MAX_BATTLE_COST_USD = Number(
  process.env.MAX_BATTLE_COST_USD || "0.25"
);

// =========================================================
// منطق کردیت و انتخاب مدل — Araaye Arena
// =========================================================

import {
  COMPARE_MODELS,
  compareModelsByTier,
  getModel,
  type AIModelInfo,
  type ModelTier,
} from "./aiModels";
import {
  BUSINESS_ONLY_MODEL_IDS,
  chatModelCredit,
  CREDIT_ERROR_MESSAGES,
  IMAGE_CREDIT_BY_MODEL,
  PLAN_IDS,
  TIER_MIN_PLAN,
  type AIPlan,
  webSearchSurcharge,
} from "./aiPricingConfig";
import { planRank } from "./aiPackages";

export type ArenaMode = "battle" | "side_by_side" | "direct";
export type BattleTier = "economy" | "standard" | "premium";

export { CREDIT_ERROR_MESSAGES };

/** هزینه کردیت هر نبرد ناشناس بر اساس tier */
export const BATTLE_CREDIT_COST: Record<BattleTier, number> = {
  economy: 1,
  standard: 2,
  premium: 8,
};

const TIER_POOLS: Record<BattleTier, ModelTier[]> = {
  economy: ["economy"],
  standard: ["economy", "mid"],
  premium: ["mid", "premium"],
};

export { TIER_MIN_PLAN };

export function canUseModel(plan: string, model: AIModelInfo): boolean {
  if (BUSINESS_ONLY_MODEL_IDS.has(model.id)) {
    return planRank(plan) >= planRank(PLAN_IDS.BUSINESS);
  }
  return planRank(plan) >= planRank(TIER_MIN_PLAN[model.tier]);
}

export const MODE_MIN_PLAN: Record<ArenaMode, AIPlan> = {
  battle: PLAN_IDS.FREE,
  direct: PLAN_IDS.FREE,
  side_by_side: PLAN_IDS.STARTER,
};

export function canUseMode(plan: string, mode: ArenaMode): boolean {
  return planRank(plan) >= planRank(MODE_MIN_PLAN[mode]);
}

export type ChatCostOptions = {
  webSearch?: boolean;
  visionExtra?: number;
};

/** هزینه یک پیام چت — مدل + surchargeها */
export function chatMessageCost(
  m: AIModelInfo,
  opts?: ChatCostOptions
): number {
  let cost = chatModelCredit(m.id, m.tier);
  if (opts?.webSearch) cost += webSearchSurcharge();
  if (opts?.visionExtra) cost += opts.visionExtra;
  return cost;
}

export function sideBySideCost(
  a: AIModelInfo,
  b: AIModelInfo,
  opts?: ChatCostOptions
): number {
  return Math.max(chatMessageCost(a, opts), chatMessageCost(b, opts));
}

export function directCost(m: AIModelInfo, opts?: ChatCostOptions): number {
  return chatMessageCost(m, opts);
}

export function pickBattleTier(plan: string): BattleTier {
  const rank = planRank(plan);
  if (rank <= 0) return "economy";
  if (rank <= 2) return "standard";
  const r = Math.random();
  if (rank === 3) return r < 0.25 ? "premium" : "standard";
  return r < 0.4 ? "premium" : "standard";
}

export function pickBattleModels(tier: BattleTier): [AIModelInfo, AIModelInfo] {
  const pool = compareModelsByTier(...TIER_POOLS[tier]);
  const list = pool.length >= 2 ? pool : COMPARE_MODELS;
  const i = Math.floor(Math.random() * list.length);
  let j = Math.floor(Math.random() * (list.length - 1));
  if (j >= i) j += 1;
  return [list[i], list[j]];
}

export function resolveUserModel(
  id: string | null | undefined,
  plan: string
): AIModelInfo | { error: "invalid_model" | "plan_upgrade_required" } {
  const m = id ? getModel(id) : undefined;
  if (!m || m.kind !== "direct") return { error: "invalid_model" };
  if (!canUseModel(plan, m)) return { error: "plan_upgrade_required" };
  return m;
}

export function resolveCompareModel(
  id: string | null | undefined,
  plan: string
): AIModelInfo | { error: "invalid_model" | "plan_upgrade_required" } {
  const m = id ? getModel(id) : undefined;
  if (!m || m.kind !== "compare") return { error: "invalid_model" };
  if (!canUseModel(plan, m)) return { error: "plan_upgrade_required" };
  return m;
}

export function resolveImageModel(
  id: string | null | undefined,
  plan: string
): AIModelInfo | { error: "invalid_model" | "plan_upgrade_required" } {
  const m = id ? getModel(id) : undefined;
  if (!m || m.kind !== "image") return { error: "invalid_model" };
  if (!canUseModel(plan, m)) return { error: "plan_upgrade_required" };
  return m;
}

export const MODEL_MAX_TOKENS: Record<ModelTier, number> = {
  economy: 900,
  mid: 1100,
  premium: 1400,
};

export const TIER_MAX_TOKENS: Record<BattleTier, number> = {
  economy: 900,
  standard: 1100,
  premium: 1400,
};

export const IMAGE_GEN_CREDIT_COST: Record<ModelTier, number> = {
  economy: 10,
  mid: 22,
  premium: 40,
};

export function imageGenCost(m: AIModelInfo): number {
  return (
    IMAGE_CREDIT_BY_MODEL[m.id] ??
    m.imageCreditCost ??
    IMAGE_GEN_CREDIT_COST[m.tier] ??
    10
  );
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

export const MAX_PROMPT_CHARS = 4000;

export const MAX_BATTLE_COST_USD = Number(
  process.env.MAX_BATTLE_COST_USD || "0.25"
);

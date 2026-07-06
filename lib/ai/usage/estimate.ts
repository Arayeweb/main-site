// =========================================================
// برآورد اعتبار قبل از run — بر اساس mode و tier مدل‌ها.
// کاربر با «اعتبار» کار می‌کند، نه token.
// =========================================================

import { getModel, type AIModelInfo, type ModelTier } from "@/lib/aiModels";
import type { RunMode } from "@/lib/ai/streaming/sse";

/** هزینه هر پاسخ تکی بر اساس tier — نگاشت جدید orchestration */
const SINGLE_ANSWER_CREDITS: Record<ModelTier, number> = {
  economy: 1,
  mid: 3,
  premium: 6,
};

/** سربار moderator شورا (نقد + سنتز) */
const COUNCIL_MODERATOR_CREDITS = 7;

export function creditsForModel(m: AIModelInfo): number {
  return SINGLE_ANSWER_CREDITS[m.tier];
}

/**
 * برآورد کل اعتبار یک run.
 * direct: هزینه یک مدل (+۱ برای vision)
 * compare: مجموع دو مدل
 * council: مجموع همه اعضا + سربار moderator
 */
export function estimateRunCredits(
  mode: RunMode,
  modelIds: string[],
  opts?: { hasVision?: boolean }
): number {
  const models = modelIds
    .map((id) => getModel(id))
    .filter((m): m is AIModelInfo => !!m);

  const base = models.reduce((sum, m) => sum + creditsForModel(m), 0);
  const visionExtra = opts?.hasVision ? 1 : 0;

  if (mode === "council") return base + COUNCIL_MODERATOR_CREDITS + visionExtra;
  return base + visionExtra;
}

// =========================================================
// برآورد اعتبار قبل از run — بر اساس mode و مدل‌ها.
// =========================================================

import { getModel, type AIModelInfo } from "@/lib/aiModels";
import { chatModelCredit, webSearchSurcharge } from "@/lib/aiPricingConfig";
import type { RunMode } from "@/lib/ai/streaming/sse";

const COUNCIL_MODERATOR_CREDITS = 7;

export function creditsForModel(m: AIModelInfo): number {
  return chatModelCredit(m.id, m.tier);
}

export function estimateRunCredits(
  mode: RunMode,
  modelIds: string[],
  opts?: { hasVision?: boolean; webSearch?: boolean }
): number {
  const models = modelIds
    .map((id) => getModel(id))
    .filter((m): m is AIModelInfo => !!m);

  let total = models.reduce((sum, m) => sum + creditsForModel(m), 0);
  if (opts?.hasVision) total += 1;
  if (opts?.webSearch) total += webSearchSurcharge();

  if (mode === "council") return total + COUNCIL_MODERATOR_CREDITS;
  return total;
}

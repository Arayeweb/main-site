// =========================================================
// برآورد اعتبار قبل از run — بر اساس mode و مدل‌ها.
// =========================================================

import { getModel, type AIModelInfo } from "@/lib/aiModels";
import {
  estimatedCreditsForModel,
  WEB_SEARCH_MIN_CREDITS,
} from "@/lib/ai/pricing/costToCredits";
import type { RunMode } from "@/lib/ai/streaming/sse";

const ESTIMATED_INPUT_TOKENS = 900;
const ESTIMATED_OUTPUT_TOKENS: Record<AIModelInfo["tier"], number> = {
  economy: 900,
  mid: 1100,
  premium: 1400,
};
const COUNCIL_CRITIQUE_TOKENS = 700;
const COUNCIL_SYNTHESIS_TOKENS = 1400;
const COUNCIL_MODERATOR_MODEL = "precise";

export function creditsForModel(m: AIModelInfo): number {
  return estimatedCreditsForModel(
    m.id,
    ESTIMATED_INPUT_TOKENS,
    ESTIMATED_OUTPUT_TOKENS[m.tier]
  );
}

export function estimateRunCredits(
  mode: RunMode,
  modelIds: string[],
  opts?: { hasVision?: boolean; webSearch?: boolean; answerSurchargeCredits?: number }
): number {
  const models = modelIds
    .map((id) => getModel(id))
    .filter((m): m is AIModelInfo => !!m);

  let total = models.reduce((sum, m) => sum + creditsForModel(m), 0);
  if (opts?.hasVision) total += 1;
  if (opts?.webSearch) total += WEB_SEARCH_MIN_CREDITS * Math.max(1, models.length);
  if (opts?.answerSurchargeCredits) {
    total += opts.answerSurchargeCredits * Math.max(1, models.length);
  }

  if (mode === "council") {
    total += estimatedCreditsForModel(
      COUNCIL_MODERATOR_MODEL,
      ESTIMATED_INPUT_TOKENS + models.length * ESTIMATED_OUTPUT_TOKENS.premium,
      COUNCIL_CRITIQUE_TOKENS
    );
    total += estimatedCreditsForModel(
      COUNCIL_MODERATOR_MODEL,
      ESTIMATED_INPUT_TOKENS + models.length * ESTIMATED_OUTPUT_TOKENS.premium + COUNCIL_CRITIQUE_TOKENS,
      COUNCIL_SYNTHESIS_TOKENS
    );
  }
  return total;
}

// =========================================================
// کردیت استودیو ویدیو / صوت — Araaye Arena
// =========================================================

import { getModel, videoModelFallbackChain, type AIModelInfo } from "./aiModels";
import {
  PLAN_IDS,
  TIER_MIN_PLAN,
  VIDEO_CREDIT_RATES,
  VIDEO_MIN_PLAN,
} from "./aiPricingConfig";
import { planRank } from "./aiPackages";

export { VIDEO_CREDIT_RATES };

export const AUDIO_SPEECH_BASE_CREDITS: Record<string, number> = {
  "audio-mini": 2,
  "audio-pro": 5,
};

export const TRANSCRIBE_CREDITS_PER_MINUTE = 2;

export const DEFAULT_VIDEO_DURATION_SEC = 5;
export const TTS_CHARS_PER_CREDIT_BLOCK = 500;

export function videoGenCost(model: AIModelInfo, durationSec: number): number {
  const rates = VIDEO_CREDIT_RATES[model.id];
  if (!rates) {
    const fallback = model.videoCreditCost ?? 60;
    return Math.max(fallback, Math.ceil(durationSec * 12));
  }
  const dur = Math.max(1, Math.round(durationSec));
  return Math.max(rates.minCredits, Math.ceil(dur * rates.creditsPerSecond));
}

export function audioSpeechCost(model: AIModelInfo, charCount: number): number {
  const base = AUDIO_SPEECH_BASE_CREDITS[model.id] ?? model.audioCreditCost ?? 2;
  const blocks = Math.max(1, Math.ceil(charCount / TTS_CHARS_PER_CREDIT_BLOCK));
  return base * blocks;
}

export function transcribeCost(model: AIModelInfo, durationSec: number): number {
  const perMin =
    model.transcribeCreditPerMinute ?? TRANSCRIBE_CREDITS_PER_MINUTE;
  const minutes = Math.max(1, Math.ceil(durationSec / 60));
  return perMin * minutes;
}

export function canUseVideoModel(plan: string, model: AIModelInfo): boolean {
  const minPlan = VIDEO_MIN_PLAN[model.id];
  if (minPlan) {
    return planRank(plan) >= planRank(minPlan);
  }
  return planRank(plan) >= planRank(TIER_MIN_PLAN[model.tier]);
}

/** زنجیره fallback فقط شامل مدل‌هایی که پلن کاربر اجازه می‌دهد */
export function videoFallbackModelsForPlan(primary: string, plan: string): string[] {
  return videoModelFallbackChain(primary).filter((id) => {
    const m = getModel(id);
    return m?.kind === "video" && canUseVideoModel(plan, m);
  });
}

export function resolveVideoModel(
  id: string | null | undefined,
  plan: string
): AIModelInfo | { error: "invalid_model" | "plan_upgrade_required" } {
  const m = id ? getModel(id) : undefined;
  if (!m || m.kind !== "video") return { error: "invalid_model" };
  if (!canUseVideoModel(plan, m)) return { error: "plan_upgrade_required" };
  return m;
}

export function resolveAudioModel(
  id: string | null | undefined,
  plan: string
): AIModelInfo | { error: "invalid_model" | "plan_upgrade_required" } {
  const m = id ? getModel(id) : undefined;
  if (!m || m.kind !== "audio") return { error: "invalid_model" };
  if (planRank(plan) < planRank(TIER_MIN_PLAN[m.tier])) {
    return { error: "plan_upgrade_required" };
  }
  return m;
}

export function musicGenCost(model: AIModelInfo): number {
  return model.musicCreditCost ?? 40;
}

export function resolveMusicModel(
  id: string | null | undefined,
  plan: string
): AIModelInfo | { error: "invalid_model" | "plan_upgrade_required" } {
  const m = id ? getModel(id) : undefined;
  if (!m || m.kind !== "music") return { error: "invalid_model" };
  if (planRank(plan) < planRank(TIER_MIN_PLAN[m.tier])) {
    return { error: "plan_upgrade_required" };
  }
  return m;
}

export function resolveTranscribeModel(
  id: string | null | undefined,
  plan: string
): AIModelInfo | { error: "invalid_model" | "plan_upgrade_required" } {
  const m = id ? getModel(id) : undefined;
  if (!m || m.kind !== "transcribe") return { error: "invalid_model" };
  if (planRank(plan) < planRank(TIER_MIN_PLAN[m.tier])) {
    return { error: "plan_upgrade_required" };
  }
  return m;
}

export function validateVideoDuration(
  model: AIModelInfo,
  durationSec: number
): number | { error: "invalid_duration" } {
  const allowed = model.videoDurations ?? [4, 5, 8];
  const dur = Math.round(durationSec);
  if (!allowed.includes(dur)) return { error: "invalid_duration" };
  return dur;
}

/** ویدیو ۱۰۸۰p فقط Max و Business */
export function is1080pVideoModel(modelId: string): boolean {
  return modelId === "video-veo";
}

export function canUse1080pVideo(plan: string): boolean {
  return planRank(plan) >= planRank(PLAN_IDS.MAX);
}

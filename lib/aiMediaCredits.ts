// =========================================================
// کردیت استودیو ویدیو / صوت — Araaye Arena
// منبع واحد قیمت‌گذاری مدیا (جدای چت و تصویر)
// =========================================================

import {
  getModel,
  type AIModelInfo,
} from "./aiModels";
import { canUseModel } from "./aiCredits";

/** نرخ کردیت ویدیو بر اساس id مدل */
export const VIDEO_CREDIT_RATES: Record<
  string,
  { creditsPerSecond: number; minCredits: number }
> = {
  "video-seedance": { creditsPerSecond: 2, minCredits: 8 },
  "video-kling": { creditsPerSecond: 10, minCredits: 40 },
  "video-sora": { creditsPerSecond: 25, minCredits: 100 },
  "video-veo": { creditsPerSecond: 30, minCredits: 120 },
};

/** کردیت پایه TTS (تا ۵۰۰ کاراکتر) */
export const AUDIO_SPEECH_BASE_CREDITS: Record<string, number> = {
  "audio-mini": 2,
  "audio-pro": 5,
};

/** کردیت رونویسی به ازای هر دقیقه (گرد به بالا) */
export const TRANSCRIBE_CREDITS_PER_MINUTE = 2;

export const DEFAULT_VIDEO_DURATION_SEC = 5;
export const TTS_CHARS_PER_CREDIT_BLOCK = 500;

export function videoGenCost(model: AIModelInfo, durationSec: number): number {
  const rates = VIDEO_CREDIT_RATES[model.id];
  if (!rates) {
    const fallback = model.videoCreditCost ?? 10;
    return Math.max(fallback, Math.ceil(durationSec * 2));
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

export function resolveVideoModel(
  id: string | null | undefined,
  plan: string
): AIModelInfo | { error: "invalid_model" | "plan_upgrade_required" } {
  const m = id ? getModel(id) : undefined;
  if (!m || m.kind !== "video") return { error: "invalid_model" };
  if (!canUseModel(plan, m)) return { error: "plan_upgrade_required" };
  return m;
}

export function resolveAudioModel(
  id: string | null | undefined,
  plan: string
): AIModelInfo | { error: "invalid_model" | "plan_upgrade_required" } {
  const m = id ? getModel(id) : undefined;
  if (!m || m.kind !== "audio") return { error: "invalid_model" };
  if (!canUseModel(plan, m)) return { error: "plan_upgrade_required" };
  return m;
}

export function musicGenCost(model: AIModelInfo): number {
  return model.musicCreditCost ?? 8;
}

export function resolveMusicModel(
  id: string | null | undefined,
  plan: string
): AIModelInfo | { error: "invalid_model" | "plan_upgrade_required" } {
  const m = id ? getModel(id) : undefined;
  if (!m || m.kind !== "music") return { error: "invalid_model" };
  if (!canUseModel(plan, m)) return { error: "plan_upgrade_required" };
  return m;
}

export function resolveTranscribeModel(
  id: string | null | undefined,
  plan: string
): AIModelInfo | { error: "invalid_model" | "plan_upgrade_required" } {
  const m = id ? getModel(id) : undefined;
  if (!m || m.kind !== "transcribe") return { error: "invalid_model" };
  if (!canUseModel(plan, m)) return { error: "plan_upgrade_required" };
  return m;
}

/** مدت‌های مجاز ویدیو — اعتبارسنجی سمت سرور */
export function validateVideoDuration(
  model: AIModelInfo,
  durationSec: number
): number | { error: "invalid_duration" } {
  const allowed = model.videoDurations ?? [4, 5, 8];
  const dur = Math.round(durationSec);
  if (!allowed.includes(dur)) return { error: "invalid_duration" };
  return dur;
}

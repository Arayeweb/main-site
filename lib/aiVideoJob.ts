import { submitVideoJobWithFallback, type VideoGenOpts } from "@/lib/aiEngine";
import {
  DEFAULT_VIDEO_DURATION_SEC,
  validateVideoDuration,
  videoFallbackModelsForPlan,
} from "@/lib/aiMediaCredits";
import { getModel } from "@/lib/aiModels";

export type VideoJobRetryRow = {
  model_id: string;
  prompt: string | null;
  duration_sec: number | null;
  reference_url?: string | null;
};

export function videoSubmitOptsFromJob(row: VideoJobRetryRow): VideoGenOpts {
  const model = getModel(row.model_id);
  const durationRaw = row.duration_sec ?? DEFAULT_VIDEO_DURATION_SEC;
  const duration =
    model && typeof validateVideoDuration(model, durationRaw) === "number"
      ? (validateVideoDuration(model, durationRaw) as number)
      : durationRaw;

  return {
    duration,
    aspectRatio: "16:9",
    resolution: "720p",
    generateAudio: true,
    referenceImageUrl: row.reference_url || undefined,
  };
}

/** مدل‌های بعدی در زنجیره fallback که هنوز امتحان نشده‌اند */
export function remainingVideoFallbackModels(primary: string, plan: string): string[] {
  const chain = videoFallbackModelsForPlan(primary, plan);
  const idx = chain.indexOf(primary);
  return idx === -1 ? [] : chain.slice(idx + 1);
}

export async function retryVideoJobWithFallback(
  row: VideoJobRetryRow,
  plan: string
): Promise<{ jobId: string; pollingUrl: string; modelId: string } | null> {
  const candidates = remainingVideoFallbackModels(row.model_id, plan);
  if (candidates.length === 0) return null;

  const prompt = row.prompt || "";
  let lastError: Error = new Error("video_submit_failed");

  for (const modelId of candidates) {
    const model = getModel(modelId);
    if (!model) continue;

    const duration = validateVideoDuration(model, row.duration_sec ?? DEFAULT_VIDEO_DURATION_SEC);
    if (typeof duration !== "number") continue;

    const opts: VideoGenOpts = {
      ...videoSubmitOptsFromJob({ ...row, model_id: modelId, duration_sec: duration }),
      duration,
    };

    try {
      const result = await submitVideoJobWithFallback(prompt, [modelId], opts);
      console.warn(`[aiVideoJob] poll fallback ${row.model_id} → ${result.modelId}`);
      return result;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error("video_submit_failed");
      console.warn(`[aiVideoJob] poll fallback ${modelId} failed:`, lastError.message);
    }
  }

  return null;
}

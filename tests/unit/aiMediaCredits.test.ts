import { describe, it, expect } from "vitest";
import {
  videoGenCost,
  audioSpeechCost,
  transcribeCost,
  resolveVideoModel,
  canUseVideoModel,
  resolveAudioModel,
  resolveTranscribeModel,
  validateVideoDuration,
} from "@/lib/aiMediaCredits";
import { getModel } from "@/lib/aiModels";

describe("aiMediaCredits — video/audio/transcribe pricing", () => {
  it("calculates 5s video costs per model", () => {
    expect(videoGenCost(getModel("video-seedance")!, 5)).toBe(60);
    expect(videoGenCost(getModel("video-kling")!, 5)).toBe(150);
    expect(videoGenCost(getModel("video-sora")!, 5)).toBe(375);
    expect(videoGenCost(getModel("video-veo")!, 5)).toBe(400);
  });

  it("enforces minimum video credits", () => {
    expect(videoGenCost(getModel("video-seedance")!, 1)).toBe(50);
    expect(videoGenCost(getModel("video-sora")!, 1)).toBe(250);
  });

  it("calculates TTS cost with char blocks", () => {
    expect(audioSpeechCost(getModel("audio-mini")!, 100)).toBe(2);
    expect(audioSpeechCost(getModel("audio-mini")!, 501)).toBe(4);
    expect(audioSpeechCost(getModel("audio-pro")!, 200)).toBe(5);
  });

  it("calculates transcribe cost per minute (ceil)", () => {
    expect(transcribeCost(getModel("transcribe-4o")!, 30)).toBe(2);
    expect(transcribeCost(getModel("transcribe-4o")!, 90)).toBe(4);
  });

  it("resolves video models with plan gating", () => {
    expect(resolveVideoModel("video-seedance", "free")).toEqual({
      error: "plan_upgrade_required",
    });
    expect(canUseVideoModel("free", getModel("video-seedance")!)).toBe(false);
    expect(canUseVideoModel("starter", getModel("video-seedance")!)).toBe(true);
    expect(resolveVideoModel("video-sora", "starter")).toEqual({
      error: "plan_upgrade_required",
    });
    expect(resolveVideoModel("video-kling", "starter")).toEqual({
      error: "plan_upgrade_required",
    });
    expect(resolveVideoModel("video-seedance", "starter")).toEqual(
      getModel("video-seedance")
    );
    expect(resolveVideoModel("video-sora", "max")).toEqual(getModel("video-sora"));
    expect(resolveVideoModel("invalid", "pro")).toEqual({ error: "invalid_model" });
  });

  it("resolves audio and transcribe models", () => {
    expect(resolveAudioModel("audio-pro", "starter")).toEqual(getModel("audio-pro"));
    expect(resolveTranscribeModel("transcribe-4o", "starter")).toEqual(
      getModel("transcribe-4o")
    );
  });

  it("validates allowed video durations", () => {
    const veo = getModel("video-veo")!;
    expect(validateVideoDuration(veo, 6)).toBe(6);
    expect(validateVideoDuration(veo, 5)).toEqual({ error: "invalid_duration" });
  });
});

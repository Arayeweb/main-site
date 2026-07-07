import { describe, it, expect } from "vitest";
import { videoModelFallbackChain } from "@/lib/aiModels";
import { videoFallbackModelsForPlan } from "@/lib/aiMediaCredits";
import { remainingVideoFallbackModels } from "@/lib/aiVideoJob";

describe("videoModelFallbackChain", () => {
  it("starts from seedance and escalates quality", () => {
    expect(videoModelFallbackChain("video-seedance")).toEqual([
      "video-seedance",
      "video-kling",
      "video-sora",
      "video-veo",
    ]);
  });

  it("skips cheaper models when user picked kling", () => {
    expect(videoModelFallbackChain("video-kling")).toEqual([
      "video-kling",
      "video-sora",
      "video-veo",
    ]);
  });
});

describe("videoFallbackModelsForPlan", () => {
  it("starter plan only gets seedance", () => {
    expect(videoFallbackModelsForPlan("video-seedance", "starter")).toEqual(["video-seedance"]);
  });

  it("plus plan gets seedance and kling chain", () => {
    expect(videoFallbackModelsForPlan("video-seedance", "plus")).toEqual([
      "video-seedance",
      "video-kling",
    ]);
  });

  it("remaining models exclude already-tried primary", () => {
    expect(remainingVideoFallbackModels("video-seedance", "plus")).toEqual(["video-kling"]);
    expect(remainingVideoFallbackModels("video-kling", "max")).toEqual(["video-sora", "video-veo"]);
  });
});

import { describe, it, expect } from "vitest";
import { imageModelFallbackChain } from "@/lib/aiModels";

describe("imageModelFallbackChain", () => {
  it("starts from image-lite and includes stronger models", () => {
    expect(imageModelFallbackChain("image-lite")).toEqual([
      "image-lite",
      "image-nano",
      "image-gpt",
    ]);
  });

  it("skips cheaper models when user picked image-nano", () => {
    expect(imageModelFallbackChain("image-nano")).toEqual(["image-nano", "image-gpt"]);
  });

  it("returns only image-gpt when that was selected", () => {
    expect(imageModelFallbackChain("image-gpt")).toEqual(["image-gpt"]);
  });

  it("returns unknown model alone", () => {
    expect(imageModelFallbackChain("custom-model")).toEqual(["custom-model"]);
  });
});

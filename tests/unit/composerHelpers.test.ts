import { describe, it, expect } from "vitest";
import { wrapPromptWithModes } from "@/app/ai/composerHelpers";

describe("composerHelpers", () => {
  it("returns prompt unchanged when code mode is off", () => {
    expect(wrapPromptWithModes("سلام", { codeMode: false })).toBe("سلام");
  });

  it("prepends code hint when code mode is on", () => {
    const result = wrapPromptWithModes("تابع fibonacci بنویس", { codeMode: true });
    expect(result).toContain("کد");
    expect(result).toContain("تابع fibonacci بنویس");
  });
});

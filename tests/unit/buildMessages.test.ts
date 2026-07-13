import { describe, it, expect } from "vitest";
import {
  buildMultiModelRunMessages,
  selectAssistantForTurn,
} from "@/lib/ai/client/buildMessages";

describe("selectAssistantForTurn", () => {
  it("prefers voted compare response", () => {
    const content = selectAssistantForTurn({
      prompt: "compare",
      responses: { economy: "A", premium: "B" },
      selectedVote: "premium",
      modelIds: ["economy", "premium"],
    });
    expect(content).toBe("B");
  });

  it("uses council summary when present", () => {
    const content = selectAssistantForTurn({
      prompt: "council",
      answers: { economy: "member A", premium: "member B" },
      summary: "final synthesis",
      modelIds: ["economy", "premium"],
    });
    expect(content).toBe("final synthesis");
  });

  it("falls back to first model answer", () => {
    const content = selectAssistantForTurn({
      prompt: "compare",
      responses: { economy: "horse wins", premium: "chicken wins" },
      modelIds: ["economy", "premium"],
    });
    expect(content).toBe("horse wins");
  });
});

describe("buildMultiModelRunMessages", () => {
  it("builds prior-turn history without duplicating current prompt", () => {
    const messages = buildMultiModelRunMessages([
      {
        id: "run-1",
        prompt: "اسب قوی‌تره یا مرغ",
        responses: { economy: "اسب قوی‌تر است", premium: "اسب قوی‌تر است" },
        modelIds: ["economy", "premium"],
      },
    ]);
    expect(messages).toEqual([
      { role: "user", content: "اسب قوی‌تره یا مرغ" },
      { role: "assistant", content: "اسب قوی‌تر است" },
    ]);
  });
});

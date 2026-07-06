import { describe, it, expect } from "vitest";
import {
  buildConversationHistory,
  selectAssistantContent,
  MAX_CONTEXT_TURNS,
  MAX_CONTEXT_CHARS,
} from "@/lib/ai/runs/conversationContext";
import type { SerializedRun } from "@/lib/ai/runs/types";

function run(partial: Partial<SerializedRun> & Pick<SerializedRun, "id" | "mode" | "prompt">): SerializedRun {
  return {
    status: "completed",
    models: [],
    conversationId: null,
    createdAt: "2026-07-05T10:00:00.000Z",
    completedAt: "2026-07-05T10:01:00.000Z",
    chargedCredits: 1,
    reservedCredits: 1,
    refundedCredits: 0,
    answers: [],
    critique: null,
    summary: null,
    selectedVote: null,
    shareSlug: null,
    isPublic: false,
    ...partial,
  };
}

describe("selectAssistantContent", () => {
  it("uses direct assistant output", () => {
    const content = selectAssistantContent(
      run({
        id: "1",
        mode: "direct",
        prompt: "hi",
        answers: [{ model: "economy", content: "hello", errorCode: null }],
      })
    );
    expect(content).toBe("hello");
  });

  it("uses voted compare output when available", () => {
    const content = selectAssistantContent(
      run({
        id: "2",
        mode: "compare",
        prompt: "compare",
        models: ["economy", "premium"],
        selectedVote: "premium",
        answers: [
          { model: "economy", content: "A", errorCode: null },
          { model: "premium", content: "B", errorCode: null },
        ],
      })
    );
    expect(content).toBe("B");
  });

  it("uses council synthesis when available", () => {
    const content = selectAssistantContent(
      run({
        id: "3",
        mode: "council",
        prompt: "council",
        summary: "final answer",
        critique: "short critique",
        answers: [{ model: "economy", content: "m1", errorCode: null }],
      })
    );
    expect(content).toBe("final answer");
  });
});

describe("buildConversationHistory", () => {
  it("builds ascending user/assistant pairs", () => {
    const history = buildConversationHistory([
      run({
        id: "a",
        mode: "direct",
        prompt: "first",
        createdAt: "2026-07-05T10:00:00.000Z",
        answers: [{ model: "economy", content: "one", errorCode: null }],
      }),
      run({
        id: "b",
        mode: "direct",
        prompt: "second",
        createdAt: "2026-07-05T11:00:00.000Z",
        answers: [{ model: "economy", content: "two", errorCode: null }],
      }),
    ]);
    expect(history).toEqual([
      { role: "user", content: "first" },
      { role: "assistant", content: "one" },
      { role: "user", content: "second" },
      { role: "assistant", content: "two" },
    ]);
  });

  it("caps turn count by dropping oldest", () => {
    const runs = Array.from({ length: MAX_CONTEXT_TURNS + 2 }, (_, i) =>
      run({
        id: `r${i}`,
        mode: "direct",
        prompt: `p${i}`,
        createdAt: new Date(Date.UTC(2026, 6, 5, 10, i)).toISOString(),
        answers: [{ model: "economy", content: `a${i}`, errorCode: null }],
      })
    );
    const history = buildConversationHistory(runs);
    expect(history.filter((m) => m.role === "user")).toHaveLength(MAX_CONTEXT_TURNS);
    expect(history[0]?.content).toBe("p2");
  });

  it("truncates oldest when over char budget", () => {
    const long = "x".repeat(Math.floor(MAX_CONTEXT_CHARS / 2));
    const history = buildConversationHistory([
      run({
        id: "old",
        mode: "direct",
        prompt: long,
        createdAt: "2026-07-05T10:00:00.000Z",
        answers: [{ model: "economy", content: long, errorCode: null }],
      }),
      run({
        id: "new",
        mode: "direct",
        prompt: "keep",
        createdAt: "2026-07-05T11:00:00.000Z",
        answers: [{ model: "economy", content: "kept", errorCode: null }],
      }),
    ]);
    expect(history.some((m) => m.content === "keep")).toBe(true);
    expect(history.some((m) => m.content === long)).toBe(false);
  });
});

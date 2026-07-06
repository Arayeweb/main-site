import { describe, expect, it } from "vitest";
import { buildRunHistoryItems, mergeHistoryItems } from "@/lib/aiHistory";

describe("buildRunHistoryItems", () => {
  it("groups follow-up runs under stable conversation id", () => {
    const items = buildRunHistoryItems([
      {
        id: "run-1",
        mode: "compare",
        metadata: { prompt: "اول" },
        created_at: "2026-07-06T10:00:00.000Z",
        conversation_id: "conv-a",
      },
      {
        id: "run-2",
        mode: "compare",
        metadata: { prompt: "اول" },
        created_at: "2026-07-06T10:05:00.000Z",
        conversation_id: "conv-a",
      },
    ]);

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("conv-a");
    expect(items[0].latestRunId).toBe("run-2");
    expect(items[0].tier).toBe("side_by_side");
    expect(items[0].source).toBe("run");
  });

  it("uses run id as anchor when conversation_id is missing", () => {
    const items = buildRunHistoryItems([
      {
        id: "run-solo",
        mode: "council",
        metadata: { prompt: "سلام" },
        created_at: "2026-07-06T10:00:00.000Z",
        conversation_id: null,
      },
    ]);

    expect(items[0].id).toBe("run-solo");
    expect(items[0].latestRunId).toBe("run-solo");
    expect(items[0].tier).toBe("council");
  });
});

describe("mergeHistoryItems", () => {
  it("upserts local optimistic item and keeps latestRunId", () => {
    const merged = mergeHistoryItems(
      [
        {
          id: "conv-a",
          title: "سرور",
          tier: "side_by_side",
          createdAt: "2026-07-06T09:00:00.000Z",
          source: "run",
          latestRunId: "run-1",
        },
      ],
      [
        {
          id: "conv-a",
          title: "محلی",
          tier: "side_by_side",
          createdAt: "2026-07-06T10:00:00.000Z",
          source: "run",
          latestRunId: "run-2",
        },
      ]
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].latestRunId).toBe("run-2");
    expect(merged[0].title).toBe("محلی");
  });
});

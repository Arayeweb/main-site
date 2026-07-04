import { describe, it, expect } from "vitest";
import { parseOpenRouterVideoPoll } from "@/lib/aiEngine";

const POLL_URL = "https://openrouter.ai/api/v1/videos/abc123";

describe("parseOpenRouterVideoPoll", () => {
  it("maps in_progress to processing", () => {
    const result = parseOpenRouterVideoPoll({ status: "in_progress" }, POLL_URL);
    expect(result.status).toBe("processing");
  });

  it("maps completed with unsigned_urls", () => {
    const result = parseOpenRouterVideoPoll(
      {
        status: "completed",
        unsigned_urls: ["https://openrouter.ai/api/v1/videos/abc123/content?index=0"],
        usage: { cost: 0.25 },
      },
      POLL_URL
    );
    expect(result.status).toBe("completed");
    expect(result.videoUrls?.[0]).toContain("/content");
    expect(result.costUsd).toBe(0.25);
  });

  it("builds content fallback URL when completed without urls", () => {
    const result = parseOpenRouterVideoPoll({ status: "completed" }, POLL_URL);
    expect(result.status).toBe("completed");
    expect(result.videoUrls).toEqual([
      "https://openrouter.ai/api/v1/videos/abc123/content?index=0",
    ]);
  });

  it("treats cancelled and expired as failed", () => {
    expect(parseOpenRouterVideoPoll({ status: "cancelled" }, POLL_URL).status).toBe("failed");
    expect(parseOpenRouterVideoPoll({ status: "expired", error: "timeout" }, POLL_URL).status).toBe(
      "failed"
    );
  });

  it("maps complete and usage+generation_id heuristics to completed", () => {
    expect(parseOpenRouterVideoPoll({ status: "complete" }, POLL_URL).status).toBe("completed");
    expect(
      parseOpenRouterVideoPoll(
        { status: "pending", generation_id: "gen-1", usage: { cost: 0.25 } },
        POLL_URL
      ).status
    ).toBe("completed");
    expect(
      parseOpenRouterVideoPoll({ status: "pending", unsigned_urls: ["https://x/v.mp4"] }, POLL_URL)
        .status
    ).toBe("completed");
  });
});

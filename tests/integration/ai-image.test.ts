import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestSupabase } from "../mocks/supabaseMock";
import { makeRequest, jsonBody } from "../helpers/request";
import { signAIToken, AI_COOKIE } from "@/lib/aiAuth";

const db = createTestSupabase({
  ai_users: [],
  ai_battles: [],
  ai_usage: [],
  ai_media_jobs: [],
  ai_credit_ledger: [],
});

const mockRunImageGen = vi.fn();
const mockClaimAndProcess = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => db,
}));

vi.mock("@/lib/aiEngine", () => ({
  runImageGen: (...args: unknown[]) => mockRunImageGen(...args),
}));

vi.mock("@/lib/aiImageJob", () => ({
  claimAndProcessImageJob: (...args: unknown[]) => mockClaimAndProcess(...args),
}));

import { POST } from "@/app/api/ai/image/route";
import { GET as pollGET } from "@/app/api/ai/image/[jobId]/route";

describe("integration — /api/ai/image", () => {
  beforeEach(() => {
    db.reset({
      ai_users: [{ id: "user-img", plan: "starter", credits: 10 }],
      ai_battles: [],
      ai_usage: [],
      ai_media_jobs: [],
      ai_credit_ledger: [],
    });
    mockRunImageGen.mockReset();
    mockClaimAndProcess.mockReset();
  });

  it("requires authentication", async () => {
    const res = await POST(
      makeRequest("/api/ai/image", {
        method: "POST",
        body: { prompt: "یک گربه", model: "image-lite" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("rejects empty prompt", async () => {
    const token = signAIToken("user-img", "starter");
    const res = await POST(
      makeRequest("/api/ai/image", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "  ", model: "image-lite" },
      })
    );
    const body = await jsonBody<{ error: string }>(res);
    expect(res.status).toBe(422);
    expect(body.error).toBe("missing_prompt");
  });

  it("blocks zero-credit users", async () => {
    db.tables.ai_users[0].credits = 0;
    const token = signAIToken("user-img", "starter");
    const res = await POST(
      makeRequest("/api/ai/image", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "یک گربه", model: "image-lite" },
      })
    );
    const body = await jsonBody<{ error: string; upgradeUrl: string }>(res);
    expect(res.status).toBe(402);
    expect(body.error).toBe("insufficient_credits");
    expect(body.upgradeUrl).toBe("/ai/pricing");
    expect(db.tables.ai_media_jobs).toHaveLength(0);
  });

  it("blocks premium image model on free plan", async () => {
    db.tables.ai_users[0].plan = "free";
    const token = signAIToken("user-img", "free");
    const res = await POST(
      makeRequest("/api/ai/image", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "لوگو", model: "image-gpt" },
      })
    );
    const body = await jsonBody<{ error: string }>(res);
    expect(res.status).toBe(403);
    expect(body.error).toBe("plan_upgrade_required");
  });

  it("creates pending job, deducts credits, and returns jobId", async () => {
    const token = signAIToken("user-img", "starter");
    const res = await POST(
      makeRequest("/api/ai/image", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "غروب دریا", model: "image-lite" },
      })
    );
    const body = await jsonBody<{
      ok: boolean;
      jobId: string;
      creditsRemaining: number;
      creditCost: number;
    }>(res);

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.jobId).toBeTruthy();
    expect(body.creditsRemaining).toBe(7);
    expect(body.creditCost).toBe(3);
    expect(db.tables.ai_media_jobs).toHaveLength(1);
    expect(db.tables.ai_media_jobs[0].status).toBe("pending");
    expect(db.tables.ai_media_jobs[0].kind).toBe("image");
    expect(db.tables.ai_users[0].credits).toBe(7);
    expect(mockRunImageGen).not.toHaveBeenCalled();
  });

  it("stores reference image URL on job", async () => {
    const token = signAIToken("user-img", "starter");
    const ref = "https://test.storage.example/user/ref.png";
    await POST(
      makeRequest("/api/ai/image", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: {
          prompt: "same style",
          model: "image-lite",
          referenceImageUrl: ref,
        },
      })
    );
    expect(db.tables.ai_media_jobs[0].reference_url).toBe(ref);
  });

  it("poll returns completed image when job finishes", async () => {
    db.tables.ai_media_jobs.push({
      id: "job-1",
      user_id: "user-img",
      kind: "image",
      model_id: "image-lite",
      prompt: "sunset",
      status: "pending",
      credit_cost: 3,
      output_url: null,
      battle_id: null,
      thread_id: null,
    });

    mockClaimAndProcess.mockImplementation(async () => {
      db.tables.ai_media_jobs[0] = {
        ...db.tables.ai_media_jobs[0],
        status: "completed",
        output_url: "https://cdn.example.com/generated.png",
        battle_id: "battle-1",
        thread_id: "battle-1",
      };
      return "done";
    });

    const token = signAIToken("user-img", "starter");
    const res = await pollGET(
      makeRequest("/api/ai/image/job-1", {
        cookies: { [AI_COOKIE]: token },
      }),
      { params: { jobId: "job-1" } }
    );
    const body = await jsonBody<{
      ok: boolean;
      status: string;
      imageUrl: string;
      isNewThread: boolean;
    }>(res);

    expect(res.status).toBe(200);
    expect(body.status).toBe("completed");
    expect(body.imageUrl).toContain("generated.png");
    expect(body.isNewThread).toBe(true);
  });

  it("poll returns processing while job is busy", async () => {
    db.tables.ai_media_jobs.push({
      id: "job-2",
      user_id: "user-img",
      kind: "image",
      model_id: "image-lite",
      prompt: "cat",
      status: "processing",
      credit_cost: 3,
    });

    mockClaimAndProcess.mockResolvedValue("busy");

    const token = signAIToken("user-img", "starter");
    const res = await pollGET(
      makeRequest("/api/ai/image/job-2", {
        cookies: { [AI_COOKIE]: token },
      }),
      { params: { jobId: "job-2" } }
    );
    const body = await jsonBody<{ status: string }>(res);
    expect(body.status).toBe("processing");
  });
});

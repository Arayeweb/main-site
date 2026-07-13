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
const mockPrepareRunAndReserveCredits = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => db,
}));

vi.mock("@/lib/aiEngine", () => ({
  runImageGen: (...args: unknown[]) => mockRunImageGen(...args),
}));

vi.mock("@/lib/aiImageJob", () => ({
  claimAndProcessImageJob: (...args: unknown[]) => mockClaimAndProcess(...args),
}));

vi.mock("@/lib/billing/credits", () => ({
  prepareRunAndReserveCredits: (...args: unknown[]) =>
    mockPrepareRunAndReserveCredits(...args),
  refundCredits: vi.fn().mockResolvedValue({ ok: true, balance: 0 }),
}));

import { POST } from "@/app/api/ai/image/route";
import { GET as pollGET } from "@/app/api/ai/image/[jobId]/route";

describe("integration — /api/ai/image", () => {
  beforeEach(() => {
    db.reset({
      ai_users: [{ id: "user-img", plan: "starter", credits: 20 }],
      ai_battles: [],
      ai_usage: [],
      ai_media_jobs: [],
      ai_credit_ledger: [],
    });
    mockRunImageGen.mockReset();
    mockClaimAndProcess.mockReset();
    mockPrepareRunAndReserveCredits.mockImplementation(
      async (input: { userId: string; runId: string; reservedCredits: number }) => {
        const user = db.tables.ai_users.find((row) => row.id === input.userId);
        if (!user || Number(user.credits) < input.reservedCredits) {
          return { ok: false, error: "insufficient_credits" };
        }
        user.credits = Number(user.credits) - input.reservedCredits;
        return {
          ok: true,
          runId: input.runId,
          conversationId: input.runId,
          plan: user.plan,
          creditsRemaining: user.credits,
        };
      }
    );
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
    expect(body.creditsRemaining).toBe(0);
    expect(body.creditCost).toBe(20);
    expect(db.tables.ai_media_jobs).toHaveLength(1);
    expect(db.tables.ai_media_jobs[0].status).toBe("pending");
    expect(db.tables.ai_media_jobs[0].kind).toBe("image");
    expect(db.tables.ai_users[0].credits).toBe(0);
    expect(mockRunImageGen).not.toHaveBeenCalled();
  });

  it("stores reference image URL on job", async () => {
    const token = signAIToken("user-img", "starter");
    const ref = "https://test-project.supabase.co/storage/v1/object/public/ai-uploads/user-img/ref.png";
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

  it("rejects another user's reference image URL", async () => {
    const token = signAIToken("user-img", "starter");
    const res = await POST(
      makeRequest("/api/ai/image", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: {
          prompt: "same style",
          model: "image-lite",
          referenceImageUrl:
            "https://test-project.supabase.co/storage/v1/object/public/ai-uploads/other-user/ref.png",
        },
      })
    );
    expect(res.status).toBe(422);
    expect(db.tables.ai_media_jobs).toHaveLength(0);
  });

  it("poll returns completed image when job finishes", async () => {
    db.tables.ai_media_jobs.push({
      id: "job-1",
      user_id: "user-img",
      kind: "image",
      model_id: "image-lite",
      prompt: "sunset",
      status: "pending",
      credit_cost: 10,
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
      credit_cost: 10,
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

  it("image generation does not double-deduct across separate jobs", async () => {
    db.tables.ai_users[0].credits = 40;
    const token = signAIToken("user-img", "starter");
    await POST(
      makeRequest("/api/ai/image", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "first", model: "image-lite" },
      })
    );
    await POST(
      makeRequest("/api/ai/image", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "second", model: "image-lite" },
      })
    );
    const totalJobCost = db.tables.ai_media_jobs.reduce(
      (sum, j) => sum + (j.credit_cost as number),
      0
    );
    expect(db.tables.ai_media_jobs).toHaveLength(2);
    expect(40 - (db.tables.ai_users[0].credits as number)).toBe(totalJobCost);
  });

  it("allows only one concurrent job when the wallet covers one image", async () => {
    db.tables.ai_users[0].credits = 20;
    const token = signAIToken("user-img", "starter");
    const request = (prompt: string) =>
      POST(
        makeRequest("/api/ai/image", {
          method: "POST",
          cookies: { [AI_COOKIE]: token },
          body: { prompt, model: "image-lite" },
        })
      );

    const responses = await Promise.all([request("first"), request("second")]);
    expect(responses.map((res) => res.status).sort()).toEqual([200, 402]);
    expect(db.tables.ai_media_jobs).toHaveLength(1);
    expect(db.tables.ai_users[0].credits).toBe(0);
  });

  it("failed image generation refunds credits via claimAndProcess", async () => {
    const token = signAIToken("user-img", "starter");
    const createRes = await POST(
      makeRequest("/api/ai/image", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "fail me", model: "image-lite" },
      })
    );
    const { jobId } = await jsonBody<{ jobId: string }>(createRes);
    expect(db.tables.ai_users[0].credits).toBe(0);

    mockClaimAndProcess.mockImplementation(async () => {
      const user = db.tables.ai_users[0];
      user.credits = (user.credits as number) + 20;
      db.tables.ai_credit_ledger.push({
        user_id: "user-img",
        delta: 20,
        balance_after: user.credits,
        reason: "image_refund",
        note: `Refund for failed image job ${jobId}`,
      });
      db.tables.ai_media_jobs[0].status = "failed";
      return "failed";
    });

    await pollGET(
      makeRequest(`/api/ai/image/${jobId}`, {
        cookies: { [AI_COOKIE]: token },
      }),
      { params: { jobId } }
    );

    expect(db.tables.ai_users[0].credits).toBe(20);
    expect(db.tables.ai_credit_ledger.some((e) => e.reason === "image_refund")).toBe(true);
  });
});

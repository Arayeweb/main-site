import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createTestSupabase } from "../mocks/supabaseMock";
import { makeRequest, jsonBody } from "../helpers/request";
import { signAIToken, AI_COOKIE } from "@/lib/aiAuth";

const db = createTestSupabase({
  ai_users: [],
  ai_media_jobs: [],
  ai_battles: [],
  ai_usage: [],
  ai_credit_ledger: [],
});

const mockSubmitVideoJobWithFallback = vi.fn();
const mockPollVideoJob = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => db,
}));

vi.mock("@/lib/aiEngine", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/aiEngine")>();
  return {
    ...actual,
    submitVideoJobWithFallback: (...args: unknown[]) =>
      mockSubmitVideoJobWithFallback(...args),
    pollVideoJob: (...args: unknown[]) => mockPollVideoJob(...args),
  };
});

import { POST } from "@/app/api/ai/video/route";
import { GET as GET_VIDEO_JOB } from "@/app/api/ai/video/[jobId]/route";
import { GET as GET_VIDEO_JOBS } from "@/app/api/ai/video/jobs/route";
import { GET as GET_VIDEO_CONTENT } from "@/app/api/ai/video/[jobId]/content/route";
import { POST as DISMISS_VIDEO_JOB } from "@/app/api/ai/video/[jobId]/dismiss/route";

describe("integration — /api/ai/video", () => {
  beforeEach(() => {
    process.env.PUBLIC_VIDEO_GENERATION_ENABLED = "true";
    db.reset({
      ai_users: [{ id: "user-vid", plan: "starter", credits: 100 }],
      ai_media_jobs: [],
      ai_battles: [],
      ai_usage: [],
      ai_credit_ledger: [],
    });
    mockSubmitVideoJobWithFallback.mockReset();
    mockSubmitVideoJobWithFallback.mockResolvedValue({
      jobId: "or-job-1",
      pollingUrl: "https://openrouter.ai/api/v1/videos/or-job-1",
      modelId: "video-seedance",
    });
    mockPollVideoJob.mockReset();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        arrayBuffer: async () => Buffer.from("fake-mp4").buffer,
      }))
    );
  });

  afterEach(() => {
    delete process.env.PUBLIC_VIDEO_GENERATION_ENABLED;
    vi.unstubAllGlobals();
  });

  it("blocks indirect provider polling while public video generation is disabled", async () => {
    delete process.env.PUBLIC_VIDEO_GENERATION_ENABLED;
    const jobId = "job-disabled-poll";
    db.tables.ai_media_jobs.push({
      id: jobId,
      user_id: "user-vid",
      kind: "video",
      model_id: "video-seedance",
      prompt: "test",
      status: "processing",
      polling_url: "https://openrouter.ai/poll/disabled",
      credit_cost: 60,
    });

    const token = signAIToken("user-vid", "starter");
    const res = await GET_VIDEO_JOB(
      makeRequest(`/api/ai/video/${jobId}`, {
        cookies: { [AI_COOKIE]: token },
      }),
      { params: { jobId } }
    );

    expect(res.status).toBe(503);
    expect(mockPollVideoJob).not.toHaveBeenCalled();
  });

  it("keeps public video generation disabled", async () => {
    const res = await POST(
      makeRequest("/api/ai/video", {
        method: "POST",
        body: { prompt: "غروب", model: "video-seedance" },
      })
    );
    const body = await jsonBody<{ error: string }>(res);
    expect(res.status).toBe(503);
    expect(body.error).toBe("feature_disabled");
  });

  it("rejects empty prompt through disabled gate", async () => {
    const token = signAIToken("user-vid", "starter");
    const res = await POST(
      makeRequest("/api/ai/video", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "  ", model: "video-seedance" },
      })
    );
    const body = await jsonBody<{ error: string }>(res);
    expect(res.status).toBe(503);
    expect(body.error).toBe("feature_disabled");
  });

  it("does not submit provider jobs while disabled", async () => {
    db.tables.ai_users[0].credits = 5;
    const token = signAIToken("user-vid", "starter");
    const res = await POST(
      makeRequest("/api/ai/video", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "کویر", model: "video-seedance", duration: 5 },
      })
    );
    const body = await jsonBody<{ error: string }>(res);
    expect(res.status).toBe(503);
    expect(body.error).toBe("feature_disabled");
    expect(mockSubmitVideoJobWithFallback).not.toHaveBeenCalled();
  });

  it("keeps premium Sora disabled publicly", async () => {
    const token = signAIToken("user-vid", "starter");
    const res = await POST(
      makeRequest("/api/ai/video", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "شهر", model: "video-sora", duration: 5 },
      })
    );
    const body = await jsonBody<{ error: string }>(res);
    expect(res.status).toBe(503);
    expect(body.error).toBe("feature_disabled");
  });

  it("keeps invalid-duration requests behind disabled gate", async () => {
    const token = signAIToken("user-vid", "starter");
    const res = await POST(
      makeRequest("/api/ai/video", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "دریا", model: "video-veo", duration: 5 },
      })
    );
    const body = await jsonBody<{ error: string }>(res);
    expect(res.status).toBe(503);
    expect(body.error).toBe("feature_disabled");
  });

  it("does not create new media jobs while disabled", async () => {
    const token = signAIToken("user-vid", "starter");
    const res = await POST(
      makeRequest("/api/ai/video", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "غروب کویر", model: "video-seedance", duration: 5 },
      })
    );
    const body = await jsonBody<{
      error: string;
    }>(res);

    expect(res.status).toBe(503);
    expect(body.error).toBe("feature_disabled");
    expect(db.tables.ai_media_jobs).toHaveLength(0);
    expect(db.tables.ai_users[0].credits).toBe(100);
    expect(mockSubmitVideoJobWithFallback).not.toHaveBeenCalled();
  });

  it("poll returns processing while job is in flight", async () => {
    const jobId = "job-processing-1";
    db.tables.ai_media_jobs.push({
      id: jobId,
      user_id: "user-vid",
      kind: "video",
      model_id: "video-seedance",
      prompt: "test",
      status: "processing",
      polling_url: "https://openrouter.ai/poll/1",
      credit_cost: 60,
    });
    mockPollVideoJob.mockResolvedValue({ status: "processing", progress: 40 });

    const token = signAIToken("user-vid", "starter");
    const res = await GET_VIDEO_JOB(
      makeRequest(`/api/ai/video/${jobId}`, {
        cookies: { [AI_COOKIE]: token },
      }),
      { params: { jobId } }
    );
    const body = await jsonBody<{ ok: boolean; status: string; progress?: number }>(res);

    expect(res.status).toBe(200);
    expect(body.status).toBe("processing");
    expect(body.progress).toBe(40);
    expect(db.tables.ai_battles).toHaveLength(0);
  });

  it("poll completes job, uploads video, and creates battle row", async () => {
    const jobId = "job-complete-1";
    db.tables.ai_media_jobs.push({
      id: jobId,
      user_id: "user-vid",
      kind: "video",
      model_id: "video-seedance",
      prompt: "کوهستان",
      status: "processing",
      polling_url: "https://openrouter.ai/poll/2",
      credit_cost: 60,
    });
    mockPollVideoJob.mockResolvedValue({
      status: "completed",
      videoUrls: ["https://cdn.example.com/out.mp4"],
      costUsd: 0.12,
    });

    const token = signAIToken("user-vid", "starter");
    const res = await GET_VIDEO_JOB(
      makeRequest(`/api/ai/video/${jobId}`, {
        cookies: { [AI_COOKIE]: token },
      }),
      { params: { jobId } }
    );
    const body = await jsonBody<{
      ok: boolean;
      status: string;
      videoUrl: string;
      battleId: string;
    }>(res);

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.status).toBe("completed");
    expect(body.videoUrl).toBe("/api/ai/video/job-complete-1/content");
    expect(db.tables.ai_battles).toHaveLength(1);
    expect(db.tables.ai_battles[0].tier).toBe("video_gen");
    expect(db.tables.ai_usage).toHaveLength(1);
    expect(db.tables.ai_media_jobs[0].status).toBe("completed");
  });

  it("poll failure refunds credits", async () => {
    db.tables.ai_users[0].credits = 40;
    const jobId = "job-fail-1";
    db.tables.ai_media_jobs.push({
      id: jobId,
      user_id: "user-vid",
      kind: "video",
      model_id: "video-seedance",
      prompt: "fail",
      status: "processing",
      polling_url: "https://openrouter.ai/poll/3",
      credit_cost: 60,
    });
    mockPollVideoJob.mockResolvedValue({
      status: "failed",
      error: "provider_error",
    });

    const token = signAIToken("user-vid", "starter");
    const res = await GET_VIDEO_JOB(
      makeRequest(`/api/ai/video/${jobId}`, {
        cookies: { [AI_COOKIE]: token },
      }),
      { params: { jobId } }
    );
    const body = await jsonBody<{ status: string; error: string }>(res);

    expect(res.status).toBe(200);
    expect(body.status).toBe("failed");
    expect(db.tables.ai_users[0].credits).toBe(100);
    expect(db.tables.ai_credit_ledger).toHaveLength(1);
    expect(db.tables.ai_credit_ledger[0].delta).toBe(60);
  });

  it("second poll on completed job does not duplicate battle", async () => {
    const jobId = "job-idempotent-1";
    db.tables.ai_media_jobs.push({
      id: jobId,
      user_id: "user-vid",
      kind: "video",
      model_id: "video-seedance",
      prompt: "idempotent",
      status: "processing",
      polling_url: "https://openrouter.ai/api/v1/videos/or-1",
      credit_cost: 60,
    });
    mockPollVideoJob.mockResolvedValue({
      status: "completed",
      videoUrls: ["https://openrouter.ai/api/v1/videos/or-1/content?index=0"],
      costUsd: 0.1,
    });

    const token = signAIToken("user-vid", "starter");
    const req = makeRequest(`/api/ai/video/${jobId}`, {
      cookies: { [AI_COOKIE]: token },
    });
    const params = { params: { jobId } };

    const first = await GET_VIDEO_JOB(req, params);
    expect(first.status).toBe(200);
    expect(db.tables.ai_battles).toHaveLength(1);

    const second = await GET_VIDEO_JOB(req, params);
    const body = await jsonBody<{ status: string; battleId: string }>(second);
    expect(second.status).toBe(200);
    expect(body.status).toBe("completed");
    expect(db.tables.ai_battles).toHaveLength(1);
  });

  it("lists pending jobs without thread filter", async () => {
    db.tables.ai_media_jobs.push(
      {
        id: "job-a",
        user_id: "user-vid",
        kind: "video",
        model_id: "video-seedance",
        prompt: "a",
        status: "processing",
        thread_id: null,
      },
      {
        id: "job-b",
        user_id: "user-vid",
        kind: "video",
        model_id: "video-seedance",
        prompt: "b",
        status: "processing",
        thread_id: "thread-1",
      }
    );

    const token = signAIToken("user-vid", "starter");
    const res = await GET_VIDEO_JOBS(
      makeRequest("/api/ai/video/jobs", { cookies: { [AI_COOKIE]: token } })
    );
    const body = await jsonBody<{ ok: boolean; jobs: Array<{ id: string }> }>(res);

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.jobs.map((j) => j.id)).toEqual(["job-a"]);
  });

  it("dismiss hides job from resume list after refresh", async () => {
    db.tables.ai_media_jobs.push({
      id: "job-dismiss-1",
      user_id: "user-vid",
      kind: "video",
      model_id: "video-seedance",
      prompt: "dismiss me",
      status: "processing",
      thread_id: null,
    });

    const token = signAIToken("user-vid", "starter");
    const dismissRes = await DISMISS_VIDEO_JOB(
      makeRequest(`/api/ai/video/job-dismiss-1/dismiss`, {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
      }),
      { params: { jobId: "job-dismiss-1" } }
    );
    expect(dismissRes.status).toBe(200);

    const listRes = await GET_VIDEO_JOBS(
      makeRequest("/api/ai/video/jobs", { cookies: { [AI_COOKIE]: token } })
    );
    const body = await jsonBody<{ ok: boolean; jobs: Array<{ id: string }> }>(listRes);
    expect(body.jobs.some((j) => j.id === "job-dismiss-1")).toBe(false);
    expect(db.tables.ai_media_jobs[0].error).toBe("dismissed_by_user");
  });

  it("content route rejects processing jobs", async () => {
    const jobId = "job-not-ready";
    db.tables.ai_media_jobs.push({
      id: jobId,
      user_id: "user-vid",
      kind: "video",
      status: "processing",
      polling_url: "https://openrouter.ai/api/v1/videos/or-2",
      openrouter_job_id: "or-2",
    });

    const token = signAIToken("user-vid", "starter");
    const res = await GET_VIDEO_CONTENT(
      makeRequest(`/api/ai/video/${jobId}/content`, { cookies: { [AI_COOKIE]: token } }),
      { params: { jobId } }
    );
    const body = await jsonBody<{ error: string }>(res);

    expect(res.status).toBe(404);
    expect(body.error).toBe("not_ready");
  });
});

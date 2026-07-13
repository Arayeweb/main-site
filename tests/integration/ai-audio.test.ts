import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestSupabase } from "../mocks/supabaseMock";
import { makeRequest, makeFormRequest, jsonBody } from "../helpers/request";
import { signAIToken, AI_COOKIE } from "@/lib/aiAuth";

const db = createTestSupabase({
  ai_users: [],
  ai_battles: [],
  ai_usage: [],
});

const mockRunAudioSpeech = vi.fn();
const mockRunTranscribe = vi.fn();

vi.mock("@/lib/ai/mediaBilling", () => ({
  reserveMediaCredits: async (input: {
    userId: string;
    runId: string;
    reservedCredits: number;
  }) => {
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
  },
  failMediaReservation: async (input: {
    userId: string;
    reservedCredits: number;
  }) => {
    const user = db.tables.ai_users.find((row) => row.id === input.userId);
    if (user) user.credits = Number(user.credits) + input.reservedCredits;
  },
  settleMediaCredits: async (input: {
    userId: string;
    reservedCredits: number;
    actualCredits: number;
  }) => {
    if (input.actualCredits > input.reservedCredits) return { ok: false };
    const user = db.tables.ai_users.find((row) => row.id === input.userId);
    if (!user) return { ok: false };
    user.credits = Number(user.credits) + input.reservedCredits - input.actualCredits;
    return { ok: true, creditsRemaining: user.credits };
  },
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => db,
}));

vi.mock("@/lib/aiEngine", () => ({
  runAudioSpeech: (...args: unknown[]) => mockRunAudioSpeech(...args),
  runTranscribe: (...args: unknown[]) => mockRunTranscribe(...args),
}));

import { POST as POST_AUDIO } from "@/app/api/ai/audio/route";
import { POST as POST_TRANSCRIBE } from "@/app/api/ai/transcribe/route";

describe("integration — /api/ai/audio", () => {
  beforeEach(() => {
    db.reset({
      ai_users: [{ id: "user-aud", plan: "starter", credits: 20 }],
      ai_battles: [],
      ai_usage: [],
    });
    mockRunAudioSpeech.mockReset();
    mockRunAudioSpeech.mockResolvedValue({
      audioBuffer: Buffer.from("fake-mp3").buffer,
      mime: "audio/mpeg",
      tokensUsed: 50,
      costUsd: 0.004,
    });
    mockRunTranscribe.mockReset();
    mockRunTranscribe.mockResolvedValue({
      text: "سلام این یک متن رونویسی شده است.",
      tokensUsed: 30,
      costUsd: 0.002,
    });
  });

  it("requires authentication for TTS", async () => {
    const res = await POST_AUDIO(
      makeRequest("/api/ai/audio", {
        method: "POST",
        body: { text: "سلام", model: "audio-mini" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("rejects empty TTS text", async () => {
    const token = signAIToken("user-aud", "starter");
    const res = await POST_AUDIO(
      makeRequest("/api/ai/audio", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { text: "  ", model: "audio-mini" },
      })
    );
    const body = await jsonBody<{ error: string }>(res);
    expect(res.status).toBe(422);
    expect(body.error).toBe("missing_text");
  });

  it("blocks premium audio model on free plan", async () => {
    db.tables.ai_users[0].plan = "free";
    const token = signAIToken("user-aud", "free");
    const res = await POST_AUDIO(
      makeRequest("/api/ai/audio", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { text: "سلام دنیا", model: "audio-pro" },
      })
    );
    const body = await jsonBody<{ error: string }>(res);
    expect(res.status).toBe(403);
    expect(body.error).toBe("plan_upgrade_required");
  });

  it("generates speech, deducts credits, and persists battle", async () => {
    const token = signAIToken("user-aud", "starter");
    const res = await POST_AUDIO(
      makeRequest("/api/ai/audio", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { text: "سلام از آرایه", model: "audio-mini" },
      })
    );
    const body = await jsonBody<{
      ok: boolean;
      audioUrl: string;
      creditsRemaining: number;
    }>(res);

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.audioUrl).toContain("test.storage.example");
    expect(body.creditsRemaining).toBe(18);
    expect(db.tables.ai_battles).toHaveLength(1);
    expect(db.tables.ai_battles[0].tier).toBe("audio_gen");
    expect(db.tables.ai_usage[0].mode).toBe("audio_gen");
    expect(mockRunAudioSpeech).toHaveBeenCalledWith(
      "سلام از آرایه",
      "audio-mini",
      "alloy"
    );
  });

  it("returns 502 when TTS generation fails", async () => {
    mockRunAudioSpeech.mockRejectedValue(new Error("OpenRouter audio error"));
    const token = signAIToken("user-aud", "starter");
    const res = await POST_AUDIO(
      makeRequest("/api/ai/audio", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { text: "fail", model: "audio-mini" },
      })
    );
    const body = await jsonBody<{ error: string }>(res);
    expect(res.status).toBe(502);
    expect(body.error).toBe("ai_error");
    expect(db.tables.ai_users[0].credits).toBe(20);
  });
});

describe("integration — /api/ai/transcribe", () => {
  beforeEach(() => {
    db.reset({
      ai_users: [{ id: "user-aud", plan: "starter", credits: 20 }],
      ai_battles: [],
      ai_usage: [],
    });
    mockRunTranscribe.mockReset();
    mockRunTranscribe.mockResolvedValue({
      text: "متن رونویسی شده",
      tokensUsed: 40,
      costUsd: 0.003,
    });
  });

  it("requires authentication", async () => {
    const form = new FormData();
    form.append("file", new File([Buffer.from("audio")], "clip.mp3", { type: "audio/mpeg" }));
    const res = await POST_TRANSCRIBE(
      makeFormRequest("/api/ai/transcribe", { form })
    );
    expect(res.status).toBe(401);
  });

  it("rejects missing file", async () => {
    const token = signAIToken("user-aud", "starter");
    const form = new FormData();
    form.append("model", "transcribe-4o");
    const res = await POST_TRANSCRIBE(
      makeFormRequest("/api/ai/transcribe", {
        form,
        cookies: { [AI_COOKIE]: token },
      })
    );
    const body = await jsonBody<{ error: string }>(res);
    expect(res.status).toBe(422);
    expect(body.error).toBe("missing_file");
  });

  it("transcribes audio, deducts credits, and stores transcript", async () => {
    const token = signAIToken("user-aud", "starter");
    const form = new FormData();
    form.append(
      "file",
      new File([Buffer.from("fake-audio-bytes")], "meeting.mp3", { type: "audio/mpeg" })
    );
    form.append("model", "transcribe-4o");
    form.append("durationSec", "45");

    const res = await POST_TRANSCRIBE(
      makeFormRequest("/api/ai/transcribe", {
        form,
        cookies: { [AI_COOKIE]: token },
      })
    );
    const body = await jsonBody<{
      ok: boolean;
      text: string;
      creditsRemaining: number;
    }>(res);

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.text).toBe("متن رونویسی شده");
    expect(body.creditsRemaining).toBe(18);
    expect(db.tables.ai_battles).toHaveLength(1);
    expect(db.tables.ai_battles[0].tier).toBe("transcribe");
    expect(db.tables.ai_usage[0].mode).toBe("transcribe");
    expect(mockRunTranscribe).toHaveBeenCalled();
  });

  it("blocks transcribe when credits insufficient", async () => {
    db.tables.ai_users[0].credits = 1;
    const token = signAIToken("user-aud", "starter");
    const form = new FormData();
    form.append(
      "file",
      new File([Buffer.from("x".repeat(500_000))], "long.mp3", { type: "audio/mpeg" })
    );
    form.append("model", "transcribe-4o");

    const res = await POST_TRANSCRIBE(
      makeFormRequest("/api/ai/transcribe", {
        form,
        cookies: { [AI_COOKIE]: token },
      })
    );
    const body = await jsonBody<{ error: string }>(res);
    expect(res.status).toBe(402);
    expect(body.error).toBe("insufficient_credits");
    expect(mockRunTranscribe).not.toHaveBeenCalled();
  });
});

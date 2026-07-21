import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createTestSupabase } from "../mocks/supabaseMock";
import {
  AI_OTP_E2E_CODE,
  AI_OTP_MAX_ATTEMPTS,
  AI_OTP_RESEND_COOLDOWN_MS,
  consumeAiOtp,
  createAndSendAiOtp,
  hashAiOtpCode,
  resolveStoredOtpPurpose,
} from "@/lib/aiOtp";

const SECRET = "test-secret-at-least-16";

describe("aiOtp createAndSend / consume", () => {
  const db = createTestSupabase({ ai_otp_challenges: [] });

  beforeEach(() => {
    vi.stubEnv("ADMIN_SESSION_SECRET", SECRET);
    vi.stubEnv("E2E_MODE", "1");
    vi.stubEnv("KAVENEGAR_API_KEY", "");
    db.reset({ ai_otp_challenges: [] });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("maps auth purpose for storage", () => {
    expect(resolveStoredOtpPurpose("auth", true)).toBe("login");
    expect(resolveStoredOtpPurpose("auth", false)).toBe("register");
    expect(resolveStoredOtpPurpose("reset", true)).toBe("reset");
  });

  it("creates challenge and returns e2e debug code", async () => {
    const result = await createAndSendAiOtp(db as unknown as SupabaseClient, {
      phone: "09123456789",
      purpose: "register",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.debugCode).toBe(AI_OTP_E2E_CODE);
    expect(result.resendAfterSec).toBe(Math.ceil(AI_OTP_RESEND_COOLDOWN_MS / 1000));
    expect(db.tables.ai_otp_challenges).toHaveLength(1);
    expect(db.tables.ai_otp_challenges[0]?.purpose).toBe("register");
    expect(db.tables.ai_otp_challenges[0]?.code_hash).toBe(
      hashAiOtpCode("09123456789", "register", AI_OTP_E2E_CODE)
    );
  });

  it("enforces 2-minute resend cooldown", async () => {
    const first = await createAndSendAiOtp(db as unknown as SupabaseClient, {
      phone: "09120000001",
      purpose: "login",
    });
    expect(first.ok).toBe(true);

    const second = await createAndSendAiOtp(db as unknown as SupabaseClient, {
      phone: "09120000001",
      purpose: "login",
    });
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.error).toBe("otp_cooldown");
    expect(second.retryAfterSec).toBeGreaterThan(0);
  });

  it("consumes a valid otp once", async () => {
    await createAndSendAiOtp(db as unknown as SupabaseClient, {
      phone: "09121112233",
      purpose: "login",
    });

    const ok = await consumeAiOtp(db as unknown as SupabaseClient, {
      phone: "09121112233",
      purpose: "login",
      code: AI_OTP_E2E_CODE,
    });
    expect(ok).toEqual({ ok: true, challengeId: expect.any(String) });
    expect(db.tables.ai_otp_challenges[0]?.consumed_at).toBeTruthy();

    const again = await consumeAiOtp(db as unknown as SupabaseClient, {
      phone: "09121112233",
      purpose: "login",
      code: AI_OTP_E2E_CODE,
    });
    expect(again).toEqual({ ok: false, error: "otp_not_found" });
  });

  it("rejects wrong code and locks after max attempts", async () => {
    await createAndSendAiOtp(db as unknown as SupabaseClient, {
      phone: "09124445566",
      purpose: "register",
    });

    for (let i = 0; i < AI_OTP_MAX_ATTEMPTS; i++) {
      const bad = await consumeAiOtp(db as unknown as SupabaseClient, {
        phone: "09124445566",
        purpose: "register",
        code: "00000",
      });
      expect(bad).toEqual({ ok: false, error: "invalid_otp" });
    }

    const locked = await consumeAiOtp(db as unknown as SupabaseClient, {
      phone: "09124445566",
      purpose: "register",
      code: AI_OTP_E2E_CODE,
    });
    expect(locked).toEqual({ ok: false, error: "otp_locked" });
    expect(db.tables.ai_otp_challenges[0]?.attempts).toBe(AI_OTP_MAX_ATTEMPTS);
  });

  it("rejects expired challenge", async () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    db.reset({
      ai_otp_challenges: [
        {
          id: "old",
          phone: "09129998877",
          purpose: "login",
          code_hash: hashAiOtpCode("09129998877", "login", AI_OTP_E2E_CODE),
          attempts: 0,
          expires_at: past,
          consumed_at: null,
          created_at: past,
        },
      ],
    });

    const result = await consumeAiOtp(db as unknown as SupabaseClient, {
      phone: "09129998877",
      purpose: "login",
      code: AI_OTP_E2E_CODE,
    });
    expect(result).toEqual({ ok: false, error: "otp_expired" });
  });
});

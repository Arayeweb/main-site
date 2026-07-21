import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestSupabase } from "../mocks/supabaseMock";
import { makeRequest, jsonBody } from "../helpers/request";
import { AI_COOKIE } from "@/lib/aiAuth";
import { AI_OTP_E2E_CODE } from "@/lib/aiOtp";

process.env.ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || "test-secret-at-least-16-chars";
process.env.E2E_MODE = "1";
delete process.env.KAVENEGAR_API_KEY;

const db = createTestSupabase({
  ai_users: [],
  ai_otp_challenges: [],
  ai_referral_codes: [],
  ai_credit_lots: [],
  ai_credit_ledger: [],
  ai_device_sessions: [],
});

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => db,
}));

vi.mock("@/lib/kavenegar", () => ({
  getKavenegarApiKey: () => null,
  getKavenegarOtpTemplate: () => "otp1",
  sendKavenegarLookup: vi.fn(async () => ({ ok: true })),
}));

import { POST as sendOtp } from "@/app/api/ai/auth/otp/send/route";
import { POST as verifyOtp } from "@/app/api/ai/auth/otp/verify/route";

let ipSeq = 0;
function nextIp() {
  ipSeq += 1;
  return `203.0.113.${ipSeq % 250}`;
}

function emptyDb(extra: Record<string, unknown[]> = {}) {
  db.reset({
    ai_users: [],
    ai_otp_challenges: [],
    ai_referral_codes: [],
    ai_credit_lots: [],
    ai_credit_ledger: [],
    ai_device_sessions: [],
    ...extra,
  });
}

function otpRequest(
  path: string,
  body: Record<string, unknown>,
  ip = nextIp()
) {
  return makeRequest(path, {
    method: "POST",
    body,
    headers: { "x-forwarded-for": ip },
  });
}

describe("integration — /api/ai/auth/otp", () => {
  beforeEach(() => {
    emptyDb();
  });

  it("send auth for new phone stores purpose=register", async () => {
    const res = await sendOtp(
      otpRequest("/api/ai/auth/otp/send", {
        phone: "09123456789",
        purpose: "auth",
      })
    );
    const body = await jsonBody<{
      ok: boolean;
      debugCode?: string;
      resendAfterSec?: number;
    }>(res);

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.debugCode).toBe(AI_OTP_E2E_CODE);
    expect(body.resendAfterSec).toBe(120);
    expect(db.tables.ai_otp_challenges).toHaveLength(1);
    expect(db.tables.ai_otp_challenges[0]?.purpose).toBe("register");
  });

  it("send auth for existing phone stores purpose=login", async () => {
    emptyDb({
      ai_users: [
        {
          id: "u1",
          phone: "09121111111",
          password_hash: "x",
          plan: "free",
          credits: 10,
        },
      ],
    });

    const res = await sendOtp(
      otpRequest("/api/ai/auth/otp/send", {
        phone: "09121111111",
        purpose: "auth",
      })
    );
    const body = await jsonBody<{ ok: boolean }>(res);
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(db.tables.ai_otp_challenges[0]?.purpose).toBe("login");
  });

  it("rejects login otp send for unknown phone", async () => {
    const res = await sendOtp(
      otpRequest("/api/ai/auth/otp/send", {
        phone: "09120000000",
        purpose: "login",
      })
    );
    const body = await jsonBody<{ error: string }>(res);
    expect(res.status).toBe(404);
    expect(body.error).toBe("phone_not_found");
  });

  it("verify auth registers new user and sets cookie", async () => {
    const ip = nextIp();
    await sendOtp(
      otpRequest(
        "/api/ai/auth/otp/send",
        { phone: "09123334455", purpose: "auth" },
        ip
      )
    );

    const res = await verifyOtp(
      otpRequest(
        "/api/ai/auth/otp/verify",
        {
          phone: "09123334455",
          purpose: "auth",
          code: AI_OTP_E2E_CODE,
        },
        ip
      )
    );
    const body = await jsonBody<{
      ok: boolean;
      isNewUser?: boolean;
      user?: { id: string };
    }>(res);

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.isNewUser).toBe(true);
    expect(body.user?.id).toBeTruthy();
    expect(res.cookies.get(AI_COOKIE)?.value).toBeTruthy();
    expect(db.tables.ai_users).toHaveLength(1);
    expect(db.tables.ai_users[0]?.phone).toBe("09123334455");
  });

  it("verify auth logs in existing user", async () => {
    emptyDb({
      ai_users: [
        {
          id: "existing-user",
          phone: "09125556677",
          password_hash: "x",
          plan: "starter",
          credits: 20,
        },
      ],
    });

    const ip = nextIp();
    await sendOtp(
      otpRequest(
        "/api/ai/auth/otp/send",
        { phone: "09125556677", purpose: "auth" },
        ip
      )
    );

    const res = await verifyOtp(
      otpRequest(
        "/api/ai/auth/otp/verify",
        {
          phone: "09125556677",
          purpose: "auth",
          code: AI_OTP_E2E_CODE,
        },
        ip
      )
    );
    const body = await jsonBody<{
      ok: boolean;
      isNewUser?: boolean;
      user?: { id: string; plan: string };
    }>(res);

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.isNewUser).toBe(false);
    expect(body.user?.id).toBe("existing-user");
    expect(body.user?.plan).toBe("starter");
    expect(res.cookies.get(AI_COOKIE)?.value).toBeTruthy();
  });

  it("rejects wrong otp code", async () => {
    const ip = nextIp();
    await sendOtp(
      otpRequest(
        "/api/ai/auth/otp/send",
        { phone: "09127778899", purpose: "auth" },
        ip
      )
    );

    const res = await verifyOtp(
      otpRequest(
        "/api/ai/auth/otp/verify",
        {
          phone: "09127778899",
          purpose: "auth",
          code: "99999",
        },
        ip
      )
    );
    const body = await jsonBody<{ error: string }>(res);
    expect(res.status).toBe(401);
    expect(body.error).toBe("invalid_otp");
  });

  it("resets password after otp", async () => {
    const { hashPassword, verifyPassword } = await import("@/lib/auth");
    emptyDb({
      ai_users: [
        {
          id: "u-reset",
          phone: "09128889900",
          password_hash: hashPassword("oldpass1"),
          plan: "free",
          credits: 5,
        },
      ],
    });

    const ip = nextIp();
    await sendOtp(
      otpRequest(
        "/api/ai/auth/otp/send",
        { phone: "09128889900", purpose: "reset" },
        ip
      )
    );

    const res = await verifyOtp(
      otpRequest(
        "/api/ai/auth/otp/verify",
        {
          phone: "09128889900",
          purpose: "reset",
          code: AI_OTP_E2E_CODE,
          password: "newpass9",
        },
        ip
      )
    );
    const body = await jsonBody<{ ok: boolean }>(res);
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(
      verifyPassword("newpass9", db.tables.ai_users[0]?.password_hash as string)
    ).toBe(true);
  });

  it("returns cooldown on immediate resend", async () => {
    const ip = nextIp();
    await sendOtp(
      otpRequest(
        "/api/ai/auth/otp/send",
        { phone: "09121231234", purpose: "auth" },
        ip
      )
    );

    const res = await sendOtp(
      otpRequest(
        "/api/ai/auth/otp/send",
        { phone: "09121231234", purpose: "auth" },
        ip
      )
    );
    const body = await jsonBody<{ error: string; retryAfterSec?: number }>(res);
    expect(res.status).toBe(429);
    expect(body.error).toBe("otp_cooldown");
    expect(body.retryAfterSec).toBeGreaterThan(60);
  });
});

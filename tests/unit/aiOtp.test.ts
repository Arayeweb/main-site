import { createHmac } from "crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AI_OTP_E2E_CODE,
  AI_OTP_LENGTH,
  generateAiOtpCode,
  hashAiOtpCode,
  isAiOtpPurpose,
  normalizeAiOtpCode,
  resolveStoredOtpPurpose,
  verifyAiOtpCodeHash,
} from "@/lib/aiOtp";
import { getKavenegarOtpTemplate } from "@/lib/kavenegar";

describe("aiOtp helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts known purposes", () => {
    expect(isAiOtpPurpose("login")).toBe(true);
    expect(isAiOtpPurpose("register")).toBe(true);
    expect(isAiOtpPurpose("reset")).toBe(true);
    expect(isAiOtpPurpose("auth")).toBe(true);
    expect(isAiOtpPurpose("other")).toBe(false);
  });

  it("maps auth purpose to login/register for DB storage", () => {
    expect(resolveStoredOtpPurpose("auth", true)).toBe("login");
    expect(resolveStoredOtpPurpose("auth", false)).toBe("register");
    expect(resolveStoredOtpPurpose("reset", false)).toBe("reset");
  });

  it("normalizes otp input to digits", () => {
    expect(normalizeAiOtpCode("12-34a5")).toBe("12345");
    expect(normalizeAiOtpCode("9999999")).toBe("99999");
  });

  it("hashes and verifies codes with timing-safe compare", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "test-secret-at-least-16");
    const hash = hashAiOtpCode("09123456789", "login", "12345");
    expect(hash).toHaveLength(64);
    expect(verifyAiOtpCodeHash("09123456789", "login", "12345", hash)).toBe(true);
    expect(verifyAiOtpCodeHash("09123456789", "login", "00000", hash)).toBe(false);
    expect(verifyAiOtpCodeHash("09123456789", "register", "12345", hash)).toBe(false);
  });

  it("uses fixed e2e code when E2E_MODE=1", () => {
    vi.stubEnv("E2E_MODE", "1");
    expect(generateAiOtpCode()).toBe(AI_OTP_E2E_CODE);
    expect(AI_OTP_E2E_CODE).toHaveLength(AI_OTP_LENGTH);
  });

  it("binds hash to phone+purpose+code", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "test-secret-at-least-16");
    const a = hashAiOtpCode("09120000000", "login", "11111");
    const b = createHmac("sha256", "ai-otp:test-secret-at-least-16")
      .update("09120000000|login|11111")
      .digest("hex");
    expect(a).toBe(b);
  });
});

describe("kavenegar config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults template to otp1", () => {
    vi.stubEnv("KAVENEGAR_OTP_TEMPLATE", "");
    expect(getKavenegarOtpTemplate()).toBe("otp1");
  });

  it("reads custom template name", () => {
    vi.stubEnv("KAVENEGAR_OTP_TEMPLATE", "araaye-otp");
    expect(getKavenegarOtpTemplate()).toBe("araaye-otp");
  });
});

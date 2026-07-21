import { describe, it, expect } from "vitest";
import { signAIToken, verifyAIToken, AI_COOKIE } from "@/lib/aiAuth";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { parseDeviceFromUa } from "@/lib/aiDeviceSessions";
import { creditReasonLabel, formatCreditDelta } from "@/lib/aiCreditLabels";

describe("aiAuth — session tokens", () => {
  it("signs and verifies a valid AI session token", () => {
    const token = signAIToken("user-123", "starter");
    const session = verifyAIToken(token);
    expect(session).not.toBeNull();
    expect(session!.userId).toBe("user-123");
    expect(session!.plan).toBe("starter");
    expect(session!.exp).toBeGreaterThan(Date.now());
    expect(session!.sessionId).toBeUndefined();
  });

  it("includes optional sessionId (sid) in the token", () => {
    const token = signAIToken("user-123", "pro", {
      sessionId: "11111111-1111-1111-1111-111111111111",
    });
    const session = verifyAIToken(token);
    expect(session?.sessionId).toBe("11111111-1111-1111-1111-111111111111");
  });

  it("rejects tampered tokens", () => {
    const token = signAIToken("user-123", "starter");
    const tampered = token.slice(0, -4) + "ffff";
    expect(verifyAIToken(tampered)).toBeNull();
  });

  it("rejects expired tokens", () => {
    const token = signAIToken("user-123", "free", -1000);
    expect(verifyAIToken(token)).toBeNull();
  });

  it("rejects null/empty tokens", () => {
    expect(verifyAIToken(null)).toBeNull();
    expect(verifyAIToken("")).toBeNull();
  });

  it("exports AI_COOKIE constant", () => {
    expect(AI_COOKIE).toBe("ary_ai_session");
  });
});

describe("auth — password hashing", () => {
  it("hashes and verifies passwords", () => {
    const hash = hashPassword("secret123");
    expect(hash).toMatch(/^scrypt\$/);
    expect(verifyPassword("secret123", hash)).toBe(true);
    expect(verifyPassword("wrong", hash)).toBe(false);
  });

  it("rejects empty stored hash", () => {
    expect(verifyPassword("x", "")).toBe(false);
  });
});

describe("aiDeviceSessions — UA parse", () => {
  it("detects iPhone Safari", () => {
    const r = parseDeviceFromUa(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    );
    expect(r.kind).toBe("mobile");
    expect(r.label).toContain("Safari");
    expect(r.label).toContain("iOS");
  });

  it("detects desktop Chrome on macOS", () => {
    const r = parseDeviceFromUa(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    expect(r.kind).toBe("desktop");
    expect(r.label).toContain("Chrome");
    expect(r.label).toContain("macOS");
  });

  it("handles empty UA", () => {
    expect(parseDeviceFromUa("")).toEqual({
      label: "دستگاه ناشناس",
      kind: "unknown",
    });
  });
});

describe("aiCreditLabels", () => {
  it("maps known reasons", () => {
    expect(creditReasonLabel("charge")).toBe("مصرف اجرا");
    expect(creditReasonLabel("signup_bonus")).toBe("اعتبار هدیه ثبت‌نام");
  });

  it("formats deltas", () => {
    expect(formatCreditDelta(-12)).toContain("۱۲");
    expect(formatCreditDelta(5).startsWith("+")).toBe(true);
  });
});

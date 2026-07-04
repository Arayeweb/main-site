import { describe, it, expect } from "vitest";
import { signAIToken, verifyAIToken, AI_COOKIE } from "@/lib/aiAuth";
import { hashPassword, verifyPassword } from "@/lib/auth";

describe("aiAuth — session tokens", () => {
  it("signs and verifies a valid AI session token", () => {
    const token = signAIToken("user-123", "starter");
    const session = verifyAIToken(token);
    expect(session).not.toBeNull();
    expect(session!.userId).toBe("user-123");
    expect(session!.plan).toBe("starter");
    expect(session!.exp).toBeGreaterThan(Date.now());
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

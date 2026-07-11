import { describe, it, expect } from "vitest";
import {
  signAdReadyToken,
  verifyAdReadyToken,
  ADREADY_COOKIE,
} from "@/lib/adreadySession";

describe("adreadySession — session tokens", () => {
  it("signs and verifies a valid AdReady session token", () => {
    const token = signAdReadyToken("user-123");
    const session = verifyAdReadyToken(token);
    expect(session).not.toBeNull();
    expect(session!.userId).toBe("user-123");
    expect(session!.exp).toBeGreaterThan(Date.now());
  });

  it("rejects tampered tokens", () => {
    const token = signAdReadyToken("user-123");
    const tampered = token.slice(0, -4) + "ffff";
    expect(verifyAdReadyToken(tampered)).toBeNull();
  });

  it("rejects expired tokens", () => {
    const token = signAdReadyToken("user-123", -1000);
    expect(verifyAdReadyToken(token)).toBeNull();
  });

  it("rejects null/empty tokens", () => {
    expect(verifyAdReadyToken(null)).toBeNull();
    expect(verifyAdReadyToken("")).toBeNull();
  });

  it("exports ADREADY_COOKIE constant", () => {
    expect(ADREADY_COOKIE).toBe("ary_adready_session");
  });

  it("does not accept AI session tokens", async () => {
    const { signAIToken } = await import("@/lib/aiAuth");
    const aiToken = signAIToken("user-123", "free");
    expect(verifyAdReadyToken(aiToken)).toBeNull();
  });
});

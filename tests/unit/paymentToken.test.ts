import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  signPaymentVerifyToken,
  verifyPaymentVerifyToken,
} from "@/lib/paymentToken";

describe("paymentToken", () => {
  const original = process.env.PAYMENT_SERVICE_SECRET;

  beforeEach(() => {
    process.env.PAYMENT_SERVICE_SECRET = "test-secret-for-hmac-signing-12345";
  });

  afterEach(() => {
    if (original === undefined) delete process.env.PAYMENT_SERVICE_SECRET;
    else process.env.PAYMENT_SERVICE_SECRET = original;
  });

  it("signs and verifies a payment token", () => {
    const token = signPaymentVerifyToken("track-99", 299000);
    expect(verifyPaymentVerifyToken("track-99", 299000, token)).toBe(true);
  });

  it("rejects tampered amount", () => {
    const token = signPaymentVerifyToken("track-99", 299000);
    expect(verifyPaymentVerifyToken("track-99", 300000, token)).toBe(false);
  });

  it("rejects tampered trackId", () => {
    const token = signPaymentVerifyToken("track-99", 299000);
    expect(verifyPaymentVerifyToken("track-100", 299000, token)).toBe(false);
  });
});

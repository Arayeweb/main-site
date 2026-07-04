import { describe, it, expect } from "vitest";
import {
  generateReferralCode,
  generateShareSlug,
  REFERRAL_BUYER_DISCOUNT_PERCENT,
  MIN_CHECKOUT_TOMAN,
} from "@/lib/aiPromo";

describe("aiPromo — code generation", () => {
  it("generates referral codes in AI-XXXXXX format", () => {
    const code = generateReferralCode();
    expect(code).toMatch(/^AI-[A-Z0-9]{6}$/);
  });

  it("generates URL-safe share slugs", () => {
    const slug = generateShareSlug();
    expect(slug).toMatch(/^[a-z0-9]{8}$/);
  });

  it("exports referral discount constants", () => {
    expect(REFERRAL_BUYER_DISCOUNT_PERCENT).toBe(10);
    expect(MIN_CHECKOUT_TOMAN).toBeGreaterThan(0);
  });
});

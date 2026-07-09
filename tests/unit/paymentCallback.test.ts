import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getPaymentCallbackUrl } from "@/lib/paymentCallback";

describe("getPaymentCallbackUrl", () => {
  const env = {
    PAYMENT_SERVICE_URL: process.env.PAYMENT_SERVICE_URL,
    PAYMENT_CALLBACKS_ENABLED: process.env.PAYMENT_CALLBACKS_ENABLED,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };

  afterEach(() => {
    for (const [k, v] of Object.entries(env)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  it("uses Vercel path when callbacks disabled", () => {
    delete process.env.PAYMENT_SERVICE_URL;
    delete process.env.PAYMENT_CALLBACKS_ENABLED;
    process.env.NEXT_PUBLIC_SITE_URL = "https://araaye.com";

    expect(getPaymentCallbackUrl("ai", "/api/ai/verify")).toBe(
      "https://araaye.com/api/ai/verify"
    );
  });

  it("uses payment subdomain when phase 2 enabled", () => {
    process.env.PAYMENT_SERVICE_URL = "https://payment.araaye.com";
    process.env.PAYMENT_CALLBACKS_ENABLED = "true";

    expect(getPaymentCallbackUrl("seo", "/api/seo/verify")).toBe(
      "https://payment.araaye.com/callback/seo"
    );
  });

  it("ignores payment URL when callbacks flag is off (phase 1)", () => {
    process.env.PAYMENT_SERVICE_URL = "https://payment.araaye.com";
    delete process.env.PAYMENT_CALLBACKS_ENABLED;
    process.env.NEXT_PUBLIC_SITE_URL = "https://araaye.com";

    expect(getPaymentCallbackUrl("telegram", "/api/telegram/payment/zibal/callback")).toBe(
      "https://araaye.com/api/telegram/payment/zibal/callback"
    );
  });
});

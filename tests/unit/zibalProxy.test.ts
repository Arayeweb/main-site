import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("zibal proxy", () => {
  const env = {
    PAYMENT_SERVICE_URL: process.env.PAYMENT_SERVICE_URL,
    PAYMENT_SERVICE_SECRET: process.env.PAYMENT_SERVICE_SECRET,
    ZIBAL_MERCHANT: process.env.ZIBAL_MERCHANT,
  };

  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    for (const [k, v] of Object.entries(env)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  it("proxies zibalRequest to payment service when configured", async () => {
    process.env.PAYMENT_SERVICE_URL = "https://payment.araaye.com";
    process.env.PAYMENT_SERVICE_SECRET = "proxy-secret";

    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          trackId: "555",
          redirectUrl: "https://gateway.zibal.ir/start/555",
        }),
        { status: 200 }
      )
    );

    const { zibalRequest } = await import("@/lib/zibal");
    const result = await zibalRequest({
      amountToman: 1000,
      callbackUrl: "https://araaye.com/api/ai/verify",
      description: "test",
      orderId: "order-1",
    });

    expect(result.ok).toBe(true);
    expect(result.trackId).toBe("555");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://payment.araaye.com/zibal/request",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Payment-Secret": "proxy-secret",
        }),
      })
    );
  });

  it("resolveZibalVerify trusts VPS ptoken without calling proxy", async () => {
    process.env.PAYMENT_SERVICE_URL = "https://payment.araaye.com";
    process.env.PAYMENT_SERVICE_SECRET = "proxy-secret";

    const { signPaymentVerifyToken } = await import("@/lib/paymentToken");
    const ptoken = signPaymentVerifyToken("track-42", 15000);
    const sp = new URLSearchParams({ ptoken, amount: "15000" });

    const { resolveZibalVerify } = await import("@/lib/zibal");
    const result = await resolveZibalVerify("track-42", sp);

    expect(result.ok).toBe(true);
    expect(result.paid).toBe(true);
    expect(result.amount).toBe(15000);
    expect(fetch).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestSupabase } from "../mocks/supabaseMock";
import { jsonBody, makeRequest } from "../helpers/request";
import { ADREADY_COOKIE, signAdReadyToken } from "@/lib/adreadySession";

const { zibalRequestMock, resolveZibalVerifyMock } = vi.hoisted(() => ({
  zibalRequestMock: vi.fn(),
  resolveZibalVerifyMock: vi.fn(),
}));

const db = createTestSupabase();

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => db,
}));

vi.mock("@/lib/zibal", () => ({
  zibalRequest: zibalRequestMock,
  resolveZibalVerify: resolveZibalVerifyMock,
}));

import { POST as checkout } from "@/app/api/adready/checkout/route";
import { GET as verify } from "@/app/api/adready/verify/route";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const CAMPAIGN_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("integration — AdReady payment", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://araaye.com";
    delete process.env.PAYMENT_CALLBACKS_ENABLED;
    db.reset({
      ai_users: [{ id: USER_ID, phone: "09121234567" }],
      campaign_pages: [
        {
          id: CAMPAIGN_ID,
          user_id: USER_ID,
          title: "کمپین تست",
          business_name: "کسب‌وکار تست",
          status: "preview",
          plan: "free",
          payment_status: "unpaid",
          active_package: null,
          expires_at: null,
        },
      ],
      adready_orders: [],
    });
    zibalRequestMock.mockReset();
    zibalRequestMock.mockResolvedValue({
      ok: true,
      trackId: "123456789",
      redirectUrl: "https://gateway.zibal.ir/start/123456789",
    });
    resolveZibalVerifyMock.mockReset();
    resolveZibalVerifyMock.mockResolvedValue({
      ok: true,
      paid: true,
      amount: 1_500_000,
      result: 100,
    });
  });

  it("creates a Zibal order and publishes after verification", async () => {
    const checkoutResponse = await checkout(
      makeRequest("/api/adready/checkout", {
        method: "POST",
        body: { campaignId: CAMPAIGN_ID, package: "monthly" },
        cookies: {
          [ADREADY_COOKIE]: signAdReadyToken(USER_ID),
        },
      })
    );
    const checkoutBody = await jsonBody<{
      ok: boolean;
      redirectUrl: string;
    }>(checkoutResponse);

    expect(checkoutResponse.status).toBe(200);
    expect(checkoutBody.redirectUrl).toContain("gateway.zibal.ir");
    expect(db.tables.adready_orders).toHaveLength(1);
    expect(db.tables.campaign_pages[0].payment_status).toBe("pending");

    const verifyResponse = await verify(
      makeRequest("/api/adready/verify", {
        searchParams: { trackId: "123456789", status: "OK" },
      })
    );

    expect(verifyResponse.status).toBe(307);
    expect(verifyResponse.headers.get("location")).toBe(
      `https://araaye.com/dashboard/adready/pages/${CAMPAIGN_ID}?paid=1`
    );
    expect(db.tables.adready_orders[0].payment_status).toBe("paid");
    expect(db.tables.campaign_pages[0]).toMatchObject({
      status: "published",
      plan: "monthly",
      payment_status: "paid",
      active_package: "monthly",
    });
    expect(db.tables.campaign_pages[0].expires_at).toEqual(expect.any(String));
  });
});

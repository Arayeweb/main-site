import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemorySupabase } from "@/tests/mocks/supabaseMock";
import { makeRequest, jsonBody } from "@/tests/helpers/request";

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: vi.fn(),
}));

import { getSupabaseAdmin } from "@/lib/supabase";
import { POST } from "@/app/api/leads/route";
import {
  MODARES_LEAD_CHANNEL,
  MODARES_LEAD_GOAL,
  MODARES_LEAD_SOURCE,
} from "@/lib/modaresLead";

const db = new InMemorySupabase({ leads: [] });

const teachersPayload = {
  goal: MODARES_LEAD_GOAL,
  page: "/modares",
  plan: "professional",
  detail: "teaching_field: زبان; variant: students",
  source: MODARES_LEAD_SOURCE,
  channel: MODARES_LEAD_CHANNEL,
  company: "",
  consent: true,
  contact: "09123456789",
  referrer: null,
  utm_source: "yektanet",
  utm_medium: "sms",
  utm_campaign: "teachers_tehran",
  utm_content: "a",
};

describe("POST /api/leads teachers campaign", () => {
  beforeEach(() => {
    db.reset({ leads: [] });
    vi.mocked(getSupabaseAdmin).mockReturnValue(db as never);
  });

  it("accepts a valid teachers lead submission", async () => {
    const res = await POST(
      makeRequest("/api/leads", {
        method: "POST",
        body: teachersPayload,
      }),
    );

    expect(res.status).toBe(200);
    const body = await jsonBody<{ ok: boolean }>(res);
    expect(body.ok).toBe(true);
    expect(db.tables.leads).toHaveLength(1);
    expect(db.tables.leads[0]).toMatchObject({
      contact: "09123456789",
      channel: MODARES_LEAD_CHANNEL,
      goal: MODARES_LEAD_GOAL,
      plan: "professional",
      page: "modares",
    });
  });

  it("normalizes international phone formats before insert", async () => {
    const res = await POST(
      makeRequest("/api/leads", {
        method: "POST",
        body: { ...teachersPayload, contact: "989123456789" },
      }),
    );

    expect(res.status).toBe(200);
    expect(db.tables.leads[0]?.contact).toBe("09123456789");
  });

  it("returns success without inserting duplicate teachers leads", async () => {
    const first = await POST(
      makeRequest("/api/leads", {
        method: "POST",
        body: teachersPayload,
      }),
    );
    expect(first.status).toBe(200);

    const second = await POST(
      makeRequest("/api/leads", {
        method: "POST",
        body: {
          ...teachersPayload,
          utm_content: "b",
          detail: "teaching_field: ریاضی; variant: students",
        },
      }),
    );

    expect(second.status).toBe(200);
    const body = await jsonBody<{ ok: boolean; duplicate?: boolean }>(second);
    expect(body.duplicate).toBe(true);
    expect(db.tables.leads).toHaveLength(1);
    expect(db.tables.leads[0]?.utm_content).toBe("a");
  });

  it("rejects invalid contact", async () => {
    const res = await POST(
      makeRequest("/api/leads", {
        method: "POST",
        body: { ...teachersPayload, contact: "12345" },
      }),
    );

    expect(res.status).toBe(422);
    const body = await jsonBody<{ ok: boolean; error: string }>(res);
    expect(body.error).toBe("invalid_contact");
    expect(db.tables.leads).toHaveLength(0);
  });

  it("still accepts non-teachers leads independently", async () => {
    const res = await POST(
      makeRequest("/api/leads", {
        method: "POST",
        body: {
          source: "doctors_hero_audit",
          page: "/doctors",
          name: "دکتر نمونه",
          contact: "09123456789",
          goal: "clinic_audit",
          channel: "doctors_landing",
          company: "",
          consent: true,
        },
      }),
    );

    expect(res.status).toBe(200);
    expect(db.tables.leads).toHaveLength(1);
    expect(db.tables.leads[0]?.channel).toBe("doctors_landing");
  });
});

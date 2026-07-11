import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestSupabase } from "../mocks/supabaseMock";
import { jsonBody, makeRequest } from "../helpers/request";
import { ADREADY_COOKIE, signAdReadyToken } from "@/lib/adreadySession";

const { generateCampaignPageContentMock } = vi.hoisted(() => ({
  generateCampaignPageContentMock: vi.fn(),
}));

vi.mock("@/lib/adreadyGeneration", () => ({
  CampaignGenerationError: class CampaignGenerationError extends Error {
    constructor(
      message: string,
      readonly code: "provider_error" | "invalid_output"
    ) {
      super(message);
    }
  },
  generateCampaignPageContent: generateCampaignPageContentMock,
}));

const db = createTestSupabase({
  campaign_pages: [],
  campaign_leads: [],
  campaign_events: [],
});

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => db,
}));

import {
  GET as listCampaigns,
  POST as createCampaign,
} from "@/app/api/adready/campaigns/route";
import {
  GET as getCampaign,
  PATCH as updateCampaign,
} from "@/app/api/adready/campaigns/[id]/route";
import { PATCH as updatePresentation } from "@/app/api/adready/campaigns/[id]/presentation/route";
import { GET as listLeads } from "@/app/api/adready/campaigns/[id]/leads/route";
import { POST as generateCampaign } from "@/app/api/adready/campaigns/[id]/generate/route";
import { POST as submitLead } from "@/app/api/adready/public/campaigns/[slug]/leads/route";
import { POST as saveEvent } from "@/app/api/adready/public/campaigns/[slug]/events/route";
import { POST as saveEventAlias } from "@/app/api/adready/events/route";
import { POST as submitLeadAlias } from "@/app/api/adready/leads/route";
import { GET as getAnalytics } from "@/app/api/adready/campaigns/[id]/analytics/route";
import { PATCH as patchLead } from "@/app/api/adready/campaigns/[id]/leads/[leadId]/route";
import { GET as exportLeads } from "@/app/api/adready/campaigns/[id]/leads/export/route";

const USER_1 = "11111111-1111-4111-8111-111111111111";
const USER_2 = "22222222-2222-4222-8222-222222222222";
const PAGE_1 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const PAGE_2 = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const LEAD_1 = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

function generatedContent() {
  return {
    headline: "یک شروع روشن برای رشد کسب‌وکار",
    subheadline: "پیشنهاد خود را شفاف معرفی کنید و درخواست‌های واقعی دریافت کنید.",
    problemBullets: ["مخاطب پیشنهاد را سریع درک نمی‌کند", "راه تماس مشخص نیست"],
    benefits: ["پیشنهاد شفاف", "مسیر اقدام کوتاه", "پاسخ به پرسش‌های رایج"],
    offerSection: {
      title: "پیشنهاد ویژه کمپین",
      description: "اطلاعات لازم را دریافت کنید و برای انتخاب آگاهانه اقدام کنید.",
      bullets: ["توضیح روشن خدمت", "تماس مستقیم با تیم"],
    },
    faq: [
      { question: "این خدمت برای چه کسانی است؟", answer: "برای مخاطبان هدف کمپین." },
      { question: "چطور شروع کنم؟", answer: "فرم را تکمیل کنید تا با شما تماس بگیریم." },
    ],
    objections: [
      { objection: "برای تصمیم‌گیری مطمئن نیستم", response: "ابتدا اطلاعات کامل را دریافت کنید." },
      { objection: "زمان کافی ندارم", response: "فرایند درخواست کوتاه و روشن است." },
    ],
    ctaText: "دریافت اطلاعات",
    formTitle: "برای دریافت اطلاعات فرم را تکمیل کنید",
    thankYouMessage: "درخواست شما ثبت شد.",
    adCopyAngles: [
      {
        channel: "Instagram",
        angle: "پیشنهاد روشن",
        copy: "برای آشنایی با این پیشنهاد و دریافت اطلاعات بیشتر اقدام کنید.",
      },
    ],
    whatsappMessage: "سلام، برای دریافت اطلاعات بیشتر پیام می‌دهم.",
  };
}

function presentationUpdate() {
  const content = generatedContent();
  const { adCopyAngles: _adCopyAngles, ...editableContent } = content;
  return {
    content: {
      ...editableContent,
      headline: "تیتر ویرایش‌شده کاربر",
    },
    contactPhone: "09121234567",
    whatsappNumber: "",
    telegramUsername: "",
    templateKey: "clinic",
    themeKey: "premium",
  };
}

function page(overrides: Record<string, unknown> = {}) {
  const now = "2026-07-09T12:00:00.000Z";
  return {
    id: PAGE_1,
    user_id: USER_1,
    title: "کمپین اول",
    slug: "campaign-one",
    status: "draft",
    plan: "free",
    generated_content: {},
    custom_content: {},
    seo_visibility: false,
    published_at: null,
    expires_at: null,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

function authedRequest(
  url: string,
  userId: string,
  options: Parameters<typeof makeRequest>[1] = {}
) {
  return makeRequest(url, {
    ...options,
    cookies: {
      ...options.cookies,
      [ADREADY_COOKIE]: signAdReadyToken(userId),
    },
  });
}

describe("integration — AdReady backend", () => {
  beforeEach(() => {
    generateCampaignPageContentMock.mockReset();
    generateCampaignPageContentMock.mockResolvedValue(generatedContent());
    db.reset({
      campaign_pages: [],
      campaign_leads: [],
      campaign_events: [],
    });
  });

  it("requires authentication to create a campaign draft", async () => {
    const response = await createCampaign(
      makeRequest("/api/adready/campaigns", {
        method: "POST",
        body: { title: "کمپین" },
      })
    );

    expect(response.status).toBe(401);
  });

  it("creates a server-owned free draft and ignores privilege fields", async () => {
    const response = await createCampaign(
      authedRequest("/api/adready/campaigns", USER_1, {
        method: "POST",
        body: {
          title: "فروش تابستان",
          slug: "summer-sale",
          userId: USER_2,
          plan: "done_for_you",
          status: "published",
          businessName: "فروشگاه آرایه",
        },
      })
    );
    const body = await jsonBody<{
      ok: boolean;
      campaignPage: { userId: string; plan: string; status: string };
    }>(response);

    expect(response.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.campaignPage).toMatchObject({
      userId: USER_1,
      plan: "free",
      status: "draft",
    });
    expect(db.tables.campaign_pages[0].user_id).toBe(USER_1);
  });

  it("lists and reads only the authenticated user's pages", async () => {
    db.reset({
      campaign_pages: [
        page(),
        page({ id: PAGE_2, user_id: USER_2, slug: "campaign-two" }),
      ],
      campaign_leads: [],
      campaign_events: [],
    });

    const listResponse = await listCampaigns(
      authedRequest("/api/adready/campaigns", USER_1)
    );
    const listBody = await jsonBody<{ campaignPages: Array<{ id: string }> }>(
      listResponse
    );
    expect(listBody.campaignPages.map((item) => item.id)).toEqual([PAGE_1]);

    const otherResponse = await getCampaign(
      authedRequest(`/api/adready/campaigns/${PAGE_2}`, USER_1),
      { params: { id: PAGE_2 } }
    );
    expect(otherResponse.status).toBe(404);
  });

  it("cannot update another user's page", async () => {
    db.reset({
      campaign_pages: [
        page({ id: PAGE_2, user_id: USER_2, title: "مالک دیگر" }),
      ],
      campaign_leads: [],
      campaign_events: [],
    });

    const response = await updateCampaign(
      authedRequest(`/api/adready/campaigns/${PAGE_2}`, USER_1, {
        method: "PATCH",
        body: { title: "دستکاری" },
      }),
      { params: { id: PAGE_2 } }
    );

    expect(response.status).toBe(404);
    expect(db.tables.campaign_pages[0].title).toBe("مالک دیگر");
  });

  it("updates an owned draft and records its first publication time", async () => {
    db.reset({
      campaign_pages: [page()],
      campaign_leads: [],
      campaign_events: [],
    });

    const response = await updateCampaign(
      authedRequest(`/api/adready/campaigns/${PAGE_1}`, USER_1, {
        method: "PATCH",
        body: {
          title: "کمپین منتشرشده",
          status: "published",
          plan: "done_for_you",
        },
      }),
      { params: { id: PAGE_1 } }
    );
    const body = await jsonBody<{
      campaignPage: { title: string; status: string; plan: string; publishedAt: string };
    }>(response);

    expect(response.status).toBe(200);
    expect(body.campaignPage.title).toBe("کمپین منتشرشده");
    expect(body.campaignPage.status).toBe("published");
    expect(body.campaignPage.plan).toBe("free");
    expect(body.campaignPage.publishedAt).toBeTruthy();
  });

  it("does not let the generic draft API accept client-generated AI content", async () => {
    db.reset({
      campaign_pages: [page()],
      campaign_leads: [],
      campaign_events: [],
    });

    const response = await updateCampaign(
      authedRequest(`/api/adready/campaigns/${PAGE_1}`, USER_1, {
        method: "PATCH",
        body: { generatedContent: generatedContent() },
      }),
      { params: { id: PAGE_1 } }
    );

    expect(response.status).toBe(422);
    expect(db.tables.campaign_pages[0].generated_content).toEqual({});
  });

  it("stores presentation edits in custom content without changing AI output", async () => {
    const original = generatedContent();
    db.reset({
      campaign_pages: [page({ generated_content: original })],
      campaign_leads: [],
      campaign_events: [],
    });

    const response = await updatePresentation(
      authedRequest(`/api/adready/campaigns/${PAGE_1}/presentation`, USER_1, {
        method: "PATCH",
        body: presentationUpdate(),
      }),
      { params: { id: PAGE_1 } }
    );

    expect(response.status).toBe(200);
    expect(db.tables.campaign_pages[0].generated_content).toEqual(original);
    expect(db.tables.campaign_pages[0]).toMatchObject({
      custom_content: expect.objectContaining({
        headline: "تیتر ویرایش‌شده کاربر",
      }),
      contact_phone: "09121234567",
      template_key: "clinic",
      theme_key: "premium",
    });
  });

  it("rejects unowned or incomplete presentation edits", async () => {
    db.reset({
      campaign_pages: [page()],
      campaign_leads: [],
      campaign_events: [],
    });

    const unowned = await updatePresentation(
      authedRequest(`/api/adready/campaigns/${PAGE_1}/presentation`, USER_2, {
        method: "PATCH",
        body: presentationUpdate(),
      }),
      { params: { id: PAGE_1 } }
    );
    expect(unowned.status).toBe(404);

    const missingContact = presentationUpdate();
    missingContact.contactPhone = "";
    const invalid = await updatePresentation(
      authedRequest(`/api/adready/campaigns/${PAGE_1}/presentation`, USER_1, {
        method: "PATCH",
        body: missingContact,
      }),
      { params: { id: PAGE_1 } }
    );
    expect(invalid.status).toBe(422);
    expect(db.tables.campaign_pages[0].custom_content).toEqual({});
  });

  it("generates once from server-saved input, persists it, and reuses it", async () => {
    db.reset({
      campaign_pages: [
        page({
          goal: "جذب لید",
          business_name: "آرایه",
          business_type: "نرم‌افزار",
          contact_phone: "09121234567",
          product_or_service_name: "کمپین‌ساز",
          short_description: "ساخت صفحه کمپین",
          main_benefit: "راه‌اندازی سریع‌تر",
          target_audience: "کسب‌وکارهای کوچک",
          campaign_channel: "Instagram",
          campaign_tone: "direct",
        }),
      ],
      campaign_leads: [],
      campaign_events: [],
    });

    const firstResponse = await generateCampaign(
      authedRequest(`/api/adready/campaigns/${PAGE_1}/generate`, USER_1, {
        method: "POST",
      }),
      { params: { id: PAGE_1 } }
    );
    const firstBody = await jsonBody<{ reused: boolean }>(firstResponse);

    expect(firstResponse.status).toBe(200);
    expect(firstBody.reused).toBe(false);
    expect(generateCampaignPageContentMock).toHaveBeenCalledTimes(1);
    expect(db.tables.campaign_pages[0]).toMatchObject({
      status: "preview",
      generated_content: generatedContent(),
    });

    const secondResponse = await generateCampaign(
      authedRequest(`/api/adready/campaigns/${PAGE_1}/generate`, USER_1, {
        method: "POST",
      }),
      { params: { id: PAGE_1 } }
    );
    const secondBody = await jsonBody<{ reused: boolean }>(secondResponse);

    expect(secondResponse.status).toBe(200);
    expect(secondBody.reused).toBe(true);
    expect(generateCampaignPageContentMock).toHaveBeenCalledTimes(1);
  });

  it("rejects AI generation for incomplete or unowned drafts", async () => {
    db.reset({
      campaign_pages: [page()],
      campaign_leads: [],
      campaign_events: [],
    });

    const incomplete = await generateCampaign(
      authedRequest(`/api/adready/campaigns/${PAGE_1}/generate`, USER_1, {
        method: "POST",
      }),
      { params: { id: PAGE_1 } }
    );
    expect(incomplete.status).toBe(422);

    const unowned = await generateCampaign(
      authedRequest(`/api/adready/campaigns/${PAGE_1}/generate`, USER_2, {
        method: "POST",
      }),
      { params: { id: PAGE_1 } }
    );
    expect(unowned.status).toBe(404);
    expect(generateCampaignPageContentMock).not.toHaveBeenCalled();
  });

  it("allows public lead submission only for a published, unexpired page", async () => {
    db.reset({
      campaign_pages: [page()],
      campaign_leads: [],
      campaign_events: [],
    });

    const draftResponse = await submitLead(
      makeRequest("/api/adready/public/campaigns/campaign-one/leads", {
        method: "POST",
        body: { fullName: "کاربر تست", phone: "09123456789" },
      }),
      { params: { slug: "campaign-one" } }
    );
    expect(draftResponse.status).toBe(404);

    db.tables.campaign_pages[0].status = "published";
    const publishedResponse = await submitLead(
      makeRequest("/api/adready/public/campaigns/campaign-one/leads", {
        method: "POST",
        body: {
          fullName: "کاربر تست",
          phone: "09123456789",
          userId: USER_2,
          utmSource: "instagram",
        },
      }),
      { params: { slug: "campaign-one" } }
    );

    expect(publishedResponse.status).toBe(201);
    expect(db.tables.campaign_leads[0]).toMatchObject({
      campaign_page_id: PAGE_1,
      user_id: USER_1,
      status: "new",
      utm_source: "instagram",
    });
    expect(db.tables.campaign_events.some((event) => event.event_name === "campaign_lead_submit")).toBe(
      true
    );
  });

  it("rejects duplicate lead submissions within the dedup window", async () => {
    db.reset({
      campaign_pages: [page({ status: "published" })],
      campaign_leads: [],
      campaign_events: [],
    });

    const first = await submitLeadAlias(
      makeRequest("/api/adready/leads", {
        method: "POST",
        body: {
          slug: "campaign-one",
          fullName: "کاربر تست",
          phone: "09123456789",
        },
      })
    );
    expect(first.status).toBe(201);

    const second = await submitLeadAlias(
      makeRequest("/api/adready/leads", {
        method: "POST",
        body: {
          slug: "campaign-one",
          fullName: "کاربر تست",
          phone: "09123456789",
        },
      })
    );
    expect(second.status).toBe(429);
  });

  it("returns leads only through a page owned by the current user", async () => {
    db.reset({
      campaign_pages: [page()],
      campaign_leads: [
        {
          id: "lead-1",
          campaign_page_id: PAGE_1,
          user_id: USER_1,
          full_name: "لید خودی",
          phone: "09123456789",
          status: "new",
          created_at: "2026-07-09T12:00:00.000Z",
          updated_at: "2026-07-09T12:00:00.000Z",
        },
        {
          id: "lead-2",
          campaign_page_id: PAGE_1,
          user_id: USER_2,
          full_name: "لید غیرمجاز",
          phone: "09111111111",
          status: "new",
          created_at: "2026-07-09T12:00:00.000Z",
          updated_at: "2026-07-09T12:00:00.000Z",
        },
      ],
      campaign_events: [],
    });

    const response = await listLeads(
      authedRequest(`/api/adready/campaigns/${PAGE_1}/leads`, USER_1),
      { params: { id: PAGE_1 } }
    );
    const body = await jsonBody<{ leads: Array<{ id: string }> }>(response);

    expect(body.leads.map((lead) => lead.id)).toEqual(["lead-1"]);
  });

  it("stores validated events only against published pages", async () => {
    db.reset({
      campaign_pages: [page({ status: "published" })],
      campaign_leads: [],
      campaign_events: [],
    });

    const response = await saveEvent(
      makeRequest("/api/adready/public/campaigns/campaign-one/events", {
        method: "POST",
        body: {
          visitorId: "visitor-1",
          sessionId: "session-1",
          eventName: "campaign_cta_click",
          payload: { location: "hero" },
        },
      }),
      { params: { slug: "campaign-one" } }
    );

    expect(response.status).toBe(201);
    expect(db.tables.campaign_events[0]).toMatchObject({
      campaign_page_id: PAGE_1,
      visitor_id: "visitor-1",
      event_name: "campaign_cta_click",
      payload: { location: "hero", sessionId: "session-1" },
    });
  });

  it("rejects unknown public event names", async () => {
    db.reset({
      campaign_pages: [page({ status: "published" })],
      campaign_leads: [],
      campaign_events: [],
    });

    const response = await saveEventAlias(
      makeRequest("/api/adready/events", {
        method: "POST",
        body: {
          slug: "campaign-one",
          visitorId: "visitor-1",
          eventName: "cta_click",
          payload: {},
        },
      })
    );

    expect(response.status).toBe(422);
  });

  it("returns analytics only for the page owner", async () => {
    db.reset({
      campaign_pages: [page({ status: "published" })],
      campaign_leads: [
        {
          id: "lead-1",
          campaign_page_id: PAGE_1,
          user_id: USER_1,
          full_name: "لید",
          phone: "09123456789",
          status: "new",
          created_at: "2026-07-09T12:00:00.000Z",
          updated_at: "2026-07-09T12:00:00.000Z",
        },
      ],
      campaign_events: [
        {
          id: "event-1",
          campaign_page_id: PAGE_1,
          visitor_id: "visitor-1",
          event_name: "campaign_page_view",
          payload: {},
          utm_source: "instagram",
          created_at: "2026-07-09T12:00:00.000Z",
        },
        {
          id: "event-2",
          campaign_page_id: PAGE_1,
          visitor_id: "visitor-1",
          event_name: "campaign_cta_click",
          payload: {},
          created_at: "2026-07-09T12:00:00.000Z",
        },
      ],
    });

    const response = await getAnalytics(
      authedRequest(`/api/adready/campaigns/${PAGE_1}/analytics`, USER_1),
      { params: { id: PAGE_1 } }
    );
    const body = await jsonBody<{
      analytics: { views: number; leads: number; ctaClicks: number };
    }>(response);

    expect(response.status).toBe(200);
    expect(body.analytics.views).toBe(1);
    expect(body.analytics.leads).toBe(1);
    expect(body.analytics.ctaClicks).toBe(1);
  });

  it("allows owner to update lead status", async () => {
    db.reset({
      campaign_pages: [page()],
      campaign_leads: [
        {
          id: LEAD_1,
          campaign_page_id: PAGE_1,
          user_id: USER_1,
          full_name: "لید",
          phone: "09123456789",
          status: "new",
          created_at: "2026-07-09T12:00:00.000Z",
          updated_at: "2026-07-09T12:00:00.000Z",
        },
      ],
      campaign_events: [],
    });

    const response = await patchLead(
      authedRequest(`/api/adready/campaigns/${PAGE_1}/leads/${LEAD_1}`, USER_1, {
        method: "PATCH",
        body: { status: "contacted" },
      }),
      { params: { id: PAGE_1, leadId: LEAD_1 } }
    );
    const body = await jsonBody<{ lead: { status: string } }>(response);

    expect(response.status).toBe(200);
    expect(body.lead.status).toBe("contacted");
  });

  it("blocks CSV export for free plan users", async () => {
    db.reset({
      campaign_pages: [page({ plan: "free" })],
      campaign_leads: [],
      campaign_events: [],
    });

    const response = await exportLeads(
      authedRequest(`/api/adready/campaigns/${PAGE_1}/leads/export`, USER_1),
      { params: { id: PAGE_1 } }
    );

    expect(response.status).toBe(403);
  });

  it("allows CSV export for pro plan users", async () => {
    db.reset({
      campaign_pages: [page({ plan: "pro" })],
      campaign_leads: [
        {
          id: "lead-1",
          campaign_page_id: PAGE_1,
          user_id: USER_1,
          full_name: "علی",
          phone: "09123456789",
          status: "new",
          created_at: "2026-07-09T12:00:00.000Z",
          updated_at: "2026-07-09T12:00:00.000Z",
        },
      ],
      campaign_events: [],
    });

    const response = await exportLeads(
      authedRequest(`/api/adready/campaigns/${PAGE_1}/leads/export`, USER_1),
      { params: { id: PAGE_1 } }
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/csv");
  });
});

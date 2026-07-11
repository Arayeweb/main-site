import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestSupabase } from "../mocks/supabaseMock";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

const db = createTestSupabase({ campaign_pages: [] });

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => db,
}));

import { getPublishedCampaignPage } from "@/lib/adreadyServer";

function page(
  slug: string,
  status: "draft" | "preview" | "published" | "archived",
  expiresAt: string | null = null
) {
  return {
    id: crypto.randomUUID(),
    user_id: crypto.randomUUID(),
    title: `کمپین ${slug}`,
    slug,
    status,
    plan: "free",
    generated_content: {},
    custom_content: {},
    seo_visibility: false,
    expires_at: expiresAt,
    published_at: status === "published" ? new Date().toISOString() : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

describe("AdReady public campaign lookup", () => {
  beforeEach(() => {
    db.reset({ campaign_pages: [] });
  });

  it("returns only a published campaign", async () => {
    db.reset({
      campaign_pages: [
        page("public-campaign", "published"),
        page("draft-campaign", "draft"),
        page("preview-campaign", "preview"),
        page("archived-campaign", "archived"),
      ],
    });

    await expect(getPublishedCampaignPage("public-campaign")).resolves.toMatchObject({
      slug: "public-campaign",
      status: "published",
    });
    await expect(getPublishedCampaignPage("draft-campaign")).resolves.toBeNull();
    await expect(getPublishedCampaignPage("preview-campaign")).resolves.toBeNull();
    await expect(getPublishedCampaignPage("archived-campaign")).resolves.toBeNull();
  });

  it("does not return an expired published campaign", async () => {
    db.reset({
      campaign_pages: [
        page("expired-campaign", "published", "2020-01-01T00:00:00.000Z"),
      ],
    });

    await expect(getPublishedCampaignPage("expired-campaign")).resolves.toBeNull();
  });
});

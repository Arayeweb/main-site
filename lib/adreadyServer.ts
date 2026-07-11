import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADREADY_COOKIE,
  verifyAdReadyToken,
  type AdReadySession,
} from "@/lib/adreadySession";
import {
  CAMPAIGN_PAGE_COLUMNS,
  isUuid,
  mapCampaignPage,
  normalizeCampaignSlug,
  type CampaignPage,
} from "@/lib/adready";
import { buildAdReadyLoginUrl } from "@/lib/adreadyAuth";
import { getSupabaseAdmin } from "@/lib/supabase";

export function requireAdReadySession(returnTo: string): AdReadySession {
  const token = cookies().get(ADREADY_COOKIE)?.value;
  const session = token ? verifyAdReadyToken(token) : null;
  if (!session) {
    redirect(buildAdReadyLoginUrl({ mode: "login", next: returnTo }));
  }
  return session;
}

export async function listOwnedCampaignPages(userId: string): Promise<CampaignPage[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("campaign_pages")
    .select(CAMPAIGN_PAGE_COLUMNS)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[adready/server] list owned pages", error.message);
    throw new Error("campaign_list_failed");
  }
  return (data || []).map((row) => mapCampaignPage(row));
}

export async function getOwnedCampaignPage(
  id: string,
  userId: string
): Promise<CampaignPage | null> {
  if (!isUuid(id)) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("campaign_pages")
    .select(CAMPAIGN_PAGE_COLUMNS)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[adready/server] get owned page", error.message);
    throw new Error("campaign_read_failed");
  }
  return data ? mapCampaignPage(data) : null;
}

export async function getLeadCountsForPages(
  userId: string,
  pageIds: string[]
): Promise<Record<string, number>> {
  if (!pageIds.length) return {};
  const { data, error } = await getSupabaseAdmin()
    .from("campaign_leads")
    .select("campaign_page_id")
    .eq("user_id", userId)
    .in("campaign_page_id", pageIds);

  if (error) {
    console.error("[adready/server] lead counts", error.message);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data || []) {
    const id = String(row.campaign_page_id);
    counts[id] = (counts[id] || 0) + 1;
  }
  return counts;
}

export async function getPublishedCampaignPage(
  rawSlug: string
): Promise<CampaignPage | null> {
  const slug = normalizeCampaignSlug(rawSlug);
  if (!slug) return null;

  const { data, error } = await getSupabaseAdmin()
    .from("campaign_pages")
    .select(CAMPAIGN_PAGE_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("[adready/server] get published page", error.message);
    throw new Error("public_campaign_read_failed");
  }
  if (!data) return null;
  if (
    data.expires_at &&
    new Date(String(data.expires_at)).getTime() <= Date.now()
  ) {
    return null;
  }
  return mapCampaignPage(data);
}

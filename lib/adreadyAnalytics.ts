import {
  CAMPAIGN_LEAD_COLUMNS,
  mapCampaignLead,
  type CampaignLead,
} from "@/lib/adready";
import { getSupabaseAdmin } from "@/lib/supabase";

export type CampaignAnalytics = {
  views: number;
  uniqueViews: number;
  leads: number;
  ctaClicks: number;
  whatsappClicks: number;
  telegramClicks: number;
  callClicks: number;
  conversionRate: number;
  topUtmSource: string | null;
  latestLeads: CampaignLead[];
};

async function countEvents(
  campaignPageId: string,
  eventName: string,
  distinctVisitor = false
): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (distinctVisitor) {
    const { data, error } = await supabase
      .from("campaign_events")
      .select("visitor_id")
      .eq("campaign_page_id", campaignPageId)
      .eq("event_name", eventName);

    if (error) {
      console.error("[adready/analytics] unique views", error.message);
      return 0;
    }
    return new Set((data || []).map((row) => String(row.visitor_id))).size;
  }

  const { data, error } = await supabase
    .from("campaign_events")
    .select("id")
    .eq("campaign_page_id", campaignPageId)
    .eq("event_name", eventName);

  if (error) {
    console.error("[adready/analytics] count", eventName, error.message);
    return 0;
  }
  return data?.length ?? 0;
}

async function topUtmSource(campaignPageId: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data: leadSources, error: leadError } = await supabase
    .from("campaign_leads")
    .select("utm_source")
    .eq("campaign_page_id", campaignPageId)
    .limit(500);

  if (!leadError && leadSources?.length) {
    const counts = new Map<string, number>();
    for (const row of leadSources) {
      const source = String(row.utm_source || "").trim();
      if (!source) continue;
      counts.set(source, (counts.get(source) || 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    if (sorted[0]) return sorted[0][0];
  }

  const { data: eventSources, error: eventError } = await supabase
    .from("campaign_events")
    .select("utm_source")
    .eq("campaign_page_id", campaignPageId)
    .limit(500);

  if (eventError || !eventSources?.length) return null;

  const counts = new Map<string, number>();
  for (const row of eventSources) {
    const source = String(row.utm_source || "").trim();
    if (!source) continue;
    counts.set(source, (counts.get(source) || 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? null;
}

export async function getCampaignAnalytics(
  campaignPageId: string,
  userId: string
): Promise<CampaignAnalytics | null> {
  const supabase = getSupabaseAdmin();
  const { data: page, error: pageError } = await supabase
    .from("campaign_pages")
    .select("id")
    .eq("id", campaignPageId)
    .eq("user_id", userId)
    .maybeSingle();

  if (pageError) {
    console.error("[adready/analytics] page lookup", pageError.message);
    throw new Error("analytics_failed");
  }
  if (!page) return null;

  const [
    views,
    uniqueViews,
    ctaClicks,
    whatsappClicks,
    telegramClicks,
    callClicks,
    topSource,
    leadsResult,
    latestLeadsResult,
  ] = await Promise.all([
    countEvents(campaignPageId, "campaign_page_view"),
    countEvents(campaignPageId, "campaign_page_view", true),
    countEvents(campaignPageId, "campaign_cta_click"),
    countEvents(campaignPageId, "campaign_whatsapp_click"),
    countEvents(campaignPageId, "campaign_telegram_click"),
    countEvents(campaignPageId, "campaign_call_click"),
    topUtmSource(campaignPageId),
    supabase
      .from("campaign_leads")
      .select("id")
      .eq("campaign_page_id", campaignPageId)
      .eq("user_id", userId),
    supabase
      .from("campaign_leads")
      .select(CAMPAIGN_LEAD_COLUMNS)
      .eq("campaign_page_id", campaignPageId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (leadsResult.error) {
    console.error("[adready/analytics] leads count", leadsResult.error.message);
    throw new Error("analytics_failed");
  }
  if (latestLeadsResult.error) {
    console.error("[adready/analytics] latest leads", latestLeadsResult.error.message);
    throw new Error("analytics_failed");
  }

  const leads = leadsResult.data?.length ?? 0;
  const conversionRate = views > 0 ? Math.round((leads / views) * 1000) / 1000 : 0;

  return {
    views,
    uniqueViews,
    leads,
    ctaClicks,
    whatsappClicks,
    telegramClicks,
    callClicks,
    conversionRate,
    topUtmSource: topSource,
    latestLeads: (latestLeadsResult.data || []).map((row) => mapCampaignLead(row)),
  };
}

export async function countCampaignLeads(
  campaignPageId: string,
  userId: string
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("campaign_leads")
    .select("id")
    .eq("campaign_page_id", campaignPageId)
    .eq("user_id", userId);

  if (error) {
    console.error("[adready/analytics] lead count", error.message);
    return 0;
  }
  return data?.length ?? 0;
}

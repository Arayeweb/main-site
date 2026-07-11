import { NextRequest } from "next/server";
import { getAdReadySession } from "@/lib/adreadySession";
import {
  CAMPAIGN_LEAD_COLUMNS,
  isUuid,
  mapCampaignLead,
} from "@/lib/adready";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

export async function GET(req: NextRequest, { params }: RouteContext) {
  const session = getAdReadySession(req);
  if (!session) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isUuid(params.id)) {
    return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
  }

  const supabase = getSupabaseAdmin();
  const { data: page, error: pageError } = await supabase
    .from("campaign_pages")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (pageError) {
    console.error("[api/adready/campaigns/:id/leads] page", pageError.message);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
  if (!page) {
    return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("campaign_leads")
    .select(CAMPAIGN_LEAD_COLUMNS)
    .eq("campaign_page_id", params.id)
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[api/adready/campaigns/:id/leads] GET", error.message);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }

  return jsonNoStore({
    ok: true,
    leads: (data || []).map((row) => mapCampaignLead(row)),
  });
}

import { NextRequest } from "next/server";
import { getAdReadySession } from "@/lib/adreadySession";
import {
  CAMPAIGN_LEAD_STATUSES,
  CAMPAIGN_LEAD_COLUMNS,
  isPlainObject,
  isUuid,
  mapCampaignLead,
  readString,
} from "@/lib/adready";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string; leadId: string } };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = getAdReadySession(req);
  if (!session) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isUuid(params.id) || !isUuid(params.leadId)) {
    return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }
  if (!isPlainObject(body)) {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const status = readString(body.status, 40);
  if (!status || !CAMPAIGN_LEAD_STATUSES.includes(status as (typeof CAMPAIGN_LEAD_STATUSES)[number])) {
    return jsonNoStore({ ok: false, error: "invalid_status" }, { status: 422 });
  }

  const supabase = getSupabaseAdmin();
  const { data: page } = await supabase
    .from("campaign_pages")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (!page) {
    return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("campaign_leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", params.leadId)
    .eq("campaign_page_id", params.id)
    .eq("user_id", session.userId);

  if (error) {
    console.error("[api/adready/campaigns/:id/leads/:leadId] PATCH", error.message);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }

  const { data, error: readError } = await supabase
    .from("campaign_leads")
    .select(CAMPAIGN_LEAD_COLUMNS)
    .eq("id", params.leadId)
    .eq("campaign_page_id", params.id)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (readError) {
    console.error("[api/adready/campaigns/:id/leads/:leadId] PATCH reload", readError.message);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
  if (!data) {
    return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
  }

  return jsonNoStore({ ok: true, lead: mapCampaignLead(data) });
}

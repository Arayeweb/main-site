import { NextRequest, NextResponse } from "next/server";
import { getAdReadySession } from "@/lib/adreadySession";
import {
  CAMPAIGN_LEAD_COLUMNS,
  isAdReadyPlanExportAllowed,
  isUuid,
  mapCampaignLead,
} from "@/lib/adready";
import { buildLeadsCsv } from "@/lib/adreadyCsv";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

export async function GET(req: NextRequest, { params }: RouteContext) {
  const session = getAdReadySession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isUuid(params.id)) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const supabase = getSupabaseAdmin();
  const { data: page, error: pageError } = await supabase
    .from("campaign_pages")
    .select("id, plan, slug")
    .eq("id", params.id)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (pageError) {
    console.error("[api/adready/campaigns/:id/leads/export] page", pageError.message);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
  if (!page) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (!isAdReadyPlanExportAllowed(String(page.plan))) {
    return NextResponse.json(
      { ok: false, error: "plan_upgrade_required" },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("campaign_leads")
    .select(CAMPAIGN_LEAD_COLUMNS)
    .eq("campaign_page_id", params.id)
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    console.error("[api/adready/campaigns/:id/leads/export] leads", error.message);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  const leads = (data || []).map((row) => mapCampaignLead(row));
  const csv = buildLeadsCsv(leads);
  const filename = `leads-${String(page.slug)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

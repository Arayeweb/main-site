import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  buildAnalyticsReport,
  type AnalyticsFilters,
  type AnalyticsRow,
  type AttributionModel,
} from "@/lib/analytics/report";
import { fetchAllRows } from "@/lib/analyticsDb";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SELECT_COLUMNS = [
  "created_at",
  "event_id",
  "event_origin",
  "actor_id",
  "account_id",
  "dedupe_key",
  "event_name",
  "canonical_event_name",
  "schema_version",
  "visitor_id",
  "session_id",
  "product_area",
  "funnel_stage",
  "page",
  "source",
  "location",
  "package",
  "value",
  "currency",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "first_utm_source",
  "first_utm_medium",
  "first_utm_campaign",
  "first_utm_content",
  "first_utm_term",
  "last_utm_source",
  "last_utm_medium",
  "last_utm_campaign",
  "last_utm_content",
  "last_utm_term",
  "landing_page",
  "first_landing_page",
  "initial_referrer",
  "traffic_type",
  "payload",
  "user_agent",
].join(",");

function cleanFilter(value: string | null, max = 200): string | undefined {
  const normalized = value?.trim();
  if (!normalized || normalized === "all") return undefined;
  return normalized.slice(0, max);
}

function parseFilters(req: NextRequest): AnalyticsFilters {
  const query = req.nextUrl.searchParams;
  const period = query.get("period") || "30d";
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const defaultFrom = new Date(Date.now() - (days - 1) * 86_400_000).toISOString().slice(0, 10);
  const attribution = query.get("attribution");
  return {
    from: cleanFilter(query.get("from"), 10) || defaultFrom,
    to: cleanFilter(query.get("to"), 10) || new Date().toISOString().slice(0, 10),
    product: cleanFilter(query.get("product")),
    source: cleanFilter(query.get("source")),
    medium: cleanFilter(query.get("medium")),
    campaign: cleanFilter(query.get("campaign")),
    page: cleanFilter(query.get("page"), 300),
    event: cleanFilter(query.get("event")),
    attribution: (["session", "first", "last"].includes(attribution || "")
      ? attribution
      : "session") as AttributionModel,
  };
}

export async function GET(req: NextRequest) {
  if (!getSession(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await fetchAllRows(
      "analytics_events",
      SELECT_COLUMNS,
      getSupabaseAdmin(),
    );
    if (error) {
      console.error("[api/admin/analytics/events] error:", error);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    const filters = parseFilters(req);
    const report = buildAnalyticsReport(data as AnalyticsRow[], filters);
    return NextResponse.json({ ok: true, ...report });
  } catch (error) {
    console.error("[api/admin/analytics/events] GET error:", error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

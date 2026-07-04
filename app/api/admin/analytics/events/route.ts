import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { buildDailySeries, fetchAllRows, groupCount } from "@/lib/analyticsDb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FUNNEL_EVENTS = ["pkg_selected", "begin_checkout", "purchase", "generate_lead"] as const;

export async function GET(req: NextRequest) {
  if (!getSession(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: events, error } = await fetchAllRows(
      "analytics_events",
      "event_name, page, source, location, package, promo_code, utm_source, created_at",
      supabase
    );

    if (error) {
      console.error("[api/admin/analytics/events] error:", error);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const monthMs = 30 * 24 * 60 * 60 * 1000;

    const thisWeek = events.filter(
      (e) => now - new Date(e.created_at as string).getTime() < weekMs
    ).length;
    const thisMonth = events.filter(
      (e) => now - new Date(e.created_at as string).getTime() < monthMs
    ).length;

    const funnel: Record<string, number> = {};
    for (const name of FUNNEL_EVENTS) {
      funnel[name] = events.filter((e) => e.event_name === name).length;
    }

    const checkoutToPurchase =
      funnel.begin_checkout > 0
        ? Math.round((funnel.purchase / funnel.begin_checkout) * 100)
        : 0;

    return NextResponse.json({
      ok: true,
      total_events: events.length,
      this_week: thisWeek,
      this_month: thisMonth,
      by_event: groupCount(events, "event_name"),
      by_page: groupCount(events, "page"),
      by_source: groupCount(events, "source"),
      by_package: groupCount(events, "package"),
      funnel,
      checkout_to_purchase_rate: checkoutToPurchase,
      last_7_days: buildDailySeries(events, 7),
      last_30_days: buildDailySeries(events, 30),
    });
  } catch (e) {
    console.error("[api/admin/analytics/events] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

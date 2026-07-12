import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { fetchAllRows, groupCount } from "@/lib/analyticsDb";

async function countExact(
  table: string,
  supabase: ReturnType<typeof getSupabaseAdmin>
): Promise<number | null> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) {
    console.error(`[api/admin/stats] countExact(${table}) error:`, error.message);
    return null;
  }
  return count;
}

function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!getSession(req)) return unauthorized();

  try {
    const supabase = getSupabaseAdmin();

    const [leadsRes, pvRes, leadsCount, pvCount] = await Promise.all([
      fetchAllRows("leads", "source, page, utm_source, utm_medium, utm_campaign, created_at", supabase),
      fetchAllRows("page_views", "page, utm_source, utm_medium, utm_campaign, visitor_id, created_at", supabase),
      countExact("leads", supabase),
      countExact("page_views", supabase),
    ]);

    if (leadsRes.error) {
      console.error("[api/admin/stats] leads error:", leadsRes.error);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (pvRes.error) {
      console.error("[api/admin/stats] page_views error:", pvRes.error);
    }

    const leads = leadsRes.data;
    const views = pvRes.data;
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const monthMs = 30 * 24 * 60 * 60 * 1000;

    const thisWeek = leads.filter(
      (l) => now - new Date(l.created_at as string).getTime() < weekMs
    ).length;
    const thisMonth = leads.filter(
      (l) => now - new Date(l.created_at as string).getTime() < monthMs
    ).length;
    const viewsThisWeek = views.filter(
      (v) => now - new Date(v.created_at as string).getTime() < weekMs
    ).length;

    const uniqueVisitors = new Set(
      views
        .map((v) => v.visitor_id as string | null)
        .filter((id): id is string => !!id)
    ).size;

    // آمار ۷ روز اخیر — لیدها و بازدیدها
    const last7: { date: string; leads: number; views: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      last7.push({ date: d.toISOString().slice(0, 10), leads: 0, views: 0 });
    }
    for (const l of leads) {
      const date = new Date(l.created_at as string).toISOString().slice(0, 10);
      const entry = last7.find((x) => x.date === date);
      if (entry) entry.leads++;
    }
    for (const v of views) {
      const date = new Date(v.created_at as string).toISOString().slice(0, 10);
      const entry = last7.find((x) => x.date === date);
      if (entry) entry.views++;
    }

    return NextResponse.json({
      ok: true,
      total_leads: leadsCount ?? leads.length,
      total_views: pvCount ?? views.length,
      unique_visitors: uniqueVisitors,
      this_week: thisWeek,
      this_month: thisMonth,
      views_this_week: viewsThisWeek,
      by_source: groupCount(leads, "source"),
      by_utm_source: groupCount(views, "utm_source", "(مستقیم/organic)"),
      by_utm_campaign: groupCount(views, "utm_campaign", "(بدون کمپین)"),
      by_page: groupCount(views, "page"),
      last_7_days: last7,
    });
  } catch (e) {
    console.error("[api/admin/stats] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

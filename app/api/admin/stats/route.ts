import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requireAny(req: NextRequest) {
  return getSession(req);
}
function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

// Supabase به‌صورت پیش‌فرض حداکثر ۱۰۰۰ ردیف برمی‌گرداند؛
// برای آمار صحیح باید همهٔ ردیف‌ها صفحه‌به‌صفحه خوانده شوند.
async function fetchAll(
  table: string,
  columns: string,
  supabase: ReturnType<typeof getSupabaseAdmin>
): Promise<{ data: Record<string, unknown>[]; error: string | null }> {
  const PAGE = 1000;
  const all: Record<string, unknown>[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order("created_at", { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) return { data: all, error: error.message };
    const batch = (data || []) as unknown as Record<string, unknown>[];
    all.push(...batch);
    if (batch.length < PAGE) break;
  }
  return { data: all, error: null };
}

function groupCount(items: Record<string, unknown>[], key: string): { key: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const v = (item[key] as string) || "";
    if (!v) continue;
    map.set(v, (map.get(v) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([k, count]) => ({ key: k, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

export async function GET(req: NextRequest) {
  if (!requireAny(req)) return unauthorized();

  try {
    const supabase = getSupabaseAdmin();
    const [leadsRes, pvRes] = await Promise.all([
      fetchAll("leads", "source, page, utm_source, utm_medium, utm_campaign, created_at", supabase),
      fetchAll("page_views", "page, utm_source, utm_medium, utm_campaign, created_at", supabase),
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
      total_leads: leads.length,
      total_views: views.length,
      this_week: thisWeek,
      this_month: thisMonth,
      views_this_week: viewsThisWeek,
      by_source: groupCount(leads, "source"),
      by_utm_source: groupCount(views, "utm_source"),
      by_utm_campaign: groupCount(views, "utm_campaign"),
      by_page: groupCount(views, "page"),
      last_7_days: last7,
    });
  } catch (e) {
    console.error("[api/admin/stats] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

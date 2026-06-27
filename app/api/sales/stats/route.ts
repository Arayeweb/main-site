import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession, type AdminRole } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SALES_ROLES: AdminRole[] = ["sales", "admin"];
const PIPELINE = ["new", "contacted", "qualified", "proposal", "won", "lost"];

// آمار داشبورد پنل فروش.
export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session || !SALES_ROLES.includes(session.role)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("leads")
      .select("crm_status, owner_id, created_at, next_followup_at, source, channel");

    if (error) {
      console.error("[api/sales/stats] GET error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    const leads = (data || []) as Record<string, unknown>[];
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const monthMs = 30 * 24 * 60 * 60 * 1000;
    const today = new Date().toISOString().slice(0, 10);

    const pipeline: Record<string, number> = {};
    for (const s of PIPELINE) pipeline[s] = 0;

    let myLeads = 0;
    let unassigned = 0;
    let wonThisMonth = 0;
    let newThisWeek = 0;
    let manualTotal = 0;
    let followupsDue = 0; // پیگیری‌هایی که سررسیدشان امروز یا گذشته است

    for (const l of leads) {
      const status = (l.crm_status as string) || "new";
      if (status in pipeline) pipeline[status]++;
      if (l.owner_id === session.userId) myLeads++;
      if (!l.owner_id) unassigned++;
      if (l.source === "manual_entry") manualTotal++;

      const created = new Date(l.created_at as string).getTime();
      if (now - created < weekMs) newThisWeek++;
      if (status === "won" && now - created < monthMs) wonThisMonth++;

      const fu = l.next_followup_at as string | null;
      if (fu && status !== "won" && status !== "lost" && fu.slice(0, 10) <= today) {
        followupsDue++;
      }
    }

    // روند ۷ روز اخیر
    const last7: { date: string; leads: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      last7.push({ date: d.toISOString().slice(0, 10), leads: 0 });
    }
    for (const l of leads) {
      const date = new Date(l.created_at as string).toISOString().slice(0, 10);
      const entry = last7.find((x) => x.date === date);
      if (entry) entry.leads++;
    }

    // تفکیک بر اساس منبع و کانال ورود (برای ثبت دستی)
    const srcMap = new Map<string, number>();
    const chMap = new Map<string, number>();
    for (const l of leads) {
      const s = (l.source as string) || "—";
      srcMap.set(s, (srcMap.get(s) || 0) + 1);
      const c = (l.channel as string) || "";
      if (c) chMap.set(c, (chMap.get(c) || 0) + 1);
    }
    const toSorted = (m: Map<string, number>) =>
      Array.from(m.entries())
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const active = leads.length - (pipeline.won + pipeline.lost);
    const closed = pipeline.won + pipeline.lost;
    const winRate = closed > 0 ? Math.round((pipeline.won / closed) * 100) : 0;

    return NextResponse.json({
      ok: true,
      total: leads.length,
      active,
      pipeline,
      my_leads: myLeads,
      unassigned,
      won_this_month: wonThisMonth,
      new_this_week: newThisWeek,
      manual_total: manualTotal,
      followups_due: followupsDue,
      win_rate: winRate,
      last_7_days: last7,
      by_source: toSorted(srcMap),
      by_channel: toSorted(chMap),
    });
  } catch (e) {
    console.error("[api/sales/stats] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

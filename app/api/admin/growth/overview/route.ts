import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { fetchAllRows } from "@/lib/analyticsDb";
import { requireSession, unauthorized } from "@/lib/adminRouteHelpers";
import {
  avgFastWebTtdHours,
  buildRevenueTrend,
  buildTrend,
  computeFunnel,
  computePipeline,
  doctorsConversionRate,
  fastwebActivationRate,
  filterLeadsByProduct,
  filterViewsByProduct,
  periodToMs,
  qualifiedLeadsInPeriod,
  sumInPeriod,
  uniqueVisitorsInPeriod,
  wonLeadsInPeriod,
  type GrowthPeriod,
} from "@/lib/growthMetrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!requireSession(req)) return unauthorized();

  const period = (req.nextUrl.searchParams.get("period") || "7d") as GrowthPeriod;
  const sinceMs = periodToMs(period === "30d" ? "30d" : "7d");
  const trendDays = period === "30d" ? 30 : 7;
  const now = Date.now();
  const sinceIso = new Date(now - sinceMs).toISOString();
  const sinceDate = sinceIso.slice(0, 10);

  try {
    const supabase = getSupabaseAdmin();

    const [
      leadsRes,
      viewsRes,
      eventsRes,
      invoicesRes,
      fastwebRes,
      aiOrdersRes,
      adSpendRes,
      activitiesRes,
      projectsRes,
      maintenanceRes,
      ticketsRes,
      experimentsRes,
      clientsRes,
    ] = await Promise.all([
      fetchAllRows(
        "leads",
        "id, source, page, crm_status, created_at, qualified_at, won_at, referred_by_lead_id, lead_score, is_auto_qualified",
        supabase
      ),
      fetchAllRows("page_views", "page, visitor_id, created_at", supabase),
      fetchAllRows("analytics_events", "canonical_event_name, event_name, page, created_at", supabase),
      fetchAllRows(
        "invoices",
        "status, kind, grand_total, currency, paid_at, created_at, lead_id, client_id",
        supabase
      ),
      fetchAllRows(
        "fastweb_orders",
        "payment_status, fulfillment_status, amount_toman, paid_at, published_at, created_at",
        supabase
      ),
      fetchAllRows("ai_orders", "status, amount_toman, created_at", supabase),
      supabase.from("ad_campaigns").select("spend, leads, date, platform").gte("date", sinceDate),
      supabase
        .from("lead_activities")
        .select("kind, created_at")
        .eq("kind", "call")
        .gte("created_at", sinceIso),
      supabase
        .from("support_projects")
        .select("status, created_at, updated_at")
        .eq("status", "delivered"),
      supabase.from("crm_maintenance_plans").select("monthly_fee, support_status, payment_status"),
      supabase
        .from("support_tickets")
        .select("id, status, created_at")
        .in("status", ["open", "in_progress"]),
      supabase.from("growth_experiments").select("status, sprint_week, bucket, score"),
      supabase.from("crm_clients").select("id, total_revenue"),
    ]);

    const leads = leadsRes.data;
    const views = viewsRes.data;
    const invoices = invoicesRes.data;
    const fastweb = fastwebRes.data;
    const aiOrders = aiOrdersRes.data;

    const invoiceRevenue = sumInPeriod(
      invoices.filter((i) => i.status === "paid" && i.kind === "invoice" && i.currency === "IRR"),
      "grand_total",
      "paid_at",
      sinceMs,
      now
    );
    const fastwebRevenue = sumInPeriod(
      fastweb.filter((o) => o.payment_status === "paid"),
      "amount_toman",
      "paid_at",
      sinceMs,
      now
    );
    const aiRevenue = sumInPeriod(
      aiOrders.filter((o) => o.status === "paid"),
      "amount_toman",
      "created_at",
      sinceMs,
      now
    );
    const revenue = invoiceRevenue + fastwebRevenue + aiRevenue;

    const qualifiedLeads = qualifiedLeadsInPeriod(leads, sinceMs, now);
    const visitors = uniqueVisitorsInPeriod(views, sinceMs, now);
    const leadsInPeriod = leads.filter(
      (l) => now - new Date(l.created_at as string).getTime() < sinceMs
    ).length;
    const conversion = visitors > 0 ? Math.round((leadsInPeriod / visitors) * 100) : 0;

    const adSpend = (adSpendRes.data ?? []).reduce((s, r) => s + (Number(r.spend) || 0), 0);
    const sales = wonLeadsInPeriod(leads, sinceMs, now);
    const cac = sales > 0 ? Math.round(adSpend / sales) : 0;

    const clientRevenues = (clientsRes.data ?? []).map((c) => Number(c.total_revenue) || 0);
    const ltv =
      clientRevenues.length > 0
        ? Math.round(clientRevenues.reduce((a, b) => a + b, 0) / clientRevenues.length)
        : 0;

    const mrr = (maintenanceRes.data ?? [])
      .filter((m) => m.support_status === "active" && m.payment_status === "paid")
      .reduce((s, m) => s + (Number(m.monthly_fee) || 0), 0);

    const pipeline = computePipeline(leads);
    const activePipeline =
      pipeline.new + pipeline.contacted + pipeline.qualified + pipeline.proposal;

    const calls = (activitiesRes.data ?? []).length;
    const proposals = leads.filter((l) => l.crm_status === "proposal").length;
    const delivered =
      (projectsRes.data ?? []).length +
      fastweb.filter((o) => o.fulfillment_status === "published").length;
    const referrals = leads.filter((l) => l.referred_by_lead_id).length;
    const repeatClients = (clientsRes.data ?? []).filter((c) => Number(c.total_revenue) > 0).length;

    const generateLeadEvents = (eventsRes.data ?? []).filter(
      (e) =>
        (e.canonical_event_name === "lead_submitted" || e.event_name === "generate_lead") &&
        now - new Date(e.created_at as string).getTime() < sinceMs
    ).length;

    const cpl = leadsInPeriod > 0 ? Math.round(adSpend / leadsInPeriod) : 0;

    const qualifiedTrend = buildTrend(
      leads.filter((l) => l.qualified_at),
      "qualified_at",
      trendDays,
      now
    );
    const revenueTrend = buildRevenueTrend(invoices, fastweb, aiOrders, trendDays, now);

    const funnel = computeFunnel({
      visitors,
      leads: leadsInPeriod,
      qualified: qualifiedLeads,
      calls,
      proposals,
      sales,
      delivered,
      referrals,
      repeat: repeatClients,
    });

    const experiments = experimentsRes.data ?? [];
    const weekStart = startOfWeekMonday();
    const hypothesesThisWeek = experiments.filter(
      (e) => e.sprint_week === weekStart
    ).length;

    const byProduct = {
      fastweb: {
        visitors: uniqueVisitorsInPeriod(filterViewsByProduct(views, "fastweb"), sinceMs, now),
        leads: filterLeadsByProduct(
          leads.filter((l) => now - new Date(l.created_at as string).getTime() < sinceMs),
          "fastweb"
        ).length,
        ttdHours: avgFastWebTtdHours(fastweb),
        activationRate: fastwebActivationRate(fastweb),
      },
      doctors: {
        visitors: uniqueVisitorsInPeriod(filterViewsByProduct(views, "doctors"), sinceMs, now),
        leads: filterLeadsByProduct(
          leads.filter((l) => now - new Date(l.created_at as string).getTime() < sinceMs),
          "doctors"
        ).length,
        conversionRate: doctorsConversionRate(leads, views),
      },
      seo: {
        visitors: uniqueVisitorsInPeriod(filterViewsByProduct(views, "seo"), sinceMs, now),
        leads: filterLeadsByProduct(
          leads.filter((l) => now - new Date(l.created_at as string).getTime() < sinceMs),
          "seo"
        ).length,
        generateLeadEvents: generateLeadEvents,
      },
      ai: {
        revenue: aiRevenue,
        orders: aiOrders.filter(
          (o) => o.status === "paid" && now - new Date(o.created_at as string).getTime() < sinceMs
        ).length,
      },
    };

    return NextResponse.json({
      ok: true,
      period,
      northStar: {
        revenue,
        qualifiedLeads,
        revenueTrend,
        qualifiedTrend,
      },
      daily: {
        revenue,
        qualifiedLeads,
        visitors,
        conversion,
        cac,
        ltv,
        mrr,
        pipeline: activePipeline,
        sales,
      },
      funnel,
      squads: {
        acquisition: { visitors, cpl, qualifiedLeads },
        conversion: {
          conversionRate: conversion,
          bookedCalls: calls,
          sales,
        },
        product: {
          ttdHours: byProduct.fastweb.ttdHours,
          bugs: (ticketsRes.data ?? []).length,
          activation: byProduct.fastweb.activationRate,
        },
        customerSuccess: {
          retention: (maintenanceRes.data ?? []).filter((m) => m.support_status === "active").length,
          referral: referrals,
          review: 0,
        },
        experimentation: {
          hypothesesThisWeek,
          shipped: experiments.filter((e) => e.status === "shipped").length,
          killed: experiments.filter((e) => e.status === "killed").length,
        },
      },
      byProduct,
    });
  } catch (e) {
    console.error("[api/admin/growth/overview] error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

function startOfWeekMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

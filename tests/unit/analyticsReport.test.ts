import { describe, expect, it } from "vitest";
import {
  applyAnalyticsFilters,
  buildAnalyticsReport,
  type AnalyticsRow,
} from "@/lib/analytics/report";

function row(
  event: string,
  createdAt: string,
  overrides: Partial<AnalyticsRow> = {},
): AnalyticsRow {
  return {
    created_at: createdAt,
    event_id: crypto.randomUUID(),
    event_name: event,
    canonical_event_name: event,
    visitor_id: "11111111-1111-4111-8111-111111111111",
    session_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    product_area: "seo",
    page: "/seo",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "summer",
    first_utm_source: "instagram",
    first_utm_medium: "social",
    first_utm_campaign: "awareness",
    last_utm_source: "google",
    last_utm_medium: "cpc",
    last_utm_campaign: "summer",
    landing_page: "/seo",
    payload: {},
    user_agent: "Mozilla/5.0",
    ...overrides,
  };
}

const events: AnalyticsRow[] = [
  row("page_view", "2026-07-20T08:00:00.000Z"),
  row("cta_clicked", "2026-07-20T08:01:00.000Z"),
  row("form_started", "2026-07-20T08:02:00.000Z"),
  row("lead_submitted", "2026-07-20T08:03:00.000Z"),
  row("checkout_started", "2026-07-20T08:04:00.000Z", { value: 500_000 }),
  row("purchase_completed", "2026-07-20T08:05:00.000Z", {
    value: 500_000,
    currency: "IRR",
  }),
  row("page_left", "2026-07-20T08:06:00.000Z", {
    payload: { engagement_time_seconds: 120 },
  }),
  row("page_view", "2026-07-28T08:00:00.000Z", {
    session_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  }),
  row("feature_used", "2026-07-28T08:01:00.000Z", {
    session_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    payload: { feature_name: "seo_audit" },
  }),
];

describe("analytics report", () => {
  it("calculates decision-ready KPI and funnel metrics", () => {
    const report = buildAnalyticsReport(events, {
      from: "2026-07-20",
      to: "2026-07-28",
      attribution: "session",
    });
    expect(report.summary.visitors).toBe(1);
    expect(report.summary.sessions).toBe(2);
    expect(report.summary.leads).toBe(1);
    expect(report.summary.purchases).toBe(1);
    expect(report.summary.revenue).toBe(500_000);
    expect(report.summary.checkout_conversion_rate).toBe(100);
    expect(report.funnel.find((stage) => stage.key === "lead")?.count).toBe(1);
    expect(report.behavior.pages[0].avg_engagement_seconds).toBe(120);
    expect(report.behavior.features[0].key).toBe("seo_audit");
  });

  it("switches campaign filters between session, first and last attribution", () => {
    expect(
      applyAnalyticsFilters(events, { source: "google", attribution: "session" }),
    ).toHaveLength(events.length);
    expect(
      applyAnalyticsFilters(events, { source: "instagram", attribution: "first" }),
    ).toHaveLength(events.length);
    expect(
      applyAnalyticsFilters(events, { source: "instagram", attribution: "last" }),
    ).toHaveLength(0);
  });

  it("returns campaign performance, journeys, retention and quality evidence", () => {
    const report = buildAnalyticsReport(events, {
      from: "2026-07-20",
      to: "2026-07-28",
      attribution: "last",
    });
    expect(report.acquisition.sources[0]).toMatchObject({
      key: "google",
      leads: 1,
      purchases: 1,
      revenue: 500_000,
    });
    expect(report.behavior.journeys[0].path).toBe("/seo");
    expect(report.retention[0].week_1).toBe(100);
    expect(report.quality.event_id_pct).toBe(100);
    expect(report.quality.utm.paid_without_campaign).toBe(0);
  });

  it("detects malformed UTM combinations", () => {
    const bad = [
      row("page_view", "2026-07-20T08:00:00.000Z", {
        utm_source: null,
        utm_medium: "cpc",
        utm_campaign: null,
      }),
    ];
    const report = buildAnalyticsReport(bad, {
      from: "2026-07-20",
      to: "2026-07-20",
    });
    expect(report.quality.utm.medium_without_source).toBe(1);
    expect(report.quality.utm.paid_without_campaign).toBe(1);
  });

  it("uses server-verified purchases as revenue truth without double counting client success events", () => {
    const purchaseEvents = [
      row("purchase_completed", "2026-07-20T08:05:00.000Z", {
        event_origin: "client",
        value: 500_000,
      }),
      row("purchase_completed", "2026-07-20T08:05:01.000Z", {
        event_origin: "server",
        actor_id: "customer-1",
        session_id: null,
        visitor_id: null,
        value: 500_000,
      }),
    ];
    const report = buildAnalyticsReport(purchaseEvents, {
      from: "2026-07-20",
      to: "2026-07-20",
    });
    expect(report.summary.purchases).toBe(1);
    expect(report.summary.revenue).toBe(500_000);
    expect(report.quality.server_verified_purchase_pct).toBe(100);
  });
});

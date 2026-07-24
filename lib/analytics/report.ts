export type AttributionModel = "session" | "first" | "last";

export type AnalyticsFilters = {
  from?: string;
  to?: string;
  product?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  page?: string;
  event?: string;
  attribution?: AttributionModel;
};

export type AnalyticsRow = Record<string, unknown> & {
  created_at: string;
  event_name?: string | null;
  canonical_event_name?: string | null;
  visitor_id?: string | null;
  session_id?: string | null;
  actor_id?: string | null;
  account_id?: string | null;
  event_origin?: string | null;
  product_area?: string | null;
  page?: string | null;
  payload?: Record<string, unknown> | null;
};

type MetricRow = {
  key: string;
  visitors: number;
  sessions: number;
  events: number;
  leads: number;
  activations: number;
  checkouts: number;
  purchases: number;
  revenue: number;
  conversion_rate: number;
};

const ENGAGEMENT_EVENTS = new Set([
  "cta_clicked",
  "internal_link_clicked",
  "outbound_link_clicked",
  "scroll_depth",
  "form_started",
  "form_submit_attempted",
  "feature_used",
  "first_key_action_completed",
  "phone_clicked",
  "whatsapp_clicked",
]);

const FUNNEL_STAGES = [
  { key: "sessions", label: "نشست", test: (event: string) => event === "page_view" },
  { key: "engaged", label: "درگیرشده", test: (event: string) => ENGAGEMENT_EVENTS.has(event) },
  { key: "cta", label: "کلیک CTA", test: (event: string) => event === "cta_clicked" },
  { key: "form_start", label: "شروع فرم", test: (event: string) => event === "form_started" },
  { key: "lead", label: "لید", test: (event: string) => event === "lead_submitted" },
  { key: "signup", label: "ثبت‌نام", test: (event: string) => event === "signup_completed" },
  {
    key: "activation",
    label: "فعال‌سازی",
    test: (event: string) => event === "first_key_action_completed",
  },
  {
    key: "checkout",
    label: "شروع پرداخت",
    test: (event: string) => event === "checkout_started",
  },
  {
    key: "purchase",
    label: "خرید",
    test: (event: string) => event === "purchase_completed",
  },
] as const;

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function number(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function eventName(row: AnalyticsRow): string {
  return text(row.canonical_event_name) || text(row.event_name);
}

function identity(row: AnalyticsRow, key: "session_id" | "visitor_id"): string {
  const stableActor = key === "visitor_id" ? text(row.actor_id) : "";
  return text(row[key]) || stableActor || `unknown:${key}:${text(row.event_id) || text(row.created_at)}`;
}

function percent(numerator: number, denominator: number): number {
  return denominator > 0 ? Math.round((numerator / denominator) * 1000) / 10 : 0;
}

function startOfWeek(date: Date): string {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = copy.getUTCDay();
  copy.setUTCDate(copy.getUTCDate() - (day === 0 ? 6 : day - 1));
  return copy.toISOString().slice(0, 10);
}

function dayDiff(a: string, b: string): number {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

export function attributionFields(model: AttributionModel) {
  const prefix = model === "session" ? "" : `${model}_`;
  return {
    source: `${prefix}utm_source`,
    medium: `${prefix}utm_medium`,
    campaign: `${prefix}utm_campaign`,
    content: `${prefix}utm_content`,
    term: `${prefix}utm_term`,
  };
}

export function applyAnalyticsFilters(
  events: AnalyticsRow[],
  filters: AnalyticsFilters,
): AnalyticsRow[] {
  const fields = attributionFields(filters.attribution || "session");
  const fromMs = filters.from ? new Date(`${filters.from}T00:00:00.000Z`).getTime() : -Infinity;
  const toMs = filters.to ? new Date(`${filters.to}T23:59:59.999Z`).getTime() : Infinity;
  return events.filter((row) => {
    const created = new Date(row.created_at).getTime();
    return (
      created >= fromMs &&
      created <= toMs &&
      (!filters.product || text(row.product_area) === filters.product) &&
      (!filters.source || (text(row[fields.source]) || "(direct)") === filters.source) &&
      (!filters.medium || (text(row[fields.medium]) || "(none)") === filters.medium) &&
      (!filters.campaign || (text(row[fields.campaign]) || "(none)") === filters.campaign) &&
      (!filters.page || text(row.page) === filters.page) &&
      (!filters.event || eventName(row) === filters.event)
    );
  });
}

function metricRows(
  events: AnalyticsRow[],
  keyFor: (row: AnalyticsRow) => string,
  limit = 50,
): MetricRow[] {
  const groups = new Map<string, AnalyticsRow[]>();
  for (const event of events) {
    const key = keyFor(event) || "(none)";
    groups.set(key, [...(groups.get(key) || []), event]);
  }
  return Array.from(groups.entries())
    .map(([key, rows]) => {
      const visitors = new Set(rows.map((row) => identity(row, "visitor_id"))).size;
      const sessions = new Set(rows.map((row) => identity(row, "session_id"))).size;
      const leads = rows.filter((row) => eventName(row) === "lead_submitted").length;
      const activations = rows.filter((row) => eventName(row) === "first_key_action_completed").length;
      const checkouts = rows.filter((row) => eventName(row) === "checkout_started").length;
      const purchases = rows.filter((row) => eventName(row) === "purchase_completed").length;
      const revenue = rows
        .filter((row) => eventName(row) === "purchase_completed")
        .reduce((sum, row) => sum + number(row.value), 0);
      return {
        key,
        visitors,
        sessions,
        events: rows.length,
        leads,
        activations,
        checkouts,
        purchases,
        revenue,
        conversion_rate: percent(leads + purchases, visitors),
      };
    })
    .sort((a, b) => b.sessions - a.sessions || b.revenue - a.revenue)
    .slice(0, limit);
}

function buildFunnel(events: AnalyticsRow[]) {
  const stageSets = FUNNEL_STAGES.map(() => new Set<string>());
  for (const row of events) {
    const event = eventName(row);
    const session = identity(row, "session_id");
    FUNNEL_STAGES.forEach((stage, index) => {
      if (stage.test(event)) stageSets[index].add(session);
    });
  }
  return FUNNEL_STAGES.map((stage, index) => {
    const count = stageSets[index].size;
    const previous = index > 0 ? stageSets[index - 1].size : count;
    const first = stageSets[0].size;
    return {
      key: stage.key,
      label: stage.label,
      count,
      from_previous_rate: index === 0 ? 100 : percent(count, previous),
      from_session_rate: percent(count, first),
      drop_off: index === 0 ? 0 : Math.max(0, previous - count),
    };
  });
}

function buildTrend(events: AnalyticsRow[], from?: string, to?: string) {
  const start = from
    ? new Date(`${from}T00:00:00.000Z`)
    : new Date(Date.now() - 29 * 86_400_000);
  const end = to ? new Date(`${to}T00:00:00.000Z`) : new Date();
  const rows: Array<{
    date: string;
    visitors: Set<string>;
    sessions: Set<string>;
    events: number;
    leads: number;
    activations: number;
    purchases: number;
    revenue: number;
    errors: number;
  }> = [];
  for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    rows.push({
      date: cursor.toISOString().slice(0, 10),
      visitors: new Set(),
      sessions: new Set(),
      events: 0,
      leads: 0,
      activations: 0,
      purchases: 0,
      revenue: 0,
      errors: 0,
    });
  }
  const byDate = new Map(rows.map((row) => [row.date, row]));
  for (const event of events) {
    const row = byDate.get(event.created_at.slice(0, 10));
    if (!row) continue;
    const name = eventName(event);
    row.visitors.add(identity(event, "visitor_id"));
    row.sessions.add(identity(event, "session_id"));
    row.events += 1;
    if (name === "lead_submitted") row.leads += 1;
    if (name === "first_key_action_completed") row.activations += 1;
    if (name === "purchase_completed") {
      row.purchases += 1;
      row.revenue += number(event.value);
    }
    if (name === "client_error") row.errors += 1;
  }
  return rows.map((row) => ({
    ...row,
    visitors: row.visitors.size,
    sessions: row.sessions.size,
  }));
}

function buildJourneys(events: AnalyticsRow[]) {
  const sessions = new Map<string, AnalyticsRow[]>();
  const convertedSessions = new Set<string>();
  for (const event of events) {
    const session = identity(event, "session_id");
    if (["lead_submitted", "purchase_completed"].includes(eventName(event))) {
      convertedSessions.add(session);
    }
    if (eventName(event) !== "page_view" || !event.page) continue;
    sessions.set(session, [...(sessions.get(session) || []), event]);
  }
  const paths = new Map<string, { count: number; converted: number }>();
  for (const rows of sessions.values()) {
    rows.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const pages: string[] = [];
    for (const row of rows) {
      const page = text(row.page);
      if (page && pages.at(-1) !== page) pages.push(page);
    }
    const key = pages.slice(0, 6).join(" → ");
    if (!key) continue;
    const converted = convertedSessions.has(identity(rows[0], "session_id"));
    const current = paths.get(key) || { count: 0, converted: 0 };
    current.count += 1;
    current.converted += converted ? 1 : 0;
    paths.set(key, current);
  }
  return Array.from(paths.entries())
    .map(([path, value]) => ({
      path,
      sessions: value.count,
      conversions: value.converted,
      conversion_rate: percent(value.converted, value.count),
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 30);
}

function buildPagePerformance(events: AnalyticsRow[]) {
  const pageGroups = new Map<string, AnalyticsRow[]>();
  for (const event of events) {
    const page = text(event.page);
    if (!page) continue;
    pageGroups.set(page, [...(pageGroups.get(page) || []), event]);
  }
  return Array.from(pageGroups.entries())
    .map(([page, rows]) => {
      const sessions = new Set(rows.map((row) => identity(row, "session_id")));
      const visitors = new Set(rows.map((row) => identity(row, "visitor_id")));
      const ctas = rows.filter((row) => eventName(row) === "cta_clicked").length;
      const leads = rows.filter((row) => eventName(row) === "lead_submitted").length;
      const exits = rows.filter((row) => eventName(row) === "page_left").length;
      const engagementValues = rows
        .filter((row) => eventName(row) === "page_left")
        .map((row) => number(row.payload?.engagement_time_seconds));
      return {
        page,
        visitors: visitors.size,
        sessions: sessions.size,
        ctas,
        leads,
        exits,
        avg_engagement_seconds: engagementValues.length
          ? Math.round(engagementValues.reduce((a, b) => a + b, 0) / engagementValues.length)
          : 0,
        lead_rate: percent(leads, sessions.size),
      };
    })
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 50);
}

function buildRetention(events: AnalyticsRow[]) {
  const visitorDays = new Map<string, Set<string>>();
  for (const event of events) {
    if (!event.visitor_id) continue;
    const visitor = text(event.visitor_id);
    const days = visitorDays.get(visitor) || new Set<string>();
    days.add(event.created_at.slice(0, 10));
    visitorDays.set(visitor, days);
  }

  const cohorts = new Map<string, { visitors: number; retained: number[] }>();
  for (const daysSet of visitorDays.values()) {
    const days = Array.from(daysSet).sort();
    const first = days[0];
    if (!first) continue;
    const cohort = startOfWeek(new Date(`${first}T00:00:00.000Z`));
    const value = cohorts.get(cohort) || { visitors: 0, retained: [0, 0, 0, 0, 0] };
    value.visitors += 1;
    value.retained[0] += 1;
    for (let week = 1; week <= 4; week++) {
      if (days.some((day) => {
        const diff = dayDiff(first, day);
        return diff >= week * 7 && diff < (week + 1) * 7;
      })) {
        value.retained[week] += 1;
      }
    }
    cohorts.set(cohort, value);
  }
  return Array.from(cohorts.entries())
    .map(([cohort, value]) => ({
      cohort,
      visitors: value.visitors,
      week_0: 100,
      week_1: percent(value.retained[1], value.visitors),
      week_2: percent(value.retained[2], value.visitors),
      week_3: percent(value.retained[3], value.visitors),
      week_4: percent(value.retained[4], value.visitors),
    }))
    .sort((a, b) => b.cohort.localeCompare(a.cohort))
    .slice(0, 16);
}

function buildFeatureUsage(events: AnalyticsRow[]) {
  const featureEvents = events.filter((row) =>
    ["feature_used", "first_key_action_completed", "free_tool_event"].includes(eventName(row)),
  );
  return metricRows(featureEvents, (row) =>
    text(row.payload?.feature_name) ||
    text(row.payload?.tool) ||
    text(row.payload?.action_type) ||
    eventName(row),
  );
}

function buildErrors(events: AnalyticsRow[]) {
  return metricRows(
    events.filter((row) => eventName(row) === "client_error"),
    (row) => `${text(row.product_area) || "unknown"} / ${text(row.payload?.error_type) || "unknown"}`,
  );
}

function deviceType(userAgent: string): string {
  if (/ipad|tablet/i.test(userAgent)) return "tablet";
  if (/mobile|android|iphone/i.test(userAgent)) return "mobile";
  return userAgent ? "desktop" : "unknown";
}

function buildUtmQuality(events: AnalyticsRow[], fields: ReturnType<typeof attributionFields>) {
  let campaignWithoutSource = 0;
  let mediumWithoutSource = 0;
  let sourceWithoutMedium = 0;
  let paidWithoutCampaign = 0;
  let nonNormalized = 0;
  let attributed = 0;
  for (const row of events) {
    const source = text(row[fields.source]);
    const medium = text(row[fields.medium]);
    const campaign = text(row[fields.campaign]);
    if (source || medium || campaign) attributed += 1;
    if (campaign && !source) campaignWithoutSource += 1;
    if (medium && !source) mediumWithoutSource += 1;
    if (source && !medium) sourceWithoutMedium += 1;
    if (/cpc|ppc|paid|display|affiliate/.test(medium) && !campaign) paidWithoutCampaign += 1;
    if ([source, medium, campaign].some((value) => value && /[A-Z\s-]/.test(value))) nonNormalized += 1;
  }
  return {
    attributed_event_pct: percent(attributed, events.length),
    unattributed_events: events.length - attributed,
    campaign_without_source: campaignWithoutSource,
    medium_without_source: mediumWithoutSource,
    source_without_medium: sourceWithoutMedium,
    paid_without_campaign: paidWithoutCampaign,
    non_normalized: nonNormalized,
  };
}

function completeness(events: AnalyticsRow[], key: string): number {
  return percent(
    events.filter((row) => row[key] !== null && row[key] !== undefined && row[key] !== "").length,
    events.length,
  );
}

function duplicateStats(events: AnalyticsRow[]) {
  const ordered = [...events].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const lastSeen = new Map<string, number>();
  let duplicates = 0;
  for (const row of ordered) {
    const key = [
      text(row.session_id),
      eventName(row),
      text(row.page),
      text(row.location),
    ].join("|");
    const at = new Date(row.created_at).getTime();
    const previous = lastSeen.get(key);
    if (previous !== undefined && at - previous < 2_000) duplicates += 1;
    lastSeen.set(key, at);
  }
  return {
    duplicate_events: duplicates,
    duplicate_event_pct: percent(duplicates, events.length),
  };
}

function sortedOptions(events: AnalyticsRow[], key: string, fallback = ""): string[] {
  return Array.from(new Set(events.map((row) => text(row[key]) || fallback).filter(Boolean))).sort();
}

function preferServerVerifiedPurchases(events: AnalyticsRow[]): AnalyticsRow[] {
  const verifiedProducts = new Set(
    events
      .filter(
        (row) =>
          eventName(row) === "purchase_completed" &&
          text(row.event_origin) === "server",
      )
      .map((row) => text(row.product_area) || "unknown"),
  );
  if (!verifiedProducts.size) return events;
  return events.filter(
    (row) =>
      eventName(row) !== "purchase_completed" ||
      text(row.event_origin) === "server" ||
      !verifiedProducts.has(text(row.product_area) || "unknown"),
  );
}

export function buildAnalyticsReport(
  allEvents: AnalyticsRow[],
  filters: AnalyticsFilters,
) {
  const attribution = filters.attribution || "session";
  const fields = attributionFields(attribution);
  const filteredEvents = applyAnalyticsFilters(allEvents, { ...filters, attribution });
  const events = preferServerVerifiedPurchases(filteredEvents);
  const visitors = new Set(events.map((row) => identity(row, "visitor_id"))).size;
  const sessions = new Set(events.map((row) => identity(row, "session_id"))).size;
  const leads = events.filter((row) => eventName(row) === "lead_submitted").length;
  const activations = events.filter((row) => eventName(row) === "first_key_action_completed").length;
  const checkouts = events.filter((row) => eventName(row) === "checkout_started").length;
  const purchases = events.filter((row) => eventName(row) === "purchase_completed").length;
  const revenue = events
    .filter((row) => eventName(row) === "purchase_completed")
    .reduce((sum, row) => sum + number(row.value), 0);
  const engagedSessions = new Set(
    events.filter((row) => ENGAGEMENT_EVENTS.has(eventName(row))).map((row) => identity(row, "session_id")),
  ).size;
  const errorSessions = new Set(
    events.filter((row) => eventName(row) === "client_error").map((row) => identity(row, "session_id")),
  ).size;

  return {
    filters: { ...filters, attribution },
    summary: {
      events: events.length,
      visitors,
      sessions,
      engaged_sessions: engagedSessions,
      leads,
      activations,
      checkouts,
      purchases,
      revenue,
      engagement_rate: percent(engagedSessions, sessions),
      lead_conversion_rate: percent(leads, visitors),
      activation_rate: percent(activations, visitors),
      checkout_conversion_rate: percent(purchases, checkouts),
      error_free_session_rate: 100 - percent(errorSessions, sessions),
      revenue_per_visitor: visitors ? Math.round(revenue / visitors) : 0,
    },
    trend: buildTrend(events, filters.from, filters.to),
    funnel: buildFunnel(events),
    products: metricRows(events, (row) => text(row.product_area) || "unknown"),
    funnels_by_product: sortedOptions(events, "product_area").map((product) => ({
      product,
      funnel: buildFunnel(events.filter((row) => text(row.product_area) === product)),
    })),
    acquisition: {
      sources: metricRows(events, (row) => text(row[fields.source]) || "(direct)"),
      mediums: metricRows(events, (row) => text(row[fields.medium]) || "(none)"),
      campaigns: metricRows(events, (row) => text(row[fields.campaign]) || "(none)"),
      contents: metricRows(events, (row) => text(row[fields.content]) || "(none)"),
      terms: metricRows(events, (row) => text(row[fields.term]) || "(none)"),
      landing_pages: metricRows(events, (row) => text(row.landing_page) || text(row.page) || "(unknown)"),
    },
    behavior: {
      journeys: buildJourneys(events),
      pages: buildPagePerformance(events),
      features: buildFeatureUsage(events),
      events: metricRows(events, (row) => eventName(row)),
      devices: metricRows(events, (row) => deviceType(text(row.user_agent))),
      errors: buildErrors(events),
    },
    retention: buildRetention(events),
    quality: {
      event_id_pct: completeness(events, "event_id"),
      visitor_id_pct: completeness(events, "visitor_id"),
      session_id_pct: completeness(events, "session_id"),
      product_area_pct: completeness(events, "product_area"),
      page_pct: completeness(events, "page"),
      canonical_event_pct: completeness(events, "canonical_event_name"),
      server_verified_purchase_pct: percent(
        events.filter(
          (row) =>
            eventName(row) === "purchase_completed" &&
            text(row.event_origin) === "server",
        ).length,
        purchases,
      ),
      ...duplicateStats(events),
      utm: buildUtmQuality(events, fields),
    },
    options: {
      products: sortedOptions(allEvents, "product_area"),
      sources: sortedOptions(allEvents, fields.source, "(direct)"),
      mediums: sortedOptions(allEvents, fields.medium, "(none)"),
      campaigns: sortedOptions(allEvents, fields.campaign, "(none)"),
      pages: sortedOptions(allEvents, "page"),
      events: Array.from(new Set(allEvents.map(eventName).filter(Boolean))).sort(),
    },
    recent_events: events.slice(0, 100).map((row) => ({
      created_at: row.created_at,
      event: eventName(row),
      original_event: text(row.event_name),
      product: text(row.product_area) || "unknown",
      page: text(row.page) || "-",
      source: text(row[fields.source]) || "(direct)",
      medium: text(row[fields.medium]) || "(none)",
      campaign: text(row[fields.campaign]) || "(none)",
      session_id: text(row.session_id) || "-",
      visitor_id: text(row.visitor_id) || "-",
      value: number(row.value),
      currency: text(row.currency),
      origin: text(row.event_origin) || "client",
    })),
  };
}

export type AnalyticsReport = ReturnType<typeof buildAnalyticsReport>;

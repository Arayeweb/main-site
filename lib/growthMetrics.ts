import { isConfirmedQualifiedStatus } from "@/lib/leadScoring";

export type GrowthPeriod = "7d" | "30d";

const DAY_MS = 24 * 60 * 60 * 1000;

export function periodToMs(period: GrowthPeriod): number {
  return period === "30d" ? 30 * DAY_MS : 7 * DAY_MS;
}

export function inPeriod(iso: string | null | undefined, sinceMs: number, now = Date.now()): boolean {
  if (!iso) return false;
  return now - new Date(iso).getTime() < sinceMs;
}

export function countInPeriod(
  items: Record<string, unknown>[],
  dateKey: string,
  sinceMs: number,
  now = Date.now()
): number {
  return items.filter((item) => inPeriod(item[dateKey] as string, sinceMs, now)).length;
}

export function sumInPeriod(
  items: Record<string, unknown>[],
  amountKey: string,
  dateKey: string,
  sinceMs: number,
  now = Date.now()
): number {
  let total = 0;
  for (const item of items) {
    if (!inPeriod(item[dateKey] as string, sinceMs, now)) continue;
    total += Number(item[amountKey]) || 0;
  }
  return total;
}

export function uniqueVisitorsInPeriod(
  views: Record<string, unknown>[],
  sinceMs: number,
  now = Date.now()
): number {
  const ids = new Set<string>();
  for (const v of views) {
    if (!inPeriod(v.created_at as string, sinceMs, now)) continue;
    const id = v.visitor_id as string | null;
    if (id) ids.add(id);
  }
  return ids.size;
}

export function buildTrend(
  items: Record<string, unknown>[],
  dateKey: string,
  days: number,
  now = Date.now()
): { date: string; count: number }[] {
  const series: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * DAY_MS);
    series.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  for (const item of items) {
    const raw = item[dateKey] as string | null;
    if (!raw) continue;
    const date = new Date(raw).toISOString().slice(0, 10);
    const entry = series.find((x) => x.date === date);
    if (entry) entry.count++;
  }
  return series;
}

export function buildRevenueTrend(
  invoices: Record<string, unknown>[],
  fastweb: Record<string, unknown>[],
  aiOrders: Record<string, unknown>[],
  days: number,
  now = Date.now()
): { date: string; amount: number }[] {
  const series: { date: string; amount: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * DAY_MS);
    series.push({ date: d.toISOString().slice(0, 10), amount: 0 });
  }
  const add = (iso: string | null | undefined, amount: number) => {
    if (!iso) return;
    const date = new Date(iso).toISOString().slice(0, 10);
    const entry = series.find((x) => x.date === date);
    if (entry) entry.amount += amount;
  };
  for (const inv of invoices) {
    if (inv.status !== "paid" || inv.kind !== "invoice") continue;
    if ((inv.currency as string) !== "IRR") continue;
    add(inv.paid_at as string, Number(inv.grand_total) || 0);
  }
  for (const o of fastweb) {
    if (o.payment_status !== "paid") continue;
    add(o.paid_at as string, Number(o.amount_toman) || 0);
  }
  for (const o of aiOrders) {
    if (o.status !== "paid") continue;
    add(o.created_at as string, Number(o.amount_toman) || 0);
  }
  return series;
}

export function computePipeline(leads: Record<string, unknown>[]) {
  const pipeline = { new: 0, contacted: 0, qualified: 0, proposal: 0, won: 0, lost: 0 };
  for (const l of leads) {
    const s = (l.crm_status as string) || "new";
    if (s in pipeline) pipeline[s as keyof typeof pipeline]++;
  }
  return pipeline;
}

export function computeFunnel(input: {
  visitors: number;
  leads: number;
  qualified: number;
  calls: number;
  proposals: number;
  sales: number;
  delivered: number;
  referrals: number;
  repeat: number;
}) {
  const stages = [
    { key: "traffic", label: "ترافیک", count: input.visitors },
    { key: "lead", label: "لید", count: input.leads },
    { key: "qualified", label: "واجد شرایط", count: input.qualified },
    { key: "call", label: "تماس", count: input.calls },
    { key: "proposal", label: "پیشنهاد", count: input.proposals },
    { key: "sale", label: "فروش", count: input.sales },
    { key: "delivery", label: "تحویل", count: input.delivered },
    { key: "referral", label: "معرفی", count: input.referrals },
    { key: "repeat", label: "تکرار", count: input.repeat },
  ];
  return stages.map((stage, i) => {
    const prev = i > 0 ? stages[i - 1].count : 0;
    const rate = prev > 0 ? Math.round((stage.count / prev) * 100) : 0;
    return { ...stage, conversionFromPrev: rate };
  });
}

export function filterLeadsByProduct(leads: Record<string, unknown>[], product: string) {
  const prefixes: Record<string, string[]> = {
    fastweb: ["fastweb"],
    doctors: ["doctors"],
    seo: ["seo", "free_seo"],
    ai: ["ai_", "arena"],
  };
  const keys = prefixes[product] || [];
  return leads.filter((l) => {
    const source = ((l.source as string) || "").toLowerCase();
    const page = ((l.page as string) || "").toLowerCase();
    return keys.some((k) => source.startsWith(k) || page.startsWith(k));
  });
}

export function filterViewsByProduct(views: Record<string, unknown>[], product: string) {
  const prefixes: Record<string, string[]> = {
    fastweb: ["/fastweb", "/s/"],
    doctors: ["/doctors"],
    seo: ["/seo", "/free-seo-audit"],
    ai: ["/ai"],
  };
  const keys = prefixes[product] || [];
  return views.filter((v) => {
    const page = ((v.page as string) || "").toLowerCase();
    return keys.some((k) => page.startsWith(k));
  });
}

export function qualifiedLeadsInPeriod(leads: Record<string, unknown>[], sinceMs: number, now = Date.now()) {
  return leads.filter((l) => {
    if (!isConfirmedQualifiedStatus(l.crm_status as string)) return false;
    const at = (l.qualified_at as string) || (l.created_at as string);
    return inPeriod(at, sinceMs, now);
  }).length;
}

export function wonLeadsInPeriod(leads: Record<string, unknown>[], sinceMs: number, now = Date.now()) {
  return leads.filter((l) => {
    if (l.crm_status !== "won") return false;
    const at = (l.won_at as string) || (l.created_at as string);
    return inPeriod(at, sinceMs, now);
  }).length;
}

export function avgFastWebTtdHours(orders: Record<string, unknown>[]): number | null {
  const deltas: number[] = [];
  for (const o of orders) {
    if (o.payment_status !== "paid" || o.fulfillment_status !== "published") continue;
    const paid = o.paid_at as string | null;
    const published = o.published_at as string | null;
    if (!paid || !published) continue;
    deltas.push((new Date(published).getTime() - new Date(paid).getTime()) / (1000 * 60 * 60));
  }
  if (!deltas.length) return null;
  return Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length);
}

export function fastwebActivationRate(orders: Record<string, unknown>[]): number {
  const paid = orders.filter((o) => o.payment_status === "paid").length;
  const published = orders.filter((o) => o.fulfillment_status === "published").length;
  return paid > 0 ? Math.round((published / paid) * 100) : 0;
}

export function doctorsConversionRate(leads: Record<string, unknown>[], views: Record<string, unknown>[]): number {
  const doctorLeads = filterLeadsByProduct(leads, "doctors").length;
  const doctorViews = uniqueVisitorsInPeriod(filterViewsByProduct(views, "doctors"), 30 * DAY_MS);
  return doctorViews > 0 ? Math.round((doctorLeads / doctorViews) * 100) : 0;
}

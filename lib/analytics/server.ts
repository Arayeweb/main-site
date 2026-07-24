import "server-only";

import {
  ANALYTICS_SCHEMA_VERSION,
  canonicalEventName,
  funnelStageForEvent,
} from "@/lib/analytics/core";
import { getSupabaseAdmin } from "@/lib/supabase";

const FORBIDDEN_KEYS =
  /^(email|phone|mobile|contact|name|full_name|customer_name|password|token|secret|message|query|prompt)$/i;

function safeText(value: unknown, max = 200): string | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text ? text.slice(0, max) : null;
}

function safeProperties(
  properties: Record<string, unknown> | undefined,
): Record<string, string | number | boolean | null> | null {
  if (!properties) return null;
  const safe: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (FORBIDDEN_KEYS.test(key)) continue;
    const safeKey = key.slice(0, 80);
    if (typeof value === "string") safe[safeKey] = value.slice(0, 500);
    else if (typeof value === "number" && Number.isFinite(value)) safe[safeKey] = value;
    else if (typeof value === "boolean" || value === null) safe[safeKey] = value;
  }
  return Object.keys(safe).length ? safe : null;
}

export async function trackServerAnalyticsEvent(input: {
  event: string;
  dedupeKey: string;
  productArea: string;
  page: string;
  actorId?: string | number | null;
  accountId?: string | number | null;
  value?: number | null;
  currency?: string | null;
  source?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  properties?: Record<string, unknown>;
}): Promise<boolean> {
  const canonicalName = canonicalEventName(input.event);
  const numericValue = Number(input.value);
  const { error } = await getSupabaseAdmin().from("analytics_events").insert({
    event_name: canonicalName,
    canonical_event_name: canonicalName,
    schema_version: ANALYTICS_SCHEMA_VERSION,
    product_area: safeText(input.productArea, 80),
    funnel_stage: funnelStageForEvent(canonicalName),
    page: safeText(input.page, 300),
    actor_id: safeText(input.actorId, 120),
    account_id: safeText(input.accountId, 120),
    source: safeText(input.source, 200) || "server_verified",
    utm_source: safeText(input.utmSource, 200),
    utm_medium: safeText(input.utmMedium, 200),
    utm_campaign: safeText(input.utmCampaign, 200),
    last_utm_source: safeText(input.utmSource, 200),
    last_utm_medium: safeText(input.utmMedium, 200),
    last_utm_campaign: safeText(input.utmCampaign, 200),
    value: Number.isFinite(numericValue) ? numericValue : null,
    currency: safeText(input.currency, 12),
    payload: safeProperties(input.properties),
    event_origin: "server",
    dedupe_key: safeText(input.dedupeKey, 240),
  });

  if (!error || error.code === "23505") return true;
  console.error("[analytics/server] insert failed:", error.message);
  return false;
}

export function tomanToIrr(amountToman: unknown): number | null {
  const amount = Number(amountToman);
  return Number.isFinite(amount) ? amount * 10 : null;
}

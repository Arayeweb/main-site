import { NextRequest, NextResponse } from "next/server";
import {
  canonicalEventName,
  funnelStageForEvent,
  productAreaFromPath,
} from "@/lib/analytics/core";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function str(v: unknown, max = 500): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

const KNOWN_KEYS = new Set([
  "event",
  "event_id",
  "canonical_event_name",
  "schema_version",
  "visitor_id",
  "session_id",
  "product_area",
  "funnel_stage",
  "client_timestamp",
  "referrer",
  "page",
  "source",
  "location",
  "package",
  "promo_code",
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
  "click_id_type",
  "has_click_id",
]);

const FORBIDDEN_KEYS =
  /^(email|phone|mobile|contact|name|full_name|customer_name|password|token|secret|message|query|prompt)$/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EVENT_RE = /^[a-z0-9][a-z0-9_]{0,119}$/;

function uuid(v: unknown): string | null {
  const value = str(v, 36);
  return value && UUID_RE.test(value) ? value : null;
}

function safeExtraValue(value: unknown): string | number | boolean | null | undefined {
  if (typeof value === "string") return value.slice(0, 500);
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "boolean") return value;
  if (value === null) return null;
  return undefined;
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const eventName = str(body.event, 120);
  if (!eventName || !EVENT_RE.test(eventName)) {
    return NextResponse.json({ ok: false, error: "invalid_event" }, { status: 400 });
  }

  const extra: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (!KNOWN_KEYS.has(k) && !FORBIDDEN_KEYS.test(k) && v !== undefined && v !== "") {
      const safeValue = safeExtraValue(v);
      if (safeValue !== undefined) extra[k.slice(0, 80)] = safeValue;
    }
  }

  const canonicalName = canonicalEventName(eventName);
  const page = str(body.page, 200);
  const rawValue = Number(body.value);
  const row = {
    event_id: uuid(body.event_id),
    event_name: eventName,
    canonical_event_name: canonicalName,
    schema_version: Math.max(1, Math.min(Number(body.schema_version) || 1, 100)),
    visitor_id: uuid(body.visitor_id),
    session_id: uuid(body.session_id),
    product_area: str(body.product_area, 80) || productAreaFromPath(page || "/"),
    funnel_stage: funnelStageForEvent(canonicalName),
    client_ts: str(body.client_timestamp, 40),
    page,
    source: str(body.source, 200),
    location: str(body.location, 200),
    package: str(body.package, 120),
    promo_code: str(body.promo_code, 80),
    value: Number.isFinite(rawValue) ? rawValue : null,
    currency: str(body.currency, 12),
    utm_source: str(body.utm_source, 200),
    utm_medium: str(body.utm_medium, 200),
    utm_campaign: str(body.utm_campaign, 200),
    utm_content: str(body.utm_content, 200),
    utm_term: str(body.utm_term, 200),
    first_utm_source: str(body.first_utm_source, 200),
    first_utm_medium: str(body.first_utm_medium, 200),
    first_utm_campaign: str(body.first_utm_campaign, 200),
    first_utm_content: str(body.first_utm_content, 200),
    first_utm_term: str(body.first_utm_term, 200),
    last_utm_source: str(body.last_utm_source, 200),
    last_utm_medium: str(body.last_utm_medium, 200),
    last_utm_campaign: str(body.last_utm_campaign, 200),
    last_utm_content: str(body.last_utm_content, 200),
    last_utm_term: str(body.last_utm_term, 200),
    landing_page: str(body.landing_page, 300),
    first_landing_page: str(body.first_landing_page, 300),
    initial_referrer: str(body.initial_referrer, 500),
    traffic_type: str(body.traffic_type, 40),
    click_id_type: str(body.click_id_type, 30),
    has_click_id: body.has_click_id === true,
    event_origin: "client",
    payload: Object.keys(extra).length ? extra : null,
    referrer: str(body.referrer, 500),
    user_agent: req.headers.get("user-agent")?.slice(0, 500) || null,
  };

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("analytics_events").insert(row);
    if (error) {
      console.error("[api/analytics/event] db error:", error.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
  } catch (e) {
    console.error("[api/analytics/event] error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

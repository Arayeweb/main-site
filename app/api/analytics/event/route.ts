import { NextRequest, NextResponse } from "next/server";
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
  "page",
  "source",
  "location",
  "package",
  "promo_code",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
]);

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
  if (!eventName) {
    return NextResponse.json({ ok: false, error: "missing_event" }, { status: 400 });
  }

  const extra: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (!KNOWN_KEYS.has(k) && v !== undefined && v !== null && v !== "") {
      extra[k] = v;
    }
  }

  const row = {
    event_name: eventName,
    page: str(body.page, 200),
    source: str(body.source, 200),
    location: str(body.location, 200),
    package: str(body.package, 120),
    promo_code: str(body.promo_code, 80),
    utm_source: str(body.utm_source, 200),
    utm_medium: str(body.utm_medium, 200),
    utm_campaign: str(body.utm_campaign, 200),
    utm_content: str(body.utm_content, 200),
    utm_term: str(body.utm_term, 200),
    payload: Object.keys(extra).length ? extra : null,
    user_agent: req.headers.get("user-agent")?.slice(0, 500) || null,
  };

  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("analytics_events").insert(row);
  } catch (e) {
    console.error("[api/analytics/event] error:", e);
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// rate-limit ساده per-IP — جلوگیری از flood
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;
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

  // هر بازدید ثبت می‌شود؛ utm_source اختیاری است (برای بازدیدهای بدون کمپین null می‌ماند)
  const utmSource = str(body.utm_source, 200);

  // visitor_id باید UUID معتبر باشد
  const rawVisitorId = str(body.visitor_id, 36);
  const visitorId =
    rawVisitorId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      rawVisitorId
    )
      ? rawVisitorId
      : null;

  const row = {
    page: str(body.page, 200),
    utm_source: utmSource,
    utm_medium: str(body.utm_medium, 200),
    utm_campaign: str(body.utm_campaign, 200),
    utm_content: str(body.utm_content, 200),
    utm_term: str(body.utm_term, 200),
    referrer: str(body.referrer, 500),
    user_agent: req.headers.get("user-agent")?.slice(0, 500) || null,
    visitor_id: visitorId,
  };

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("page_views").insert(row);
    if (error) {
      console.error("[api/pageview] db error:", error.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
  } catch (e) {
    console.error("[api/pageview] error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { normalizeContact } from "@/lib/validateContact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------- rate-limit ساده در حافظه (per-IP) ----------
// برای جلوگیری از flood کافی است. روی استقرار چندنمونه‌ای، با جدول/Redis جایگزین شود.
const WINDOW_MS = 60_000; // یک دقیقه
const MAX_PER_WINDOW = 8;
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

function pageFromPath(p: unknown): string | null {
  const s = String(p || "");
  const m = s.match(/(index|clinic|doctors|restaurant|spaces|googlesabt|academy|konkour|seo)/);
  if (m) return m[1];
  if (s === "/" || s === "") return "index";
  return null;
}

function str(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, 2000) : null;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  // honeypot: فیلد مخفی company اگر پر بود، بات است → بی‌صدا موفقیت برگردان (تله را لو نده)
  if (str(body.company)) {
    return NextResponse.json({ ok: true });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  // اعتبارسنجی تماس سمت سرور (نه فقط فرانت)
  const contact = normalizeContact(String(body.contact || ""));
  if (contact.kind === "invalid") {
    return NextResponse.json({ ok: false, error: "invalid_contact" }, { status: 422 });
  }

  const source = str(body.source) || "unknown";
  const row = {
    source,
    page: pageFromPath(body.page),
    name: str(body.name),
    contact: contact.value,
    goal: str(body.goal),
    budget: str(body.budget),
    plan: str(body.plan),
    channel: str(body.channel),
    sitetype: str(body.sitetype),
    intent: str(body.intent),
    detail: str(body.detail),
    consent: body.consent === false ? false : true,
    utm_source: str(body.utm_source),
    utm_medium: str(body.utm_medium),
    utm_campaign: str(body.utm_campaign),
    utm_content: str(body.utm_content),
    utm_term: str(body.utm_term),
    referrer: str(body.referrer),
    raw: body,
    user_agent: req.headers.get("user-agent")?.slice(0, 500) || null,
  };

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("leads").insert(row);
    if (error) {
      console.error("[api/leads] insert error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
  } catch (e) {
    console.error("[api/leads] error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}

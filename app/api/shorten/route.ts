import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------- rate-limit ساده در حافظه (per-IP) ----------
// عمومی و بدون احراز هویت است؛ برای جلوگیری از سوءاستفاده محدودیت می‌گذاریم.
const WINDOW_MS = 60_000; // یک دقیقه
const MAX_PER_WINDOW = 10;
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

function str(v: unknown, max = 2000): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

// slug فقط حروف کوچک، عدد، خط تیره و آندرلاین — حداکثر ۴۸ کاراکتر.
function normSlug(v: unknown): string | null {
  const s = str(v, 64);
  if (!s) return null;
  const slug = s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 48);
  return slug || null;
}

function genSlug(): string {
  return Math.random().toString(36).slice(2, 8);
}

// مقصد باید http/https باشد تا open-redirect نشود.
function normTarget(v: unknown): string | null {
  const s = str(v, 4000);
  if (!s) return null;
  const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withProto);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname.includes(".")) return null; // دامنه‌ی نامعتبر
    return u.toString();
  } catch {
    return null;
  }
}

// نام‌های رزرو‌شده که نباید به‌عنوان slug عمومی استفاده شوند.
const RESERVED = new Set(["s", "b", "api", "admin", "ai", "www", "shortener", "qr"]);

// POST /api/shorten — عمومی، بدون احراز هویت، ساخت لینک کوتاه با محافظت از سوءاستفاده.
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 }); }

  // honeypot: اگر فیلد مخفی پر بود، بات است → بی‌صدا موفقیت جعلی
  if (str(body.company)) {
    return NextResponse.json({ ok: true, slug: "x", short_url: "" });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const target_url = normTarget(body.target_url ?? body.url);
  if (!target_url) {
    return NextResponse.json({ ok: false, error: "invalid_target" }, { status: 422 });
  }

  const custom = normSlug(body.slug);
  if (custom && RESERVED.has(custom)) {
    return NextResponse.json({ ok: false, error: "reserved_slug" }, { status: 409 });
  }

  const supabase = getSupabaseAdmin();
  const origin = new URL(req.url).origin;

  try {
    let slug = custom || genSlug();
    for (let attempt = 0; attempt < 6; attempt++) {
      const { data, error } = await supabase
        .from("short_links")
        .insert({ slug, target_url, title: str(body.title, 200), is_active: true })
        .select("slug")
        .single();

      if (!error) {
        return NextResponse.json({
          ok: true,
          slug: data.slug,
          short_url: `${origin}/s/${data.slug}`,
        });
      }
      // برخورد slug یکتا (23505): اگر سفارشی بود خطا بده، وگرنه دوباره تولید کن.
      if ((error as { code?: string }).code === "23505") {
        if (custom) {
          return NextResponse.json({ ok: false, error: "duplicate_slug" }, { status: 409 });
        }
        slug = genSlug();
        continue;
      }
      console.error("[api/shorten] POST error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: false, error: "slug_collision" }, { status: 500 });
  } catch (e) {
    console.error("[api/shorten] POST error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}

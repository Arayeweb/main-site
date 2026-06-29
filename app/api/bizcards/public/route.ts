import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function str(v: unknown, max = 2000): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

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

// POST /api/bizcards/public — عمومی، بدون احراز هویت، کارت با is_active: false ثبت می‌شه
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 }); }

  const business_name = str(body.business_name, 200);
  if (!business_name) return NextResponse.json({ ok: false, error: "missing_name" }, { status: 422 });

  const phone = str(body.phone, 30);

  const rawSlug = normSlug(body.slug || business_name);
  if (!rawSlug) return NextResponse.json({ ok: false, error: "invalid_slug" }, { status: 422 });

  const supabase = getSupabaseAdmin();

  // بررسی تکراری نبودن slug
  let slug = rawSlug;
  const { data: existing } = await supabase
    .from("bizcards")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    // اضافه کردن پسوند تصادفی برای جلوگیری از تکرار
    slug = rawSlug + "-" + Math.random().toString(36).slice(2, 6);
  }

  const row = {
    slug,
    business_name,
    category:    str(body.category, 100),
    phone,
    maps_url:    str(body.maps_url, 2000),
    neshan_url:  str(body.neshan_url, 2000),
    balad_url:   str(body.balad_url, 2000),
    address:     str(body.address, 500),
    instagram:   str(body.instagram, 100),
    telegram:    str(body.telegram, 100),
    website:     str(body.website, 2000),
    hours:       str(body.hours, 300),
    logo_url:    str(body.logo_url, 2000),
    theme_color: str(body.theme_color, 20) ?? "blue",
    is_active:   true, // فوری فعال — ادمین فقط برای غیرفعال کردن مداخله می‌کند
  };

  try {
    const { data, error } = await supabase
      .from("bizcards")
      .insert(row)
      .select("slug, business_name")
      .single();

    if (error) {
      console.error("[api/bizcards/public] POST error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, slug: data.slug });
  } catch (e) {
    console.error("[api/bizcards/public] POST error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

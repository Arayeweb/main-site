import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

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

// GET /api/bizcards?slug=xxx  ← عمومی، برای صفحه‌ی کارت
export async function GET(req: NextRequest) {
  const slug = normSlug(req.nextUrl.searchParams.get("slug"));
  if (!slug) return NextResponse.json({ ok: false, error: "missing_slug" }, { status: 400 });

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("bizcards")
      .select("slug,business_name,category,phone,maps_url,neshan_url,balad_url,address,instagram,telegram,whatsapp,website,hours,logo_url,theme_color")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    if (!data) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, card: data });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// POST /api/bizcards  ← ادمین، ساخت کارت جدید
export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 }); }

  const business_name = str(body.business_name, 200);
  if (!business_name) return NextResponse.json({ ok: false, error: "missing_name" }, { status: 422 });

  const slug = normSlug(body.slug || business_name);
  if (!slug) return NextResponse.json({ ok: false, error: "invalid_slug" }, { status: 422 });

  const row = {
    slug,
    business_name,
    category:    str(body.category, 100),
    phone:       str(body.phone, 30),
    maps_url:    str(body.maps_url, 2000),
    neshan_url:  str(body.neshan_url, 2000),
    balad_url:   str(body.balad_url, 2000),
    address:     str(body.address, 500),
    instagram:   str(body.instagram, 100),
    telegram:    str(body.telegram, 100),
    whatsapp:    str(body.whatsapp, 30),
    website:     str(body.website, 2000),
    hours:       str(body.hours, 300),
    logo_url:    str(body.logo_url, 2000),
    theme_color: str(body.theme_color, 20) ?? "blue",
    is_active:   true,
  };

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("bizcards")
      .insert(row)
      .select()
      .single();

    if (error) {
      if ((error as { code?: string }).code === "23505") {
        return NextResponse.json({ ok: false, error: "duplicate_slug" }, { status: 409 });
      }
      console.error("[api/bizcards] POST error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, card: data });
  } catch (e) {
    console.error("[api/bizcards] POST error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// PUT /api/bizcards?id=xxx  ← ادمین، ویرایش کارت
export async function PUT(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const id = str(req.nextUrl.searchParams.get("id"), 64);
  if (!id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 422 });

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 }); }

  const business_name = str(body.business_name, 200);
  const slug = normSlug(body.slug);

  const row: Record<string, unknown> = {};
  if (business_name) row.business_name = business_name;
  if (slug) row.slug = slug;
  if (body.category !== undefined) row.category = str(body.category, 100);
  if (body.phone !== undefined) row.phone = str(body.phone, 30);
  if (body.whatsapp !== undefined) row.whatsapp = str(body.whatsapp, 30);
  if (body.maps_url !== undefined) row.maps_url = str(body.maps_url, 2000);
  if (body.neshan_url !== undefined) row.neshan_url = str(body.neshan_url, 2000);
  if (body.balad_url !== undefined) row.balad_url = str(body.balad_url, 2000);
  if (body.address !== undefined) row.address = str(body.address, 500);
  if (body.instagram !== undefined) row.instagram = str(body.instagram, 100);
  if (body.telegram !== undefined) row.telegram = str(body.telegram, 100);
  if (body.website !== undefined) row.website = str(body.website, 2000);
  if (body.hours !== undefined) row.hours = str(body.hours, 300);
  if (body.logo_url !== undefined) row.logo_url = str(body.logo_url, 2000);
  if (body.theme_color !== undefined) row.theme_color = str(body.theme_color, 20) ?? "blue";
  if (body.is_active !== undefined) row.is_active = !!body.is_active;

  row.updated_at = new Date().toISOString();

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("bizcards")
      .update(row)
      .eq("id", id)
      .select("id, slug, business_name, category, phone, whatsapp, maps_url, neshan_url, balad_url, address, instagram, telegram, website, hours, logo_url, theme_color, is_active, created_at, updated_at")
      .single();

    if (error) {
      if ((error as { code?: string }).code === "23505") {
        return NextResponse.json({ ok: false, error: "duplicate_slug" }, { status: 409 });
      }
      console.error("[api/bizcards] PUT error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, card: data });
  } catch (e) {
    console.error("[api/bizcards] PUT error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// GET /api/bizcards/list  ← ادمین، لیست همه کارت‌ها
// (از همین endpoint با پارامتر list=1 استفاده می‌کنیم)
export async function DELETE(req: NextRequest) {
  if (!getSession(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const id = str(req.nextUrl.searchParams.get("id"), 64);
  if (!id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 422 });

  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("bizcards").update({ is_active: false }).eq("id", id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

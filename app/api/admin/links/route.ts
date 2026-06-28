import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requireAny(req: NextRequest) {
  return getSession(req);
}
function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
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
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

// لیست همه‌ی لینک‌های کوتاه.
export async function GET(req: NextRequest) {
  if (!requireAny(req)) return unauthorized();
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("short_links")
      .select("id, created_at, slug, target_url, title, clicks, is_active")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("[api/admin/links] GET error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, links: data || [] });
  } catch (e) {
    console.error("[api/admin/links] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// ساخت لینک کوتاه جدید.
export async function POST(req: NextRequest) {
  const session = requireAny(req);
  if (!session) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const target_url = normTarget(body.target_url ?? body.targetUrl);
  if (!target_url) {
    return NextResponse.json({ ok: false, error: "invalid_target" }, { status: 422 });
  }

  const row: Record<string, unknown> = {
    target_url,
    title: str(body.title, 200),
    is_active: true,
    created_by: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.userId) ? session.userId : null,
  };

  try {
    const supabase = getSupabaseAdmin();
    const custom = normSlug(body.slug);
    let slug = custom || genSlug();
    for (let attempt = 0; attempt < 6; attempt++) {
      row.slug = slug;
      const { data, error } = await supabase
        .from("short_links")
        .insert(row)
        .select("id, slug, target_url, title, clicks, is_active, created_at")
        .single();
      if (!error) {
        return NextResponse.json({ ok: true, link: data });
      }
      // برخورد slug یکتا → فقط وقتی خودمان تولید کرده‌ایم دوباره تلاش کن.
      if ((error as { code?: string }).code === "23505") {
        if (custom) {
          return NextResponse.json({ ok: false, error: "duplicate_slug" }, { status: 409 });
        }
        slug = genSlug();
        continue;
      }
      console.error("[api/admin/links] POST error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: false, error: "slug_collision" }, { status: 500 });
  } catch (e) {
    console.error("[api/admin/links] POST error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// ویرایش لینک (مقصد، عنوان، فعال/غیرفعال).
export async function PATCH(req: NextRequest) {
  if (!requireAny(req)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const id = str(body.id, 64);
  if (!id) {
    return NextResponse.json({ ok: false, error: "missing_id" }, { status: 422 });
  }

  const patch: Record<string, unknown> = {};
  if ("target_url" in body || "targetUrl" in body) {
    const t = normTarget(body.target_url ?? body.targetUrl);
    if (!t) return NextResponse.json({ ok: false, error: "invalid_target" }, { status: 422 });
    patch.target_url = t;
  }
  if ("title" in body) patch.title = str(body.title, 200);
  if ("is_active" in body) patch.is_active = Boolean(body.is_active);

  if (!Object.keys(patch).length) {
    return NextResponse.json({ ok: false, error: "nothing_to_update" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("short_links")
      .update(patch)
      .eq("id", id)
      .select("id, slug, target_url, title, clicks, is_active, created_at")
      .maybeSingle();

    if (error) {
      console.error("[api/admin/links] PATCH error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, link: data });
  } catch (e) {
    console.error("[api/admin/links] PATCH error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// حذف لینک.
export async function DELETE(req: NextRequest) {
  if (!requireAny(req)) return unauthorized();

  const id = str(req.nextUrl.searchParams.get("id"), 64);
  if (!id) {
    return NextResponse.json({ ok: false, error: "missing_id" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("short_links").delete().eq("id", id);
    if (error) {
      console.error("[api/admin/links] DELETE error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/admin/links] DELETE error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

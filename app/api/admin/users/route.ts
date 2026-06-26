import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession, hashPassword, ROLES, type AdminRole } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROLES_SET = new Set(ROLES);

function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

function str(v: unknown, max = 200): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

function isAdmin(req: NextRequest) {
  const session = getSession(req);
  return session && session.role === "admin";
}

// لیست کاربران پنل (فقط admin)
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, created_at, updated_at, email, name, role, is_active, last_login_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[api/admin/users] GET error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, users: data || [] });
  } catch (e) {
    console.error("[api/admin/users] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// ساخت کاربر جدید (فقط admin)
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const email = str(body.email, 200)?.toLowerCase();
  const name = str(body.name, 200);
  const role = str(body.role, 32) as AdminRole | null;
  const password = str(body.password, 200);

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "missing_credentials" }, { status: 422 });
  }
  if (!role || !ROLES_SET.has(role)) {
    return NextResponse.json({ ok: false, error: "invalid_role" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("admin_users")
      .insert({
        email,
        name,
        role,
        password_hash: hashPassword(password),
        is_active: true,
      })
      .select("id, email, name, role, is_active")
      .single();

    if (error) {
      console.error("[api/admin/users] POST error:", error.message);
      const dup = (error as { code?: string }).code === "23505";
      return NextResponse.json(
        { ok: false, error: dup ? "duplicate_email" : "db_error" },
        { status: dup ? 409 : 500 }
      );
    }
    return NextResponse.json({ ok: true, user: data });
  } catch (e) {
    console.error("[api/admin/users] POST error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// ویرایش کاربر (فقط admin)
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();

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

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if ("name" in body) patch.name = str(body.name, 200);
  if ("role" in body) {
    const role = str(body.role, 32) as AdminRole | null;
    if (!role || !ROLES_SET.has(role)) {
      return NextResponse.json({ ok: false, error: "invalid_role" }, { status: 422 });
    }
    patch.role = role;
  }
  if ("is_active" in body) {
    patch.is_active = Boolean(body.is_active);
  }
  if ("password" in body) {
    const password = str(body.password, 200);
    if (password) {
      patch.password_hash = hashPassword(password);
    }
  }

  if (Object.keys(patch).length === 1) {
    return NextResponse.json({ ok: false, error: "nothing_to_update" }, { status: 422 });
  }

  // جلوگیری از غیرفعال‌سازی خودِ ادمین
  if (patch.is_active === false) {
    const session = getSession(req);
    if (session && session.userId === id) {
      return NextResponse.json({ ok: false, error: "cannot_disable_self" }, { status: 422 });
    }
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("admin_users")
      .update(patch)
      .eq("id", id)
      .select("id, email, name, role, is_active")
      .maybeSingle();

    if (error) {
      console.error("[api/admin/users] PATCH error:", error.message);
      const dup = (error as { code?: string }).code === "23505";
      return NextResponse.json(
        { ok: false, error: dup ? "duplicate_email" : "db_error" },
        { status: dup ? 409 : 500 }
      );
    }
    if (!data) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, user: data });
  } catch (e) {
    console.error("[api/admin/users] PATCH error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// غیرفعال‌سازی/حذف کاربر (فقط admin)
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "missing_id" }, { status: 422 });
  }

  const session = getSession(req);
  if (session && session.userId === id) {
    return NextResponse.json({ ok: false, error: "cannot_delete_self" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    // به جای حذف فیزیکی، غیرفعال می‌کنیم تا audit حفظ شود.
    const { data, error } = await supabase
      .from("admin_users")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, email, is_active")
      .maybeSingle();

    if (error) {
      console.error("[api/admin/users] DELETE error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, user: data });
  } catch (e) {
    console.error("[api/admin/users] DELETE error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

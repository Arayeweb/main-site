import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ADMIN_COOKIE, verifyAdminToken, hashPassword } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = new Set([
  "intake",
  "design",
  "development",
  "review",
  "delivered",
  "paused",
]);
const SERVICE_TYPES = new Set(["website", "landing", "chatbot", "other"]);

function authed(req: NextRequest): boolean {
  return verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value);
}
function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

function str(v: unknown, max = 2000): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

function clampPercent(v: unknown): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, n));
}

function genProjectCode(): string {
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return "ARY-" + rnd;
}

// لیست همه‌ی پروژه‌ها (رمز هرگز برنمی‌گردد؛ فقط has_password).
export async function GET(req: NextRequest) {
  if (!authed(req)) return unauthorized();
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("support_projects")
      .select(
        "id, created_at, updated_at, project_code, access_password, customer_name, customer_contact, title, service_type, status, progress_percent, estimated_delivery_at, last_note"
      )
      .order("updated_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("[api/admin/projects] GET error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    const projects = (data || []).map((p) => {
      const { access_password, ...rest } = p as Record<string, unknown>;
      return { ...rest, has_password: Boolean(access_password) };
    });
    return NextResponse.json({ ok: true, projects });
  } catch (e) {
    console.error("[api/admin/projects] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// ساخت پروژه‌ی جدید.
export async function POST(req: NextRequest) {
  if (!authed(req)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const title = str(body.title, 200);
  if (!title) {
    return NextResponse.json({ ok: false, error: "missing_title" }, { status: 422 });
  }

  const statusRaw = str(body.status, 32);
  const status = statusRaw && STATUSES.has(statusRaw) ? statusRaw : "intake";
  const serviceRaw = str(body.service_type ?? body.serviceType, 32);
  const service_type = serviceRaw && SERVICE_TYPES.has(serviceRaw) ? serviceRaw : null;
  const passwordRaw = str(body.password, 200);

  const row: Record<string, unknown> = {
    project_code: str(body.project_code ?? body.projectCode, 64) || genProjectCode(),
    title,
    customer_name: str(body.customer_name ?? body.customerName, 200),
    customer_contact: str(body.customer_contact ?? body.contact, 200),
    service_type,
    status,
    progress_percent: clampPercent(body.progress_percent ?? body.progressPercent) ?? 0,
    estimated_delivery_at: str(body.estimated_delivery_at ?? body.estimatedDeliveryAt, 32),
    last_note: str(body.last_note ?? body.lastNote, 4000),
    access_password: passwordRaw ? hashPassword(passwordRaw) : null,
  };

  try {
    const supabase = getSupabaseAdmin();
    let code = row.project_code as string;
    for (let attempt = 0; attempt < 5; attempt++) {
      row.project_code = code;
      const { data, error } = await supabase
        .from("support_projects")
        .insert(row)
        .select("id, project_code")
        .single();
      if (!error) {
        return NextResponse.json({ ok: true, project: data });
      }
      // برخورد کد یکتا → فقط وقتی کد را خودمان تولید کرده‌ایم، دوباره تلاش کن.
      if ((error as { code?: string }).code === "23505" && !str(body.project_code ?? body.projectCode)) {
        code = genProjectCode();
        continue;
      }
      console.error("[api/admin/projects] POST error:", error.message);
      const dup = (error as { code?: string }).code === "23505";
      return NextResponse.json(
        { ok: false, error: dup ? "duplicate_code" : "db_error" },
        { status: dup ? 409 : 500 }
      );
    }
    return NextResponse.json({ ok: false, error: "code_collision" }, { status: 500 });
  } catch (e) {
    console.error("[api/admin/projects] POST error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// ویرایش پروژه (با id). فیلدهای ارسالی به‌روزرسانی می‌شوند.
export async function PATCH(req: NextRequest) {
  if (!authed(req)) return unauthorized();

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

  if ("title" in body) patch.title = str(body.title, 200);
  if ("customer_name" in body || "customerName" in body)
    patch.customer_name = str(body.customer_name ?? body.customerName, 200);
  if ("customer_contact" in body || "contact" in body)
    patch.customer_contact = str(body.customer_contact ?? body.contact, 200);
  if ("last_note" in body || "lastNote" in body)
    patch.last_note = str(body.last_note ?? body.lastNote, 4000);
  if ("estimated_delivery_at" in body || "estimatedDeliveryAt" in body)
    patch.estimated_delivery_at = str(body.estimated_delivery_at ?? body.estimatedDeliveryAt, 32);

  if ("status" in body) {
    const s = str(body.status, 32);
    if (!s || !STATUSES.has(s))
      return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 422 });
    patch.status = s;
  }
  if ("service_type" in body || "serviceType" in body) {
    const s = str(body.service_type ?? body.serviceType, 32);
    patch.service_type = s && SERVICE_TYPES.has(s) ? s : null;
  }
  if ("progress_percent" in body || "progressPercent" in body) {
    patch.progress_percent = clampPercent(body.progress_percent ?? body.progressPercent) ?? 0;
  }
  // رمز فقط وقتی فرستاده شود تغییر می‌کند؛ رشته‌ی خالی یعنی حذف رمز.
  if ("password" in body) {
    const pw = str(body.password, 200);
    patch.access_password = pw ? hashPassword(pw) : null;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("support_projects")
      .update(patch)
      .eq("id", id)
      .select("id, project_code")
      .maybeSingle();

    if (error) {
      console.error("[api/admin/projects] PATCH error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, project: data });
  } catch (e) {
    console.error("[api/admin/projects] PATCH error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

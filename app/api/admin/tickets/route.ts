import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = new Set(["open", "in_progress", "answered", "closed"]);
const PRIORITIES = new Set(["low", "normal", "high", "urgent"]);

function requireAny(req: NextRequest) {
  return getSession(req);
}
function requireSupportOrAdmin(req: NextRequest) {
  const s = getSession(req);
  return s && (s.role === "admin" || s.role === "support") ? s : null;
}
function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}
function forbidden() {
  return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
}

function str(v: unknown, max = 2000): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

function genTicketCode(): string {
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return "TK-" + rnd;
}

// لیست تیکت‌ها — فیلتر اختیاری با ?status= .
export async function GET(req: NextRequest) {
  if (!requireAny(req)) return unauthorized();

  const statusFilter = req.nextUrl.searchParams.get("status");
  const customerName = req.nextUrl.searchParams.get("customer_name");
  const customerContact = req.nextUrl.searchParams.get("customer_contact");
  const id = req.nextUrl.searchParams.get("id");

  try {
    const supabase = getSupabaseAdmin();

    if (id) {
      const { data, error } = await supabase
        .from("support_tickets")
        .select(
          "id, created_at, updated_at, ticket_code, project_id, customer_name, customer_contact, subject, category, priority, status, message"
        )
        .eq("id", id)
        .maybeSingle();
      if (error) {
        console.error("[api/admin/tickets] GET id error:", error.message);
        return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
      }
      if (!data) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
      return NextResponse.json({ ok: true, ticket: data });
    }

    let query = supabase
      .from("support_tickets")
      .select(
        "id, created_at, updated_at, ticket_code, project_id, customer_name, customer_contact, subject, category, priority, status, message"
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (statusFilter && STATUSES.has(statusFilter)) {
      query = query.eq("status", statusFilter);
    }
    if (customerName) {
      query = query.eq("customer_name", customerName);
    }
    if (customerContact) {
      query = query.eq("customer_contact", customerContact);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[api/admin/tickets] GET error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, tickets: data || [] });
  } catch (e) {
    console.error("[api/admin/tickets] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// ساخت تیکت جدید (admin یا support)
export async function POST(req: NextRequest) {
  if (!requireSupportOrAdmin(req)) return forbidden();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const subject = str(body.subject, 300);
  if (!subject) {
    return NextResponse.json({ ok: false, error: "missing_subject" }, { status: 422 });
  }

  const priorityRaw = str(body.priority, 32);
  const priority = priorityRaw && PRIORITIES.has(priorityRaw) ? priorityRaw : "normal";
  const category = str(body.category, 50) || "other";

  const row = {
    ticket_code: genTicketCode(),
    subject,
    message: str(body.message, 8000),
    customer_name: str(body.customer_name, 200),
    customer_contact: str(body.customer_contact, 200),
    project_id: str(body.project_id, 64),
    category,
    priority,
    status: "open",
  };

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("support_tickets").insert(row).select().single();
    if (error) {
      console.error("[api/admin/tickets] POST error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, ticket: data });
  } catch (e) {
    console.error("[api/admin/tickets] POST error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// تغییر وضعیت/اولویت تیکت (با id). (admin یا support)
export async function PATCH(req: NextRequest) {
  if (!requireSupportOrAdmin(req)) return forbidden();

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

  if ("status" in body) {
    const s = str(body.status, 32);
    if (!s || !STATUSES.has(s))
      return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 422 });
    patch.status = s;
  }
  if ("priority" in body) {
    const p = str(body.priority, 32);
    if (!p || !PRIORITIES.has(p))
      return NextResponse.json({ ok: false, error: "invalid_priority" }, { status: 422 });
    patch.priority = p;
  }

  if (Object.keys(patch).length === 1) {
    return NextResponse.json({ ok: false, error: "nothing_to_update" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("support_tickets")
      .update(patch)
      .eq("id", id)
      .select("id, ticket_code, status, priority")
      .maybeSingle();

    if (error) {
      console.error("[api/admin/tickets] PATCH error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, ticket: data });
  } catch (e) {
    console.error("[api/admin/tickets] PATCH error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

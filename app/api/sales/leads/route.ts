import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession, type AdminRole } from "@/lib/auth";
import { normalizeContact } from "@/lib/validateContact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// نقش‌هایی که به CRM فروش دسترسی دارند.
const SALES_ROLES: AdminRole[] = ["sales", "admin"];
const CRM_STATUSES = new Set([
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
]);
const PAGE_SIZE = 50;

function salesSession(req: NextRequest) {
  const session = getSession(req);
  if (!session || !SALES_ROLES.includes(session.role)) return null;
  return session;
}
function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}
function str(v: unknown, max = 500): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

// لیست لیدهای CRM با فیلتر وضعیت/مالک/جستجو و صفحه‌بندی.
export async function GET(req: NextRequest) {
  const session = salesSession(req);
  if (!session) return unauthorized();

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status") || "";
  const owner = sp.get("owner") || "";
  const q = (sp.get("q") || "").trim();
  const followup = sp.get("followup") || "";
  const pageNum = Math.max(0, parseInt(sp.get("page_num") || "0", 10));
  const offset = pageNum * PAGE_SIZE;

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("leads")
      .select(
        "id, created_at, source, page, name, contact, company, goal, budget, plan, crm_status, owner_id, next_followup_at, crm_note, crm_updated_at"
      )
      .range(offset, offset + PAGE_SIZE - 1);

    // حالت یادآور: فقط پیگیری‌های باز که سررسیدشان امروز یا گذشته است، مرتب بر اساس تاریخ.
    if (followup === "due") {
      const today = new Date().toISOString().slice(0, 10);
      query = query
        .not("next_followup_at", "is", null)
        .lte("next_followup_at", today + "T23:59:59")
        .not("crm_status", "in", "(won,lost)")
        .order("next_followup_at", { ascending: true });
    } else {
      query = query
        .order("created_at", { ascending: false })
        .order("crm_updated_at", { ascending: false, nullsFirst: false });
    }

    if (status && CRM_STATUSES.has(status)) query = query.eq("crm_status", status);
    if (owner === "me") query = query.eq("owner_id", session.userId);
    else if (owner === "unassigned") query = query.is("owner_id", null);
    else if (owner) query = query.eq("owner_id", owner);
    if (q) query = query.or(`name.ilike.%${q}%,contact.ilike.%${q}%,company.ilike.%${q}%`);

    const { data, error } = await query;
    if (error) {
      console.error("[api/sales/leads] GET error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      leads: data || [],
      page_num: pageNum,
      page_size: PAGE_SIZE,
      has_more: (data || []).length === PAGE_SIZE,
    });
  } catch (e) {
    console.error("[api/sales/leads] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// ورود دستی لید توسط تیم فروش.
export async function POST(req: NextRequest) {
  const session = salesSession(req);
  if (!session) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const name = str(body.name, 200);
  const company = str(body.company, 200);
  const rawContact = str(body.contact, 200);
  if (!rawContact) {
    return NextResponse.json({ ok: false, error: "missing_contact" }, { status: 422 });
  }
  const { kind, value } = normalizeContact(rawContact);
  if (kind === "invalid") {
    return NextResponse.json({ ok: false, error: "invalid_contact" }, { status: 422 });
  }

  const status = str(body.crm_status, 32) || "new";
  const insert: Record<string, unknown> = {
    source: "manual_entry",
    name,
    company,
    contact: value,
    goal: str(body.goal, 500),
    budget: str(body.budget, 64),
    channel: str(body.channel, 120), // از کجا پیدا شده (اینستاگرام، معرفی، …)
    crm_status: CRM_STATUSES.has(status) ? status : "new",
    crm_note: str(body.crm_note, 1000),
    crm_updated_at: new Date().toISOString(),
    next_followup_at: str(body.next_followup_at, 40) || null,
    owner_id: body.assign_me ? session.userId : str(body.owner_id, 64),
    consent: true,
  };

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("leads")
      .insert(insert)
      .select("id")
      .single();

    if (error) {
      console.error("[api/sales/leads] POST error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    // فعالیت اولیه برای ثبت در تاریخچه
    await supabase.from("lead_activities").insert({
      lead_id: data.id,
      author_id: session.userId === "admin" ? null : session.userId,
      author_name: session.role === "admin" ? "مدیر" : "فروش",
      kind: "note",
      body: "لید به‌صورت دستی ثبت شد" + (insert.channel ? ` (منبع: ${insert.channel})` : ""),
    });

    return NextResponse.json({ ok: true, id: data.id });
  } catch (e) {
    console.error("[api/sales/leads] POST error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// ویرایش وضعیت CRM / مالک / پیگیری بعدی روی یک لید.
export async function PATCH(req: NextRequest) {
  const session = salesSession(req);
  if (!session) return unauthorized();

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

  const patch: Record<string, unknown> = { crm_updated_at: new Date().toISOString() };
  let statusChange: string | null = null;

  if ("crm_status" in body) {
    const status = str(body.crm_status, 32) || "";
    if (!CRM_STATUSES.has(status)) {
      return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 422 });
    }
    patch.crm_status = status;
    statusChange = status;
  }
  if ("owner_id" in body) {
    if (body.owner_id === "me") {
      // session.userId برای ادمین fallback برابر "admin" است (UUID نیست)؛
      // ستون owner_id از نوع uuid است، پس فقط UUID معتبر می‌پذیرد.
      patch.owner_id =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          session.userId
        )
          ? session.userId
          : null;
    } else {
      patch.owner_id = str(body.owner_id, 64);
    }
  }
  if ("next_followup_at" in body) {
    const d = str(body.next_followup_at, 40);
    // ورودی <input type="date"> فقط YYYY-MM-DD است؛ ستون timestamptz به زمان نیاز دارد.
    patch.next_followup_at = d ? d + "T00:00:00+00:00" : null;
  }
  if ("crm_note" in body) {
    patch.crm_note = str(body.crm_note, 1000);
  }
  if ("company" in body) patch.company = str(body.company, 200);
  if ("name" in body) patch.name = str(body.name, 200);

  if (Object.keys(patch).length === 1) {
    return NextResponse.json({ ok: false, error: "nothing_to_update" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    // وضعیت قبلی را برای ثبت فعالیت تغییر وضعیت می‌خوانیم.
    const { data: oldLead } = await supabase
      .from("leads")
      .select("crm_status")
      .eq("id", id)
      .maybeSingle();

    const { data, error } = await supabase
      .from("leads")
      .update(patch)
      .eq("id", id)
      .select(
        "id, name, contact, company, crm_status, owner_id, next_followup_at, crm_note"
      )
      .maybeSingle();

    if (error) {
      console.error("[api/sales/leads] PATCH error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    if (statusChange && statusChange !== oldLead?.crm_status) {
      await supabase.from("lead_activities").insert({
        lead_id: id,
        author_id: session.userId === "admin" ? null : session.userId,
        author_name: session.role === "admin" ? "مدیر" : "فروش",
        kind: "status_change",
        body: `وضعیت به «${statusChange}» تغییر کرد`,
      });
    }

    return NextResponse.json({ ok: true, lead: data });
  } catch (e) {
    console.error("[api/sales/leads] PATCH error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

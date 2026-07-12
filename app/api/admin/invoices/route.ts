import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession, type AdminRole } from "@/lib/auth";
import { parseUuid, syncLeadStatus } from "@/lib/crmWorkflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ROLES: AdminRole[] = ["admin", "sales"];

function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

function str(v: unknown, max = 500): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

function num(v: unknown): number {
  const n = Number(v);
  return isNaN(n) ? 0 : Math.round(n);
}

function calcTotals(items: InvoiceItem[]) {
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;
  for (const it of items) {
    const base = it.qty * it.unit_price;
    const disc = Math.round(base * ((it.discount ?? 0) / 100));
    const afterDisc = base - disc;
    const tax = Math.round(afterDisc * ((it.tax ?? 0) / 100));
    subtotal += base;
    discountTotal += disc;
    taxTotal += tax;
  }
  const grandTotal = subtotal - discountTotal + taxTotal;
  return { subtotal, discount_total: discountTotal, tax_total: taxTotal, grand_total: grandTotal };
}

interface InvoiceItem {
  title: string;
  qty: number;
  unit_price: number;
  discount?: number;
  tax?: number;
}

// شماره‌ی فاکتور خودکار
async function nextInvoiceNumber(kind: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const prefix = kind === "proforma" ? "PRO" : "INV";
  const { data } = await supabase
    .from("invoices")
    .select("invoice_number")
    .like("invoice_number", `${prefix}-%`)
    .order("created_at", { ascending: false })
    .limit(1);
  if (!data || data.length === 0) return `${prefix}-1001`;
  const last = data[0].invoice_number as string;
  const num = parseInt(last.split("-")[1] || "1000", 10);
  return `${prefix}-${num + 1}`;
}

// GET — لیست فاکتورها یا یک فاکتور کامل با ?id=...&full=1
export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session || !ALLOWED_ROLES.includes(session.role)) return unauthorized();

  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  const full = searchParams.get("full");

  // single invoice fetch
  if (id && full) {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
      if (!data) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
      return NextResponse.json({ ok: true, invoice: data });
    } catch (e) {
      console.error("[api/admin/invoices] GET single error:", e);
      return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
    }
  }

  // summary mode — aggregate stats for dashboard cards
  if (searchParams.get("summary")) {
    try {
      const supabase = getSupabaseAdmin();
      const kindFilter = searchParams.get("kind") || "invoice";
      let q = supabase.from("invoices").select("status,kind,grand_total,currency,paid_at");
      if (kindFilter) q = q.eq("kind", kindFilter);
      const { data, error } = await q;
      if (error) {
        console.error("[api/admin/invoices] GET summary error:", error.message);
        return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
      }
      const rows = data || [];
      const paid: Record<string, number> = {};
      const outstanding: Record<string, number> = {};
      const paidThisMonth: Record<string, number> = {};
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const counts = { total: 0, paid: 0, sent: 0, draft: 0, cancelled: 0, invoice: 0, proforma: 0 };
      for (const r of rows) {
        const cur = r.currency || "IRR";
        const amt = Number(r.grand_total) || 0;
        counts.total++;
        if (r.kind === "proforma") counts.proforma++; else counts.invoice++;
        if (r.status === "paid") {
          counts.paid++;
          paid[cur] = (paid[cur] || 0) + amt;
          if (r.paid_at && r.paid_at >= monthStart) {
            paidThisMonth[cur] = (paidThisMonth[cur] || 0) + amt;
          }
        } else if (r.status === "sent") {
          counts.sent++;
          outstanding[cur] = (outstanding[cur] || 0) + amt;
        } else if (r.status === "draft") {
          counts.draft++;
          outstanding[cur] = (outstanding[cur] || 0) + amt;
        } else if (r.status === "cancelled") {
          counts.cancelled++;
        }
      }
      return NextResponse.json({ ok: true, summary: { paid, outstanding, paidThisMonth, counts } });
    } catch (e) {
      console.error("[api/admin/invoices] GET summary error:", e);
      return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
    }
  }

  const kind = searchParams.get("kind") || "";
  const status = searchParams.get("status") || "";
  const customerName = searchParams.get("customer_name") || "";
  const clientId = searchParams.get("client_id") || "";
  const leadId = searchParams.get("lead_id") || "";
  const page = Math.max(0, parseInt(searchParams.get("page") || "0", 10));
  const PAGE_SIZE = 30;

  try {
    const supabase = getSupabaseAdmin();
    let q = supabase
      .from("invoices")
      .select(
        "id,invoice_number,kind,status,issue_date,due_date,customer_name,customer_contact,customer_address,lead_id,client_id,project_id,items,subtotal,discount_total,tax_total,grand_total,currency,note,terms,created_at,paid_at"
      )
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (kind) q = q.eq("kind", kind);
    if (status) q = q.eq("status", status);
    if (customerName) q = q.eq("customer_name", customerName);
    if (clientId && parseUuid(clientId)) q = q.eq("client_id", clientId);
    if (leadId && parseUuid(leadId)) q = q.eq("lead_id", leadId);

    const { data, error } = await q;
    if (error) {
      console.error("[api/admin/invoices] GET error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, invoices: data || [], page });
  } catch (e) {
    console.error("[api/admin/invoices] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// POST — ساخت فاکتور جدید
export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session || !ALLOWED_ROLES.includes(session.role)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const customer_name = str(body.customer_name, 200);
  if (!customer_name) {
    return NextResponse.json({ ok: false, error: "missing_customer_name" }, { status: 422 });
  }

  const kind = str(body.kind, 20) || "invoice";
  const rawItems: InvoiceItem[] = Array.isArray(body.items)
    ? (body.items as unknown[]).map((i) => {
        const it = i as Record<string, unknown>;
        return {
          title: str(it.title, 300) || "",
          qty: num(it.qty) || 1,
          unit_price: num(it.unit_price),
          discount: num(it.discount),
          tax: num(it.tax),
        };
      })
    : [];

  const totals = calcTotals(rawItems);
  const invoice_number = str(body.invoice_number, 30) || (await nextInvoiceNumber(kind));

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("invoices")
      .insert({
        invoice_number,
        kind,
        status: str(body.status, 20) || "draft",
        issue_date: str(body.issue_date, 20) || new Date().toISOString().split("T")[0],
        due_date: str(body.due_date, 20) || null,
        customer_name,
        customer_contact: str(body.customer_contact, 200),
        customer_address: str(body.customer_address, 500),
        project_id: parseUuid(body.project_id),
        lead_id: parseUuid(body.lead_id),
        client_id: parseUuid(body.client_id),
        items: rawItems,
        currency: str(body.currency, 10) || "IRR",
        note: str(body.note, 1000),
        terms: str(body.terms, 1000),
        created_by: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.userId) ? session.userId : null,
        ...totals,
      })
      .select()
      .single();

    if (error) {
      console.error("[api/admin/invoices] POST error:", error.message);
      const dup = (error as { code?: string }).code === "23505";
      return NextResponse.json(
        { ok: false, error: dup ? "duplicate_number" : "db_error" },
        { status: dup ? 409 : 500 }
      );
    }

    const lead_id = parseUuid(body.lead_id);
    if (lead_id && kind === "proforma") {
      await syncLeadStatus(
        supabase,
        lead_id,
        "proposal",
        session.role,
        session.userId,
        "پیش‌فاکتور صادر شد — وضعیت لید به «پیشنهاد» تغییر کرد"
      );
    }

    return NextResponse.json({ ok: true, invoice: data });
  } catch (e) {
    console.error("[api/admin/invoices] POST error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// PATCH — ویرایش فاکتور
export async function PATCH(req: NextRequest) {
  const session = getSession(req);
  if (!session || !ALLOWED_ROLES.includes(session.role)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const id = str(body.id, 64);
  if (!id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 422 });

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if ("status" in body) {
    patch.status = str(body.status, 20);
    if (patch.status === "paid" && !body.paid_at) patch.paid_at = new Date().toISOString();
  }
  if ("customer_name" in body) patch.customer_name = str(body.customer_name, 200);
  if ("customer_contact" in body) patch.customer_contact = str(body.customer_contact, 200);
  if ("customer_address" in body) patch.customer_address = str(body.customer_address, 500);
  if ("issue_date" in body) patch.issue_date = str(body.issue_date, 20);
  if ("due_date" in body) patch.due_date = str(body.due_date, 20);
  if ("note" in body) patch.note = str(body.note, 1000);
  if ("terms" in body) patch.terms = str(body.terms, 1000);
  if ("currency" in body) patch.currency = str(body.currency, 10);
  if ("kind" in body) patch.kind = str(body.kind, 20);

  if ("items" in body && Array.isArray(body.items)) {
    const rawItems: InvoiceItem[] = (body.items as unknown[]).map((i) => {
      const it = i as Record<string, unknown>;
      return {
        title: str(it.title, 300) || "",
        qty: num(it.qty) || 1,
        unit_price: num(it.unit_price),
        discount: num(it.discount),
        tax: num(it.tax),
      };
    });
    patch.items = rawItems;
    Object.assign(patch, calcTotals(rawItems));
  }

  try {
    const supabase = getSupabaseAdmin();

    let prevLeadId: string | null = null;
    if ("status" in body && patch.status === "sent") {
      const { data: prev } = await supabase.from("invoices").select("lead_id, kind").eq("id", id).maybeSingle();
      prevLeadId = (prev?.lead_id as string | null) ?? null;
    }

    const { data, error } = await supabase
      .from("invoices")
      .update(patch)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("[api/admin/invoices] PATCH error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!data) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

    if (prevLeadId && data.kind === "proforma" && data.status === "sent") {
      await syncLeadStatus(
        supabase,
        prevLeadId,
        "proposal",
        session.role,
        session.userId,
        "پیش‌فاکتور ارسال شد"
      );
    }

    return NextResponse.json({ ok: true, invoice: data });
  } catch (e) {
    console.error("[api/admin/invoices] PATCH error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// DELETE — حذف فاکتور (فقط admin)
export async function DELETE(req: NextRequest) {
  const session = getSession(req);
  if (!session || session.role !== "admin") return unauthorized();

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 422 });

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) {
      console.error("[api/admin/invoices] DELETE error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/admin/invoices] DELETE error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

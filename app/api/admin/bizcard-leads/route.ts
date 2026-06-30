import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SALES_STATUSES = new Set([
  "new", "auto_followed", "contacted", "interested",
  "proposal_sent", "won", "lost", "not_answered",
]);
const PAGE_SIZE = 50;

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

// لیست لیدهای کارت ویزیت — فیلتر اختیاری با ?status= و جستجو با ?q=
export async function GET(req: NextRequest) {
  if (!requireAny(req)) return unauthorized();

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status") || "";
  const onlyHot = sp.get("hot") === "1";
  const q = (sp.get("q") || "").trim();
  const pageNum = Math.max(0, parseInt(sp.get("page_num") || "0", 10));
  const offset = pageNum * PAGE_SIZE;

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("bizcard_leads")
      .select(
        "id, created_at, updated_at, slug, business_name, phone, category, city, " +
        "has_site, site_url, has_googlemap, wants_google, wants_review, " +
        "requested_service, lead_score, sales_status, last_followup_at"
      )
      .order("lead_score", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (status && SALES_STATUSES.has(status)) query = query.eq("sales_status", status);
    if (onlyHot) query = query.gte("lead_score", 70);
    if (q) query = query.or(`business_name.ilike.%${q}%,phone.ilike.%${q}%`);

    const { data, error } = await query;
    if (error) {
      console.error("[api/admin/bizcard-leads] GET error:", error.message);
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
    console.error("[api/admin/bizcard-leads] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// به‌روزرسانی وضعیت فروش / ثبت فالوآپ
export async function PATCH(req: NextRequest) {
  if (!requireAny(req)) return unauthorized();

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 }); }

  const id = str(body.id, 64);
  if (!id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 422 });

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if ("sales_status" in body) {
    const status = str(body.sales_status, 32) || "";
    if (!SALES_STATUSES.has(status)) {
      return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 422 });
    }
    patch.sales_status = status;
  }
  if (body.mark_followup === true) {
    patch.last_followup_at = new Date().toISOString();
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("bizcard_leads").update(patch).eq("id", id);
    if (error) {
      console.error("[api/admin/bizcard-leads] PATCH error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/admin/bizcard-leads] PATCH error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

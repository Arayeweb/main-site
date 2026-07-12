import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireRoles, str, dbError, unauthorized, isMissingTableError } from "@/lib/adminRouteHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
const BRIEF_STATUSES = new Set([
  "new",
  "contacted",
  "proposal_preparing",
  "proposal_sent",
  "won",
  "lost",
]);
const RECOMMENDED = new Set([
  "lead_management",
  "adready",
  "maps",
  "chatbot",
  "seo",
  "none",
]);

const LIST_COLUMNS =
  "id, created_at, updated_at, status, contact_name, contact_phone, business_name, " +
  "primary_conversion_goal, primary_business_problem, recommended_service, " +
  "recommendation_interest, recommendation_reason_code";

export async function GET(req: NextRequest) {
  if (!requireRoles(req, ["admin", "sales"])) return unauthorized();

  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim();
  const status = sp.get("status") || "";
  const recommended = sp.get("recommended_service") || "";
  const interest = sp.get("recommendation_interest");
  const pageNum = Math.max(0, parseInt(sp.get("page_num") || "0", 10));
  const offset = pageNum * PAGE_SIZE;

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("website_project_briefs")
      .select(LIST_COLUMNS, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (status && BRIEF_STATUSES.has(status)) query = query.eq("status", status);
    if (recommended && RECOMMENDED.has(recommended)) {
      query = query.eq("recommended_service", recommended);
    }
    if (interest === "true") query = query.eq("recommendation_interest", true);
    if (interest === "false") query = query.eq("recommendation_interest", false);
    if (interest === "null") query = query.is("recommendation_interest", null);
    if (q) {
      query = query.or(
        `contact_name.ilike.%${q}%,contact_phone.ilike.%${q}%,business_name.ilike.%${q}%`
      );
    }

    const { data, error, count } = await query;
    if (error) {
      if (isMissingTableError(error.message)) {
        return NextResponse.json({
          ok: true,
          briefs: [],
          page_num: pageNum,
          page_size: PAGE_SIZE,
          total: 0,
          has_more: false,
          migration_required: true,
        });
      }
      return dbError(error.message);
    }

    return NextResponse.json({
      ok: true,
      briefs: data || [],
      page_num: pageNum,
      page_size: PAGE_SIZE,
      total: count ?? 0,
      has_more: (data || []).length === PAGE_SIZE,
    });
  } catch (e) {
    console.error("[api/admin/website-project-briefs] GET:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireRoles(req, ["admin", "sales"])) return unauthorized();

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
    const status = str(body.status, 32) || "";
    if (!BRIEF_STATUSES.has(status)) {
      return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 422 });
    }
    patch.status = status;
  }

  if ("internal_notes" in body) {
    patch.internal_notes = str(body.internal_notes, 5000);
  }

  if (Object.keys(patch).length <= 1) {
    return NextResponse.json({ ok: false, error: "nothing_to_update" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("website_project_briefs").update(patch).eq("id", id);
    if (error) return dbError(error.message);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/admin/website-project-briefs] PATCH:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession, type AdminRole } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SALES_ROLES: AdminRole[] = ["sales", "admin"];
const PAGE_SIZE = 50;

function salesSession(req: NextRequest) {
  const session = getSession(req);
  if (!session || !SALES_ROLES.includes(session.role)) return null;
  return session;
}

function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!salesSession(req)) return unauthorized();

  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim();
  const status = sp.get("status") || "";
  const pageNum = Math.max(0, parseInt(sp.get("page_num") || "0", 10));
  const offset = pageNum * PAGE_SIZE;

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("content_sales_orders")
      .select(
        "id, created_at, buyer_name, buyer_phone, buyer_email, amount_toman, status, paid_at, ai_user_id, zibal_track_id"
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (status) query = query.eq("status", status);
    if (q) query = query.or(`buyer_name.ilike.%${q}%,buyer_phone.ilike.%${q}%`);

    const { data, error } = await query;
    if (error) {
      if (error.message.includes("content_sales_orders")) {
        return NextResponse.json({
          ok: true,
          orders: [],
          migration_required: true,
          page_num: pageNum,
          has_more: false,
        });
      }
      console.error("[api/admin/content-sales-orders] GET error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      orders: data || [],
      page_num: pageNum,
      page_size: PAGE_SIZE,
      has_more: (data || []).length === PAGE_SIZE,
    });
  } catch (e) {
    console.error("[api/admin/content-sales-orders] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

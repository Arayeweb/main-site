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
  const pageNum = Math.max(0, parseInt(sp.get("page_num") || "0", 10));
  const offset = pageNum * PAGE_SIZE;

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("campaign_leads")
      .select(
        "id, created_at, full_name, phone, email, message, status, utm_source, campaign_page_id, campaign_pages(title, slug)"
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`);

    const { data, error } = await query;
    if (error) {
      if (error.message.includes("campaign_leads")) {
        return NextResponse.json({
          ok: true,
          leads: [],
          migration_required: true,
          page_num: pageNum,
          has_more: false,
        });
      }
      console.error("[api/admin/adready-leads] GET error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    const leads = (data || []).map((row) => {
      const page = row.campaign_pages as { title?: string; slug?: string } | null;
      return {
        id: row.id,
        created_at: row.created_at,
        full_name: row.full_name,
        phone: row.phone,
        email: row.email,
        message: row.message,
        status: row.status,
        utm_source: row.utm_source,
        campaign_title: page?.title ?? null,
        campaign_slug: page?.slug ?? null,
      };
    });

    return NextResponse.json({
      ok: true,
      leads,
      page_num: pageNum,
      page_size: PAGE_SIZE,
      has_more: leads.length === PAGE_SIZE,
    });
  } catch (e) {
    console.error("[api/admin/adready-leads] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

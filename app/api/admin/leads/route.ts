import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOURCES = new Set(["multistep_form", "chatbot", "hero_form"]);
const PAGES = new Set(["index", "clinic", "doctors", "restaurant"]);
const PAGE_SIZE = 50;

function authed(req: NextRequest): boolean {
  return verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value);
}
function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!authed(req)) return unauthorized();

  const sp = req.nextUrl.searchParams;
  const source = sp.get("source") || "";
  const utmSource = sp.get("utm_source") || "";
  const page = sp.get("page") || "";
  const pageNum = Math.max(0, parseInt(sp.get("page_num") || "0", 10));
  const offset = pageNum * PAGE_SIZE;

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("leads")
      .select(
        "id, created_at, source, page, name, contact, goal, budget, plan, channel, intent, utm_source, utm_medium, utm_campaign, utm_content, utm_term, referrer"
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (source && SOURCES.has(source)) {
      query = query.eq("source", source);
    }
    if (utmSource) {
      query = query.eq("utm_source", utmSource);
    }
    if (page && PAGES.has(page)) {
      query = query.eq("page", page);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[api/admin/leads] GET error:", error.message);
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
    console.error("[api/admin/leads] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

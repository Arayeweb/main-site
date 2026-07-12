import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession, type AdminRole } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SALES_ROLES: AdminRole[] = ["sales", "admin"];

const FULL_SELECT =
  "id, created_at, source, page, name, contact, company, goal, budget, plan, channel, sitetype, intent, detail, " +
  "crm_status, owner_id, next_followup_at, crm_note, crm_updated_at, utm_source, utm_medium, utm_campaign, " +
  "utm_content, utm_term, referrer, raw, user_agent, consent";

function salesSession(req: NextRequest) {
  const session = getSession(req);
  if (!session || !SALES_ROLES.includes(session.role)) return null;
  return session;
}

function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!salesSession(req)) return unauthorized();

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "missing_id" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("leads")
      .select(FULL_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[api/sales/leads/[id]] GET error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, lead: data });
  } catch (e) {
    console.error("[api/sales/leads/[id]] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession, type AdminRole } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SALES_ROLES: AdminRole[] = ["sales", "admin"];
const KINDS = new Set(["note", "call", "followup"]);

function salesSession(req: NextRequest) {
  const session = getSession(req);
  if (!session || !SALES_ROLES.includes(session.role)) return null;
  return session;
}
function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}
function str(v: unknown, max = 1000): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

// تاریخچهٔ فعالیت یک لید.
export async function GET(req: NextRequest) {
  const session = salesSession(req);
  if (!session) return unauthorized();

  const leadId = req.nextUrl.searchParams.get("lead_id");
  if (!leadId) {
    return NextResponse.json({ ok: false, error: "missing_lead_id" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("lead_activities")
      .select("id, created_at, kind, body, author_name")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("[api/sales/activities] GET error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, activities: data || [] });
  } catch (e) {
    console.error("[api/sales/activities] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// ثبت یادداشت/تماس روی یک لید.
export async function POST(req: NextRequest) {
  const session = salesSession(req);
  if (!session) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const leadId = str(body.lead_id, 64);
  const text = str(body.body, 2000);
  const kindRaw = str(body.kind, 32) || "note";
  const kind = KINDS.has(kindRaw) ? kindRaw : "note";
  if (!leadId || !text) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("lead_activities")
      .insert({
        lead_id: leadId,
        author_id: session.userId === "admin" ? null : session.userId,
        author_name: session.role === "admin" ? "مدیر" : "فروش",
        kind,
        body: text,
      })
      .select("id, created_at, kind, body, author_name")
      .single();

    if (error) {
      console.error("[api/sales/activities] POST error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    // آخرین یادداشت کوتاه را روی خود لید هم نگه می‌داریم.
    await supabase
      .from("leads")
      .update({ crm_note: text.slice(0, 1000), crm_updated_at: new Date().toISOString() })
      .eq("id", leadId);

    return NextResponse.json({ ok: true, activity: data });
  } catch (e) {
    console.error("[api/sales/activities] POST error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

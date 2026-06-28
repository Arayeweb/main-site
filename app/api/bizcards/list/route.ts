import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!getSession(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("bizcards")
      .select("id, slug, business_name, category, phone, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[api/bizcards/list] error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, cards: data || [] });
  } catch (e) {
    console.error("[api/bizcards/list] error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

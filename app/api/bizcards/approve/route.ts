import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/bizcards/approve  — ادمین، تایید کارت pending
export async function POST(req: NextRequest) {
  if (!getSession(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let body: { id?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 }); }

  const id = String(body.id || "").trim();
  if (!id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 422 });

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("bizcards")
      .update({ is_active: true })
      .eq("id", id);

    if (error) {
      console.error("[api/bizcards/approve] error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/bizcards/approve] error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

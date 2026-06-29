import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/bizcards/count — عمومی، تعداد کل کارت‌های فعال
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from("bizcards")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    if (error) return NextResponse.json({ ok: false, count: 0 }, { status: 500 });
    return NextResponse.json({ ok: true, count: count ?? 0 });
  } catch {
    return NextResponse.json({ ok: false, count: 0 }, { status: 500 });
  }
}

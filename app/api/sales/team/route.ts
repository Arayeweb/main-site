import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession, type AdminRole } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SALES_ROLES: AdminRole[] = ["sales", "admin"];

// لیست اعضای تیم فروش برای انتساب مالک لید.
export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session || !SALES_ROLES.includes(session.role)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, name, email, role")
      .in("role", ["sales", "admin"])
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("[api/sales/team] GET error:", error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      team: data || [],
      me: session.userId,
      role: session.role,
    });
  } catch (e) {
    console.error("[api/sales/team] GET error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

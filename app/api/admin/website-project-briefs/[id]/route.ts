import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireRoles, dbError, unauthorized, isMissingTableError } from "@/lib/adminRouteHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  if (!requireRoles(req, ["admin", "sales"])) return unauthorized();

  const { id } = await context.params;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("website_project_briefs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error.message)) {
        return NextResponse.json({ ok: false, error: "migration_required" }, { status: 503 });
      }
      return dbError(error.message);
    }

    if (!data) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, brief: data });
  } catch (e) {
    console.error("[api/admin/website-project-briefs/[id]] GET:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

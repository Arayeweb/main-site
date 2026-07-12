import { NextRequest, NextResponse } from "next/server";
import {
  dbError,
  isMissingTableError,
  requireRoles,
  unauthorized,
} from "@/lib/adminRouteHelpers";
import { isUuid, mapFastWebOrder } from "@/lib/fastweb";
import { FASTWEB_ORDER_COLUMNS } from "@/lib/fastweb";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

export async function GET(req: NextRequest, ctx: RouteContext) {
  if (!requireRoles(req, ["admin", "sales"])) return unauthorized();
  if (!isUuid(ctx.params.id)) {
    return NextResponse.json({ ok: false, error: "bad_id" }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("fastweb_orders")
    .select(FASTWEB_ORDER_COLUMNS)
    .eq("id", ctx.params.id)
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

  return NextResponse.json({
    ok: true,
    order: mapFastWebOrder(data as unknown as Record<string, unknown>, {
      includeAccessToken: true,
    }),
  });
}

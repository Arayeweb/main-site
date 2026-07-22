import { NextRequest, NextResponse } from "next/server";
import {
  dbError,
  isMissingTableError,
  requireRoles,
  str,
  unauthorized,
} from "@/lib/adminRouteHelpers";
import {
  FULFILLMENT_STATUSES,
  isFulfillmentStatus,
  mapFastWebOrder,
} from "@/lib/fastweb";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
const LIST_COLUMNS =
  "id, slug, phone, business_name, package, amount_toman, payment_status, " +
  "fulfillment_status, category_key, template_key, revision_count, domain_request, " +
  "paid_at, published_at, created_at, updated_at";

export async function GET(req: NextRequest) {
  if (!requireRoles(req, ["admin", "sales"])) return unauthorized();

  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim();
  const fulfillment = sp.get("fulfillment") || "";
  const payment = sp.get("payment") || "";
  const pageNum = Math.max(0, parseInt(sp.get("page_num") || "0", 10));
  const offset = pageNum * PAGE_SIZE;

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("fastweb_orders")
      .select(LIST_COLUMNS, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (fulfillment && isFulfillmentStatus(fulfillment)) {
      query = query.eq("fulfillment_status", fulfillment);
    }
    if (payment === "paid" || payment === "pending" || payment === "draft") {
      query = query.eq("payment_status", payment);
    } else {
      // Default: show paid queue for ops
      query = query.eq("payment_status", "paid");
    }

    if (q) {
      query = query.or(
        `business_name.ilike.%${q}%,phone.ilike.%${q}%,slug.ilike.%${q}%`
      );
    }

    const { data, error, count } = await query;
    if (error) {
      if (isMissingTableError(error.message)) {
        return NextResponse.json({
          ok: true,
          orders: [],
          page_num: pageNum,
          page_size: PAGE_SIZE,
          total: 0,
          has_more: false,
          migration_required: true,
        });
      }
      return dbError(error.message);
    }

    const orders = (data || []).map((row) =>
      mapFastWebOrder(row as unknown as Record<string, unknown>)
    );

    return NextResponse.json({
      ok: true,
      orders,
      page_num: pageNum,
      page_size: PAGE_SIZE,
      total: count ?? orders.length,
      has_more: (count ?? 0) > offset + PAGE_SIZE,
      statuses: FULFILLMENT_STATUSES,
    });
  } catch (e) {
    console.error("[admin/fastweb]", e);
    return dbError();
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireRoles(req, ["admin", "sales"])) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const id = str(body.id, 40);
  if (!id) {
    return NextResponse.json({ ok: false, error: "missing_id" }, { status: 422 });
  }

  const patch: Record<string, unknown> = {};
  if (isFulfillmentStatus(body.fulfillmentStatus)) {
    patch.fulfillment_status = body.fulfillmentStatus;
    if (body.fulfillmentStatus === "published") {
      patch.published_at = new Date().toISOString();
    }
  }
  if (typeof body.adminNotes === "string") {
    patch.admin_notes = body.adminNotes.trim().slice(0, 4000) || null;
  }
  if (body.publishedContent && typeof body.publishedContent === "object") {
    patch.published_content = body.publishedContent;
  }
  if (typeof body.slug === "string" && body.slug.trim()) {
    patch.slug = body.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 48);
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "empty_patch" }, { status: 422 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("fastweb_orders")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error.message)) {
      return NextResponse.json({
        ok: false,
        error: "migration_required",
      }, { status: 503 });
    }
    return dbError(error.message);
  }

  if (!data) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    order: mapFastWebOrder(data as Record<string, unknown>),
  });
}

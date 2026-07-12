import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import { isUuid, mapFastWebOrder, type FastWebBrief } from "@/lib/fastweb";
import {
  getFastWebSession,
  setFastWebSessionCookie,
} from "@/lib/fastwebSession";
import { getSupabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

async function authorizeOrder(
  req: NextRequest,
  id: string
): Promise<
  | { ok: true; row: Record<string, unknown>; accessToken: string }
  | { ok: false; status: number; error: string }
> {
  if (!isUuid(id)) return { ok: false, status: 400, error: "bad_id" };

  const session = getFastWebSession(req);
  const headerToken = req.headers.get("x-fastweb-token")?.trim() || "";
  const spToken = req.nextUrl.searchParams.get("accessToken")?.trim() || "";

  const supabase = getSupabaseAdmin();

  if (session && session.orderId === id) {
    const { data, error } = await supabase
      .from("fastweb_orders")
      .select("*")
      .eq("id", id)
      .eq("access_token", session.accessToken)
      .maybeSingle();
    if (error || !data) return { ok: false, status: 404, error: "not_found" };
    return {
      ok: true,
      row: data as Record<string, unknown>,
      accessToken: session.accessToken,
    };
  }

  const token = headerToken || spToken;
  if (!token) return { ok: false, status: 401, error: "unauthorized" };

  const { data, error } = await supabase
    .from("fastweb_orders")
    .select("*")
    .eq("id", id)
    .eq("access_token", token)
    .maybeSingle();

  if (error || !data) return { ok: false, status: 404, error: "not_found" };
  return {
    ok: true,
    row: data as Record<string, unknown>,
    accessToken: token,
  };
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const auth = await authorizeOrder(req, ctx.params.id);
  if (!auth.ok) {
    return jsonNoStore({ ok: false, error: auth.error }, { status: auth.status });
  }

  const order = mapFastWebOrder(auth.row);
  const res = NextResponse.json({ ok: true, order });
  res.headers.set("Cache-Control", "no-store");
  if (!getFastWebSession(req) || getFastWebSession(req)?.orderId !== order.id) {
    setFastWebSessionCookie(res, order.id, auth.accessToken);
  }
  return res;
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const auth = await authorizeOrder(req, ctx.params.id);
  if (!auth.ok) {
    return jsonNoStore({ ok: false, error: auth.error }, { status: auth.status });
  }

  if (auth.row.payment_status !== "paid") {
    return jsonNoStore({ ok: false, error: "not_paid" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  const brief = { ...((auth.row.brief as FastWebBrief) || {}) };

  if (body.contacts && typeof body.contacts === "object") {
    brief.contacts = {
      ...(brief.contacts || {}),
      ...(body.contacts as FastWebBrief["contacts"]),
    };
    patch.brief = brief;
    if (typeof (body.contacts as { phone?: string }).phone === "string") {
      patch.phone = (body.contacts as { phone: string }).phone;
    }
  }

  if (typeof body.domainRequest === "string") {
    patch.domain_request = body.domainRequest.trim().slice(0, 200) || null;
  }

  if (typeof body.revisionNotes === "string") {
    const notes = body.revisionNotes.trim().slice(0, 4000);
    if (notes) {
      const maxRevisions = auth.row.package === "plus" ? 2 : 1;
      const current = Number(auth.row.revision_count) || 0;
      if (current >= maxRevisions) {
        return jsonNoStore(
          { ok: false, error: "revision_limit" },
          { status: 422 }
        );
      }
      patch.revision_notes = notes;
      patch.revision_count = current + 1;
      if (
        auth.row.fulfillment_status === "first_version" ||
        auth.row.fulfillment_status === "awaiting_approval"
      ) {
        patch.fulfillment_status = "design";
      }
    }
  }

  if (Object.keys(patch).length === 0) {
    return jsonNoStore({ ok: false, error: "empty_patch" }, { status: 422 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("fastweb_orders")
    .update(patch)
    .eq("id", ctx.params.id)
    .eq("access_token", auth.accessToken)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    console.error("[fastweb/orders] patch", error);
    return jsonNoStore({ ok: false, error: "db_error" }, { status: 500 });
  }

  return jsonNoStore({
    ok: true,
    order: mapFastWebOrder(data as Record<string, unknown>),
  });
}

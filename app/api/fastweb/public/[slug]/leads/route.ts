import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: { slug: string } };

export async function POST(req: NextRequest, ctx: RouteContext) {
  const slug = ctx.params.slug?.trim();
  if (!slug) {
    return jsonNoStore({ ok: false, error: "bad_slug" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const phone =
    typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : "";
  const message =
    typeof body.message === "string" ? body.message.trim().slice(0, 1000) : "";

  if (!name || !phone) {
    return jsonNoStore({ ok: false, error: "missing_fields" }, { status: 422 });
  }

  function str(v: unknown, max = 200): string | null {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s ? s.slice(0, max) : null;
  }

  const utm = {
    utm_source: str(body.utm_source),
    utm_medium: str(body.utm_medium),
    utm_campaign: str(body.utm_campaign),
    utm_content: str(body.utm_content),
    utm_term: str(body.utm_term),
    referrer: str(body.referrer, 500),
  };

  try {
    const supabase = getSupabaseAdmin();
    const { data: order } = await supabase
      .from("fastweb_orders")
      .select("id, business_name, phone, payment_status, fulfillment_status")
      .eq("slug", slug)
      .eq("payment_status", "paid")
      .in("fulfillment_status", ["first_version", "awaiting_approval", "published"])
      .maybeSingle();

    if (!order) {
      return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
    }

    await supabase.from("leads").insert({
      source: "fastweb_site_form",
      page: `/s/${slug}`,
      name,
      contact: phone,
      detail: message || null,
      goal: "fastweb_lead",
      ...utm,
      raw: {
        orderId: order.id,
        businessName: order.business_name,
        ownerPhone: order.phone,
        message,
      },
      consent: true,
    });

    return jsonNoStore({ ok: true });
  } catch (e) {
    console.error("[fastweb/public/leads]", e);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
}

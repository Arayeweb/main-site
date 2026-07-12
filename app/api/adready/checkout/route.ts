import { NextRequest } from "next/server";
import { getAdReadySession } from "@/lib/adreadySession";
import {
  ADREADY_PACKAGES,
  isAdReadyPackageKey,
} from "@/lib/adreadyPackages";
import { isUuid } from "@/lib/adready";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getPaymentCallbackUrl } from "@/lib/paymentCallback";
import { getSupabaseAdmin } from "@/lib/supabase";
import { zibalRequest } from "@/lib/zibal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = getAdReadySession(req);
  if (!session) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const campaignId =
    typeof body.campaignId === "string" ? body.campaignId : "";
  const packageKey = isAdReadyPackageKey(body.package) ? body.package : null;
  if (!isUuid(campaignId)) {
    return jsonNoStore({ ok: false, error: "invalid_campaign" }, { status: 422 });
  }
  if (!packageKey) {
    return jsonNoStore({ ok: false, error: "invalid_package" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const [{ data: campaign, error: campaignError }, { data: user }] =
      await Promise.all([
        supabase
          .from("campaign_pages")
          .select(
            "id, title, business_name, payment_status, active_package, expires_at"
          )
          .eq("id", campaignId)
          .eq("user_id", session.userId)
          .maybeSingle(),
        supabase
          .from("ai_users")
          .select("phone")
          .eq("id", session.userId)
          .maybeSingle(),
      ]);

    if (campaignError || !campaign) {
      return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
    }

    const expiry = campaign.expires_at
      ? new Date(String(campaign.expires_at))
      : null;
    const active =
      campaign.payment_status === "paid" &&
      (!expiry || (!Number.isNaN(expiry.getTime()) && expiry > new Date()));
    if (active && campaign.active_package === "lifetime") {
      return jsonNoStore({
        ok: true,
        alreadyPaid: true,
        redirectUrl: `/dashboard/adready/pages/${campaignId}`,
      });
    }

    const pkg = ADREADY_PACKAGES[packageKey];
    const zibal = await zibalRequest({
      amountToman: pkg.priceToman,
      callbackUrl: getPaymentCallbackUrl("adready", "/api/adready/verify"),
      description: `AdReady آرایه — ${pkg.name} — ${
        campaign.business_name || campaign.title
      }`,
      orderId: `adready-${campaignId.slice(0, 8)}-${Date.now()}`,
      mobile: typeof user?.phone === "string" ? user.phone : undefined,
    });

    if (!zibal.ok || !zibal.trackId || !zibal.redirectUrl) {
      return jsonNoStore(
        { ok: false, error: zibal.error || "gateway_error" },
        { status: 502 }
      );
    }

    const { error: orderError } = await supabase.from("adready_orders").insert({
      user_id: session.userId,
      campaign_page_id: campaignId,
      package: packageKey,
      amount_toman: pkg.priceToman,
      list_amount_toman: pkg.listPriceToman,
      payment_status: "pending",
      zibal_track_id: zibal.trackId,
    });
    if (orderError) {
      console.error("[adready/checkout] insert order", orderError);
      return jsonNoStore({ ok: false, error: "db_error" }, { status: 500 });
    }

    if (!active) {
      const { error: campaignUpdateError } = await supabase
        .from("campaign_pages")
        .update({ payment_status: "pending" })
        .eq("id", campaignId)
        .eq("user_id", session.userId);
      if (campaignUpdateError) {
        console.error(
          "[adready/checkout] mark pending",
          campaignUpdateError.message
        );
      }
    }

    return jsonNoStore({
      ok: true,
      trackId: zibal.trackId,
      redirectUrl: zibal.redirectUrl,
    });
  } catch (error) {
    console.error("[adready/checkout]", error);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
}

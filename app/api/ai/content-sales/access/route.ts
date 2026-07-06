import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  attachContentSalesCookie,
  getContentSalesSession,
} from "@/lib/contentSalesAccess";
import { findActiveContentSalesOrder } from "@/lib/contentSalesOrder";
import { getAISession } from "@/lib/aiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const revealSetup = req.nextUrl.searchParams.get("reveal_setup") === "1";
  const supabase = getSupabaseAdmin();

  const cookieSession = getContentSalesSession(req);
  let order = await findActiveContentSalesOrder(supabase, {
    orderId: cookieSession?.orderId,
  });

  let issuedCookie = false;

  if (!order) {
    const aiSession = getAISession(req);
    if (!aiSession) {
      return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const { data: user } = await supabase
      .from("ai_users")
      .select("id, phone")
      .eq("id", aiSession.userId)
      .maybeSingle();

    if (!user) {
      return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    order = await findActiveContentSalesOrder(supabase, {
      aiUserId: user.id as string,
      phone: user.phone as string,
    });

    if (!order) {
      return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
    }
    issuedCookie = true;
  }

  let oneTimePassword: string | null = null;
  if (revealSetup && order.temp_password) {
    oneTimePassword = order.temp_password;
    await supabase
      .from("content_sales_orders")
      .update({ temp_password: null })
      .eq("id", order.id);
  }

  const res = jsonNoStore({
    ok: true,
    order: {
      buyerName: order.buyer_name,
      paidAt: order.paid_at,
      status: order.status,
    },
    needsManualSetup: order.status === "paid_needs_setup",
    oneTimePassword,
    aiUrl: "/ai",
  });

  if (issuedCookie) {
    attachContentSalesCookie(res, order.id);
  }

  return res;
}

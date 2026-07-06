import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";
import { CONTENT_SALES_LAUNCH_PRICE_TOMAN } from "@/lib/contentSalesBundle";
import { generateAccessToken } from "@/lib/contentSalesAccess";
import { findActiveContentSalesOrder, maskPhone } from "@/lib/contentSalesOrder";
import { getAISession } from "@/lib/aiAuth";
import { normalizeContact } from "@/lib/validateContact";
import { zibalRequest } from "@/lib/zibal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com";

function str(v: unknown, max = 200): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const email = str(body.email, 120);
  const supabase = getSupabaseAdmin();
  const aiSession = getAISession(req);

  let phone: string;
  let buyerName: string;
  let aiUserId: string | null = null;

  if (aiSession) {
    const { data: user } = await supabase
      .from("ai_users")
      .select("id, phone")
      .eq("id", aiSession.userId)
      .maybeSingle();

    if (!user?.phone) {
      return jsonNoStore({ ok: false, error: "user_not_found" }, { status: 404 });
    }

    phone = user.phone as string;
    aiUserId = user.id as string;
    const nameFromBody = str(body.name, 120);
    buyerName = nameFromBody || `کاربر ${maskPhone(phone)}`;
  } else {
    const name = str(body.name, 120);
    const rawPhone = str(body.phone, 20);

    if (!name || !rawPhone) {
      return jsonNoStore({ ok: false, error: "missing_fields" }, { status: 422 });
    }

    const { kind, value: normalized } = normalizeContact(rawPhone);
    if (kind !== "phone") {
      return jsonNoStore({ ok: false, error: "invalid_phone" }, { status: 422 });
    }

    phone = normalized;
    buyerName = name;
  }

  const existing = await findActiveContentSalesOrder(supabase, {
    aiUserId: aiUserId ?? undefined,
    phone,
  });
  if (existing) {
    return jsonNoStore(
      {
        ok: false,
        error: "already_purchased",
        message: "این حساب قبلاً پکیج را خریده — از منوی AI وارد «پکیج محتوا» شو.",
        appUrl: "/ai/content-sales/app",
      },
      { status: 409 }
    );
  }

  const accessToken = generateAccessToken();
  const orderId = `cs-bundle-${Date.now()}`;

  const zibal = await zibalRequest({
    amountToman: CONTENT_SALES_LAUNCH_PRICE_TOMAN,
    callbackUrl: `${SITE_URL}/api/ai/content-sales/verify`,
    description: "Araaye AI Content & Sales Bundle",
    orderId,
    mobile: phone,
  });

  if (!zibal.ok || !zibal.trackId) {
    return jsonNoStore(
      { ok: false, error: zibal.error || "gateway_error" },
      { status: 502 }
    );
  }

  const { error: orderErr } = await supabase.from("content_sales_orders").insert({
    buyer_name: buyerName,
    buyer_phone: phone,
    buyer_email: email,
    amount_toman: CONTENT_SALES_LAUNCH_PRICE_TOMAN,
    zibal_track_id: zibal.trackId,
    status: "pending",
    access_token: accessToken,
    ai_user_id: aiUserId,
    raw: { utm: body.utm || null, checkout_via: aiUserId ? "ai_session" : "guest" },
  });

  if (orderErr) {
    console.error("[api/ai/content-sales/checkout]", orderErr);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }

  return jsonNoStore({ ok: true, redirectUrl: zibal.redirectUrl });
}

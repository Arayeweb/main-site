import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { attachContentSalesCookie } from "@/lib/contentSalesAccess";
import { provisionContentSalesAI } from "@/lib/contentSalesProvision";
import { signAIToken, AI_COOKIE } from "@/lib/aiAuth";
import { zibalVerify } from "@/lib/zibal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com";
const AMOUNT_TOLERANCE = 10;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const trackId = sp.get("trackId");
  const status = sp.get("status");
  const success = sp.get("success");

  if (!trackId) {
    return NextResponse.redirect(`${SITE_URL}/ai/content-sales?payment=error`);
  }

  const supabase = getSupabaseAdmin();
  const { data: order } = await supabase
    .from("content_sales_orders")
    .select("id, amount_toman, buyer_phone, buyer_name, status, ai_user_id")
    .eq("zibal_track_id", trackId)
    .maybeSingle();

  if (!order) {
    return NextResponse.redirect(`${SITE_URL}/ai/content-sales?payment=error`);
  }

  const successUrl = new URL(`${SITE_URL}/ai/content-sales/app`);
  successUrl.searchParams.set("welcome", "1");

  if (order.status === "paid" || order.status === "paid_needs_setup") {
    const res = NextResponse.redirect(successUrl.toString());
    setCookies(res, order.id as string, order.ai_user_id as string | null);
    return res;
  }

  if (status === "NOK" || success === "false") {
    await supabase.from("content_sales_orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.redirect(`${SITE_URL}/ai/content-sales?payment=failed`);
  }

  const verify = await zibalVerify(trackId);
  if (!verify.ok || !verify.paid) {
    await supabase.from("content_sales_orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.redirect(`${SITE_URL}/ai/content-sales?payment=failed`);
  }

  const paidAmount = verify.amount ?? 0;
  if (Math.abs(paidAmount - (order.amount_toman as number)) > AMOUNT_TOLERANCE) {
    await supabase.from("content_sales_orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.redirect(`${SITE_URL}/ai/content-sales?payment=error`);
  }

  let orderStatus: "paid" | "paid_needs_setup" = "paid";
  let aiUserId: string | null = null;
  let tempPassword: string | null = null;

  try {
    const provision = await provisionContentSalesAI(
      supabase,
      order.buyer_phone as string,
      order.buyer_name as string
    );
    aiUserId = provision.aiUserId;
    tempPassword = provision.tempPassword;
  } catch (e) {
    console.error("[content-sales/verify] provision failed:", e);
    orderStatus = "paid_needs_setup";
    await supabase.from("leads").insert({
      source: "content_sales_provision_failed",
      page: "content-sales",
      name: order.buyer_name,
      contact: order.buyer_phone,
      detail: `URGENT provision failed track=${trackId}`,
      consent: true,
    });
  }

  await supabase
    .from("content_sales_orders")
    .update({
      status: orderStatus,
      paid_at: new Date().toISOString(),
      ai_user_id: aiUserId,
      temp_password: tempPassword,
    })
    .eq("id", order.id);

  if (orderStatus === "paid_needs_setup") {
    successUrl.searchParams.set("setup", "pending");
  }

  await supabase.from("leads").insert({
    source: "content_sales_paid",
    page: "content-sales",
    name: order.buyer_name,
    contact: order.buyer_phone,
    plan: "content_sales_bundle",
    budget: String(order.amount_toman),
    consent: true,
  });

  const res = NextResponse.redirect(successUrl.toString());
  setCookies(res, order.id as string, aiUserId);
  return res;
}

function setCookies(res: NextResponse, orderId: string, aiUserId: string | null) {
  attachContentSalesCookie(res, orderId);
  if (aiUserId) {
    res.cookies.set(AI_COOKIE, signAIToken(aiUserId, "pro"), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
  }
}

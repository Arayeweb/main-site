// =========================================================
// Telegram Zibal payment order creation and settlement
// =========================================================

import { getSupabaseAdmin } from "@/lib/supabase";
import { getPaymentCallbackUrl } from "@/lib/paymentCallback";
import { resolveZibalVerify, zibalRequest } from "@/lib/zibal";
import { getTelegramConfig } from "./config";
import { getTelegramPackage } from "./packages";
import { ensureAraayeUser, linkAraayeUser } from "./accounts";
import { trackEvent } from "./events";
import { sendMessage } from "./api";
import { COPY } from "./copy";
import {
  tomanToIrr,
  trackServerAnalyticsEvent,
} from "@/lib/analytics/server";

const AMOUNT_TOLERANCE = 10;

export async function activatePaymentOrder(opts: {
  orderId: string;
  telegramUserId: string;
  telegramId: number;
  phone: string;
}): Promise<
  | { ok: true; redirectUrl: string }
  | { ok: false; error: string }
> {
  const supabase = getSupabaseAdmin();
  const { data: order } = await supabase
    .from("telegram_payment_orders")
    .select("id, package_id, amount_toman, credits, status, phone")
    .eq("id", opts.orderId)
    .eq("telegram_user_id", opts.telegramUserId)
    .maybeSingle();

  if (!order || order.status !== "pending") {
    return { ok: false, error: "invalid_order" };
  }

  const pkg = getTelegramPackage(order.package_id as string);
  if (!pkg) return { ok: false, error: "invalid_package" };

  const araayeUserId = await ensureAraayeUser(opts.phone);
  if (!araayeUserId) return { ok: false, error: "account_error" };
  await linkAraayeUser(opts.telegramUserId, araayeUserId);

  if (!order.phone) {
    await supabase
      .from("telegram_payment_orders")
      .update({ phone: opts.phone })
      .eq("id", order.id);
  }

  const callbackUrl = getPaymentCallbackUrl(
    "telegram",
    "/api/telegram/payment/zibal/callback"
  );
  const zibal = await zibalRequest({
    amountToman: order.amount_toman as number,
    callbackUrl,
    description: `آرایه تلگرام — بسته ${pkg.name}`,
    orderId: order.id as string,
    mobile: opts.phone,
  });

  if (!zibal.ok || !zibal.trackId || !zibal.redirectUrl) {
    return { ok: false, error: zibal.error || "zibal_error" };
  }

  await supabase
    .from("telegram_payment_orders")
    .update({ zibal_track_id: zibal.trackId })
    .eq("id", order.id);

  await trackEvent("payment_link_created", {
    telegramUserId: opts.telegramUserId,
    telegramId: opts.telegramId,
    metadata: { package_id: order.package_id, order_id: order.id },
  });

  return { ok: true, redirectUrl: zibal.redirectUrl };
}

export async function createPaymentOrder(opts: {
  telegramUserId: string;
  telegramId: number;
  packageId: string;
  phone: string;
}): Promise<
  | { ok: true; orderId: string; redirectUrl: string }
  | { ok: false; error: string }
> {
  const pkg = getTelegramPackage(opts.packageId);
  if (!pkg) return { ok: false, error: "invalid_package" };

  const araayeUserId = await ensureAraayeUser(opts.phone);
  if (!araayeUserId) return { ok: false, error: "account_error" };

  await linkAraayeUser(opts.telegramUserId, araayeUserId);

  const supabase = getSupabaseAdmin();
  const { data: order, error } = await supabase
    .from("telegram_payment_orders")
    .insert({
      telegram_user_id: opts.telegramUserId,
      package_id: pkg.id,
      amount_toman: pkg.priceToman,
      credits: pkg.credits,
      phone: opts.phone,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !order) {
    console.error("[telegram/payment] order insert failed:", error?.message);
    return { ok: false, error: "db_error" };
  }

  const callbackUrl = getPaymentCallbackUrl(
    "telegram",
    "/api/telegram/payment/zibal/callback"
  );
  const zibal = await zibalRequest({
    amountToman: pkg.priceToman,
    callbackUrl,
    description: `آرایه تلگرام — بسته ${pkg.name}`,
    orderId: order.id as string,
    mobile: opts.phone,
  });

  if (!zibal.ok || !zibal.trackId || !zibal.redirectUrl) {
    await supabase
      .from("telegram_payment_orders")
      .update({ status: "failed" })
      .eq("id", order.id);
    return { ok: false, error: zibal.error || "zibal_error" };
  }

  await supabase
    .from("telegram_payment_orders")
    .update({ zibal_track_id: zibal.trackId })
    .eq("id", order.id);

  await trackEvent("payment_link_created", {
    telegramUserId: opts.telegramUserId,
    telegramId: opts.telegramId,
    metadata: { package_id: pkg.id, order_id: order.id },
  });

  return { ok: true, orderId: order.id as string, redirectUrl: zibal.redirectUrl };
}

export async function settlePaymentByTrackId(
  trackId: string,
  status?: string | null,
  success?: string | null,
  searchParams?: URLSearchParams
): Promise<{
  ok: boolean;
  telegramId?: number;
  alreadyPaid?: boolean;
  error?: string;
}> {
  const supabase = getSupabaseAdmin();

  const { data: order } = await supabase
    .from("telegram_payment_orders")
    .select(
      "id, telegram_user_id, package_id, amount_toman, credits, phone, status, zibal_track_id"
    )
    .eq("zibal_track_id", trackId)
    .maybeSingle();

  if (!order) return { ok: false, error: "order_not_found" };

  const { data: tgUser } = await supabase
    .from("telegram_users")
    .select("telegram_id, araaye_user_id")
    .eq("id", order.telegram_user_id)
    .maybeSingle();

  const telegramId = tgUser?.telegram_id as number | undefined;

  if (order.status === "paid") {
    await trackServerAnalyticsEvent({
      event: "purchase_completed",
      dedupeKey: `purchase:telegram:${order.id}`,
      productArea: "ai",
      page: "/telegram",
      actorId: tgUser?.araaye_user_id,
      accountId: order.telegram_user_id,
      value: tomanToIrr(order.amount_toman),
      currency: "IRR",
      properties: { package: order.package_id, channel: "telegram", payment_provider: "zibal" },
    });
    return { ok: true, telegramId, alreadyPaid: true };
  }

  if (status === "NOK" || success === "false") {
    await supabase
      .from("telegram_payment_orders")
      .update({ status: "failed" })
      .eq("id", order.id);
    if (telegramId) {
      await sendMessage(telegramId, COPY.paymentFailed);
      await trackEvent("payment_failed", {
        telegramUserId: order.telegram_user_id as string,
        telegramId,
        metadata: { order_id: order.id, track_id: trackId },
      });
    }
    return { ok: false, error: "payment_cancelled", telegramId };
  }

  const verify = searchParams
    ? await resolveZibalVerify(trackId, searchParams)
    : await resolveZibalVerify(trackId, new URLSearchParams());
  if (!verify.ok || !verify.paid) {
    await supabase
      .from("telegram_payment_orders")
      .update({ status: "failed" })
      .eq("id", order.id);
    if (telegramId) {
      await sendMessage(telegramId, COPY.paymentFailed);
      await trackEvent("payment_failed", {
        telegramUserId: order.telegram_user_id as string,
        telegramId,
        metadata: { order_id: order.id },
      });
    }
    return { ok: false, error: "verify_failed", telegramId };
  }

  const paidAmount = verify.amount ?? 0;
  if (Math.abs(paidAmount - (order.amount_toman as number)) > AMOUNT_TOLERANCE) {
    return { ok: false, error: "amount_mismatch", telegramId };
  }

  const phone = order.phone as string;
  let araayeUserId = tgUser?.araaye_user_id as string | null;
  if (!araayeUserId && phone) {
    araayeUserId = await ensureAraayeUser(phone);
  }
  if (!araayeUserId) return { ok: false, error: "no_user", telegramId };

  const { data: settled, error: rpcErr } = await supabase.rpc(
    "telegram_settle_payment_order",
    {
      p_order_id: order.id,
      p_track_id: trackId,
      p_paid_amount: paidAmount,
      p_araaye_user_id: araayeUserId,
    }
  );

  if (rpcErr) {
    console.error("[telegram/payment] settle rpc failed:", rpcErr.message);
    return { ok: false, error: "settle_failed", telegramId };
  }

  const result = settled as { ok?: boolean; already_paid?: boolean };
  if (!result.ok) return { ok: false, error: "settle_rejected", telegramId };

  await trackServerAnalyticsEvent({
    event: "purchase_completed",
    dedupeKey: `purchase:telegram:${order.id}`,
    productArea: "ai",
    page: "/telegram",
    actorId: araayeUserId,
    accountId: order.telegram_user_id,
    value: tomanToIrr(order.amount_toman),
    currency: "IRR",
    properties: { package: order.package_id, channel: "telegram", payment_provider: "zibal" },
  });

  if (telegramId) {
    await sendMessage(telegramId, COPY.paymentSuccess);
    await trackEvent("payment_success", {
      telegramUserId: order.telegram_user_id as string,
      telegramId,
      metadata: {
        order_id: order.id,
        package_id: order.package_id,
        credits: order.credits,
      },
    });
  }

  return { ok: true, telegramId, alreadyPaid: result.already_paid };
}

export async function createPendingOrderForConfirm(opts: {
  telegramUserId: string;
  packageId: string;
  phone: string;
}): Promise<string | null> {
  const pkg = getTelegramPackage(opts.packageId);
  if (!pkg) return null;

  const araayeUserId = await ensureAraayeUser(opts.phone);
  if (!araayeUserId) return null;
  await linkAraayeUser(opts.telegramUserId, araayeUserId);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("telegram_payment_orders")
    .insert({
      telegram_user_id: opts.telegramUserId,
      package_id: pkg.id,
      amount_toman: pkg.priceToman,
      credits: pkg.credits,
      phone: opts.phone,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) return null;
  return data.id as string;
}

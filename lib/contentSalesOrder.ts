import type { SupabaseClient } from "@supabase/supabase-js";

export const CONTENT_SALES_PAID_STATUSES = ["paid", "paid_needs_setup"] as const;

export type ContentSalesOrderRow = {
  id: string;
  buyer_name: string;
  buyer_phone: string;
  status: string;
  paid_at: string | null;
  temp_password: string | null;
  ai_user_id: string | null;
};

export function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length < 8) return "09** *** ** **";
  return `${d.slice(0, 4)}***${d.slice(-4)}`;
}

/** سفارش پرداخت‌شدهٔ فعال کاربر — با ai_user_id یا موبایل */
export async function findActiveContentSalesOrder(
  supabase: SupabaseClient,
  opts: { orderId?: string; aiUserId?: string; phone?: string }
): Promise<ContentSalesOrderRow | null> {
  const select =
    "id, buyer_name, buyer_phone, status, paid_at, temp_password, ai_user_id";

  if (opts.orderId) {
    const { data } = await supabase
      .from("content_sales_orders")
      .select(select)
      .eq("id", opts.orderId)
      .in("status", [...CONTENT_SALES_PAID_STATUSES])
      .maybeSingle();
    if (data) return data as ContentSalesOrderRow;
  }

  if (opts.aiUserId) {
    const { data } = await supabase
      .from("content_sales_orders")
      .select(select)
      .eq("ai_user_id", opts.aiUserId)
      .in("status", [...CONTENT_SALES_PAID_STATUSES])
      .order("paid_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) return data as ContentSalesOrderRow;
  }

  if (opts.phone) {
    const { data } = await supabase
      .from("content_sales_orders")
      .select(select)
      .eq("buyer_phone", opts.phone)
      .in("status", [...CONTENT_SALES_PAID_STATUSES])
      .order("paid_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) return data as ContentSalesOrderRow;
  }

  return null;
}

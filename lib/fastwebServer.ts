import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase";
import {
  FASTWEB_ORDER_COLUMNS,
  mapFastWebOrder,
  type FastWebOrder,
} from "@/lib/fastweb";

export async function findOrderById(id: string) {
  return getSupabaseAdmin()
    .from("fastweb_orders")
    .select(FASTWEB_ORDER_COLUMNS)
    .eq("id", id)
    .maybeSingle();
}

export async function findOrderByAccess(
  id: string,
  accessToken: string
): Promise<{ order: FastWebOrder & { accessToken?: string }; row: Record<string, unknown> } | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("fastweb_orders")
    .select(FASTWEB_ORDER_COLUMNS)
    .eq("id", id)
    .eq("access_token", accessToken)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as unknown as Record<string, unknown>;
  return {
    order: mapFastWebOrder(row, { includeAccessToken: true }),
    row,
  };
}

export async function findPublishedBySlug(slug: string) {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("fastweb_orders")
      .select(FASTWEB_ORDER_COLUMNS)
      .eq("slug", slug)
      .in("fulfillment_status", ["first_version", "awaiting_approval", "published"])
      .eq("payment_status", "paid")
      .maybeSingle();

    if (error || !data) return null;
    return mapFastWebOrder(data as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function ensureUniqueSlug(base: string): Promise<string> {
  let candidate = base.slice(0, 40) || "business";
  for (let i = 0; i < 8; i++) {
    const trySlug = i === 0 ? candidate : `${candidate}-${i + 1}`;
    const { data } = await getSupabaseAdmin()
      .from("fastweb_orders")
      .select("id")
      .eq("slug", trySlug)
      .maybeSingle();
    if (!data) return trySlug;
  }
  return `${candidate}-${Date.now().toString(36).slice(-4)}`;
}

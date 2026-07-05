import type { SupabaseClient } from "@supabase/supabase-js";

/** فیلدهای پایه — همیشه در schema موجودند */
export const BIZCARD_BASE_SELECT =
  "slug,business_name,category,phone,whatsapp,maps_url,neshan_url,balad_url,address,instagram,telegram,website,hours,logo_url,theme_color";

/** فیلدهای اضافه پس از migration 20260714 */
export const BIZCARD_NAV_SELECT = "snap_url,osm_url";

export type BizcardRow = {
  slug: string;
  business_name: string;
  category: string | null;
  phone: string | null;
  whatsapp: string | null;
  maps_url: string | null;
  neshan_url: string | null;
  balad_url: string | null;
  snap_url: string | null;
  osm_url: string | null;
  address: string | null;
  instagram: string | null;
  telegram: string | null;
  website: string | null;
  hours: string | null;
  logo_url: string | null;
  theme_color: string | null;
};

function isMissingNavColumns(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "42703") return true;
  const msg = error.message ?? "";
  return msg.includes("snap_url") || msg.includes("osm_url");
}

/** خواندن کارت فعال — اگر migration مسیریاب اضافه نشده باشد، بدون snap/osm fallback می‌کند */
export async function fetchActiveBizcardBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<{ data: BizcardRow | null; error: { code?: string; message?: string } | null }> {
  const fullSelect = `${BIZCARD_BASE_SELECT},${BIZCARD_NAV_SELECT}`;
  const full = await supabase
    .from("bizcards")
    .select(fullSelect)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!full.error) {
    return { data: full.data as BizcardRow | null, error: null };
  }

  if (!isMissingNavColumns(full.error)) {
    return { data: null, error: full.error };
  }

  const base = await supabase
    .from("bizcards")
    .select(BIZCARD_BASE_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (base.error || !base.data) {
    return { data: null, error: base.error };
  }

  return {
    data: { ...(base.data as Omit<BizcardRow, "snap_url" | "osm_url">), snap_url: null, osm_url: null },
    error: null,
  };
}

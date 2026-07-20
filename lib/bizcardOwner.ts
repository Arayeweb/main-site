import type { BizcardRow } from "@/lib/bizcardDb";

export type BizcardOwnerRow = BizcardRow & {
  id: string;
  is_active: boolean;
  access_token: string;
};

export function toOwnerPublicCard(card: BizcardOwnerRow) {
  return {
    id: card.id,
    slug: card.slug,
    business_name: card.business_name,
    category: card.category,
    phone: card.phone,
    whatsapp: card.whatsapp,
    maps_url: card.maps_url,
    neshan_url: card.neshan_url,
    balad_url: card.balad_url,
    snap_url: card.snap_url,
    osm_url: card.osm_url,
    address: card.address,
    instagram: card.instagram,
    telegram: card.telegram,
    website: card.website,
    hours: card.hours,
    logo_url: card.logo_url,
    theme_color: card.theme_color,
    is_active: card.is_active,
  };
}

export function strField(v: unknown, max = 2000): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

/** فیلدهای قابل‌ویرایش توسط صاحب — بدون slug / is_active / access_token */
export function buildOwnerPatch(body: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  const business_name = strField(body.business_name, 200);
  if (business_name) row.business_name = business_name;

  if (body.category !== undefined) row.category = strField(body.category, 100);
  if (body.phone !== undefined) row.phone = strField(body.phone, 30);
  if (body.whatsapp !== undefined) row.whatsapp = strField(body.whatsapp, 30);
  if (body.maps_url !== undefined) row.maps_url = strField(body.maps_url, 2000);
  if (body.neshan_url !== undefined) row.neshan_url = strField(body.neshan_url, 2000);
  if (body.balad_url !== undefined) row.balad_url = strField(body.balad_url, 2000);
  if (body.snap_url !== undefined) row.snap_url = strField(body.snap_url, 2000);
  if (body.osm_url !== undefined) row.osm_url = strField(body.osm_url, 2000);
  if (body.address !== undefined) row.address = strField(body.address, 500);
  if (body.instagram !== undefined) row.instagram = strField(body.instagram, 100);
  if (body.telegram !== undefined) row.telegram = strField(body.telegram, 100);
  if (body.website !== undefined) row.website = strField(body.website, 2000);
  if (body.hours !== undefined) row.hours = strField(body.hours, 300);
  if (body.logo_url !== undefined) row.logo_url = strField(body.logo_url, 2000);
  if (body.theme_color !== undefined) {
    row.theme_color = strField(body.theme_color, 20) ?? "blue";
  }

  row.updated_at = new Date().toISOString();
  return row;
}

export function ownerPanelUrl(slug: string, token: string, origin?: string): string {
  const base = (origin || "https://araaye.com").replace(/\/$/, "");
  return `${base}/dashboard/bizcard/${encodeURIComponent(slug)}?token=${encodeURIComponent(token)}`;
}

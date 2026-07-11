import { NextRequest } from "next/server";
import { getAdReadySession } from "@/lib/adreadySession";
import {
  CAMPAIGN_PAGE_COLUMNS,
  isPlainObject,
  isUuid,
  mapCampaignPage,
  parseCampaignPageInput,
} from "@/lib/adready";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

async function findOwnedPage(id: string, userId: string) {
  return getSupabaseAdmin()
    .from("campaign_pages")
    .select(CAMPAIGN_PAGE_COLUMNS)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const session = getAdReadySession(req);
  if (!session) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isUuid(params.id)) {
    return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
  }

  const { data, error } = await findOwnedPage(params.id, session.userId);
  if (error) {
    console.error("[api/adready/campaigns/:id] GET", error.message);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
  if (!data) {
    return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
  }

  return jsonNoStore({ ok: true, campaignPage: mapCampaignPage(data) });
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = getAdReadySession(req);
  if (!session) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isUuid(params.id)) {
    return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }
  if (!isPlainObject(body)) {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const parsed = parseCampaignPageInput(body, { create: false });
  if (!parsed.ok) {
    return jsonNoStore({ ok: false, error: parsed.error }, { status: 422 });
  }
  if (Object.keys(parsed.row).length === 0) {
    return jsonNoStore({ ok: false, error: "nothing_to_update" }, { status: 422 });
  }

  const existing = await findOwnedPage(params.id, session.userId);
  if (existing.error) {
    console.error("[api/adready/campaigns/:id] PATCH lookup", existing.error.message);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
  if (!existing.data) {
    return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (parsed.row.status === "published" && !existing.data.published_at) {
    parsed.row.published_at = new Date().toISOString();
  }
  parsed.row.updated_at = new Date().toISOString();

  const { error } = await getSupabaseAdmin()
    .from("campaign_pages")
    .update(parsed.row)
    .eq("id", params.id)
    .eq("user_id", session.userId);

  if (error) {
    if ((error as { code?: string }).code === "23505") {
      return jsonNoStore({ ok: false, error: "slug_taken" }, { status: 409 });
    }
    console.error("[api/adready/campaigns/:id] PATCH", error.message);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }

  const updated = await findOwnedPage(params.id, session.userId);
  if (updated.error || !updated.data) {
    console.error("[api/adready/campaigns/:id] PATCH reload", updated.error?.message);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }

  return jsonNoStore({ ok: true, campaignPage: mapCampaignPage(updated.data) });
}

import { NextRequest } from "next/server";
import { getAdReadySession } from "@/lib/adreadySession";
import {
  CAMPAIGN_PAGE_COLUMNS,
  isPlainObject,
  isUuid,
  mapCampaignPage,
} from "@/lib/adready";
import { validateCampaignPresentationUpdate } from "@/lib/adreadyPresentation";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

async function findOwnedCampaign(id: string, userId: string) {
  return getSupabaseAdmin()
    .from("campaign_pages")
    .select(CAMPAIGN_PAGE_COLUMNS)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
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

  const parsed = validateCampaignPresentationUpdate(body);
  if (!parsed.ok) {
    return jsonNoStore({ ok: false, error: parsed.error }, { status: 422 });
  }

  const existing = await findOwnedCampaign(params.id, session.userId);
  if (existing.error) {
    console.error(
      "[api/adready/campaigns/:id/presentation] lookup",
      existing.error.message
    );
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
  if (!existing.data) {
    return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
  }

  const update = parsed.value;
  const { error } = await getSupabaseAdmin()
    .from("campaign_pages")
    .update({
      custom_content: update.customContent,
      contact_phone: update.contactPhone,
      whatsapp_number: update.whatsappNumber,
      telegram_username: update.telegramUsername,
      template_key: update.templateKey,
      theme_key: update.themeKey,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .eq("user_id", session.userId);

  if (error) {
    console.error("[api/adready/campaigns/:id/presentation] update", error.message);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }

  const updated = await findOwnedCampaign(params.id, session.userId);
  if (updated.error || !updated.data) {
    console.error(
      "[api/adready/campaigns/:id/presentation] reload",
      updated.error?.message
    );
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }

  return jsonNoStore({
    ok: true,
    campaignPage: mapCampaignPage(updated.data),
  });
}

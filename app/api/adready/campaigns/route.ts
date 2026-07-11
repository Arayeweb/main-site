import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { getAdReadySession } from "@/lib/adreadySession";
import {
  CAMPAIGN_PAGE_COLUMNS,
  isPlainObject,
  mapCampaignPage,
  normalizeCampaignSlug,
  parseCampaignPageInput,
} from "@/lib/adready";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = getAdReadySession(req);
  if (!session) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("campaign_pages")
    .select(CAMPAIGN_PAGE_COLUMNS)
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[api/adready/campaigns] GET", error.message);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }

  return jsonNoStore({
    ok: true,
    campaignPages: (data || []).map((row) => mapCampaignPage(row)),
  });
}

export async function POST(req: NextRequest) {
  const session = getAdReadySession(req);
  if (!session) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
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

  const parsed = parseCampaignPageInput(body, { create: true });
  if (!parsed.ok) {
    return jsonNoStore({ ok: false, error: parsed.error }, { status: 422 });
  }

  const requestedSlug = "slug" in parsed.row;
  const slugBase =
    (parsed.row.slug as string | undefined) ||
    normalizeCampaignSlug(parsed.row.title) ||
    "campaign";
  const slug = requestedSlug
    ? slugBase
    : `${slugBase.slice(0, 55)}-${randomUUID().slice(0, 8)}`;

  const { data, error } = await getSupabaseAdmin()
    .from("campaign_pages")
    .insert({
      ...parsed.row,
      user_id: session.userId,
      slug,
      status: "draft",
      // Phase 1 has no AdReady billing or entitlement flow. New pages are
      // therefore server-assigned to free; clients cannot elevate this value.
      plan: "free",
    })
    .select(CAMPAIGN_PAGE_COLUMNS)
    .single();

  if (error || !data) {
    if ((error as { code?: string } | null)?.code === "23505") {
      return jsonNoStore({ ok: false, error: "slug_taken" }, { status: 409 });
    }
    console.error("[api/adready/campaigns] POST", error?.message);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }

  return jsonNoStore(
    { ok: true, campaignPage: mapCampaignPage(data) },
    { status: 201 }
  );
}

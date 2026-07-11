import { NextRequest } from "next/server";
import { getAdReadySession } from "@/lib/adreadySession";
import { CAMPAIGN_PAGE_COLUMNS, isUuid, mapCampaignPage } from "@/lib/adready";
import {
  CampaignGenerationError,
  generateCampaignPageContent,
  type CampaignGenerationInput,
} from "@/lib/adreadyGeneration";
import {
  hasGeneratedCampaignContent,
  type CampaignPageContent,
} from "@/lib/adreadyContent";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

type RouteContext = { params: { id: string } };
type CampaignRow = Record<string, unknown>;

const generationInFlight = new Map<string, Promise<CampaignPageContent>>();

function requiredText(row: CampaignRow, key: string): string | null {
  const value = row[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalText(row: CampaignRow, key: string): string | null {
  const value = row[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function generationInput(
  row: CampaignRow
): { ok: true; input: CampaignGenerationInput } | { ok: false; missing: string[] } {
  const required = {
    campaignGoal: requiredText(row, "goal"),
    businessName: requiredText(row, "business_name"),
    businessType: requiredText(row, "business_type"),
    contactPhone: requiredText(row, "contact_phone"),
    productOrServiceName: requiredText(row, "product_or_service_name"),
    shortDescription: requiredText(row, "short_description"),
    mainBenefit: requiredText(row, "main_benefit"),
    targetAudience: requiredText(row, "target_audience"),
    campaignChannel: requiredText(row, "campaign_channel"),
    campaignTone: requiredText(row, "campaign_tone"),
  };
  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) return { ok: false, missing };

  return {
    ok: true,
    input: {
      campaignGoal: required.campaignGoal!,
      businessName: required.businessName!,
      businessType: required.businessType!,
      city: optionalText(row, "city"),
      websiteOrInstagram: optionalText(row, "website_or_instagram"),
      contactPhone: required.contactPhone!,
      whatsappNumber: optionalText(row, "whatsapp_number"),
      telegramUsername: optionalText(row, "telegram_username"),
      productOrServiceName: required.productOrServiceName!,
      shortDescription: required.shortDescription!,
      priceRange: optionalText(row, "price_range"),
      mainBenefit: required.mainBenefit!,
      targetAudience: required.targetAudience!,
      campaignChannel: required.campaignChannel!,
      campaignTone: required.campaignTone!,
    },
  };
}

async function findOwnedCampaign(id: string, userId: string) {
  return getSupabaseAdmin()
    .from("campaign_pages")
    .select(CAMPAIGN_PAGE_COLUMNS)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
}

async function generateSingleFlight(
  campaignId: string,
  input: CampaignGenerationInput
): Promise<CampaignPageContent> {
  const existing = generationInFlight.get(campaignId);
  if (existing) return existing;

  const promise = generateCampaignPageContent(input).finally(() => {
    generationInFlight.delete(campaignId);
  });
  generationInFlight.set(campaignId, promise);
  return promise;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = getAdReadySession(req);
  if (!session) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isUuid(params.id)) {
    return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
  }

  const current = await findOwnedCampaign(params.id, session.userId);
  if (current.error) {
    console.error("[api/adready/campaigns/:id/generate] lookup", current.error.message);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
  if (!current.data) {
    return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (hasGeneratedCampaignContent(current.data.generated_content)) {
    return jsonNoStore({
      ok: true,
      reused: true,
      generatedContent: current.data.generated_content,
      campaignPage: mapCampaignPage(current.data),
    });
  }

  const generatedValue = current.data.generated_content;
  if (
    generatedValue &&
    typeof generatedValue === "object" &&
    Object.keys(generatedValue as Record<string, unknown>).length > 0
  ) {
    return jsonNoStore(
      { ok: false, error: "invalid_existing_generated_content" },
      { status: 409 }
    );
  }

  if (current.data.status !== "draft" && current.data.status !== "preview") {
    return jsonNoStore(
      { ok: false, error: "campaign_not_generatable" },
      { status: 409 }
    );
  }

  const parsedInput = generationInput(current.data);
  if (!parsedInput.ok) {
    return jsonNoStore(
      { ok: false, error: "incomplete_campaign", missing: parsedInput.missing },
      { status: 422 }
    );
  }

  let generatedContent: CampaignPageContent;
  try {
    generatedContent = await generateSingleFlight(params.id, parsedInput.input);
  } catch (error) {
    const code =
      error instanceof CampaignGenerationError ? error.code : "provider_error";
    console.error(
      "[api/adready/campaigns/:id/generate]",
      error instanceof Error ? error.message : error
    );
    return jsonNoStore(
      { ok: false, error: code === "invalid_output" ? "invalid_ai_output" : "ai_error" },
      { status: 502 }
    );
  }

  // A second request or instance may have completed while this request was
  // generating. Prefer the already-persisted valid result and never overwrite it.
  const afterGeneration = await findOwnedCampaign(params.id, session.userId);
  if (afterGeneration.data && hasGeneratedCampaignContent(afterGeneration.data.generated_content)) {
    return jsonNoStore({
      ok: true,
      reused: true,
      generatedContent: afterGeneration.data.generated_content,
      campaignPage: mapCampaignPage(afterGeneration.data),
    });
  }

  const supabase = getSupabaseAdmin();
  const { error: updateError } = await supabase
    .from("campaign_pages")
    .update({
      generated_content: generatedContent,
      status: "preview",
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .eq("user_id", session.userId);

  if (updateError) {
    console.error("[api/adready/campaigns/:id/generate] save", updateError.message);
    return jsonNoStore({ ok: false, error: "save_failed" }, { status: 500 });
  }

  const updated = await findOwnedCampaign(params.id, session.userId);
  if (updated.error || !updated.data) {
    console.error(
      "[api/adready/campaigns/:id/generate] reload",
      updated.error?.message
    );
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }

  return jsonNoStore({
    ok: true,
    reused: false,
    generatedContent,
    campaignPage: mapCampaignPage(updated.data),
  });
}

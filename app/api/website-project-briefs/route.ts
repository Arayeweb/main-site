import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { recommendedServiceLabels } from "@/lib/websiteBrief/constants";
import { WebsiteBriefRecommendationService } from "@/lib/websiteBrief/recommendation";
import { validateWebsiteBriefBody } from "@/lib/websiteBrief/validation";
import { notifyWebsiteBriefSubmitted } from "@/lib/websiteBrief/notify";
import { FORM_VERSION, type RecommendedService } from "@/lib/websiteBrief/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 6;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function str(v: unknown, max = 500): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

function successPayload(
  submissionId: string,
  recommendedService: string,
  recommendationMessage: string,
  recommendationReasonCode: string
) {
  return {
    success: true,
    submissionId,
    recommendedService,
    recommendationMessage,
    recommendationReasonCode,
    serviceLabel: recommendedServiceLabels[recommendedService as RecommendedService],
  };
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "bad_json" }, { status: 400 });
  }

  if (str(body.company)) {
    return NextResponse.json({ success: true, submissionId: "ok" });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });
  }

  const submissionToken =
    str(body.submission_token, 64) ||
    req.headers.get("idempotency-key")?.slice(0, 64) ||
    null;

  if (!submissionToken || submissionToken.length < 8) {
    return NextResponse.json({ success: false, error: "missing_submission_token" }, { status: 422 });
  }

  const validation = validateWebsiteBriefBody(body);
  if (!validation.ok) {
    return NextResponse.json(
      { success: false, error: "validation_failed", errors: validation.errors },
      { status: 422 }
    );
  }

  const { confirmation_branch, ...briefInput } = validation.data;
  const recommendation = WebsiteBriefRecommendationService.recommend(briefInput);

  const row = {
    status: "new",
    form_version: FORM_VERSION,
    primary_service: "website_design",
    ...briefInput,
    required_sections: briefInput.required_sections,
    acquisition_channels: briefInput.acquisition_channels,
    current_assets: briefInput.current_assets,
    confirmation_branch,
    recommended_service: recommendation.recommendedService,
    recommendation_reason_code: recommendation.recommendationReasonCode,
    recommendation_template_id: recommendation.recommendationTemplateId,
    recommendation_interest: null,
    source_page: str(body.source_page, 300),
    referrer: str(body.referrer, 500),
    utm_source: str(body.utm_source, 200),
    utm_medium: str(body.utm_medium, 200),
    utm_campaign: str(body.utm_campaign, 200),
    utm_content: str(body.utm_content, 200),
    utm_term: str(body.utm_term, 200),
    submission_token: submissionToken,
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = getSupabaseAdmin();

    const { data: existing } = await supabase
      .from("website_project_briefs")
      .select("id, recommended_service, recommendation_reason_code")
      .eq("submission_token", submissionToken)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        successPayload(
          existing.id,
          existing.recommended_service,
          recommendation.recommendationMessage,
          existing.recommendation_reason_code
        )
      );
    }

    const { data: inserted, error } = await supabase
      .from("website_project_briefs")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        const { data: dup } = await supabase
          .from("website_project_briefs")
          .select("id, recommended_service, recommendation_reason_code")
          .eq("submission_token", submissionToken)
          .single();
        if (dup) {
          return NextResponse.json(
            successPayload(
              dup.id,
              dup.recommended_service,
              recommendation.recommendationMessage,
              dup.recommendation_reason_code
            )
          );
        }
      }
      console.error("[api/website-project-briefs] insert:", error.message);
      return NextResponse.json({ success: false, error: "db_error" }, { status: 500 });
    }

    void notifyWebsiteBriefSubmitted({
      submissionId: inserted!.id,
      input: briefInput,
      recommendedService: recommendation.recommendedService,
    });

    return NextResponse.json(
      successPayload(
        inserted!.id,
        recommendation.recommendedService,
        recommendation.recommendationMessage,
        recommendation.recommendationReasonCode
      )
    );
  } catch (e) {
    console.error("[api/website-project-briefs] error:", e);
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: false, error: "method_not_allowed" }, { status: 405 });
}

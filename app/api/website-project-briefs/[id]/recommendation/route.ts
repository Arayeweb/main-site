import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "bad_json" }, { status: 400 });
  }

  if (typeof body.interested !== "boolean") {
    return NextResponse.json({ success: false, error: "invalid_interested" }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("website_project_briefs")
      .update({
        recommendation_interest: body.interested,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, recommendation_interest")
      .maybeSingle();

    if (error) {
      console.error("[api/website-project-briefs/recommendation] update:", error.message);
      return NextResponse.json({ success: false, error: "db_error" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      submissionId: data.id,
      recommendationInterest: data.recommendation_interest,
    });
  } catch (e) {
    console.error("[api/website-project-briefs/recommendation] error:", e);
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}

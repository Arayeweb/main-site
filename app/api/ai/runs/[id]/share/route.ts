// POST /api/ai/runs/[id]/share — public share link for compare/council runs

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { isUuid } from "@/lib/ai/requestValidation";
import { generateShareSlug } from "@/lib/aiPromo";
import { loadRunById } from "@/lib/ai/runs/loadRun";
import { SITE_URL } from "@/lib/siteUrl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const runId = params.id;
  if (!runId || !isUuid(runId)) {
    return NextResponse.json({ ok: false, error: "missing_run_id" }, { status: 422 });
  }

  const bundle = await loadRunById(runId);
  if (!bundle || bundle.run.user_id !== session.userId) {
    return NextResponse.json({ ok: false, error: "run_not_found" }, { status: 404 });
  }

  const mode = bundle.run.mode as string;
  if (mode === "direct") {
    return NextResponse.json({ ok: false, error: "not_shareable" }, { status: 422 });
  }

  if (bundle.run.status !== "completed") {
    return NextResponse.json({ ok: false, error: "not_ready" }, { status: 422 });
  }

  const meta = { ...(bundle.run.metadata ?? {}) } as Record<string, unknown>;
  let slug = typeof meta.share_slug === "string" ? meta.share_slug : null;

  const supabase = getSupabaseAdmin();
  if (!slug) {
    for (let attempt = 0; attempt < 5; attempt++) {
      slug = generateShareSlug();
      const nextMeta = { ...meta, share_slug: slug, is_public: true };
      const { error } = await supabase
        .from("ai_runs")
        .update({ metadata: nextMeta })
        .eq("id", runId)
        .eq("user_id", session.userId);
      if (!error) break;
      slug = null;
    }
    if (!slug) {
      return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
    }
  } else if (meta.is_public !== true) {
    await supabase
      .from("ai_runs")
      .update({ metadata: { ...meta, is_public: true } })
      .eq("id", runId)
      .eq("user_id", session.userId);
  }

  return NextResponse.json({
    ok: true,
    slug,
    shareUrl: `${SITE_URL}/ai/share/${slug}`,
    source: "run",
  });
}

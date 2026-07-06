import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getModel, modelName, modelPoweredBy } from "@/lib/aiModels";
import { loadRunByShareSlug, loadRunById, serializeRun } from "@/lib/ai/runs/loadRun";
import { isE2eMode } from "@/lib/e2eMode";
import { withPublicTimeout } from "@/lib/publicDataFetch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publicModel(id: string) {
  return {
    id,
    name: modelName(id),
    poweredBy: modelPoweredBy(id),
    brand: getModel(id)?.brand ?? "openai",
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = String(params.slug ?? "").slice(0, 32);
  if (!slug) {
    return NextResponse.json({ ok: false, error: "invalid_slug" }, { status: 422 });
  }

  if (isE2eMode()) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const supabase = getSupabaseAdmin();
  const battleResult = await withPublicTimeout(
    supabase
      .from("ai_battles")
      .select(
        "prompt, model_a, model_b, response_a, response_b, winner, tier, voted_at, share_slug"
      )
      .eq("share_slug", slug)
      .eq("is_public", true)
      .maybeSingle(),
    "share/battle"
  );

  const battle = battleResult?.data;
  const error = battleResult?.error;

  if (!error && battle) {
    const tier = battle.tier as string;
    const modelsRevealed = tier === "side_by_side" || !!battle.winner;

    return NextResponse.json({
      ok: true,
      source: "legacy",
      slug,
      prompt: battle.prompt,
      responseA: battle.response_a,
      responseB: battle.response_b,
      winner: battle.winner,
      tier,
      modelA: modelsRevealed
        ? publicModel(battle.model_a as string)
        : null,
      modelB:
        modelsRevealed && battle.model_b
          ? publicModel(battle.model_b as string)
          : null,
    });
  }

  const runBundle = await withPublicTimeout(loadRunByShareSlug(slug), "share/run-slug");
  if (!runBundle) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const full = await withPublicTimeout(loadRunById(runBundle.run.id), "share/run-detail");
  if (!full) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const run = serializeRun(full);
  const [modelAId, modelBId] = run.models;
  const answerA = run.answers.find((a) => a.model === modelAId)?.content ?? "";
  const answerB = run.answers.find((a) => a.model === modelBId)?.content ?? "";

  let winner: string | null = null;
  if (run.selectedVote === modelAId) winner = "a";
  else if (run.selectedVote === modelBId) winner = "b";

  const tier =
    run.mode === "compare" ? "side_by_side" : run.mode === "council" ? "council" : "direct";

  return NextResponse.json({
    ok: true,
    source: "run",
    slug,
    mode: run.mode,
    prompt: run.prompt,
    responseA: answerA,
    responseB: answerB,
    critique: run.critique,
    summary: run.summary,
    winner,
    tier,
    modelA: modelAId ? publicModel(modelAId) : null,
    modelB: modelBId ? publicModel(modelBId) : null,
  });
}

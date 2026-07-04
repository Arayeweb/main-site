import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getModel, modelName, modelPoweredBy } from "@/lib/aiModels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = String(params.slug ?? "").slice(0, 32);
  if (!slug) {
    return NextResponse.json({ ok: false, error: "invalid_slug" }, { status: 422 });
  }

  const supabase = getSupabaseAdmin();
  const { data: battle, error } = await supabase
    .from("ai_battles")
    .select(
      "prompt, model_a, model_b, response_a, response_b, winner, tier, voted_at, share_slug"
    )
    .eq("share_slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (error || !battle) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const tier = battle.tier as string;
  const modelsRevealed = tier === "side_by_side" || !!battle.winner;

  return NextResponse.json({
    ok: true,
    slug,
    prompt: battle.prompt,
    responseA: battle.response_a,
    responseB: battle.response_b,
    winner: battle.winner,
    tier,
    modelA: modelsRevealed
      ? {
          id: battle.model_a,
          name: modelName(battle.model_a as string),
          poweredBy: modelPoweredBy(battle.model_a as string),
          brand: getModel(battle.model_a as string)?.brand ?? "openai",
        }
      : null,
    modelB:
      modelsRevealed && battle.model_b
        ? {
            id: battle.model_b,
            name: modelName(battle.model_b as string),
            poweredBy: modelPoweredBy(battle.model_b as string),
            brand: getModel(battle.model_b as string)?.brand ?? "openai",
          }
        : null,
  });
}

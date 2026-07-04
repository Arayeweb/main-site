import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { guestOwnsBattle } from "@/lib/aiGuest";
import { getModel, modelName, modelPoweredBy } from "@/lib/aiModels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ثبت رأی و افشای نام مدل‌ها
export async function POST(req: NextRequest) {
  const session = getAISession(req);
  if (!session && !req.cookies.get("ary_ai_guest")?.value) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const battleId = String(body.battleId ?? "").slice(0, 36);
  const winner = String(body.winner ?? "");

  if (!battleId || !["a", "b", "tie"].includes(winner)) {
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 422 });
  }

  const supabase = getSupabaseAdmin();

  const { data: battle, error } = await supabase
    .from("ai_battles")
    .select("id, user_id, guest_token, model_a, model_b, winner, tier")
    .eq("id", battleId)
    .maybeSingle();

  if (error || !battle) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const isOwner =
    (session && battle.user_id === session.userId) ||
    guestOwnsBattle(req, battle.guest_token as string | null);

  if (!isOwner) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  if (battle.tier === "direct") {
    return NextResponse.json({ ok: false, error: "not_votable" }, { status: 422 });
  }
  if (battle.winner) {
    return NextResponse.json({ ok: false, error: "already_voted" }, { status: 409 });
  }

  await supabase
    .from("ai_battles")
    .update({ winner, voted_at: new Date().toISOString() })
    .eq("id", battleId);

  const modelA = battle.model_a as string;
  const modelB = battle.model_b as string;

  return NextResponse.json({
    ok: true,
    winner,
    modelA: {
      id: modelA,
      name: modelName(modelA),
      poweredBy: modelPoweredBy(modelA),
      brand: getModel(modelA)?.brand ?? "openai",
    },
    modelB: {
      id: modelB,
      name: modelName(modelB),
      poweredBy: modelPoweredBy(modelB),
      brand: getModel(modelB)?.brand ?? "openai",
    },
  });
}

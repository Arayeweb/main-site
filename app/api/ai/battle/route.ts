import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { runBattle, runDirect } from "@/lib/aiEngine";
import {
  createGuestState,
  decrementGuestBattle,
  getGuestState,
  setGuestCookie,
} from "@/lib/aiGuest";
import {
  BATTLE_CREDIT_COST,
  MAX_BATTLE_COST_USD,
  MAX_PROMPT_CHARS,
  MODEL_MAX_TOKENS,
  TIER_MAX_TOKENS,
  canUseMode,
  directCost,
  pickBattleModels,
  pickBattleTier,
  resolveCompareModel,
  resolveUserModel,
  sideBySideCost,
  type ArenaMode,
} from "@/lib/aiCredits";
import { getModel, modelName, modelPoweredBy } from "@/lib/aiModels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function publicModel(id: string) {
  return {
    id,
    name: modelName(id),
    poweredBy: modelPoweredBy(id),
    brand: getModel(id)?.brand ?? "openai",
  };
}

export async function POST(req: NextRequest) {
  const session = getAISession(req);
  const isGuest = !session;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const prompt = String(body.prompt ?? "").trim().slice(0, MAX_PROMPT_CHARS);
  if (!prompt) {
    return NextResponse.json({ ok: false, error: "missing_prompt" }, { status: 422 });
  }

  const webSearch = body.webSearch === true;

  const mode = (["battle", "side_by_side", "direct"].includes(String(body.mode))
    ? String(body.mode)
    : "battle") as ArenaMode;

  // مهمان فقط battle
  if (isGuest) {
    if (mode !== "battle") {
      return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
    }
    let guest = getGuestState(req) || createGuestState();
    if (guest.remaining <= 0) {
      return NextResponse.json(
        { ok: false, error: "guest_limit", guestBattlesRemaining: 0 },
        { status: 401 }
      );
    }
  } else if (mode !== "battle") {
    // logged-in non-battle handled below
  }

  const threadId = typeof body.threadId === "string" && body.threadId ? body.threadId : null;
  const supabase = getSupabaseAdmin();

  let plan = "free";
  let userCredits = 0;
  let userId: string | null = null;
  let guestToken: string | null = null;
  let guestState = getGuestState(req);

  if (session) {
    const { data: user, error: userErr } = await supabase
      .from("ai_users")
      .select("id, plan, credits")
      .eq("id", session.userId)
      .maybeSingle();

    if (userErr || !user) {
      return NextResponse.json({ ok: false, error: "user_not_found" }, { status: 404 });
    }
    plan = (user.plan as string) || "free";
    userCredits = user.credits as number;
    userId = user.id as string;

    if (!canUseMode(plan, mode)) {
      return NextResponse.json(
        { ok: false, error: "plan_upgrade_required", upgradeUrl: "/ai/pricing" },
        { status: 403 }
      );
    }
  } else {
    guestState = guestState || createGuestState();
    guestToken = guestState.token;
  }

  let cost: number;
  let tierValue: string;
  let modelAId: string;
  let modelBId: string;
  let maxTokens: number;

  if (mode === "battle") {
    const tier = pickBattleTier(plan);
    const [a, b] = pickBattleModels(tier);
    cost = isGuest ? 0 : BATTLE_CREDIT_COST[tier];
    tierValue = tier;
    modelAId = a.id;
    modelBId = b.id;
    maxTokens = TIER_MAX_TOKENS[tier];
  } else if (mode === "side_by_side") {
    const a = resolveCompareModel(String(body.modelA ?? ""), plan);
    const b = resolveCompareModel(String(body.modelB ?? ""), plan);
    if ("error" in a) {
      return NextResponse.json({ ok: false, error: a.error, which: "a" }, {
        status: a.error === "plan_upgrade_required" ? 403 : 422,
      });
    }
    if ("error" in b) {
      return NextResponse.json({ ok: false, error: b.error, which: "b" }, {
        status: b.error === "plan_upgrade_required" ? 403 : 422,
      });
    }
    if (a.id === b.id) {
      return NextResponse.json({ ok: false, error: "same_model" }, { status: 422 });
    }
    cost = sideBySideCost(a, b);
    tierValue = "side_by_side";
    modelAId = a.id;
    modelBId = b.id;
    maxTokens = Math.max(MODEL_MAX_TOKENS[a.tier], MODEL_MAX_TOKENS[b.tier]);
  } else {
    const m = resolveUserModel(String(body.model ?? ""), plan);
    if ("error" in m) {
      return NextResponse.json({ ok: false, error: m.error }, {
        status: m.error === "plan_upgrade_required" ? 403 : 422,
      });
    }
    cost = directCost(m);
    tierValue = "direct";
    modelAId = m.id;
    modelBId = "";
    maxTokens = MODEL_MAX_TOKENS[m.tier];
  }

  if (!isGuest && userCredits < cost) {
    return NextResponse.json(
      { ok: false, error: "insufficient_credits", upgradeUrl: "/ai/pricing" },
      { status: 402 }
    );
  }

  const history: { role: "user" | "assistant"; content: string }[] = [];
  if (mode === "direct" && threadId && session) {
    let prev = await supabase
      .from("ai_battles")
      .select("id, user_id, prompt, response_a")
      .or(`id.eq.${threadId},thread_id.eq.${threadId}`)
      .order("created_at", { ascending: true })
      .limit(12);

    if (prev.error) {
      prev = await supabase
        .from("ai_battles")
        .select("id, user_id, prompt, response_a")
        .eq("id", threadId)
        .order("created_at", { ascending: true })
        .limit(1);
    }

    const rows = (prev.data || []).filter((r) => r.user_id === session.userId);
    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: "thread_not_found" }, { status: 404 });
    }
    for (const r of rows.slice(-6)) {
      history.push({ role: "user", content: (r.prompt as string) || "" });
      history.push({ role: "assistant", content: (r.response_a as string) || "" });
    }
  }

  let responseA: string;
  let responseB: string;
  let tokensUsed: number;
  let costUsd: number;

  try {
    if (mode === "direct") {
      const r = await runDirect(prompt, modelAId, maxTokens, history, [], webSearch);
      responseA = r.content;
      responseB = "";
      tokensUsed = r.tokensUsed;
      costUsd = r.costUsd;
    } else {
      const r = await runBattle(prompt, [modelAId, modelBId], maxTokens, webSearch);
      responseA = r.responseA;
      responseB = r.responseB;
      tokensUsed = r.tokensUsed;
      costUsd = r.costUsd;
    }
  } catch (e) {
    console.error("[api/ai/battle] ai call failed:", e);
    return NextResponse.json({ ok: false, error: "ai_error" }, { status: 502 });
  }

  if (costUsd > MAX_BATTLE_COST_USD) {
    console.warn(
      `[api/ai/battle] cost alert: $${costUsd.toFixed(4)} > $${MAX_BATTLE_COST_USD}`
    );
  }

  const creditsRemaining = isGuest ? 0 : Math.max(0, userCredits - cost);

  const insertRow: Record<string, unknown> = {
    prompt,
    model_a: modelAId,
    model_b: modelBId,
    response_a: responseA,
    response_b: responseB,
    tier: tierValue,
    mode_kind: "text",
    credit_cost: cost,
    cost_usd: costUsd,
    tokens_used: tokensUsed,
  };

  if (isGuest) {
    insertRow.guest_token = guestToken;
  } else {
    insertRow.user_id = userId;
    if (mode === "direct" && threadId) insertRow.thread_id = threadId;
  }

  let { data: battle, error: insErr } = await supabase
    .from("ai_battles")
    .insert(insertRow)
    .select("id")
    .single();

  if (insErr && insertRow.thread_id) {
    delete insertRow.thread_id;
    const retry = await supabase.from("ai_battles").insert(insertRow).select("id").single();
    battle = retry.data;
    insErr = retry.error;
  }

  if (insErr || !battle) {
    console.error("[api/ai/battle] insert:", insErr);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  if (!isGuest && userId) {
    await supabase.from("ai_users").update({ credits: creditsRemaining }).eq("id", userId);

    await supabase.from("ai_usage").insert({
      user_id: userId,
      conversation_id: battle.id,
      mode: tierValue,
      tokens_used: tokensUsed,
      cost_usd: costUsd,
    });
  }

  const json: Record<string, unknown> = {
    ok: true,
    id: battle.id,
    threadId: mode === "direct" ? threadId || battle.id : battle.id,
    mode,
    responseA,
    responseB,
    creditsRemaining,
    ...(mode !== "battle"
      ? {
          modelA: publicModel(modelAId),
          ...(modelBId ? { modelB: publicModel(modelBId) } : {}),
        }
      : {}),
  };

  if (isGuest && guestState) {
    const updated = decrementGuestBattle(guestState);
    json.guestBattlesRemaining = updated.remaining;
    const res = NextResponse.json(json);
    setGuestCookie(res, updated);
    return res;
  }

  return NextResponse.json(json);
}

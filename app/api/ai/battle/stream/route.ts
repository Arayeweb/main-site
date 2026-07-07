import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { streamBattle, classifyOpenRouterFetchError } from "@/lib/aiEngine";
import { persistBattle } from "@/lib/aiPersist";
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
  pickBattleModels,
  pickBattleTier,
  resolveCompareModel,
  sideBySideCost,
  type ArenaMode,
} from "@/lib/aiCredits";
import { webSearchSurcharge } from "@/lib/aiPricingConfig";
import { getModel, modelName, modelPoweredBy } from "@/lib/aiModels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function sse(data: Record<string, unknown>) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

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
    return new Response(sse({ type: "error", error: "bad_json" }), {
      status: 400,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const prompt = String(body.prompt ?? "").trim().slice(0, MAX_PROMPT_CHARS);
  if (!prompt) {
    return new Response(sse({ type: "error", error: "missing_prompt" }), {
      status: 422,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const webSearch = body.webSearch === true;
  const mode = (["battle", "side_by_side", "direct"].includes(String(body.mode))
    ? String(body.mode)
    : "battle") as ArenaMode;

  if (isGuest) {
    return new Response(sse({ type: "error", error: "login_required" }), {
      status: 401,
      headers: { "Content-Type": "text/event-stream" },
    });
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
      return new Response(sse({ type: "error", error: "user_not_found" }), {
        status: 404,
        headers: { "Content-Type": "text/event-stream" },
      });
    }
    plan = (user.plan as string) || "free";
    userCredits = user.credits as number;
    userId = user.id as string;

    if (!canUseMode(plan, mode)) {
      return new Response(sse({ type: "error", error: "plan_upgrade_required" }), {
        status: 403,
        headers: { "Content-Type": "text/event-stream" },
      });
    }
  } else {
    guestState = guestState || createGuestState();
    if (guestState.remaining <= 0) {
      return new Response(sse({ type: "error", error: "guest_limit" }), {
        status: 401,
        headers: { "Content-Type": "text/event-stream" },
      });
    }
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
    cost = isGuest ? 0 : BATTLE_CREDIT_COST[tier] + (webSearch ? webSearchSurcharge() : 0);
    tierValue = tier;
    modelAId = a.id;
    modelBId = b.id;
    maxTokens = TIER_MAX_TOKENS[tier];
  } else if (mode === "side_by_side") {
    const a = resolveCompareModel(String(body.modelA ?? ""), plan);
    const b = resolveCompareModel(String(body.modelB ?? ""), plan);
    if ("error" in a || "error" in b) {
      return new Response(sse({ type: "error", error: "invalid_model" }), {
        status: 422,
        headers: { "Content-Type": "text/event-stream" },
      });
    }
    if (a.id === b.id) {
      return new Response(sse({ type: "error", error: "same_model" }), {
        status: 422,
        headers: { "Content-Type": "text/event-stream" },
      });
    }
    cost = sideBySideCost(a, b, { webSearch });
    tierValue = "side_by_side";
    modelAId = a.id;
    modelBId = b.id;
    maxTokens = Math.max(MODEL_MAX_TOKENS[a.tier], MODEL_MAX_TOKENS[b.tier]);
  } else {
    return new Response(sse({ type: "error", error: "use_chat_route" }), {
      status: 422,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  if (!isGuest && userCredits < cost) {
    return new Response(sse({ type: "error", error: "insufficient_credits" }), {
      status: 402,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (obj: Record<string, unknown>) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(sse(obj)));
        } catch {
          closed = true;
        }
      };

      let responseA = "";
      let responseB = "";
      let tokensUsed = 0;
      let costUsd = 0;

      try {
        const r = await streamBattle(
          prompt,
          [modelAId, modelBId],
          maxTokens,
          (side, text) => {
            if (side === "a") responseA += text;
            else responseB += text;
            send({ type: "delta", side, text });
          },
          webSearch
        );
        responseA = r.responseA;
        responseB = r.responseB;
        tokensUsed = r.tokensUsed;
        costUsd = r.costUsd;
      } catch (e) {
        console.error("[api/ai/battle/stream] failed:", e);
        send({ type: "error", error: classifyOpenRouterFetchError(e) });
        controller.close();
        return;
      }

      if (costUsd > MAX_BATTLE_COST_USD) {
        console.warn(`[api/ai/battle/stream] cost alert: $${costUsd.toFixed(4)}`);
      }

      let guestRemainingAfter: number | undefined;
      if (isGuest && guestState) {
        const updated = decrementGuestBattle(guestState);
        guestRemainingAfter = updated.remaining;
        guestState = updated;
      }

      const creditsRemaining = isGuest ? 0 : Math.max(0, userCredits - cost);
      const battleId = randomUUID();

      const donePayload: Record<string, unknown> = {
        type: "done",
        id: battleId,
        threadId: battleId,
        mode,
        responseA,
        responseB,
        creditsRemaining,
        ...(mode !== "battle"
          ? {
              modelA: publicModel(modelAId),
              modelB: publicModel(modelBId),
            }
          : {}),
      };

      if (guestRemainingAfter !== undefined) {
        donePayload.guestBattlesRemaining = guestRemainingAfter;
      }

      send(donePayload);
      controller.close();

      void persistBattle({
        battleId,
        prompt,
        modelAId,
        modelBId,
        responseA,
        responseB,
        tier: tierValue,
        cost: isGuest ? 0 : cost,
        costUsd,
        tokensUsed,
        userId: userId,
        guestToken: isGuest ? guestToken : null,
      });
    },
  });

  const headers: Record<string, string> = {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };

  if (isGuest && guestState) {
    const res = new NextResponse(stream, { headers });
    setGuestCookie(res, guestState);
    return res;
  }

  return new NextResponse(stream, { headers });
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { AI_COOKIE, verifyAIToken } from "@/lib/aiAuth";
import { GUEST_COOKIE } from "@/lib/aiGuest";
import { getModel, modelName, modelPersonaName, modelPoweredBy } from "@/lib/aiModels";
import BattleClient from "./BattleClient";

export const dynamic = "force-dynamic";

function publicModel(id: string, persona = false) {
  return {
    id,
    name: persona ? modelPersonaName(id) : modelName(id),
    poweredBy: modelPoweredBy(id),
    brand: getModel(id)?.brand ?? "openai",
  };
}

type BattleRow = {
  id: string;
  user_id: string | null;
  guest_token: string | null;
  prompt: string;
  model_a: string;
  model_b: string;
  response_a: string;
  response_b: string;
  winner: string | null;
  tier: string;
  thread_id?: string | null;
  persona_key?: string | null;
};

const COLS =
  "id, user_id, guest_token, prompt, model_a, model_b, response_a, response_b, winner, tier, persona_key";

export default async function BattlePage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const token = cookieStore.get(AI_COOKIE)?.value;
  const session = token ? verifyAIToken(token) : null;

  const guestRaw = cookieStore.get(GUEST_COOKIE)?.value;
  let guestToken: string | null = null;
  if (guestRaw) {
    try {
      const parsed = JSON.parse(guestRaw) as { token?: string };
      guestToken = parsed.token || null;
    } catch {
      guestToken = null;
    }
  }

  const supabase = getSupabaseAdmin();

  let battle: BattleRow | null = null;
  let hasThreadCol = true;
  {
    const res = await supabase
      .from("ai_battles")
      .select(`${COLS}, thread_id`)
      .eq("id", params.id)
      .maybeSingle();
    if (res.error) {
      hasThreadCol = false;
      const plain = await supabase
        .from("ai_battles")
        .select(COLS)
        .eq("id", params.id)
        .maybeSingle();
      battle = plain.data as BattleRow | null;
    } else {
      battle = res.data as BattleRow | null;
    }
  }

  if (!battle) redirect("/ai");

  const isOwner =
    (session && battle.user_id === session.userId) ||
    (!!guestToken && battle.guest_token === guestToken);

  if (!isOwner) redirect("/ai");

  if (battle.tier === "image_gen") {
    redirect(`/ai/image/${(battle.thread_id as string) || battle.id}`);
  }

  if (battle.tier === "persona" && session && battle.persona_key) {
    redirect(`/ai/personas/${battle.persona_key}?thread=${(battle.thread_id as string) || battle.id}`);
  }
  if (battle.tier === "video_gen") {
    redirect(`/ai/video/${(battle.thread_id as string) || battle.id}`);
  }
  if (battle.tier === "audio_gen" || battle.tier === "transcribe") {
    redirect(`/ai/audio/${(battle.thread_id as string) || battle.id}`);
  }

  const tier = battle.tier;
  const mode =
    tier === "direct" ? "direct" : tier === "side_by_side" ? "side_by_side" : "battle";

  if (mode === "direct" && session) {
    const rootId = (battle.thread_id as string) || battle.id;
    let turns: { id: string; prompt: string; response: string }[] = [
      { id: battle.id, prompt: battle.prompt, response: battle.response_a },
    ];

    if (hasThreadCol) {
      const { data: rows } = await supabase
        .from("ai_battles")
        .select("id, user_id, prompt, response_a, created_at")
        .or(`id.eq.${rootId},thread_id.eq.${rootId}`)
        .order("created_at", { ascending: true })
        .limit(40);
      const mine = (rows || []).filter((r) => r.user_id === session.userId);
      if (mine.length > 0) {
        turns = mine.map((r) => ({
          id: r.id as string,
          prompt: r.prompt as string,
          response: r.response_a as string,
        }));
      }
    }

    return (
      <BattleClient
        battleId={battle.id}
        threadId={rootId}
        mode="direct"
        prompt={battle.prompt}
        responseA={battle.response_a}
        responseB=""
        winner={null}
        modelA={publicModel(battle.model_a, true)}
        modelB={null}
        turns={turns}
      />
    );
  }

  const modelsKnown = mode !== "battle" || !!battle.winner;

  return (
    <BattleClient
      battleId={battle.id}
      threadId={battle.id}
      mode={mode}
      prompt={battle.prompt}
      responseA={battle.response_a}
      responseB={battle.response_b || ""}
      winner={(battle.winner as "a" | "b" | "tie" | null) ?? null}
      modelA={modelsKnown ? publicModel(battle.model_a) : null}
      modelB={modelsKnown && battle.model_b ? publicModel(battle.model_b) : null}
    />
  );
}

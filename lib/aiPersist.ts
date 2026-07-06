import { getSupabaseAdmin } from "@/lib/supabase";

export type ChatPersistPayload = {
  userId: string;
  prompt: string;
  responseA: string;
  modelId: string;
  cost: number;
  costUsd: number;
  tokensUsed: number;
  tier: string;
  modeKind: string;
  threadId?: string | null;
  battleId?: string;
  personaKey?: string | null;
  attachments?: unknown[];
};

export async function persistChatTurn(payload: ChatPersistPayload): Promise<{
  battleId: string;
  threadId: string;
  creditsRemaining: number;
} | null> {
  const supabase = getSupabaseAdmin();

  const { data: user } = await supabase
    .from("ai_users")
    .select("credits")
    .eq("id", payload.userId)
    .maybeSingle();

  if (!user) return null;

  const creditsRemaining = Math.max(0, (user.credits as number) - payload.cost);

  const insertRow: Record<string, unknown> = {
    user_id: payload.userId,
    prompt: payload.prompt,
    model_a: payload.modelId,
    model_b: "",
    response_a: payload.responseA,
    response_b: "",
    tier: payload.tier,
    mode_kind: payload.modeKind,
    credit_cost: payload.cost,
    cost_usd: payload.costUsd,
    tokens_used: payload.tokensUsed,
    attachments: payload.attachments ?? [],
  };
  if (payload.battleId) insertRow.id = payload.battleId;
  if (payload.personaKey) insertRow.persona_key = payload.personaKey;
  if (payload.threadId) insertRow.thread_id = payload.threadId;

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

  if (insErr && insertRow.persona_key) {
    delete insertRow.persona_key;
    const retry = await supabase.from("ai_battles").insert(insertRow).select("id").single();
    battle = retry.data;
    insErr = retry.error;
  }

  if (insErr || !battle) {
    console.error("[aiPersist] chat insert:", insErr);
    return null;
  }

  await supabase.from("ai_users").update({ credits: creditsRemaining }).eq("id", payload.userId);

  await supabase.from("ai_usage").insert({
    user_id: payload.userId,
    conversation_id: battle.id,
    mode: payload.modeKind,
    tokens_used: payload.tokensUsed,
    cost_usd: payload.costUsd,
  });

  const resolvedThreadId = payload.threadId || (battle.id as string);
  return { battleId: battle.id as string, threadId: resolvedThreadId, creditsRemaining };
}

export type ImagePersistPayload = {
  userId: string;
  prompt: string;
  modelId: string;
  imageUrl: string;
  mime: string;
  caption: string;
  cost: number;
  costUsd: number;
  tokensUsed: number;
  threadId?: string | null;
};

export async function persistImageGen(payload: ImagePersistPayload): Promise<{
  battleId: string;
  threadId: string;
  creditsRemaining: number;
} | null> {
  const supabase = getSupabaseAdmin();

  const { data: user } = await supabase
    .from("ai_users")
    .select("credits")
    .eq("id", payload.userId)
    .maybeSingle();

  if (!user) return null;

  // اعتبار هنگام ثبت job (POST /api/ai/image) کسر شده — اینجا فقط موجودی فعلی
  // خوانده می‌شود. کسر دوباره باعث double-deduct می‌شد.
  const creditsRemaining = Math.max(0, user.credits as number);
  const attachments = [{ url: payload.imageUrl, mime: payload.mime, kind: "output" as const }];

  const insertRow: Record<string, unknown> = {
    user_id: payload.userId,
    prompt: payload.prompt,
    model_a: payload.modelId,
    model_b: "",
    response_a: payload.caption || "تصویر ساخته شد.",
    response_b: "",
    tier: "image_gen",
    mode_kind: "image_gen",
    credit_cost: payload.cost,
    cost_usd: payload.costUsd,
    tokens_used: payload.tokensUsed,
    attachments,
  };
  if (payload.threadId) insertRow.thread_id = payload.threadId;

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
    console.error("[aiPersist] image insert:", insErr);
    return null;
  }

  await supabase.from("ai_usage").insert({
    user_id: payload.userId,
    conversation_id: battle.id,
    mode: "image_gen",
    tokens_used: payload.tokensUsed,
    cost_usd: payload.costUsd,
  });

  const resolvedThreadId = payload.threadId || (battle.id as string);
  return { battleId: battle.id as string, threadId: resolvedThreadId, creditsRemaining };
}

export type GuestDirectPersistPayload = {
  guestToken: string;
  prompt: string;
  responseA: string;
  modelId: string;
  costUsd: number;
  tokensUsed: number;
  tier: "direct" | "persona";
  battleId: string;
  threadId?: string | null;
  personaKey?: string | null;
};

export async function persistGuestDirect(payload: GuestDirectPersistPayload): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const insertRow: Record<string, unknown> = {
    id: payload.battleId,
    guest_token: payload.guestToken,
    prompt: payload.prompt,
    model_a: payload.modelId,
    model_b: "",
    response_a: payload.responseA,
    response_b: "",
    tier: payload.tier,
    mode_kind: "text",
    credit_cost: 0,
    cost_usd: payload.costUsd,
    tokens_used: payload.tokensUsed,
  };
  if (payload.threadId) insertRow.thread_id = payload.threadId;
  if (payload.personaKey) insertRow.persona_key = payload.personaKey;

  let { error: insErr } = await supabase.from("ai_battles").insert(insertRow);
  if (insErr && insertRow.thread_id) {
    delete insertRow.thread_id;
    ({ error: insErr } = await supabase.from("ai_battles").insert(insertRow));
  }
  if (insErr && insertRow.persona_key) {
    delete insertRow.persona_key;
    ({ error: insErr } = await supabase.from("ai_battles").insert(insertRow));
  }
  if (insErr) {
    console.error("[aiPersist] guest direct insert:", insErr);
    return false;
  }
  return true;
}

export type BattlePersistPayload = {
  userId?: string | null;
  guestToken?: string | null;
  prompt: string;
  modelAId: string;
  modelBId: string;
  responseA: string;
  responseB: string;
  tier: string;
  cost: number;
  costUsd: number;
  tokensUsed: number;
  battleId: string;
};

export async function persistBattle(payload: BattlePersistPayload): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  const insertRow: Record<string, unknown> = {
    id: payload.battleId,
    prompt: payload.prompt,
    model_a: payload.modelAId,
    model_b: payload.modelBId,
    response_a: payload.responseA,
    response_b: payload.responseB,
    tier: payload.tier,
    mode_kind: "text",
    credit_cost: payload.cost,
    cost_usd: payload.costUsd,
    tokens_used: payload.tokensUsed,
  };

  if (payload.guestToken) insertRow.guest_token = payload.guestToken;
  else if (payload.userId) insertRow.user_id = payload.userId;

  const { error: insErr } = await supabase.from("ai_battles").insert(insertRow);
  if (insErr) {
    console.error("[aiPersist] battle insert:", insErr);
    return false;
  }

  if (payload.userId && payload.cost > 0) {
    const { data: user } = await supabase
      .from("ai_users")
      .select("credits")
      .eq("id", payload.userId)
      .maybeSingle();
    if (user) {
      const creditsRemaining = Math.max(0, (user.credits as number) - payload.cost);
      await supabase.from("ai_users").update({ credits: creditsRemaining }).eq("id", payload.userId);
      await supabase.from("ai_usage").insert({
        user_id: payload.userId,
        conversation_id: payload.battleId,
        mode: payload.tier,
        tokens_used: payload.tokensUsed,
        cost_usd: payload.costUsd,
      });
    }
  }

  return true;
}

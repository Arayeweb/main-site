import type { SupabaseClient } from "@supabase/supabase-js";

type AiUserBridgeRow = {
  id: string;
  phone: string;
  password_hash: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  status?: string | null;
  last_login_at?: string | null;
  created_at?: string | null;
};

export function normalizeAdReadyUserStatus(status: string | null | undefined): string {
  if (status === "suspended" || status === "banned") return status;
  return "active";
}

/** Copies a legacy ai_users row into adready_users (same id) for first AdReady login. */
export async function ensureAdReadyUserFromAi(
  supabase: SupabaseClient,
  aiUser: AiUserBridgeRow
): Promise<{ id: string } | null> {
  const { data: existing } = await supabase
    .from("adready_users")
    .select("id")
    .eq("id", aiUser.id)
    .maybeSingle();

  if (existing?.id) {
    return { id: existing.id as string };
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("adready_users")
    .insert({
      id: aiUser.id,
      phone: aiUser.phone,
      password_hash: aiUser.password_hash,
      utm_source: aiUser.utm_source ?? null,
      utm_medium: aiUser.utm_medium ?? null,
      utm_campaign: aiUser.utm_campaign ?? null,
      status: normalizeAdReadyUserStatus(aiUser.status),
      last_login_at: aiUser.last_login_at ?? null,
      created_at: aiUser.created_at ?? now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[adready/bridge] ensure from ai_users", error);
    return null;
  }

  return { id: data.id as string };
}

const AI_USER_BRIDGE_COLUMNS =
  "id, phone, password_hash, utm_source, utm_medium, utm_campaign, status, last_login_at, created_at";

export async function findAiUserForBridge(
  supabase: SupabaseClient,
  phone: string
): Promise<AiUserBridgeRow | null> {
  const { data, error } = await supabase
    .from("ai_users")
    .select(AI_USER_BRIDGE_COLUMNS)
    .eq("phone", phone)
    .maybeSingle();

  if (error) {
    console.error("[adready/bridge] find ai_users", error);
    return null;
  }

  return data as AiUserBridgeRow | null;
}

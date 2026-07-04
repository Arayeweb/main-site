import type { SupabaseClient } from "@supabase/supabase-js";

export interface AIChallenge {
  id: string;
  slug: string;
  title: string;
  active: boolean;
}

export async function fetchActiveChallenge(
  _supabase: SupabaseClient
): Promise<AIChallenge | null> {
  return null;
}

export async function fetchChallengeBySlug(
  _supabase: SupabaseClient,
  _slug: string
): Promise<AIChallenge | null> {
  return null;
}

import type { SupabaseClient } from "@supabase/supabase-js";

type MediaJobInsert = Record<string, unknown>;

/** Insert ai_media_jobs; retries without reference_url if migration not applied yet. */
export async function insertMediaJob(
  supabase: SupabaseClient,
  row: MediaJobInsert
): Promise<{ data: { id: string } | null; error: { code?: string; message?: string } | null }> {
  const first = await supabase.from("ai_media_jobs").insert(row).select("id").single();
  if (!first.error || first.error.code !== "PGRST204" || !("reference_url" in row)) {
    return first;
  }

  console.warn(
    "[ai_media_jobs] reference_url column missing — apply supabase/migrations/20260713_ai_media_jobs_image.sql"
  );
  const { reference_url: _ref, ...withoutRef } = row;
  return supabase.from("ai_media_jobs").insert(withoutRef).select("id").single();
}

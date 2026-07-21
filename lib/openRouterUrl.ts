const OPENROUTER_ORIGIN = "https://openrouter.ai";

/** Strict origin check — never use substring `.includes("openrouter.ai")`. */
export function isTrustedOpenRouterUrl(rawUrl: string): boolean {
  if (!rawUrl) return false;
  try {
    const u = new URL(rawUrl);
    return u.origin === OPENROUTER_ORIGIN;
  } catch {
    return false;
  }
}

/** Supabase storage URLs we may redirect/proxy for completed media jobs. */
export function isTrustedSupabaseStorageUrl(rawUrl: string): boolean {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl || !rawUrl) return false;
  try {
    const candidate = new URL(rawUrl);
    const expected = new URL(supabaseUrl);
    return candidate.origin === expected.origin && candidate.pathname.includes("/storage/");
  } catch {
    return false;
  }
}

/** Build canonical OpenRouter video content URL from a job id. */
export function openRouterVideoContentUrl(jobId: string, index = 0): string {
  return `${OPENROUTER_ORIGIN}/api/v1/videos/${jobId}/content?index=${index}`;
}

// Fail-fast helpers for non-critical public widgets (leaderboard, share previews, etc.)

export const PUBLIC_FETCH_TIMEOUT_MS = 2000;

class PublicFetchTimeoutError extends Error {
  constructor(label: string) {
    super(`timeout:${label}`);
    this.name = "PublicFetchTimeoutError";
  }
}

function sanitizeError(err: unknown): string {
  if (err instanceof Error) {
    return err.message.replace(/https?:\/\/[^\s]+/g, "[host]");
  }
  return "unknown";
}

export function logPublicDataWarning(label: string, err: unknown): void {
  console.warn(`[publicData] ${label}: ${sanitizeError(err)}`);
}

/** Race a Supabase (or other) query; return null on timeout or network failure. */
export async function withPublicTimeout<T>(
  promise: PromiseLike<T>,
  label: string,
  timeoutMs = PUBLIC_FETCH_TIMEOUT_MS
): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new PublicFetchTimeoutError(label)), timeoutMs);
      }),
    ]);
  } catch (err) {
    logPublicDataWarning(label, err);
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

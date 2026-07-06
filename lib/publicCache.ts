// =========================================================
// In-memory TTL cache with stale-if-error semantics for
// non-critical public aggregates (leaderboard, challenges).
// Public data only — never cache per-user or private data.
// =========================================================

import { isE2eMode } from "./e2eMode";
import { PUBLIC_FETCH_TIMEOUT_MS, withPublicTimeout } from "./publicDataFetch";

export interface CachedResult<T> {
  value: T | null;
  stale: boolean;
}

export interface CachePublicDataOptions {
  ttlMs: number;
  timeoutMs?: number;
}

interface CacheEntry {
  value: unknown;
  fetchedAt: number;
}

const store = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<CachedResult<unknown>>>();

async function loadAndStore<T>(
  key: string,
  loader: () => PromiseLike<T | null>,
  timeoutMs: number
): Promise<CachedResult<T>> {
  const value = await withPublicTimeout(loader(), key, timeoutMs);

  if (value !== null && value !== undefined) {
    store.set(key, { value, fetchedAt: Date.now() });
    return { value, stale: false };
  }

  // Loader failed/timed out/returned null — serve last good value if any.
  const prior = store.get(key);
  if (prior) {
    return { value: prior.value as T, stale: true };
  }
  return { value: null, stale: false };
}

/**
 * Cache a public-aggregate loader by key with a TTL.
 * - Fresh hit → cached value, stale: false.
 * - Miss/expired → run loader (with timeout); on success store fresh.
 * - Failure/timeout/null → serve last good value with stale: true;
 *   if none, { value: null, stale: false } so the caller uses its fallback.
 * - Concurrent callers share one in-flight loader (single-flight).
 * - E2E_MODE bypasses the cache entirely.
 */
export async function cachePublicData<T>(
  key: string,
  loader: () => PromiseLike<T | null>,
  { ttlMs, timeoutMs = PUBLIC_FETCH_TIMEOUT_MS }: CachePublicDataOptions
): Promise<CachedResult<T>> {
  if (isE2eMode()) {
    const value = await withPublicTimeout(loader(), key, timeoutMs);
    return { value: value ?? null, stale: false };
  }

  const entry = store.get(key);
  if (entry && Date.now() - entry.fetchedAt < ttlMs) {
    return { value: entry.value as T, stale: false };
  }

  const existing = inFlight.get(key);
  if (existing) {
    return existing as Promise<CachedResult<T>>;
  }

  const promise = loadAndStore(key, loader, timeoutMs).finally(() => {
    inFlight.delete(key);
  });
  inFlight.set(key, promise as Promise<CachedResult<unknown>>);
  return promise;
}

/** Test helper — reset all cached values and in-flight loaders. */
export function clearPublicCache(): void {
  store.clear();
  inFlight.clear();
}

import type { HistoryItem } from "./aiHistory";

const KEY_PREFIX = "ai_history_v1";
const LEGACY_KEY = "ai_history_v1";
const MAX = 60;

function cacheKey(userId?: string | null): string {
  return userId ? `${KEY_PREFIX}:${userId}` : `${KEY_PREFIX}:guest`;
}

function safeParse(raw: string | null): HistoryItem[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(arr) ? arr.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

function readStorage(userId?: string | null): HistoryItem[] {
  if (typeof window === "undefined") return [];
  const key = cacheKey(userId);
  const store = userId ? localStorage : sessionStorage;
  const items = safeParse(store.getItem(key));
  if (items.length > 0 || userId) return items;

  // One-time migration from legacy single-key sessionStorage cache.
  const legacy = safeParse(sessionStorage.getItem(LEGACY_KEY));
  if (legacy.length > 0) {
    try {
      sessionStorage.setItem(key, JSON.stringify(legacy));
      sessionStorage.removeItem(LEGACY_KEY);
    } catch {
      /* quota */
    }
    return legacy;
  }
  return [];
}

function writeStorage(items: HistoryItem[], userId?: string | null) {
  if (typeof window === "undefined") return;
  const key = cacheKey(userId);
  const store = userId ? localStorage : sessionStorage;
  try {
    store.setItem(key, JSON.stringify(items.slice(0, MAX)));
  } catch {
    /* quota */
  }
}

export function readHistoryCache(userId?: string | null): HistoryItem[] {
  return readStorage(userId);
}

export function writeHistoryCache(items: HistoryItem[], userId?: string | null) {
  writeStorage(items, userId);
}

export function prependHistoryCache(item: HistoryItem, userId?: string | null) {
  const prev = readHistoryCache(userId);
  const idx = prev.findIndex((x) => x.id === item.id);
  if (idx >= 0) {
    const merged = { ...prev[idx], ...item, latestRunId: item.latestRunId ?? prev[idx].latestRunId };
    writeHistoryCache([merged, ...prev.filter((_, i) => i !== idx)], userId);
    return;
  }
  writeHistoryCache([item, ...prev], userId);
}

import type { HistoryItem } from "./aiHistory";

const KEY = "ai_history_v1";
const MAX = 60;

function safeParse(raw: string | null): HistoryItem[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(arr) ? arr.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function readHistoryCache(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  return safeParse(sessionStorage.getItem(KEY));
}

export function writeHistoryCache(items: HistoryItem[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
  } catch {
    /* quota */
  }
}

export function prependHistoryCache(item: HistoryItem) {
  const prev = readHistoryCache();
  if (prev.some((x) => x.id === item.id)) return;
  writeHistoryCache([item, ...prev]);
}

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  prependHistoryCache,
  readHistoryCache,
  writeHistoryCache,
} from "@/lib/aiHistoryCache";
import type { HistoryItem } from "@/lib/aiHistory";

const USER_A = "user-a";
const USER_B = "user-b";

const sample: HistoryItem = {
  id: "conv-1",
  title: "سلام",
  tier: "direct",
  createdAt: "2026-07-05T10:00:00.000Z",
  source: "run",
  latestRunId: "run-1",
};

function createStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

describe("aiHistoryCache", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {} as Window);
    vi.stubGlobal("localStorage", createStorage());
    vi.stubGlobal("sessionStorage", createStorage());
  });

  it("stores authed history per user in localStorage", () => {
    writeHistoryCache([sample], USER_A);
    expect(readHistoryCache(USER_A)).toEqual([sample]);
    expect(readHistoryCache(USER_B)).toEqual([]);
  });

  it("keeps user history after guest cache is cleared", () => {
    writeHistoryCache([sample], USER_A);
    writeHistoryCache([], null);
    expect(readHistoryCache(USER_A)).toEqual([sample]);
  });

  it("prepends and merges by id for the same user", () => {
    writeHistoryCache([sample], USER_A);
    prependHistoryCache(
      { ...sample, title: "سلام دوباره", latestRunId: "run-2" },
      USER_A
    );
    const items = readHistoryCache(USER_A);
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe("سلام دوباره");
    expect(items[0]?.latestRunId).toBe("run-2");
  });
});

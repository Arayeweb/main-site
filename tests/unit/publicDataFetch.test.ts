import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchLeaderboard } from "@/lib/aiLeaderboard";
import { withPublicTimeout, PUBLIC_FETCH_TIMEOUT_MS } from "@/lib/publicDataFetch";

describe("withPublicTimeout", () => {
  afterEach(() => {
    vi.useRealTimers();
    delete process.env.E2E_MODE;
  });

  it("returns result when promise resolves in time", async () => {
    const value = await withPublicTimeout(Promise.resolve({ ok: true }), "test");
    expect(value).toEqual({ ok: true });
  });

  it("returns null on timeout", async () => {
    vi.useFakeTimers();
    const pending = withPublicTimeout(
      new Promise<{ ok: boolean }>(() => {}),
      "slow-query",
      50
    );
    await vi.advanceTimersByTimeAsync(50);
    await expect(pending).resolves.toBeNull();
  });

  it("returns null when promise rejects", async () => {
    const value = await withPublicTimeout(
      Promise.reject(new TypeError("fetch failed")),
      "network"
    );
    expect(value).toBeNull();
  });

  it("uses 2s default timeout budget", () => {
    expect(PUBLIC_FETCH_TIMEOUT_MS).toBe(2000);
  });
});

describe("fetchLeaderboard", () => {
  afterEach(() => {
    delete process.env.E2E_MODE;
    delete process.env.NEXT_PUBLIC_E2E_MODE;
  });

  it("returns empty list in E2E mode without querying Supabase", async () => {
    process.env.E2E_MODE = "1";
    const supabase = {
      from: vi.fn(() => {
        throw new Error("should not query supabase in e2e mode");
      }),
    };

    await expect(fetchLeaderboard(supabase as never)).resolves.toEqual([]);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("returns empty list when Supabase query times out", async () => {
    vi.useFakeTimers();
    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          in: vi.fn(() => new Promise(() => {})),
        })),
      })),
    };

    const pending = fetchLeaderboard(supabase as never);
    await vi.advanceTimersByTimeAsync(PUBLIC_FETCH_TIMEOUT_MS + 10);
    await expect(pending).resolves.toEqual([]);
    vi.useRealTimers();
  });
});

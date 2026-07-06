import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cachePublicData, clearPublicCache } from "@/lib/publicCache";

describe("cachePublicData", () => {
  beforeEach(() => {
    clearPublicCache();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete process.env.E2E_MODE;
    delete process.env.NEXT_PUBLIC_E2E_MODE;
  });

  it("returns fresh value on cache miss and caches it", async () => {
    const loader = vi.fn(async () => ["a"]);

    const first = await cachePublicData("k1", loader, { ttlMs: 1000 });
    expect(first).toEqual({ value: ["a"], stale: false });

    const second = await cachePublicData("k1", loader, { ttlMs: 1000 });
    expect(second).toEqual({ value: ["a"], stale: false });
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("refetches after TTL expiry", async () => {
    vi.useFakeTimers();
    const loader = vi
      .fn<() => Promise<string[]>>()
      .mockResolvedValueOnce(["old"])
      .mockResolvedValueOnce(["new"]);

    await cachePublicData("k2", loader, { ttlMs: 1000 });
    await vi.advanceTimersByTimeAsync(1001);

    const result = await cachePublicData("k2", loader, { ttlMs: 1000 });
    expect(result).toEqual({ value: ["new"], stale: false });
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("serves stale value when loader fails after a prior success", async () => {
    vi.useFakeTimers();
    const loader = vi
      .fn<() => Promise<string[] | null>>()
      .mockResolvedValueOnce(["good"])
      .mockRejectedValueOnce(new Error("db down"));

    await cachePublicData("k3", loader, { ttlMs: 1000 });
    await vi.advanceTimersByTimeAsync(1001);

    const result = await cachePublicData("k3", loader, { ttlMs: 1000 });
    expect(result).toEqual({ value: ["good"], stale: true });
  });

  it("serves stale value when loader returns null after a prior success", async () => {
    vi.useFakeTimers();
    const loader = vi
      .fn<() => Promise<string[] | null>>()
      .mockResolvedValueOnce(["good"])
      .mockResolvedValueOnce(null);

    await cachePublicData("k4", loader, { ttlMs: 1000 });
    await vi.advanceTimersByTimeAsync(1001);

    const result = await cachePublicData("k4", loader, { ttlMs: 1000 });
    expect(result).toEqual({ value: ["good"], stale: true });
  });

  it("returns null non-stale when loader fails with empty cache", async () => {
    const loader = vi.fn(async () => {
      throw new Error("db down");
    });

    const result = await cachePublicData("k5", loader, { ttlMs: 1000 });
    expect(result).toEqual({ value: null, stale: false });
  });

  it("serves stale value when loader times out", async () => {
    vi.useFakeTimers();
    const loader = vi
      .fn<() => Promise<string[] | null>>()
      .mockResolvedValueOnce(["good"])
      .mockImplementationOnce(() => new Promise(() => {}));

    await cachePublicData("k6", loader, { ttlMs: 1000, timeoutMs: 50 });
    await vi.advanceTimersByTimeAsync(1001);

    const pending = cachePublicData("k6", loader, { ttlMs: 1000, timeoutMs: 50 });
    await vi.advanceTimersByTimeAsync(50);
    await expect(pending).resolves.toEqual({ value: ["good"], stale: true });
  });

  it("deduplicates concurrent loads (single-flight)", async () => {
    let resolveLoader: (v: string[]) => void = () => {};
    const loader = vi.fn(
      () => new Promise<string[]>((resolve) => (resolveLoader = resolve))
    );

    const p1 = cachePublicData("k7", loader, { ttlMs: 1000 });
    const p2 = cachePublicData("k7", loader, { ttlMs: 1000 });
    resolveLoader(["shared"]);

    await expect(p1).resolves.toEqual({ value: ["shared"], stale: false });
    await expect(p2).resolves.toEqual({ value: ["shared"], stale: false });
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("bypasses the cache entirely in E2E mode", async () => {
    process.env.E2E_MODE = "1";
    const loader = vi.fn(async () => ["e2e"]);

    await cachePublicData("k8", loader, { ttlMs: 1000 });
    const result = await cachePublicData("k8", loader, { ttlMs: 1000 });

    expect(result).toEqual({ value: ["e2e"], stale: false });
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("clearPublicCache resets stored values", async () => {
    const loader = vi.fn(async () => ["v"]);

    await cachePublicData("k9", loader, { ttlMs: 60_000 });
    clearPublicCache();
    await cachePublicData("k9", loader, { ttlMs: 60_000 });

    expect(loader).toHaveBeenCalledTimes(2);
  });
});

// =========================================================
// قفل و شمارنده همزمانی — کنترل تعداد run فعال هر کاربر
// و flag توقف run (برای /api/ai/runs/[id]/stop).
// =========================================================

import { getRedis } from "./client";

const CONCURRENCY_TTL_SEC = 180; // اگر process بمیرد، slot خودکار آزاد می‌شود
const STOP_FLAG_TTL_SEC = 300;

// fallback درون‌حافظه‌ای
const memActive = new Map<string, number>();
const memStops = new Map<string, number>();

/** یک slot همزمانی می‌گیرد. false = سقف پر است. */
export async function acquireRunSlot(
  userId: string,
  maxConcurrent: number,
  opts: { failClosed?: boolean } = {}
): Promise<boolean> {
  const key = `conc:${userId}`;
  const redis = getRedis();

  if (!redis) {
    if (opts.failClosed) {
      console.warn("[redis/locks] redis unavailable; blocking fail-closed mode");
      return false;
    }
    const cur = memActive.get(key) ?? 0;
    if (cur >= maxConcurrent) return false;
    memActive.set(key, cur + 1);
    return true;
  }

  try {
    const count = Number(await redis.command(["INCR", key]));
    await redis.command(["EXPIRE", key, CONCURRENCY_TTL_SEC]);
    if (count > maxConcurrent) {
      await redis.command(["DECR", key]);
      return false;
    }
    return true;
  } catch {
    if (opts.failClosed) {
      console.warn("[redis/locks] redis error; blocking fail-closed mode");
      return false;
    }
    return true; // حالت‌های کم‌هزینه‌تر می‌توانند با fallback ادامه دهند
  }
}

export async function releaseRunSlot(userId: string): Promise<void> {
  const key = `conc:${userId}`;
  const redis = getRedis();

  if (!redis) {
    const cur = memActive.get(key) ?? 0;
    memActive.set(key, Math.max(0, cur - 1));
    return;
  }

  try {
    const val = Number(await redis.command(["DECR", key]));
    if (val < 0) await redis.command(["SET", key, 0, "EX", CONCURRENCY_TTL_SEC]);
  } catch {
    /* ignore */
  }
}

/** ثبت درخواست توقف یک run. */
export async function requestStop(runId: string): Promise<void> {
  const key = `stop:${runId}`;
  const redis = getRedis();
  if (!redis) {
    memStops.set(key, Date.now());
    return;
  }
  try {
    await redis.command(["SET", key, "1", "EX", STOP_FLAG_TTL_SEC]);
  } catch {
    memStops.set(key, Date.now());
  }
}

/** بررسی اینکه توقف run درخواست شده یا نه. */
export async function isStopRequested(runId: string): Promise<boolean> {
  const key = `stop:${runId}`;
  const redis = getRedis();
  if (!redis) {
    const ts = memStops.get(key);
    return ts != null && Date.now() - ts < STOP_FLAG_TTL_SEC * 1000;
  }
  try {
    const val = await redis.command(["GET", key]);
    return val != null;
  } catch {
    const ts = memStops.get(key);
    return ts != null && Date.now() - ts < STOP_FLAG_TTL_SEC * 1000;
  }
}

export const STOP_POLL_INTERVAL_MS = 400;

/**
 * Polls Redis stop flag at most once per interval — avoids per-chunk HTTP calls.
 * Local AbortSignal is checked on every call (immediate cancel).
 */
export class ThrottledStopChecker {
  private lastCheckMs = 0;
  private lastResult = false;
  private polls = 0;

  constructor(
    private readonly runId: string,
    private readonly intervalMs = STOP_POLL_INTERVAL_MS
  ) {}

  /** Returns true when aborted locally or stop flag is set in Redis/memory. */
  async shouldStop(signal: AbortSignal): Promise<boolean> {
    if (signal.aborted) return true;
    const now = Date.now();
    if (this.lastCheckMs === 0 || now - this.lastCheckMs >= this.intervalMs) {
      this.lastCheckMs = now;
      this.polls += 1;
      this.lastResult = await isStopRequested(this.runId);
    }
    return this.lastResult;
  }

  /** Force a fresh Redis read (e.g. after stream ends). */
  async forceCheck(): Promise<boolean> {
    this.lastCheckMs = Date.now();
    this.polls += 1;
    this.lastResult = await isStopRequested(this.runId);
    return this.lastResult;
  }

  /** Test hook — number of Redis polls performed. */
  get pollCount(): number {
    return this.polls;
  }
}

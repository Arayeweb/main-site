// =========================================================
// Rate limit بر اساس پلن و mode — sliding window ساعتی.
// =========================================================

import { planRank } from "@/lib/aiPackages";
import type { RunMode } from "@/lib/ai/streaming/sse";
import { getRedis } from "./client";

const WINDOW_SEC = 3600;

type PlanBucket = 0 | 1 | 2 | 3 | 4;

/** سقف ساعتی هر mode: free | starter | plus | pro | max+ */
const HOURLY_LIMITS: Record<RunMode, [number, number, number, number, number]> = {
  direct: [10, 30, 45, 60, 150],
  compare: [1, 10, 20, 30, 60],
  council: [0, 0, 5, 10, 25],
};

/** حداکثر run همزمان: free | starter | plus | pro | max+ */
export const MAX_CONCURRENCY: [number, number, number, number, number] = [
  1, 1, 2, 2, 4,
];

function planBucket(plan: string): PlanBucket {
  const rank = planRank(plan);
  if (rank <= 0) return 0;
  if (rank === 1) return 1;
  if (rank === 2) return 2;
  if (rank === 3) return 3;
  return 4;
}

export function hourlyLimit(plan: string, mode: RunMode): number {
  return HOURLY_LIMITS[mode][planBucket(plan)];
}

export function maxConcurrency(plan: string): number {
  return MAX_CONCURRENCY[planBucket(plan)];
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
};

const memHits = new Map<string, number[]>();

function memCheck(key: string, limit: number): RateLimitResult {
  const now = Date.now();
  const arr = (memHits.get(key) || []).filter((t) => now - t < WINDOW_SEC * 1000);
  if (arr.length >= limit) {
    memHits.set(key, arr);
    return { allowed: false, remaining: 0 };
  }
  arr.push(now);
  memHits.set(key, arr);
  return { allowed: true, remaining: limit - arr.length };
}

export async function checkRateLimit(
  userId: string,
  plan: string,
  mode: RunMode
): Promise<RateLimitResult> {
  const limit = hourlyLimit(plan, mode);
  if (limit <= 0) return { allowed: false, remaining: 0 };

  const key = `rl:${userId}:${mode}:${Math.floor(Date.now() / (WINDOW_SEC * 1000))}`;
  const redis = getRedis();
  if (!redis) return memCheck(key, limit);

  try {
    const count = Number(await redis.command(["INCR", key]));
    if (count === 1) {
      await redis.command(["EXPIRE", key, WINDOW_SEC]);
    }
    if (count > limit) return { allowed: false, remaining: 0 };
    return { allowed: true, remaining: limit - count };
  } catch (e) {
    console.warn("[redis/rate-limit] fallback to memory:", e);
    return memCheck(key, limit);
  }
}

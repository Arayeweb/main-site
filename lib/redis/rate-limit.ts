// =========================================================
// Rate limit بر اساس پلن و mode — sliding window ساعتی.
// اگر Redis در دسترس نباشد fallback درون‌حافظه‌ای استفاده می‌شود
// (بهتر از هیچ؛ در multi-instance فقط تقریبی است).
// =========================================================

import { planRank } from "@/lib/aiPackages";
import type { RunMode } from "@/lib/ai/streaming/sse";
import { getRedis } from "./client";

const WINDOW_SEC = 3600;

/** سقف ساعتی هر mode بر اساس پلن */
const HOURLY_LIMITS: Record<RunMode, [free: number, starter: number, pro: number, business: number]> = {
  direct: [10, 30, 60, 150],
  compare: [1, 10, 30, 60],
  council: [0, 0, 10, 25],
};

/** حداکثر run همزمان بر اساس پلن */
export const MAX_CONCURRENCY: [number, number, number, number] = [1, 1, 2, 4];

export function hourlyLimit(plan: string, mode: RunMode): number {
  const rank = Math.min(Math.max(planRank(plan), 0), 3) as 0 | 1 | 2 | 3;
  return HOURLY_LIMITS[mode][rank];
}

export function maxConcurrency(plan: string): number {
  const rank = Math.min(Math.max(planRank(plan), 0), 3) as 0 | 1 | 2 | 3;
  return MAX_CONCURRENCY[rank];
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
};

// fallback درون‌حافظه‌ای وقتی Redis نیست
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

/**
 * بررسی و مصرف یک واحد از rate limit کاربر برای mode داده‌شده.
 */
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

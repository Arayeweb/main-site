// =========================================================
// Webhook rate limiting per telegram_id and IP
// =========================================================

import { getRedis } from "@/lib/redis/client";

const WINDOW_SEC = 60;
const MAX_PER_USER = 30;
const MAX_PER_IP = 60;

const memHits = new Map<string, number[]>();

function memCheck(key: string, limit: number): boolean {
  const now = Date.now();
  const arr = (memHits.get(key) || []).filter((t) => now - t < WINDOW_SEC * 1000);
  if (arr.length >= limit) {
    memHits.set(key, arr);
    return false;
  }
  arr.push(now);
  memHits.set(key, arr);
  return true;
}

async function redisCheck(key: string, limit: number): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return memCheck(key, limit);
  try {
    const count = Number(await redis.command(["INCR", key]));
    if (count === 1) await redis.command(["EXPIRE", key, WINDOW_SEC]);
    return count <= limit;
  } catch {
    return memCheck(key, limit);
  }
}

export async function checkWebhookRateLimit(
  telegramId: number | null,
  ip: string
): Promise<boolean> {
  const ipOk = await redisCheck(`tg:ip:${ip}`, MAX_PER_IP);
  if (!ipOk) return false;
  if (telegramId == null) return true;
  return redisCheck(`tg:wh:${telegramId}`, MAX_PER_USER);
}

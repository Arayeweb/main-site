// =========================================================
// کلاینت Redis سبک — Upstash REST بدون dependency.
// اگر UPSTASH_REDIS_REST_URL/TOKEN تنظیم نشده باشد null برمی‌گردد
// و مصرف‌کننده‌ها به fallback درون‌حافظه‌ای می‌روند.
// =========================================================

type RedisCommandResult = { result: unknown };

export type RedisClient = {
  /** اجرای یک دستور Redis — مثل ["INCR", "key"] */
  command(args: (string | number)[]): Promise<unknown>;
};

let cached: RedisClient | null | undefined;

export function getRedis(): RedisClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    cached = null;
    return null;
  }

  cached = {
    async command(args: (string | number)[]): Promise<unknown> {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(args.map(String)),
      });
      if (!res.ok) {
        throw new Error(`redis_http_${res.status}`);
      }
      const data = (await res.json()) as RedisCommandResult;
      return data.result;
    },
  };
  return cached;
}

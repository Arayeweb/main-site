import type { getSupabaseAdmin } from "@/lib/supabase";

type SupabaseAdmin = ReturnType<typeof getSupabaseAdmin>;

export async function fetchAllRows(
  table: string,
  columns: string,
  supabase: SupabaseAdmin
): Promise<{ data: Record<string, unknown>[]; error: string | null }> {
  const PAGE = 1000;
  const all: Record<string, unknown>[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order("created_at", { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) return { data: all, error: error.message };
    const batch = (data || []) as unknown as Record<string, unknown>[];
    all.push(...batch);
    if (batch.length < PAGE) break;
  }
  return { data: all, error: null };
}

/**
 * گروه‌بندی و شمارش ردیف‌ها بر اساس یک فیلد.
 * اگر organicLabel بدهی، ردیف‌های بدون مقدار (organic/direct) هم با آن برچسب شمرده می‌شوند.
 */
export function groupCount(
  items: Record<string, unknown>[],
  key: string,
  organicLabel?: string
): { key: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const v = (item[key] as string) || "";
    const bucket = v || (organicLabel ?? "");
    if (!bucket) continue;
    map.set(bucket, (map.get(bucket) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([k, count]) => ({ key: k, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

export function buildDailySeries(
  items: Record<string, unknown>[],
  days: number,
  now = Date.now()
): { date: string; count: number }[] {
  const series: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    series.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  for (const item of items) {
    const date = new Date(item.created_at as string).toISOString().slice(0, 10);
    const entry = series.find((x) => x.date === date);
    if (entry) entry.count++;
  }
  return series;
}

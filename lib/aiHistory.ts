// گروه‌بندی ردیف‌های ai_battles به thread برای سایدبار (مثل ChatGPT)

export type HistoryRow = {
  id: string;
  prompt: string;
  tier: string;
  created_at: string;
  thread_id?: string | null;
  persona_key?: string | null;
};

export type HistoryItem = {
  id: string;
  title: string;
  tier: string;
  createdAt: string;
  personaKey?: string | null;
};

export function buildHistoryItems(rows: HistoryRow[]): HistoryItem[] {
  const groups = new Map<string, HistoryRow[]>();

  for (const r of rows) {
    const rootId = r.thread_id || r.id;
    const g = groups.get(rootId);
    if (g) g.push(r);
    else groups.set(rootId, [r]);
  }

  const items: HistoryItem[] = [];
  for (const [rootId, msgs] of groups) {
    msgs.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const first = msgs[0];
    const latest = msgs[msgs.length - 1];
    items.push({
      id: rootId,
      title: (first.prompt || "").slice(0, 80),
      tier: first.tier,
      createdAt: latest.created_at,
      personaKey: first.persona_key ?? null,
    });
  }

  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function mergeHistoryItems(
  server: HistoryItem[],
  local: HistoryItem[]
): HistoryItem[] {
  const map = new Map<string, HistoryItem>();
  for (const it of server) map.set(it.id, it);
  for (const it of local) {
    if (!map.has(it.id)) map.set(it.id, it);
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

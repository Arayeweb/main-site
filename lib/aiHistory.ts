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
  /** `run` = ai_runs orchestration row; default legacy ai_battles */
  source?: "run" | "legacy";
  /** Latest run id in thread — used for /ai/runs/[id] links (id stays conversation anchor). */
  latestRunId?: string;
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

/** Map ai_runs.mode to sidebar tier + Persian label key */
export function runModeToHistoryTier(mode: string): string {
  if (mode === "compare") return "side_by_side";
  if (mode === "council") return "council";
  return "direct";
}

export function historyTierLabel(tier: string, source?: "run" | "legacy"): string {
  if (source === "run") {
    if (tier === "direct") return "چت";
    if (tier === "side_by_side") return "مقایسه";
    if (tier === "council") return "همفکری";
  }
  if (tier === "direct") return "چت";
  if (tier === "side_by_side") return "مقایسه";
  if (tier === "battle" || tier === "council") return "همفکری";
  if (tier === "code_studio") return "استودیو کد";
  return tier;
}

export function buildRunHistoryItems(
  rows: Array<{
    id: string;
    mode: string;
    metadata: { prompt?: string; persona_key?: string; source?: string } | null;
    created_at: string;
    conversation_id?: string | null;
  }>
): HistoryItem[] {
  const groups = new Map<string, typeof rows>();

  for (const r of rows) {
    // Media tools have their own legacy history rows in ai_battles. Their
    // internal financial runs must not appear as duplicate chat conversations.
    if (["audio_generation", "transcription", "image_generation"].includes(
      String(r.metadata?.source ?? "")
    )) {
      continue;
    }
    const rootId = r.conversation_id ?? r.id;
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
      latestRunId: latest.id,
      title: String(first.metadata?.prompt ?? "").slice(0, 80) || "گفتگو",
      tier: runModeToHistoryTier(first.mode),
      personaKey: first.metadata?.persona_key ?? null,
      createdAt: latest.created_at,
      source: "run" as const,
    });
  }

  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function mergeUnifiedHistory(legacy: HistoryItem[], runs: HistoryItem[]): HistoryItem[] {
  const map = new Map<string, HistoryItem>();
  for (const it of legacy) map.set(`legacy:${it.id}`, { ...it, source: it.source ?? "legacy" });
  for (const it of runs) map.set(`run:${it.id}`, it);
  return Array.from(map.values()).sort(
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
    const prev = map.get(it.id);
    if (!prev) {
      map.set(it.id, it);
      continue;
    }
    const serverAt = new Date(prev.createdAt).getTime();
    const localAt = new Date(it.createdAt).getTime();
    map.set(it.id, {
      ...prev,
      ...it,
      title: localAt >= serverAt ? it.title : prev.title,
      createdAt: localAt >= serverAt ? it.createdAt : prev.createdAt,
      latestRunId: it.latestRunId ?? prev.latestRunId,
    });
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// =========================================================
// لیدربورد مدل‌ها — aggregate win rate از ai_battles
// =========================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import { modelName } from "./aiModels";

export interface LeaderboardEntry {
  modelId: string;
  name: string;
  wins: number;
  losses: number;
  total: number;
  winRate: number;
}

const MIN_VOTES = 5;
const EXCLUDED_TIERS = new Set(["direct", "image_gen"]);

export async function fetchLeaderboard(
  supabase: SupabaseClient
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("ai_battles")
    .select("model_a, model_b, winner, tier")
    .in("winner", ["a", "b"]);

  if (error) {
    console.error("[aiLeaderboard]", error);
    return [];
  }

  const stats = new Map<string, { wins: number; losses: number }>();

  function bump(id: string, won: boolean) {
    const cur = stats.get(id) || { wins: 0, losses: 0 };
    if (won) cur.wins += 1;
    else cur.losses += 1;
    stats.set(id, cur);
  }

  for (const row of data || []) {
    const tier = row.tier as string;
    if (EXCLUDED_TIERS.has(tier)) continue;

    const winner = row.winner as string;
    const a = row.model_a as string;
    const b = row.model_b as string;
    if (!a || !b) continue;

    if (winner === "a") {
      bump(a, true);
      bump(b, false);
    } else if (winner === "b") {
      bump(b, true);
      bump(a, false);
    }
  }

  const entries: LeaderboardEntry[] = [];
  for (const [modelId, s] of stats) {
    const total = s.wins + s.losses;
    if (total < MIN_VOTES) continue;
    entries.push({
      modelId,
      name: modelName(modelId),
      wins: s.wins,
      losses: s.losses,
      total,
      winRate: Math.round((s.wins / total) * 1000) / 10,
    });
  }

  entries.sort((x, y) => y.winRate - x.winRate || y.total - x.total);
  return entries;
}

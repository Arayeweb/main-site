import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { fetchLeaderboardOrNull } from "@/lib/aiLeaderboard";
import { isE2eMode } from "@/lib/e2eMode";
import { cachePublicData } from "@/lib/publicCache";
import { E2E_LEADERBOARD_FIXTURE } from "@/lib/aiPublicFixtures";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_KEY = "ai:leaderboard:v1";
const TTL_MS = 300_000;
const CDN_CACHE_CONTROL = "public, s-maxage=300, stale-while-revalidate=600";

export async function GET() {
  if (isE2eMode()) {
    return NextResponse.json({ ok: true, entries: E2E_LEADERBOARD_FIXTURE, stale: false });
  }

  const supabase = getSupabaseAdmin();
  const { value, stale } = await cachePublicData(
    CACHE_KEY,
    () => fetchLeaderboardOrNull(supabase),
    { ttlMs: TTL_MS }
  );

  return NextResponse.json(
    { ok: true, entries: value ?? [], stale },
    { headers: { "Cache-Control": CDN_CACHE_CONTROL } }
  );
}

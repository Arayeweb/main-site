import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { fetchLeaderboard } from "@/lib/aiLeaderboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const entries = await fetchLeaderboard(supabase);
  return NextResponse.json({ ok: true, entries });
}

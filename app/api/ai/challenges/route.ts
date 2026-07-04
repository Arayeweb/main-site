import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { fetchActiveChallenge, fetchChallengeBySlug } from "@/lib/aiChallenges";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  const supabase = getSupabaseAdmin();
  const challenge = slug
    ? await fetchChallengeBySlug(supabase, slug)
    : await fetchActiveChallenge(supabase);

  if (!challenge) {
    return NextResponse.json({ ok: true, challenge: null });
  }

  return NextResponse.json({ ok: true, challenge });
}

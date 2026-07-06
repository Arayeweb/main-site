import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { fetchActiveChallenge, fetchChallengeBySlug } from "@/lib/aiChallenges";
import { isE2eMode } from "@/lib/e2eMode";
import { cachePublicData } from "@/lib/publicCache";
import { E2E_CHALLENGE_FIXTURE } from "@/lib/aiPublicFixtures";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TTL_MS = 300_000;
const CDN_CACHE_CONTROL = "public, s-maxage=300, stale-while-revalidate=600";

export async function GET(req: Request) {
  if (isE2eMode()) {
    return NextResponse.json({ ok: true, challenge: E2E_CHALLENGE_FIXTURE, stale: false });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const cacheKey = slug
    ? `ai:challenges:slug:${slug}:v1`
    : "ai:challenges:active:v1";

  const supabase = getSupabaseAdmin();
  const { value, stale } = await cachePublicData(
    cacheKey,
    () =>
      slug
        ? fetchChallengeBySlug(supabase, slug)
        : fetchActiveChallenge(supabase),
    { ttlMs: TTL_MS }
  );

  return NextResponse.json(
    { ok: true, challenge: value ?? null, stale },
    { headers: { "Cache-Control": CDN_CACHE_CONTROL } }
  );
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { guestOwnsBattle } from "@/lib/aiGuest";
import { generateShareSlug } from "@/lib/aiPromo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com";

export async function POST(req: NextRequest) {
  const session = getAISession(req);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const battleId = String(body.battleId ?? "").slice(0, 36);
  if (!battleId) {
    return NextResponse.json({ ok: false, error: "missing_battle" }, { status: 422 });
  }

  const supabase = getSupabaseAdmin();
  const { data: battle, error } = await supabase
    .from("ai_battles")
    .select("id, user_id, guest_token, winner, tier, share_slug, is_public")
    .eq("id", battleId)
    .maybeSingle();

  if (error || !battle) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const isOwner =
    (session && battle.user_id === session.userId) ||
    guestOwnsBattle(req, battle.guest_token as string | null);

  if (!isOwner) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const tier = battle.tier as string;
  if (
    tier === "direct" ||
    tier === "image_gen" ||
    tier === "video_gen" ||
    tier === "audio_gen" ||
    tier === "transcribe"
  ) {
    return NextResponse.json({ ok: false, error: "not_shareable" }, { status: 422 });
  }

  if (tier === "battle" && !battle.winner) {
    return NextResponse.json({ ok: false, error: "vote_first" }, { status: 422 });
  }

  let slug = battle.share_slug as string | null;
  if (!slug) {
    for (let attempt = 0; attempt < 5; attempt++) {
      slug = generateShareSlug();
      const { error: upErr } = await supabase
        .from("ai_battles")
        .update({ is_public: true, share_slug: slug })
        .eq("id", battleId);
      if (!upErr) break;
      slug = null;
    }
    if (!slug) {
      return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
    }
  } else if (!battle.is_public) {
    await supabase.from("ai_battles").update({ is_public: true }).eq("id", battleId);
  }

  const shareUrl = `${SITE_URL}/ai/share/${slug}`;
  return NextResponse.json({ ok: true, slug, shareUrl });
}

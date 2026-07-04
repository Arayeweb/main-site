import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { extractCodeSnapshot, type CodeFileMap } from "@/lib/codeStudio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = String(params.slug ?? "").slice(0, 32);
  if (!slug) {
    return NextResponse.json({ ok: false, error: "invalid_slug" }, { status: 422 });
  }

  const supabase = getSupabaseAdmin();
  const { data: battle, error } = await supabase
    .from("ai_battles")
    .select("prompt, tier, attachments, share_slug")
    .eq("share_slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (error || !battle) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if ((battle.tier as string) !== "code_studio") {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const snap = extractCodeSnapshot(battle.attachments);
  if (!snap) {
    return NextResponse.json({ ok: false, error: "no_snapshot" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    slug,
    prompt: battle.prompt,
    files: snap.files as CodeFileMap,
    activeFile: snap.activeFile,
  });
}

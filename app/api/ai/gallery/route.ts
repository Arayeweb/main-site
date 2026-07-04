import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { extractCodeSnapshot, galleryPreviewFromFiles } from "@/lib/codeStudio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Attachment = { url?: string; mime?: string; kind?: string };

export async function GET(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const tier = req.nextUrl.searchParams.get("tier") || "image_gen";
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") || 48), 120);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ai_battles")
    .select("id, prompt, tier, created_at, attachments, thread_id")
    .eq("user_id", session.userId)
    .eq("tier", tier)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[api/ai/gallery]", error.message);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  const items = (data || [])
    .map((row) => {
      const attachments = (row.attachments as Attachment[] | null) || [];

      if (tier === "code_studio") {
        const snap = extractCodeSnapshot(attachments);
        if (!snap) return null;
        return {
          id: row.id as string,
          threadId: (row.thread_id as string | null) || (row.id as string),
          prompt: ((row.prompt as string) || "").slice(0, 200),
          preview: galleryPreviewFromFiles(snap.files),
          createdAt: row.created_at as string,
        };
      }

      const output = attachments.find((a) => a.kind === "output" && a.url);
      if (!output?.url) return null;
      return {
        id: row.id as string,
        threadId: (row.thread_id as string | null) || (row.id as string),
        prompt: ((row.prompt as string) || "").slice(0, 200),
        url: output.url,
        mime: output.mime || (tier === "video_gen" ? "video/mp4" : tier === "music_gen" ? "audio/mpeg" : "image/png"),
        createdAt: row.created_at as string,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ ok: true, items });
}

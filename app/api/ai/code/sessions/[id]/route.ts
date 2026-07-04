import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import {
  CODE_STARTER_FILES,
  extractCodeSnapshot,
  type CodeFileMap,
} from "@/lib/codeStudio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = {
  id: string;
  user_id: string;
  prompt: string;
  response_a: string;
  model_a: string;
  thread_id?: string | null;
  attachments?: unknown;
  created_at?: string;
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const rootId = String(params.id ?? "").slice(0, 36);
  if (!rootId) {
    return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 422 });
  }

  const supabase = getSupabaseAdmin();
  const res = await supabase
    .from("ai_battles")
    .select("id, user_id, prompt, response_a, model_a, thread_id, attachments, created_at")
    .or(`id.eq.${rootId},thread_id.eq.${rootId}`)
    .eq("tier", "code_studio")
    .order("created_at", { ascending: true })
    .limit(40);

  let rows = ((res.data || []) as Row[]).filter((r) => r.user_id === session.userId);

  if (rows.length === 0) {
    const single = await supabase
      .from("ai_battles")
      .select("id, user_id, prompt, response_a, model_a, thread_id, attachments, created_at")
      .eq("id", rootId)
      .maybeSingle();
    const row = single.data as Row | null;
    if (!row || row.user_id !== session.userId) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    rows = [row];
  }

  const turns = rows.map((r) => ({
    id: r.id,
    prompt: r.prompt,
    response: r.response_a || "",
    modelId: r.model_a,
  }));

  let files: CodeFileMap = { ...CODE_STARTER_FILES };
  let activeFile = "src/app/page.tsx";

  for (let i = rows.length - 1; i >= 0; i--) {
    const snap = extractCodeSnapshot(rows[i].attachments);
    if (snap) {
      files = snap.files;
      activeFile = snap.activeFile;
      break;
    }
  }

  const threadId = (rows[0].thread_id as string | null) || rows[0].id;

  return NextResponse.json({
    ok: true,
    threadId,
    turns,
    files,
    activeFile,
  });
}

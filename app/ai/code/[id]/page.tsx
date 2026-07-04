import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { AI_COOKIE, verifyAIToken } from "@/lib/aiAuth";
import {
  CODE_STARTER_FILES,
  extractCodeSnapshot,
  type CodeFileMap,
} from "@/lib/codeStudio";
import CodeStudioClient from "./CodeStudioClient";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  user_id: string;
  prompt: string;
  response_a: string;
  attachments?: unknown;
  thread_id?: string | null;
};

export default async function CodeThreadPage({ params }: { params: { id: string } }) {
  const token = cookies().get(AI_COOKIE)?.value;
  const session = token ? verifyAIToken(token) : null;
  if (!session) redirect("/ai?login=1");

  const rootId = params.id;
  const supabase = getSupabaseAdmin();

  const res = await supabase
    .from("ai_battles")
    .select("id, user_id, prompt, response_a, thread_id, attachments, created_at")
    .or(`id.eq.${rootId},thread_id.eq.${rootId}`)
    .eq("tier", "code_studio")
    .order("created_at", { ascending: true })
    .limit(40);

  let rows = ((res.data || []) as Row[]).filter((r) => r.user_id === session.userId);

  if (rows.length === 0) {
    const single = await supabase
      .from("ai_battles")
      .select("id, user_id, prompt, response_a, thread_id, attachments")
      .eq("id", rootId)
      .maybeSingle();
    const row = single.data as Row | null;
    if (!row || row.user_id !== session.userId) {
      redirect("/ai/code");
    }
    rows = [row];
  }

  const { data: user } = await supabase
    .from("ai_users")
    .select("plan")
    .eq("id", session.userId)
    .maybeSingle();

  const turns = rows.map((r) => ({
    id: r.id,
    prompt: r.prompt,
    response: r.response_a || "",
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

  return (
    <CodeStudioClient
      threadId={threadId}
      initialTurns={turns}
      initialFiles={files}
      initialActiveFile={activeFile}
      plan={(user?.plan as string) || "free"}
    />
  );
}

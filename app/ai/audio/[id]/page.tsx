import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { AI_COOKIE, verifyAIToken } from "@/lib/aiAuth";
import AudioStudioClient from "./AudioStudioClient";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  user_id: string;
  prompt: string;
  response_a: string;
  model_a: string;
  tier: string;
  thread_id?: string | null;
  attachments?: { url: string; mime: string; kind: string }[] | null;
};

export default async function AudioThreadPage({ params }: { params: { id: string } }) {
  const token = cookies().get(AI_COOKIE)?.value;
  const session = token ? verifyAIToken(token) : null;
  if (!session) redirect("/ai?login=1");

  const supabase = getSupabaseAdmin();
  const rootId = params.id;

  const res = await supabase
    .from("ai_battles")
    .select("id, user_id, prompt, response_a, model_a, tier, thread_id, attachments, created_at")
    .or(`id.eq.${rootId},thread_id.eq.${rootId}`)
    .order("created_at", { ascending: true })
    .limit(40);

  const rows = ((res.data || []) as Row[]).filter(
    (r) =>
      r.user_id === session.userId &&
      (r.tier === "audio_gen" || r.tier === "transcribe")
  );

  if (rows.length === 0) {
    redirect("/ai/audio");
  }

  const { data: user } = await supabase
    .from("ai_users")
    .select("plan")
    .eq("id", session.userId)
    .maybeSingle();

  const turns = rows.map((r) => {
    const att = Array.isArray(r.attachments) ? r.attachments : [];
    const out = att.find((a) => a.kind === "output");
    return {
      id: r.id,
      prompt: r.prompt,
      response: r.response_a || "",
      audioUrl: out?.url,
      modelId: r.model_a,
      kind: (r.tier === "transcribe" ? "transcribe" : "tts") as "tts" | "transcribe",
    };
  });

  return (
    <AudioStudioClient
      threadId={rootId}
      initialTurns={turns}
      plan={(user?.plan as string) || "free"}
    />
  );
}

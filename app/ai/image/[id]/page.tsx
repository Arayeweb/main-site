import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { AI_COOKIE, verifyAIToken } from "@/lib/aiAuth";
import ImageStudioClient from "./ImageStudioClient";

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

export default async function ImageThreadPage({ params }: { params: { id: string } }) {
  const token = cookies().get(AI_COOKIE)?.value;
  const session = token ? verifyAIToken(token) : null;
  if (!session) redirect("/ai?login=1");

  const supabase = getSupabaseAdmin();
  const rootId = params.id;

  let rows: Row[] = [];
  const res = await supabase
    .from("ai_battles")
    .select("id, user_id, prompt, response_a, model_a, tier, thread_id, attachments, created_at")
    .or(`id.eq.${rootId},thread_id.eq.${rootId}`)
    .order("created_at", { ascending: true })
    .limit(40);

  rows = ((res.data || []) as Row[]).filter(
    (r) => r.user_id === session.userId && r.tier === "image_gen"
  );

  if (rows.length === 0) {
    const single = await supabase
      .from("ai_battles")
      .select("id, user_id, prompt, response_a, model_a, tier, thread_id, attachments")
      .eq("id", rootId)
      .maybeSingle();
    const row = single.data as Row | null;
    if (!row || row.user_id !== session.userId || row.tier !== "image_gen") {
      redirect("/ai/image");
    }
    rows = [row];
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
      imageUrl: out?.url,
      modelId: r.model_a,
    };
  });

  const { data: pendingJobs } = await supabase
    .from("ai_media_jobs")
    .select("id, prompt, model_id, status, thread_id, error, dismissed_at")
    .eq("user_id", session.userId)
    .eq("kind", "image")
    .in("status", ["pending", "processing"])
    .eq("thread_id", rootId)
    .order("created_at", { ascending: true });

  const pendingTurns = (pendingJobs || [])
    .filter(
      (j) =>
        j.error !== "dismissed_by_user" &&
        !(j as { dismissed_at?: string | null }).dismissed_at
    )
    .map((j) => ({
      id: `job-${j.id}`,
      prompt: (j.prompt as string) || "",
      response: "",
      streaming: true as const,
      statusText:
        j.status === "processing" ? "در حال ساخت تصویر…" : "در صف — به‌زودی شروع می‌شود",
      modelId: j.model_id as string,
      jobId: j.id as string,
    }));

  return (
    <ImageStudioClient
      threadId={rootId}
      initialTurns={[...turns, ...pendingTurns]}
      plan={(user?.plan as string) || "free"}
    />
  );
}

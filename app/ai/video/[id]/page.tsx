import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { AI_COOKIE, verifyAIToken } from "@/lib/aiAuth";
import VideoStudioClient from "./VideoStudioClient";

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

export default async function VideoThreadPage({ params }: { params: { id: string } }) {
  const token = cookies().get(AI_COOKIE)?.value;
  const session = token ? verifyAIToken(token) : null;
  if (!session) redirect("/ai?login=1");

  const supabase = getSupabaseAdmin();
  const rootId = params.id;

  const [res, userP, pendingJobsP] = await Promise.all([
    supabase
      .from("ai_battles")
      .select("id, user_id, prompt, response_a, model_a, tier, thread_id, attachments, created_at")
      .or(`id.eq.${rootId},thread_id.eq.${rootId}`)
      .order("created_at", { ascending: true })
      .limit(40),
    supabase.from("ai_users").select("plan").eq("id", session.userId).maybeSingle(),
    supabase
      .from("ai_media_jobs")
      .select("id, prompt, model_id, status, thread_id, error, dismissed_at")
      .eq("user_id", session.userId)
      .eq("kind", "video")
      .in("status", ["pending", "processing"])
      .eq("thread_id", rootId)
      .order("created_at", { ascending: true }),
  ]);

  let rows: Row[] = ((res.data || []) as Row[]).filter(
    (r) => r.user_id === session.userId && r.tier === "video_gen"
  );

  if (rows.length === 0) {
    const single = await supabase
      .from("ai_battles")
      .select("id, user_id, prompt, response_a, model_a, tier, thread_id, attachments")
      .eq("id", rootId)
      .maybeSingle();
    const row = single.data as Row | null;
    if (!row || row.user_id !== session.userId || row.tier !== "video_gen") {
      redirect("/ai/video");
    }
    rows = [row];
  }

  const { data: user } = userP;

  const battleIds = rows.map((r) => r.id);
  const { data: mediaJobs } =
    battleIds.length > 0
      ? await supabase
          .from("ai_media_jobs")
          .select("id, battle_id")
          .eq("user_id", session.userId)
          .in("battle_id", battleIds)
      : { data: [] as { id: string; battle_id: string | null }[] };

  const jobIdByBattle = new Map(
    (mediaJobs || [])
      .filter((j) => j.battle_id)
      .map((j) => [j.battle_id as string, j.id as string])
  );

  const turns = rows.map((r) => {
    const att = Array.isArray(r.attachments) ? r.attachments : [];
    const out = att.find((a) => a.kind === "output");
    let videoUrl = out?.url;
    if (!videoUrl || videoUrl.includes("openrouter.ai")) {
      const jobId = jobIdByBattle.get(r.id);
      if (jobId) videoUrl = `/api/ai/video/${jobId}/content`;
    }
    return {
      id: r.id,
      prompt: r.prompt,
      response: r.response_a || "",
      videoUrl,
      modelId: r.model_a,
    };
  });

  const { data: pendingJobs } = pendingJobsP;

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
      j.status === "processing" ? "در حال ساخت ویدیو…" : "در صف — به‌زودی شروع می‌شود",
    modelId: j.model_id as string,
    jobId: j.id as string,
  }));

  return (
    <VideoStudioClient
      threadId={rootId}
      initialTurns={[...turns, ...pendingTurns]}
      plan={(user?.plan as string) || "free"}
    />
  );
}

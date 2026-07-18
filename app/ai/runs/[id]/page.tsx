import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AI_COOKIE, verifyAIToken } from "@/lib/aiAuth";
import { getPersona } from "@/lib/aiPersonas";
import { loadRunById, serializeRun } from "@/lib/ai/runs/loadRun";
import { loadConversationThreadByRunId } from "@/lib/ai/runs/conversationContext";
import { threadToHydration } from "@/lib/ai/runs/types";
import { friendlyError } from "@/lib/ai/streaming/sse";
import RunSessionClient from "./RunSessionClient";

export const dynamic = "force-dynamic";

export default async function RunPage({ params }: { params: { id: string } }) {
  const token = cookies().get(AI_COOKIE)?.value;
  const session = token ? verifyAIToken(token) : null;
  if (!session) redirect("/ai");

  const bundle = await loadRunById(params.id);
  if (!bundle || bundle.run.user_id !== session.userId) {
    redirect("/ai");
  }

  const personaKey = bundle.run.metadata?.persona_key;
  if (typeof personaKey === "string" && getPersona(personaKey)) {
    const conversationId = bundle.run.conversation_id ?? bundle.run.id;
    redirect(`/ai/personas/${personaKey}?thread=${conversationId}`);
  }

  const threadData = await loadConversationThreadByRunId(params.id, session.userId);
  // threadData.runs only contains terminal-status runs; if the anchor run is still
  // "running" (e.g. stuck) the array is [] — an empty array is truthy so ?? won't
  // fire. Always fall back to the anchor run so `latest` is never undefined.
  const runs = threadData?.runs?.length ? threadData.runs : [serializeRun(bundle)];
  const conversationId = threadData?.conversationId ?? bundle.run.conversation_id ?? bundle.run.id;
  const thread = threadToHydration(conversationId, runs);
  const latest = runs[runs.length - 1];
  const statusMessage =
    latest.status === "cancelled"
      ? friendlyError("cancelled")
      : latest.status === "failed" || latest.status === "settlement_failed"
        ? friendlyError("provider_error")
        : null;

  return <RunSessionClient thread={thread} statusMessage={statusMessage} />;
}

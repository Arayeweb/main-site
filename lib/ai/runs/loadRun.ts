import { getSupabaseAdmin } from "@/lib/supabase";
import type { RunMode, RunStatus, SerializedRun } from "./types";

type RunRow = {
  id: string;
  user_id: string;
  conversation_id: string | null;
  mode: string;
  status: string;
  reserved_credits: number;
  charged_credits: number;
  refunded_credits: number;
  metadata: { models?: string[]; prompt?: string; share_slug?: string; is_public?: boolean } | null;
  created_at: string;
  completed_at: string | null;
};

type CallRow = {
  id: string;
  model: string;
  role: string;
  status: string;
  error_code: string | null;
};

type OutputRow = {
  model: string;
  content: string;
  model_call_id: string | null;
};

function readPrompt(row: RunRow): string {
  const meta = row.metadata ?? {};
  return typeof meta.prompt === "string" ? meta.prompt : "";
}

function readModels(row: RunRow): string[] {
  const meta = row.metadata ?? {};
  return Array.isArray(meta.models) ? meta.models.map(String) : [];
}

function readShare(row: RunRow): { shareSlug: string | null; isPublic: boolean } {
  const meta = row.metadata ?? {};
  const shareSlug = typeof meta.share_slug === "string" ? meta.share_slug : null;
  const isPublic = meta.is_public === true;
  return { shareSlug, isPublic };
}

export async function loadRunById(runId: string): Promise<{
  run: RunRow;
  calls: CallRow[];
  outputs: OutputRow[];
  selectedVote: string | null;
} | null> {
  const supabase = getSupabaseAdmin();

  const { data: run } = await supabase
    .from("ai_runs")
    .select(
      "id, user_id, conversation_id, mode, status, reserved_credits, charged_credits, refunded_credits, metadata, created_at, completed_at"
    )
    .eq("id", runId)
    .maybeSingle();

  if (!run) return null;

  const [{ data: calls }, { data: outputs }, { data: vote }] = await Promise.all([
    supabase
      .from("model_calls")
      .select("id, model, role, status, error_code")
      .eq("run_id", runId)
      .order("created_at", { ascending: true }),
    supabase
      .from("model_outputs")
      .select("model, content, model_call_id")
      .eq("run_id", runId)
      .order("created_at", { ascending: true }),
    supabase
      .from("feedback_votes")
      .select("selected_model")
      .eq("run_id", runId)
      .maybeSingle(),
  ]);

  return {
    run: run as RunRow,
    calls: (calls ?? []) as CallRow[],
    outputs: (outputs ?? []) as OutputRow[],
    selectedVote: (vote?.selected_model as string | null) ?? null,
  };
}

export async function loadRunByShareSlug(slug: string): Promise<{
  run: RunRow;
  calls: CallRow[];
  outputs: OutputRow[];
} | null> {
  const supabase = getSupabaseAdmin();
  const { data: rows } = await supabase
    .from("ai_runs")
    .select(
      "id, user_id, conversation_id, mode, status, reserved_credits, charged_credits, refunded_credits, metadata, created_at, completed_at"
    )
    .filter("metadata->>share_slug", "eq", slug)
    .filter("metadata->>is_public", "eq", "true")
    .limit(1);

  const run = rows?.[0] as RunRow | undefined;
  if (!run) return null;

  const loaded = await loadRunById(run.id);
  if (!loaded) return null;
  return { run: loaded.run, calls: loaded.calls, outputs: loaded.outputs };
}

export function serializeRun(
  bundle: NonNullable<Awaited<ReturnType<typeof loadRunById>>>
): SerializedRun {
  const { run, calls, outputs, selectedVote } = bundle;
  const callById = new Map(calls.map((c) => [c.id, c]));
  const { shareSlug, isPublic } = readShare(run);

  let critique: string | null = null;
  let summary: string | null = null;
  const answers: SerializedRun["answers"] = [];
  const answerByModel = new Map<string, SerializedRun["answers"][number]>();

  for (const out of outputs) {
    const call = out.model_call_id ? callById.get(out.model_call_id) : undefined;
    const role = call?.role ?? "answer";
    if (role === "critique") {
      critique = out.content;
      continue;
    }
    if (role === "synthesis") {
      summary = out.content;
      continue;
    }
    answerByModel.set(out.model, {
      model: out.model,
      content: out.content,
      errorCode: null,
    });
  }

  for (const call of calls) {
    if (call.role !== "answer") continue;
    if (answerByModel.has(call.model)) continue;
    answers.push({
      model: call.model,
      content: "",
      errorCode: call.status === "failed" ? call.error_code ?? "provider_error" : null,
    });
  }

  for (const entry of answerByModel.values()) {
    answers.push(entry);
  }

  const models = readModels(run);
  const orderedModels =
    models.length > 0
      ? models
      : answers.map((a) => a.model);

  return {
    id: run.id,
    mode: run.mode as RunMode,
    status: run.status as RunStatus,
    prompt: readPrompt(run),
    models: orderedModels,
    conversationId: run.conversation_id,
    createdAt: run.created_at,
    completedAt: run.completed_at,
    chargedCredits: run.charged_credits ?? 0,
    reservedCredits: run.reserved_credits ?? 0,
    refundedCredits: run.refunded_credits ?? 0,
    answers: orderedModels.map((model) => {
      const found = answers.find((a) => a.model === model);
      return found ?? { model, content: "", errorCode: null };
    }),
    critique,
    summary,
    selectedVote,
    shareSlug,
    isPublic,
  };
}

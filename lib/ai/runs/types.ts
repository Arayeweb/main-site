export type RunMode = "direct" | "compare" | "council";

export type RunStatus =
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "settlement_failed";

export type RunAnswerOutput = {
  model: string;
  content: string;
  errorCode: string | null;
};

export type SerializedRun = {
  id: string;
  mode: RunMode;
  status: RunStatus;
  prompt: string;
  models: string[];
  conversationId: string | null;
  createdAt: string;
  completedAt: string | null;
  chargedCredits: number;
  reservedCredits: number;
  refundedCredits: number;
  answers: RunAnswerOutput[];
  critique: string | null;
  summary: string | null;
  selectedVote: string | null;
  shareSlug: string | null;
  isPublic: boolean;
};

export type StaticRunHydration = {
  runId: string;
  mode: RunMode;
  status: RunStatus;
  prompt: string;
  models: string[];
  answers: Record<string, string>;
  modelErrors: Record<string, string>;
  critique: string;
  summary: string;
  selectedVote: string | null;
};

export type ThreadHydration = {
  conversationId: string;
  latestRunId: string;
  runs: StaticRunHydration[];
};

export function runToHydration(run: SerializedRun): StaticRunHydration {
  const answers: Record<string, string> = {};
  const modelErrors: Record<string, string> = {};
  for (const a of run.answers) {
    if (a.errorCode) modelErrors[a.model] = a.errorCode;
    else if (a.content) answers[a.model] = a.content;
  }
  return {
    runId: run.id,
    mode: run.mode,
    status: run.status,
    prompt: run.prompt,
    models: run.models,
    answers,
    modelErrors,
    critique: run.critique ?? "",
    summary: run.summary ?? "",
    selectedVote: run.selectedVote,
  };
}

export function threadToHydration(
  conversationId: string,
  runs: SerializedRun[]
): ThreadHydration {
  const hydrated = runs.map(runToHydration);
  const latest = runs[runs.length - 1];
  return {
    conversationId,
    latestRunId: latest?.id ?? conversationId,
    runs: hydrated,
  };
}

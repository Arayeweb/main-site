// =========================================================
// Frontend SSE client for POST /api/ai/runs
// Parses text/event-stream incrementally; no provider logic here.
// =========================================================

import type { RunMode, RunSSEEvent } from "@/lib/ai/streaming/sse";
import { friendlyError } from "@/lib/ai/streaming/sse";

export type { RunMode, RunSSEEvent };

export type RunStreamMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type RunStreamRequest = {
  mode: RunMode;
  model?: string;
  models?: string[];
  modelA?: string;
  modelB?: string;
  messages?: RunStreamMessage[];
  prompt?: string;
  conversationId?: string | null;
  threadId?: string | null;
  webSearch?: boolean;
  personaKey?: string | null;
  attachments?: { url: string; mime: string; name?: string; size?: number; text?: string }[];
  excludeRunId?: string | null;
};

export type RunStreamTerminalStatus = "completed" | "cancelled" | "failed" | "aborted";

export type RunStreamHandlers = {
  onEvent?: (event: RunSSEEvent) => void;
  onRunId?: (runId: string) => void;
};

export type RunStreamResult = {
  runId: string | null;
  status: RunStreamTerminalStatus;
  lastErrorCode: string | null;
};

export type RunStreamErrorCode =
  | "unauthorized"
  | "insufficient_credits"
  | "plan_upgrade_required"
  | "invalid_model"
  | "rate_limited"
  | "too_many_concurrent"
  | "missing_prompt"
  | "bad_request"
  | "provider_error"
  | "server_error"
  | "cancelled"
  | "network_error";

/** Map backend error codes to safe Persian UI copy. */
export function runStreamErrorMessage(code: string): string {
  return friendlyError(code);
}

/** Classify HTTP/SSE errors for UI state buckets. */
export function classifyRunStreamError(code: string): RunStreamErrorCode {
  const known = new Set<string>([
    "unauthorized",
    "insufficient_credits",
    "plan_upgrade_required",
    "invalid_model",
    "rate_limited",
    "too_many_concurrent",
    "missing_prompt",
    "bad_request",
    "provider_error",
    "server_error",
    "cancelled",
    "network_error",
  ]);
  if (known.has(code)) return code as RunStreamErrorCode;
  if (code === "login_required") return "unauthorized";
  if (code === "plan_required" || code === "forbidden") return "plan_upgrade_required";
  return "server_error";
}

function parseSseBlock(block: string): RunSSEEvent | null {
  const line = block.trim();
  if (!line.startsWith("data:")) return null;
  const json = line.slice(5).trim();
  try {
    return JSON.parse(json) as RunSSEEvent;
  } catch {
    return null;
  }
}

async function readSseFromResponse(
  res: Response,
  handlers: RunStreamHandlers,
  signal: AbortSignal
): Promise<{ runId: string | null; status: RunStreamTerminalStatus; lastErrorCode: string | null }> {
  let runId: string | null = res.headers.get("X-Run-Id");
  let status: RunStreamTerminalStatus = "failed";
  let lastErrorCode: string | null = null;

  if (!res.body) {
    return { runId, status: "failed", lastErrorCode: "server_error" };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      if (signal.aborted) {
        status = "aborted";
        break;
      }
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const block of parts) {
        const ev = parseSseBlock(block);
        if (!ev) continue;
        handlers.onEvent?.(ev);

        if (ev.type === "run_started") {
          runId = ev.runId;
          handlers.onRunId?.(ev.runId);
        } else if (ev.type === "run_done") {
          status = ev.status === "cancelled" ? "cancelled" : "completed";
        } else if (ev.type === "run_error") {
          lastErrorCode = ev.errorCode;
          status = "failed";
        }
      }
    }

    const tail = parseSseBlock(buffer);
    if (tail) {
      handlers.onEvent?.(tail);
      if (tail.type === "run_started") {
        runId = tail.runId;
        handlers.onRunId?.(tail.runId);
      } else if (tail.type === "run_done") {
        status = tail.status === "cancelled" ? "cancelled" : "completed";
      } else if (tail.type === "run_error") {
        lastErrorCode = tail.errorCode;
        status = "failed";
      }
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      /* already closed */
    }
  }

  if (signal.aborted && status !== "cancelled" && status !== "completed") {
    status = "aborted";
  }

  return { runId, status, lastErrorCode };
}

/** Request server-side stop for an active run (best-effort). */
export async function requestRunStop(runId: string): Promise<void> {
  try {
    await fetch(`/api/ai/runs/${encodeURIComponent(runId)}/stop`, { method: "POST" });
  } catch {
    /* ignore — local abort still applies */
  }
}

/**
 * POST /api/ai/runs and consume SSE until run_done, run_error, or abort.
 * Returns runId from run_started / X-Run-Id header.
 */
export async function startRunStream(
  req: RunStreamRequest,
  handlers: RunStreamHandlers = {},
  externalSignal?: AbortSignal
): Promise<RunStreamResult & { abort: () => void }> {
  const controller = new AbortController();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else {
      externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }
  const signal = controller.signal;

  const body: Record<string, unknown> = {
    mode: req.mode,
    webSearch: req.webSearch === true,
  };

  if (req.model) body.model = req.model;
  if (req.models?.length) body.models = req.models;
  if (req.modelA) body.modelA = req.modelA;
  if (req.modelB) body.modelB = req.modelB;
  if (req.messages?.length) body.messages = req.messages;
  if (req.prompt) body.prompt = req.prompt;
  if (req.personaKey) body.personaKey = req.personaKey;

  const conv = req.conversationId ?? req.threadId;
  if (conv) {
    body.conversationId = conv;
    body.threadId = conv;
  }

  if (req.attachments?.length) body.attachments = req.attachments;
  if (req.excludeRunId) body.excludeRunId = req.excludeRunId;

  let res: Response;
  try {
    res = await fetch("/api/ai/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    return {
      runId: null,
      status: signal.aborted ? "aborted" : "failed",
      lastErrorCode: signal.aborted ? "cancelled" : "network_error",
      abort: () => controller.abort(),
    };
  }

  // Pre-stream SSE error envelope (401/402/403/422/429…)
  const ct = res.headers.get("Content-Type") ?? "";
  if (!res.ok && !ct.includes("text/event-stream")) {
    return {
      runId: null,
      status: "failed",
      lastErrorCode: httpStatusToErrorCode(res.status),
      abort: () => controller.abort(),
    };
  }

  const headerRunId = res.headers.get("X-Run-Id");
  if (headerRunId) handlers.onRunId?.(headerRunId);

  if (!res.ok && ct.includes("text/event-stream")) {
    const text = await res.text();
    let lastErrorCode: string | null = httpStatusToErrorCode(res.status);
    for (const block of text.split("\n\n")) {
      const ev = parseSseBlock(block);
      if (!ev) continue;
      handlers.onEvent?.(ev);
      if (ev.type === "run_error") lastErrorCode = ev.errorCode;
      if (ev.type === "run_started") handlers.onRunId?.(ev.runId);
    }
    return {
      runId: null,
      status: "failed",
      lastErrorCode,
      abort: () => controller.abort(),
    };
  }

  const result = await readSseFromResponse(res, handlers, signal);
  return {
    ...result,
    runId: result.runId ?? headerRunId,
    abort: () => controller.abort(),
  };
}

function httpStatusToErrorCode(status: number): string {
  if (status === 401) return "unauthorized";
  if (status === 402) return "insufficient_credits";
  if (status === 403) return "plan_upgrade_required";
  if (status === 422) return "invalid_model";
  if (status === 429) return "rate_limited";
  return "server_error";
}

/** Stop an active run: server flag + local abort. */
export async function stopRunStream(runId: string | null, abort: () => void): Promise<void> {
  abort();
  if (runId) await requestRunStop(runId);
}

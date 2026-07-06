// =========================================================
// POST /api/ai/runs — نقطه ورود واحد orchestration
// یک SSE stream برای هر run (direct / compare / council).
// مسیرهای قدیمی /api/ai/chat و /api/ai/battle دست‌نخورده باقی می‌مانند.
// =========================================================

import { NextRequest } from "next/server";
import { getAISession } from "@/lib/aiAuth";
import { getPersona } from "@/lib/aiPersonas";
import { hasVision } from "@/lib/aiModels";
import { prepareRun, type RunRequest } from "@/lib/ai/orchestrator";
import {
  encodeSSE,
  friendlyError,
  SSE_HEADERS,
  type RunSSEEvent,
} from "@/lib/ai/streaming/sse";
import { validatePrompt } from "@/lib/ai/safety/moderation";
import { parseRunBody } from "@/lib/ai/requestValidation";
import {
  registerRunAbortController,
  unregisterRunAbortController,
} from "@/lib/ai/runAbortRegistry";
import {
  buildConversationHistory,
  loadConversationRuns,
  validateConversationAccess,
} from "@/lib/ai/runs/conversationContext";
import { RunPerfTracker } from "@/lib/observability/perf";
import type { ChatMessage } from "@/lib/ai/providers/interface";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_ATTACHMENTS = 2;

/** Last user message content when clients send OpenAI-style `messages` instead of `prompt`. */
function extractPromptFromMessages(raw: unknown): string | undefined {
  if (!Array.isArray(raw)) return undefined;
  for (let i = raw.length - 1; i >= 0; i--) {
    const item = raw[i];
    if (!item || typeof item !== "object") continue;
    if ((item as { role?: unknown }).role !== "user") continue;
    const content = (item as { content?: unknown }).content;
    if (typeof content === "string" && content.trim()) return content.trim();
  }
  return undefined;
}

function sseError(code: string, status: number): Response {
  return new Response(
    encodeSSE({ type: "run_error", runId: "", errorCode: code, message: friendlyError(code) }),
    { status, headers: SSE_HEADERS }
  );
}

function parseAttachments(raw: unknown): { url: string; mime: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, MAX_ATTACHMENTS)
    .map((a) => ({
      url: String((a as { url?: unknown })?.url ?? "").trim(),
      mime: String((a as { mime?: unknown })?.mime ?? "").trim(),
    }))
    .filter((a) => a.url && a.mime.startsWith("image/"));
}

function sendEvent(send: (chunk: string) => void, ev: RunSSEEvent): void {
  if (ev.type === "model_error" || ev.type === "run_error") {
    send(encodeSSE({ ...ev, message: friendlyError(ev.errorCode) }));
  } else {
    send(encodeSSE(ev));
  }
}

export async function POST(req: NextRequest) {
  const perf = new RunPerfTracker();
  perf.mark("request_received");

  const session = getAISession(req);
  perf.mark("auth_done");
  if (!session) return sseError("unauthorized", 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return sseError("server_error", 400);
  }

  const parsed = parseRunBody(body);
  if (!parsed.ok) return sseError(parsed.error, 400);
  const mode = parsed.mode;

  const promptCheck = validatePrompt(body.prompt ?? extractPromptFromMessages(body.messages));
  const attachments = parseAttachments(body.attachments);
  if (!promptCheck.ok && attachments.length === 0) {
    return sseError("missing_prompt", 422);
  }
  const prompt = promptCheck.ok ? promptCheck.prompt : "این تصویر را توضیح بده.";

  const personaKey = parsed.personaKey;
  const persona = personaKey ? getPersona(personaKey) : undefined;
  if (personaKey && !persona) return sseError("invalid_model", 422);

  const models: string[] =
    parsed.models.length > 0
      ? parsed.models
      : persona?.defaultModelId
        ? [persona.defaultModelId]
        : [];
  const conversationId = parsed.conversationId;

  if (attachments.length > 0 && mode === "direct" && models[0] && !hasVision(models[0])) {
    return sseError("invalid_model", 422);
  }

  perf.mark("validate_done");

  const plan = session.plan || "free";

  const encoder = new TextEncoder();
  const abort = new AbortController();
  req.signal.addEventListener("abort", () => abort.abort(), { once: true });

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      let activeRunId: string | null = null;
      let cleanup: (() => Promise<void>) | null = null;

      const send = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
          abort.abort();
        }
      };

      send(encodeSSE({ type: "run_preparing", runId: "" }));

      try {
        if (conversationId) {
          const allowed = await validateConversationAccess(session.userId, conversationId);
          if (!allowed) {
            sendEvent(send, {
              type: "run_error",
              runId: "",
              errorCode: "bad_request",
              message: "",
            });
            return;
          }
        }

        let history: ChatMessage[] = [];
        if (conversationId) {
          const priorRuns = await loadConversationRuns(session.userId, conversationId);
          history = buildConversationHistory(priorRuns);
        } else if (mode === "direct" && Array.isArray(body.messages) && body.messages.length > 0) {
          for (const item of body.messages as { role?: string; content?: string }[]) {
            if (item.role === "user" || item.role === "assistant") {
              history.push({ role: item.role, content: String(item.content ?? "") });
            }
          }
        }

        const runReq: RunRequest = {
          userId: session.userId,
          plan,
          mode,
          prompt,
          models,
          conversationId,
          history,
          imageUrls: attachments.map((a) => a.url),
          webSearch: parsed.webSearch,
          personaSystem: persona?.systemPrompt,
        };

        const prepared = await prepareRun(runReq, perf);
        if ("error" in prepared) {
          sendEvent(send, {
            type: "run_error",
            runId: "",
            errorCode:
              prepared.error === "too_many_concurrent" ? "rate_limited" : prepared.error,
            message: "",
          });
          return;
        }

        activeRunId = prepared.runId;
        cleanup = prepared.cleanup;
        registerRunAbortController(prepared.runId, abort);

        for await (const ev of prepared.execute(abort.signal)) {
          sendEvent(send, ev);
        }
      } catch (e) {
        console.error("[api/ai/runs] stream crashed:", e);
        sendEvent(send, {
          type: "run_error",
          runId: activeRunId ?? "",
          errorCode: "server_error",
          message: "",
        });
      } finally {
        if (activeRunId) unregisterRunAbortController(activeRunId);
        if (cleanup) await cleanup();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
    cancel() {
      abort.abort();
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}

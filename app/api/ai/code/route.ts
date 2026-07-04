import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { streamDirect } from "@/lib/aiEngine";
import { persistChatTurn } from "@/lib/aiPersist";
import {
  MAX_PROMPT_CHARS,
  MODEL_MAX_TOKENS,
  canUseMode,
  directCost,
  resolveUserModel,
} from "@/lib/aiCredits";
import {
  buildCodePrompt,
  type CodeFileMap,
  type CodeSnapshotAttachment,
} from "@/lib/codeStudio";
import {
  applyEditsToFiles,
  parseCodeEdits,
} from "@/lib/codeEdits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CODE_TIER = "code_studio";

function sse(data: Record<string, unknown>) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function parseFiles(raw: unknown): CodeFileMap | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const out: CodeFileMap = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
  }
  return Object.keys(out).length > 0 ? out : null;
}

export async function POST(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    return new Response(sse({ type: "error", error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(sse({ type: "error", error: "bad_json" }), {
      status: 400,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const userMessage = String(body.prompt ?? "").trim().slice(0, MAX_PROMPT_CHARS);
  const activeFile =
    typeof body.activeFile === "string" && body.activeFile.trim()
      ? body.activeFile.trim()
      : "src/app/page.tsx";
  const files = parseFiles(body.files);

  if (!userMessage) {
    return new Response(sse({ type: "error", error: "missing_prompt" }), {
      status: 422,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  if (!files) {
    return new Response(sse({ type: "error", error: "missing_files" }), {
      status: 422,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const threadId = typeof body.threadId === "string" && body.threadId ? body.threadId : null;
  const supabase = getSupabaseAdmin();

  const { data: user, error: userErr } = await supabase
    .from("ai_users")
    .select("id, plan, credits")
    .eq("id", session.userId)
    .maybeSingle();

  if (userErr || !user) {
    return new Response(sse({ type: "error", error: "user_not_found" }), {
      status: 404,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const plan = (user.plan as string) || "free";
  if (!canUseMode(plan, "direct")) {
    return new Response(sse({ type: "error", error: "plan_upgrade_required" }), {
      status: 403,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const m = resolveUserModel(String(body.model ?? "economy"), plan);
  if ("error" in m) {
    const status = m.error === "plan_upgrade_required" ? 403 : 422;
    return new Response(sse({ type: "error", error: m.error }), {
      status,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const cost = directCost(m);
  if ((user.credits as number) < cost) {
    return new Response(sse({ type: "error", error: "insufficient_credits" }), {
      status: 402,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const history: { role: "user" | "assistant"; content: string }[] = [];
  if (threadId) {
    let prev = await supabase
      .from("ai_battles")
      .select("id, user_id, prompt, response_a")
      .or(`id.eq.${threadId},thread_id.eq.${threadId}`)
      .eq("tier", CODE_TIER)
      .order("created_at", { ascending: true })
      .limit(12);

    if (prev.error) {
      prev = await supabase
        .from("ai_battles")
        .select("id, user_id, prompt, response_a")
        .eq("id", threadId)
        .order("created_at", { ascending: true })
        .limit(1);
    }

    const rows = (prev.data || []).filter((r) => r.user_id === session.userId);
    if (rows.length === 0) {
      return new Response(sse({ type: "error", error: "thread_not_found" }), {
        status: 404,
        headers: { "Content-Type": "text/event-stream" },
      });
    }
    for (const r of rows.slice(-6)) {
      history.push({ role: "user", content: (r.prompt as string) || "" });
      history.push({ role: "assistant", content: (r.response_a as string) || "" });
    }
  }

  const apiPrompt = buildCodePrompt(userMessage, activeFile, files);
  const maxTokens = MODEL_MAX_TOKENS[m.tier];
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (obj: Record<string, unknown>) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(sse(obj)));
        } catch {
          closed = true;
        }
      };

      let responseA = "";
      let tokensUsed = 0;
      let costUsd = 0;

      try {
        const r = await streamDirect(
          apiPrompt,
          m.id,
          maxTokens,
          history,
          (text) => {
            if (!closed) send({ type: "delta", text });
          },
          [],
          false,
          undefined
        );
        if (closed) {
          controller.close();
          return;
        }
        responseA = r.content;
        tokensUsed = r.tokensUsed;
        costUsd = r.costUsd;
      } catch (e) {
        if (!closed) {
          console.error("[api/ai/code] stream failed:", e);
          send({ type: "error", error: "ai_error" });
        }
        controller.close();
        return;
      }

      if (closed) {
        controller.close();
        return;
      }

      const edits = parseCodeEdits(responseA, activeFile, files);
      const mergedFiles = applyEditsToFiles(files, edits);
      const snapshot: CodeSnapshotAttachment = {
        kind: "code_snapshot",
        files: mergedFiles,
        activeFile: edits[0]?.path || activeFile,
      };

      const creditsRemaining = Math.max(0, (user.credits as number) - cost);
      const isNewThread = !threadId;
      const battleId = randomUUID();
      const resolvedThreadId = threadId || battleId;

      send({
        type: "done",
        id: battleId,
        threadId: resolvedThreadId,
        responseA,
        creditsRemaining,
        isNewThread,
        edits: edits.map((e) => ({ path: e.path, contentLength: e.content.length })),
        files: mergedFiles,
        activeFile: snapshot.activeFile,
      });
      controller.close();

      void persistChatTurn({
        userId: session.userId,
        prompt: userMessage,
        responseA,
        modelId: m.id,
        cost,
        costUsd,
        tokensUsed,
        tier: CODE_TIER,
        modeKind: "text",
        threadId: isNewThread ? null : threadId,
        battleId,
        attachments: [snapshot],
      }).then((result) => {
        if (!result) console.error("[api/ai/code] background persist failed");
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

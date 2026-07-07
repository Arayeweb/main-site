import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { streamDirect, classifyOpenRouterFetchError } from "@/lib/aiEngine";
import { persistChatTurn } from "@/lib/aiPersist";
import {
  MAX_BATTLE_COST_USD,
  MAX_PROMPT_CHARS,
  MODEL_MAX_TOKENS,
  canUseMode,
  directCost,
  resolveUserModel,
} from "@/lib/aiCredits";
import { hasVision } from "@/lib/aiModels";
import { getPersona } from "@/lib/aiPersonas";
import { planRank } from "@/lib/aiPackages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_ATTACHMENTS = 2;

type AttachmentInput = { url: string; mime: string };

function sse(data: Record<string, unknown>) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function parseAttachments(raw: unknown): AttachmentInput[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, MAX_ATTACHMENTS)
    .map((a) => ({
      url: String((a as AttachmentInput)?.url ?? "").trim(),
      mime: String((a as AttachmentInput)?.mime ?? "").trim(),
    }))
    .filter((a) => a.url && a.mime.startsWith("image/"));
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

  const prompt = String(body.prompt ?? "").trim().slice(0, MAX_PROMPT_CHARS);
  const attachments = parseAttachments(body.attachments);
  const webSearch = body.webSearch === true;
  const personaKey =
    typeof body.personaKey === "string" && body.personaKey.trim()
      ? body.personaKey.trim()
      : null;
  const persona = personaKey ? getPersona(personaKey) : undefined;
  if (personaKey && !persona) {
    return new Response(sse({ type: "error", error: "invalid_persona" }), {
      status: 422,
      headers: { "Content-Type": "text/event-stream" },
    });
  }
  if (!prompt && attachments.length === 0) {
    return new Response(sse({ type: "error", error: "missing_prompt" }), {
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
  if (body.studio === "code_studio" && planRank(plan) < planRank("starter")) {
    return new Response(sse({ type: "error", error: "plan_upgrade_required" }), {
      status: 403,
      headers: { "Content-Type": "text/event-stream" },
    });
  }
  if (!canUseMode(plan, "direct")) {
    return new Response(sse({ type: "error", error: "plan_upgrade_required" }), {
      status: 403,
      headers: { "Content-Type": "text/event-stream" },
    });
  }
  const m = resolveUserModel(String(body.model ?? persona?.defaultModelId ?? ""), plan);
  if ("error" in m) {
    const status = m.error === "plan_upgrade_required" ? 403 : 422;
    return new Response(sse({ type: "error", error: m.error }), {
      status,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  if (attachments.length > 0 && !hasVision(m.id)) {
    return new Response(sse({ type: "error", error: "model_no_vision" }), {
      status: 422,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const visionExtra = attachments.length > 0 ? 1 : 0;
  const cost = directCost(m, { webSearch, visionExtra });

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
      .select("id, user_id, prompt, response_a, persona_key")
      .or(`id.eq.${threadId},thread_id.eq.${threadId}`)
      .order("created_at", { ascending: true })
      .limit(12);

    if (prev.error) {
      prev = await supabase
        .from("ai_battles")
        .select("id, user_id, prompt, response_a, persona_key")
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
    if (personaKey) {
      const threadPersona = (rows[0].persona_key as string | null) || null;
      if (threadPersona && threadPersona !== personaKey) {
        return new Response(sse({ type: "error", error: "persona_mismatch" }), {
          status: 422,
          headers: { "Content-Type": "text/event-stream" },
        });
      }
    }
    for (const r of rows.slice(-6)) {
      history.push({ role: "user", content: (r.prompt as string) || "" });
      history.push({ role: "assistant", content: (r.response_a as string) || "" });
    }
  }

  const maxTokens = MODEL_MAX_TOKENS[m.tier];
  const imageUrls = attachments.map((a) => a.url);
  const modeKind = attachments.length > 0 ? "vision" : "text";
  const storedAttachments = attachments.map((a) => ({ ...a, kind: "input" as const }));

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
          prompt || "این تصویر را توضیح بده.",
          m.id,
          maxTokens,
          history,
          (text) => {
            if (!closed) send({ type: "delta", text });
          },
          imageUrls,
          webSearch,
          persona?.systemPrompt
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
          console.error("[api/ai/chat] stream failed:", e);
          send({ type: "error", error: classifyOpenRouterFetchError(e) });
        }
        controller.close();
        return;
      }

      if (closed) {
        controller.close();
        return;
      }

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
      });
      controller.close();

      void persistChatTurn({
        userId: session.userId,
        prompt: prompt || "(تصویر)",
        responseA,
        modelId: m.id,
        cost,
        costUsd,
        tokensUsed,
        tier: personaKey ? "persona" : "direct",
        modeKind,
        threadId: isNewThread ? null : threadId,
        battleId,
        personaKey,
        attachments: storedAttachments,
      }).then((result) => {
        if (!result) console.error("[api/ai/chat] background persist failed");
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

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { streamDirect, classifyOpenRouterFetchError } from "@/lib/aiEngine";
import { persistGuestDirect } from "@/lib/aiPersist";
import {
  createGuestState,
  decrementGuestDirect,
  getGuestState,
  markPersonaTrial,
  canGuestPersonaMessage,
  setGuestCookie,
} from "@/lib/aiGuest";
import { MAX_PROMPT_CHARS, MODEL_MAX_TOKENS } from "@/lib/aiCredits";
import { getPersona } from "@/lib/aiPersonas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function sse(data: Record<string, unknown>) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  let guest = getGuestState(req) || createGuestState();

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

  if (!prompt) {
    return new Response(sse({ type: "error", error: "missing_prompt" }), {
      status: 422,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  if (personaKey) {
    if (!canGuestPersonaMessage(guest, personaKey)) {
      return new Response(sse({ type: "error", error: "guest_persona_limit" }), {
        status: 401,
        headers: { "Content-Type": "text/event-stream" },
      });
    }
  } else if (guest.directRemaining <= 0) {
    return new Response(sse({ type: "error", error: "guest_direct_limit" }), {
      status: 401,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const threadId = typeof body.threadId === "string" && body.threadId ? body.threadId : null;
  const modelId = "economy";
  const maxTokens = MODEL_MAX_TOKENS.economy;

  if (personaKey) {
    guest = markPersonaTrial(guest, personaKey);
  } else {
    guest = decrementGuestDirect(guest);
  }

  const history: { role: "user" | "assistant"; content: string }[] = [];
  if (threadId) {
    const supabase = getSupabaseAdmin();
    const { data: rows } = await supabase
      .from("ai_battles")
      .select("id, guest_token, prompt, response_a, persona_key")
      .or(`id.eq.${threadId},thread_id.eq.${threadId}`)
      .order("created_at", { ascending: true })
      .limit(12);

    const mine = (rows || []).filter((r) => r.guest_token === guest.token);
    if (mine.length === 0) {
      return new Response(sse({ type: "error", error: "thread_not_found" }), {
        status: 404,
        headers: { "Content-Type": "text/event-stream" },
      });
    }
    for (const r of mine.slice(-6)) {
      history.push({ role: "user", content: (r.prompt as string) || "" });
      history.push({ role: "assistant", content: (r.response_a as string) || "" });
    }
  }

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
          prompt,
          modelId,
          maxTokens,
          history,
          (text) => {
            if (!closed) send({ type: "delta", text });
          },
          [],
          false,
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
          console.error("[api/ai/chat/guest] stream failed:", e);
          send({ type: "error", error: classifyOpenRouterFetchError(e) });
        }
        controller.close();
        return;
      }

      if (personaKey) {
        // already marked before stream
      }

      const isNewThread = !threadId;
      const battleId = randomUUID();
      const resolvedThreadId = threadId || battleId;

      send({
        type: "done",
        id: battleId,
        threadId: resolvedThreadId,
        responseA,
        isNewThread,
        guestDirectRemaining: guest.directRemaining,
        guestBattlesRemaining: guest.remaining,
      });
      controller.close();

      void persistGuestDirect({
        guestToken: guest.token,
        prompt,
        responseA,
        modelId,
        costUsd,
        tokensUsed,
        tier: personaKey ? "persona" : "direct",
        battleId,
        threadId: isNewThread ? null : threadId,
        personaKey,
      });
    },
  });

  const res = new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
  setGuestCookie(res, guest);
  return res;
}

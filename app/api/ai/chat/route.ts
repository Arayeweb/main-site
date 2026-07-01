import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { runQuick, runQuickStream, runBrainstorm, runCritique } from "@/lib/aiEngine";
import { sanitizeCouncil } from "@/lib/aiModels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Mode = "quick" | "brainstorm" | "critique";

const MODE_CREDIT_COST: Record<Mode, number> = {
  quick: 1,
  brainstorm: 2,
  critique: 3,
};

const PLAN_MODES: Record<string, Mode[]> = {
  free: ["quick", "brainstorm"],
  pro: ["quick", "brainstorm"],
  business: ["quick", "brainstorm", "critique"],
};

function str(v: unknown, max = 5000): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

export async function POST(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const content = str(body.content);
  const rawMode = str(body.mode, 20);
  const conversationId = str(body.conversation_id, 36) ?? null;
  const rawModels = Array.isArray(body.models)
    ? (body.models as unknown[]).map((m) => String(m)).slice(0, 4)
    : undefined;
  const quickModel = str(body.model, 60) ?? undefined;
  const wantStream = body.stream === true;

  if (!content || !rawMode) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 422 });
  }

  const mode = rawMode as Mode;
  if (!["quick", "brainstorm", "critique"].includes(mode)) {
    return NextResponse.json({ ok: false, error: "invalid_mode" }, { status: 422 });
  }

  const supabase = getSupabaseAdmin();

  // بررسی کاربر و اعتبار
  const { data: user, error: userErr } = await supabase
    .from("ai_users")
    .select("id, plan, credits, brainstorm_demos")
    .eq("id", session.userId)
    .maybeSingle();

  if (userErr || !user) {
    return NextResponse.json({ ok: false, error: "user_not_found" }, { status: 404 });
  }

  // بررسی دسترسی حالت
  const allowedModes = PLAN_MODES[user.plan as string] ?? ["quick"];
  if (!allowedModes.includes(mode)) {
    return NextResponse.json({ ok: false, error: "plan_upgrade_required" }, { status: 403 });
  }

  // بررسی demo رایگان همفکری برای کاربران free
  if (user.plan === "free" && mode === "brainstorm") {
    if ((user.brainstorm_demos as number) <= 0) {
      return NextResponse.json({ ok: false, error: "brainstorm_demo_exhausted" }, { status: 403 });
    }
  }

  // بررسی کردیت
  const cost = MODE_CREDIT_COST[mode];
  if ((user.credits as number) < cost) {
    return NextResponse.json({ ok: false, error: "insufficient_credits" }, { status: 402 });
  }

  // پیدا کردن یا ساختن مکالمه
  let convId = conversationId;
  if (!convId) {
    const { data: newConv, error: convErr } = await supabase
      .from("ai_conversations")
      .insert({
        user_id: session.userId,
        mode,
        title: content.slice(0, 60),
      })
      .select("id")
      .single();

    if (convErr || !newConv) {
      console.error("[api/ai/chat] conv create:", convErr);
      return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
    }
    convId = newConv.id as string;
  }

  // ذخیره پیام کاربر
  const { data: userMsg, error: msgErr } = await supabase
    .from("ai_messages")
    .insert({ conversation_id: convId, role: "user", content })
    .select("id")
    .single();

  if (msgErr || !userMsg) {
    console.error("[api/ai/chat] user msg:", msgErr);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  // فراخوانی AI
  let aiResult: {
    responses: Array<{ agent_role: string; content: string; order_index: number }>;
    tokens_used: number;
  };

  try {
    if (mode === "quick" && wantStream) {
      // Streaming path for quick mode
      const usedModel = quickModel || "openai/gpt-4o-mini";
      const stream = await runQuickStream(content, usedModel);

      // Save user message + placeholder assistant message first
      const { data: assistantMsg } = await supabase
        .from("ai_messages")
        .insert({ conversation_id: convId, role: "assistant", content: "[streaming]" })
        .select("id")
        .single();

      const encoder = new TextEncoder();
      let fullContent = "";

      const transformedStream = new ReadableStream({
        async start(controller) {
          const reader = stream.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith("data: ")) continue;
                const data = trimmed.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta?.content;
                  if (delta) {
                    fullContent += delta;
                    controller.enqueue(encoder.encode(delta));
                  }
                } catch {
                  // skip malformed chunks
                }
              }
            }
          } catch (e) {
            console.error("[api/ai/chat] stream error:", e);
          } finally {
            controller.close();

            // Save full response to DB after stream completes
            if (assistantMsg) {
              const savedContent = fullContent || "[پاسخی دریافت نشد]";
              await supabase.from("ai_responses").insert({
                message_id: assistantMsg.id,
                mode: "quick",
                agent_role: usedModel,
                content: savedContent,
                order_index: 0,
                model_name: usedModel,
              });

              // Update assistant message content
              await supabase
                .from("ai_messages")
                .update({ content: "[structured]" })
                .eq("id", assistantMsg.id);

              // Deduct credits
              const updateData: Record<string, number> = {
                credits: Math.max(0, (user.credits as number) - cost),
              };
              await supabase.from("ai_users").update(updateData).eq("id", session.userId);

              // Log usage
              await supabase.from("ai_usage").insert({
                user_id: session.userId,
                conversation_id: convId,
                mode: "quick",
                tokens_used: Math.ceil(savedContent.length / 4),
              });

              // Update conversation timestamp
              await supabase
                .from("ai_conversations")
                .update({ updated_at: new Date().toISOString() })
                .eq("id", convId);
            }
          }
        },
      });

      return new Response(transformedStream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Conversation-Id": convId,
          "X-Credits-Remaining": String(Math.max(0, (user.credits as number) - cost)),
        },
      });
    }

    if (mode === "quick") {
      const usedModel = quickModel || "openai/gpt-4o-mini";
      const result = await runQuick(content, usedModel);
      aiResult = {
        responses: [{ agent_role: usedModel, content: result.content, order_index: 0 }],
        tokens_used: Math.ceil(result.content.length / 4),
      };
    } else if (mode === "brainstorm") {
      const council = sanitizeCouncil(rawModels, user.plan as string);
      const result = await runBrainstorm(content, council);
      const responses = [
        ...result.agents.map((a, i) => ({
          agent_role: a.role,
          content: a.content,
          order_index: i,
        })),
        {
          agent_role: "synthesizer",
          content: result.synthesis,
          order_index: result.agents.length,
        },
      ];
      aiResult = {
        responses,
        tokens_used: Math.ceil(
          (result.agents.reduce((s, a) => s + a.content.length, 0) + result.synthesis.length) / 4
        ),
      };
    } else {
      const result = await runCritique(content);
      const responses = [
        { agent_role: "initial", content: result.initial, order_index: 0 },
        ...result.critics.map((c, i) => ({
          agent_role: c.role,
          content: c.content,
          order_index: i + 1,
        })),
        {
          agent_role: "final_improved",
          content: result.final_improved,
          order_index: result.critics.length + 1,
        },
      ];
      aiResult = {
        responses,
        tokens_used: Math.ceil(
          (result.initial.length +
            result.critics.reduce((s, c) => s + c.content.length, 0) +
            result.final_improved.length) /
            4
        ),
      };
    }
  } catch (e) {
    console.error("[api/ai/chat] AI error:", e);
    return NextResponse.json({ ok: false, error: "ai_error" }, { status: 502 });
  }

  // ذخیره پیام assistant و response‌ها
  const { data: assistantMsg, error: aMsgErr } = await supabase
    .from("ai_messages")
    .insert({ conversation_id: convId, role: "assistant", content: "[structured]" })
    .select("id")
    .single();

  if (aMsgErr || !assistantMsg) {
    console.error("[api/ai/chat] assistant msg:", aMsgErr);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  const responsesToInsert = aiResult.responses.map((r) => ({
    message_id: assistantMsg.id,
    mode,
    agent_role: r.agent_role,
    content: r.content,
    order_index: r.order_index,
    // برای اعضای شورا، agent_role همان اسلاگ مدل است (شامل "/").
    model_name: r.agent_role.includes("/")
      ? r.agent_role
      : "openai/gpt-4o-mini",
  }));

  await supabase.from("ai_responses").insert(responsesToInsert);

  // کاهش اعتبار
  const updateData: Record<string, number> = {
    credits: Math.max(0, (user.credits as number) - cost),
  };
  if (user.plan === "free" && mode === "brainstorm") {
    updateData.brainstorm_demos = Math.max(0, (user.brainstorm_demos as number) - 1);
  }
  await supabase.from("ai_users").update(updateData).eq("id", session.userId);

  // ثبت مصرف
  await supabase.from("ai_usage").insert({
    user_id: session.userId,
    conversation_id: convId,
    mode,
    tokens_used: aiResult.tokens_used,
  });

  // بروز رسانی updated_at مکالمه
  await supabase
    .from("ai_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", convId);

  return NextResponse.json({
    ok: true,
    conversation_id: convId,
    responses: aiResult.responses,
    credits_remaining: Math.max(0, (user.credits as number) - cost),
  });
}

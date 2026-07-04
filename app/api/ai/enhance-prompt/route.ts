import { NextRequest, NextResponse } from "next/server";
import { getAISession } from "@/lib/aiAuth";
import { enhanceImagePrompt, enhanceVideoPrompt } from "@/lib/aiEngine";
import { MAX_PROMPT_CHARS } from "@/lib/aiCredits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const prompt = String(body.prompt ?? "").trim().slice(0, MAX_PROMPT_CHARS);
  const mode = String(body.mode ?? "video");
  if (!prompt) {
    return NextResponse.json({ ok: false, error: "missing_prompt" }, { status: 422 });
  }
  if (mode !== "video" && mode !== "image") {
    return NextResponse.json({ ok: false, error: "unsupported_mode" }, { status: 422 });
  }

  try {
    const enhanced =
      mode === "image" ? await enhanceImagePrompt(prompt) : await enhanceVideoPrompt(prompt);
    if (!enhanced) {
      return NextResponse.json({ ok: false, error: "ai_error" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, prompt: enhanced });
  } catch (e) {
    console.error("[api/ai/enhance-prompt]", e);
    return NextResponse.json({ ok: false, error: "ai_error" }, { status: 502 });
  }
}

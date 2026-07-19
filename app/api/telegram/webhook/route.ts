import { NextRequest, NextResponse } from "next/server";
import { handleTelegramUpdate, type TelegramUpdate } from "@/lib/telegram/handler";
import { checkWebhookRateLimit } from "@/lib/telegram/rateLimit";
import { getTelegramConfig } from "@/lib/telegram/config";
import { tgDebugLog } from "@/lib/debugLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function extractTelegramId(update: TelegramUpdate): number | null {
  return (
    update.message?.from?.id ??
    update.callback_query?.from.id ??
    null
  );
}

export async function POST(req: NextRequest) {
  const reqStarted = Date.now();
  const { webhookSecret } = getTelegramConfig();
  if (webhookSecret) {
    const secret = req.headers.get("x-telegram-bot-api-secret-token");
    if (secret !== webhookSecret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const ip = clientIp(req);
  const telegramId = extractTelegramId(update);
  const rlStart = Date.now();
  const allowed = await checkWebhookRateLimit(telegramId, ip);
  const rateLimitMs = Date.now() - rlStart;
  if (!allowed) {
    // #region agent log
    tgDebugLog("F", "webhook/route.ts:POST", "rate_limited", { rateLimitMs, telegramId });
    // #endregion
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  try {
    const handlerStart = Date.now();
    await handleTelegramUpdate(update);
    // #region agent log
    tgDebugLog("E", "webhook/route.ts:POST", "update handled", {
      rateLimitMs,
      handlerMs: Date.now() - handlerStart,
      totalMs: Date.now() - reqStarted,
      isStart: Boolean(update.message?.text?.trim().startsWith("/start")),
      hasCallback: Boolean(update.callback_query),
    });
    // #endregion
  } catch (e) {
    console.error("[telegram/webhook] handler error:", e instanceof Error ? e.name : e);
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { handleUpdate, TelegramUpdate } from "@/lib/telegramBot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  // تأیید secret برای جلوگیری از درخواست‌های ناخواسته
  if (WEBHOOK_SECRET) {
    const secret = req.headers.get("x-telegram-bot-api-secret-token");
    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  try {
    await handleUpdate(update);
  } catch (e) {
    console.error("[telegram webhook] error:", e);
  }

  // تلگرام انتظار 200 دارد حتی اگر خطایی رخ داده باشد
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, status: "telegram webhook active" });
}

import { NextResponse } from "next/server";
import { isBotConfigured, isZibalConfigured } from "@/lib/telegram/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    status: "telegram acquisition webhook",
    botConfigured: isBotConfigured(),
    zibalConfigured: isZibalConfigured(),
  });
}

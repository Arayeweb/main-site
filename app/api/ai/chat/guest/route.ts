import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sse(data: Record<string, unknown>) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

/** Guest chat disabled — login required before first message. */
export async function POST(_req: NextRequest) {
  return new Response(sse({ type: "error", error: "login_required" }), {
    status: 401,
    headers: { "Content-Type": "text/event-stream" },
  });
}

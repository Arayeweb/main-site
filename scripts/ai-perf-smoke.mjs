#!/usr/bin/env node
/**
 * Dev-only timing helper — POST /api/ai/runs with a session cookie and print stage metrics.
 *
 * Usage:
 *   AI_PERF_LOGS=1 node scripts/ai-perf-smoke.mjs [baseUrl] [sessionCookieValue]
 *
 * Requires a valid ary_ai_session cookie for an authenticated user.
 */

const baseUrl = process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const cookie = process.argv[3] || process.env.ARY_AI_SESSION;

if (!cookie) {
  console.error("Pass session cookie value as argv[3] or set ARY_AI_SESSION");
  process.exit(1);
}

const t0 = Date.now();
let prepareEnd = null;
let firstDelta = null;

const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/ai/runs`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Cookie: `ary_ai_session=${cookie}`,
  },
  body: JSON.stringify({
    mode: "direct",
    model: "economy",
    prompt: "سلام",
  }),
});

const tHeaders = Date.now() - t0;
if (!res.ok && !(res.headers.get("Content-Type") || "").includes("text/event-stream")) {
  console.error("HTTP", res.status, await res.text());
  process.exit(1);
}

const reader = res.body?.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (reader) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  const parts = buffer.split("\n\n");
  buffer = parts.pop() ?? "";
  for (const block of parts) {
    const line = block.trim();
    if (!line.startsWith("data:")) continue;
    let ev;
    try {
      ev = JSON.parse(line.slice(5).trim());
    } catch {
      continue;
    }
    if (ev.type === "run_started" && prepareEnd == null) prepareEnd = Date.now() - t0;
    if (ev.type === "model_delta" && firstDelta == null) firstDelta = Date.now() - t0;
    if (ev.type === "run_done" || ev.type === "run_error") {
      reader.cancel();
      break;
    }
  }
}

console.log(
  JSON.stringify(
    {
      httpHeadersMs: tHeaders,
      prepareRunMs: prepareEnd,
      totalTtftMs: firstDelta,
      note: "Set AI_PERF_LOGS=1 on server for full ai-perf JSON logs",
    },
    null,
    2
  )
);

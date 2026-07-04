const AGENT_DEBUG_ENDPOINT =
  process.env.AGENT_DEBUG_ENDPOINT ||
  "http://127.0.0.1:7595/ingest/5edfe92e-8eff-41b7-9393-ff5814f12f32";
const AGENT_DEBUG_SESSION_ID = "ad61f5";
const AGENT_DEBUG_LOG_PATH = "/Users/abtin/Desktop/mewoo/bus/.cursor/debug-ad61f5.log";

function debugEnabled() {
  return process.env.NODE_ENV === "development" && process.env.AGENT_DEBUG !== "0";
}

export function agentDebugLog(
  location: string,
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string,
  runId = "pre-fix"
) {
  if (!debugEnabled()) return;

  const payload = {
    sessionId: AGENT_DEBUG_SESSION_ID,
    runId,
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  };

  fetch(AGENT_DEBUG_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": AGENT_DEBUG_SESSION_ID,
    },
    body: JSON.stringify(payload),
  }).catch(() => {});

  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("fs") as typeof import("fs");
      fs.appendFileSync(AGENT_DEBUG_LOG_PATH, `${JSON.stringify(payload)}\n`);
    } catch {
      /* ignore */
    }
  }
}

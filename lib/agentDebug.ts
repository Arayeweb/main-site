const AGENT_DEBUG_ENDPOINT =
  process.env.AGENT_DEBUG_ENDPOINT ||
  "http://127.0.0.1:7595/ingest/5edfe92e-8eff-41b7-9393-ff5814f12f32";
const AGENT_DEBUG_SESSION_ID = "ad61f5";

function debugEnabled() {
  return process.env.NODE_ENV === "development" && process.env.AGENT_DEBUG === "1";
}

/** Client/edge-safe debug logger (fetch only — no Node fs). */
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
}

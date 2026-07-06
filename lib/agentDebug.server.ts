import "server-only";
import fs from "fs";
import { agentDebugLog as agentDebugLogClient } from "@/lib/agentDebug";

const AGENT_DEBUG_LOG_PATH = "/Users/abtin/Desktop/mewoo/bus/.cursor/debug-ad61f5.log";

/** Server-only debug logger: fetch + optional local file append in development. */
export function agentDebugLog(
  location: string,
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string,
  runId = "pre-fix"
) {
  agentDebugLogClient(location, message, data, hypothesisId, runId);

  if (process.env.NODE_ENV !== "development" || process.env.AGENT_DEBUG === "0") return;

  const payload = {
    sessionId: "ad61f5",
    runId,
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  };

  try {
    fs.appendFileSync(AGENT_DEBUG_LOG_PATH, `${JSON.stringify(payload)}\n`);
  } catch {
    /* ignore */
  }
}

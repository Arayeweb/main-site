// =========================================================
// Small internal validator for /api/ai/runs.
// Avoids a heavy dependency while keeping untrusted payload fields bounded.
// =========================================================

import type { RunMode } from "@/lib/ai/streaming/sse";

const VALID_MODES = new Set<RunMode>(["direct", "compare", "council"]);
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ParsedRunBody =
  | {
      ok: true;
      mode: RunMode;
      model?: string;
      models: string[];
      conversationId: string | null;
      excludeRunId: string | null;
      personaKey: string | null;
      webSearch: boolean;
    }
  | { ok: false; error: "bad_request" | "invalid_model" };

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function cleanModelId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  // Internal model IDs are short slugs. Keep this deliberately narrow.
  if (!/^[a-z0-9][a-z0-9._:-]{0,80}$/i.test(v)) return null;
  return v;
}

const VALID_MESSAGE_ROLES = new Set(["user", "assistant", "system"]);
const MAX_MESSAGES = 24;
const MAX_MESSAGE_CONTENT_CHARS = 4000;

function validateMessages(raw: unknown): boolean {
  if (raw == null) return true;
  if (!Array.isArray(raw)) return false;
  if (raw.length > MAX_MESSAGES) return false;
  for (const item of raw) {
    if (!item || typeof item !== "object") return false;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if (typeof role !== "string" || !VALID_MESSAGE_ROLES.has(role)) return false;
    if (typeof content !== "string") return false;
    if (content.length > MAX_MESSAGE_CONTENT_CHARS) return false;
  }
  return true;
}

export function parseRunBody(body: Record<string, unknown>): ParsedRunBody {
  const modeRaw = String(body.mode ?? "direct");
  if (!VALID_MODES.has(modeRaw as RunMode)) {
    return { ok: false, error: "bad_request" };
  }
  const mode = modeRaw as RunMode;

  if (!validateMessages(body.messages)) {
    return { ok: false, error: "bad_request" };
  }

  const model = cleanModelId(body.model) ?? undefined;
  const models = Array.isArray(body.models)
    ? body.models.map(cleanModelId).filter((v): v is string => !!v).slice(0, 4)
    : [];

  // Backward-compatible compare payload shape.
  if (models.length === 0) {
    const a = cleanModelId(body.modelA);
    const b = cleanModelId(body.modelB);
    if (a) models.push(a);
    if (b) models.push(b);
  }
  if (models.length === 0 && model) models.push(model);

  const rawConversationId =
    typeof body.conversationId === "string" && body.conversationId
      ? body.conversationId.trim()
      : typeof body.threadId === "string" && body.threadId
        ? body.threadId.trim()
        : null;
  if (rawConversationId && !isUuid(rawConversationId)) {
    return { ok: false, error: "bad_request" };
  }

  const rawExcludeRunId =
    typeof body.excludeRunId === "string" && body.excludeRunId
      ? body.excludeRunId.trim()
      : null;
  if (rawExcludeRunId && !isUuid(rawExcludeRunId)) {
    return { ok: false, error: "bad_request" };
  }

  const personaKey =
    typeof body.personaKey === "string" && body.personaKey.trim()
      ? body.personaKey.trim().slice(0, 80)
      : null;

  return {
    ok: true,
    mode,
    model,
    models,
    conversationId: rawConversationId,
    excludeRunId: rawExcludeRunId,
    personaKey,
    webSearch: body.webSearch === true,
  };
}

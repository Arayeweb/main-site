// =========================================================
// Sanitized logging — never store full private prompts in logs
// =========================================================

export function textPreview(text: string, max = 120): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max) + "…";
}

export function safeLogMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (k === "text" || k === "prompt" || k === "message") {
      out[k] = typeof v === "string" ? textPreview(v) : "[redacted]";
    } else {
      out[k] = v;
    }
  }
  return out;
}

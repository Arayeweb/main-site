export const SSE_CONTENT_TYPE = "text/event-stream";

/** Assert response is an SSE stream with the expected content type. */
export function assertSseResponse(res: Response): void {
  const ct = res.headers.get("Content-Type") ?? "";
  if (!ct.includes(SSE_CONTENT_TYPE)) {
    throw new Error(`expected SSE response, got Content-Type: ${ct || "(none)"}`);
  }
}

function parseSseBlock(block: string): Record<string, unknown> | null {
  const line = block.trim();
  if (!line.startsWith("data: ")) return null;
  try {
    return JSON.parse(line.slice(6)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Extract runId from parsed SSE events (preferred over X-Run-Id header). */
export function runIdFromSseEvents(events: Record<string, unknown>[]): string {
  const started = events.find((e) => e.type === "run_started");
  return started?.runId != null ? String(started.runId) : "";
}

/** Parse SSE `data: {...}` lines from a fetch Response body. */
export async function readSseEvents(
  res: Response
): Promise<Record<string, unknown>[]> {
  const text = await res.text();
  const events: Record<string, unknown>[] = [];
  for (const block of text.split("\n\n")) {
    const ev = parseSseBlock(block);
    if (ev) events.push(ev);
  }
  return events;
}

/**
 * Incrementally read SSE events from a live Response stream.
 * Useful for stop/cancel tests that must act mid-stream.
 */
export async function readSseEventsStreaming(
  res: Response,
  opts?: {
    onEvent?: (ev: Record<string, unknown>) => void;
    until?: (events: Record<string, unknown>[]) => boolean;
  }
): Promise<Record<string, unknown>[]> {
  if (!res.body) return [];
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const events: Record<string, unknown>[] = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const block of parts) {
        const ev = parseSseBlock(block);
        if (!ev) continue;
        events.push(ev);
        opts?.onEvent?.(ev);
        if (opts?.until?.(events)) return events;
      }
    }

    const tail = parseSseBlock(buffer);
    if (tail) {
      events.push(tail);
      opts?.onEvent?.(tail);
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      /* already closed */
    }
  }

  return events;
}

/** Wait until a predicate matches one parsed SSE event (or stream ends). */
export async function waitForSseEvent(
  res: Response,
  predicate: (ev: Record<string, unknown>) => boolean
): Promise<{ events: Record<string, unknown>[]; matched: Record<string, unknown> }> {
  const events: Record<string, unknown>[] = [];
  let matched: Record<string, unknown> | null = null;

  await readSseEventsStreaming(res, {
    onEvent: (ev) => {
      events.push(ev);
      if (!matched && predicate(ev)) matched = ev;
    },
    until: () => matched != null,
  });

  if (!matched) {
    throw new Error(
      `SSE predicate never matched. Events: ${JSON.stringify(events.map((e) => e.type))}`
    );
  }
  return { events, matched };
}

/** Consume stream until first SSE event (for partial-read / disconnect tests). */
export async function readFirstSseChunk(res: Response): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const { value } = await reader.read();
  await reader.cancel();
  return decoder.decode(value ?? new Uint8Array());
}

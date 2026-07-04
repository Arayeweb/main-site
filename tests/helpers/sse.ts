/** Parse SSE `data: {...}` lines from a fetch Response body. */
export async function readSseEvents(
  res: Response
): Promise<Record<string, unknown>[]> {
  const text = await res.text();
  const events: Record<string, unknown>[] = [];
  for (const block of text.split("\n\n")) {
    const line = block.trim();
    if (!line.startsWith("data: ")) continue;
    try {
      events.push(JSON.parse(line.slice(6)) as Record<string, unknown>);
    } catch {
      // ignore malformed chunks
    }
  }
  return events;
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

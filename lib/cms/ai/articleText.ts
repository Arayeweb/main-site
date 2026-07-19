/** Plain text extraction from Tiptap JSON for AI context. */
type JsonNode = {
  type?: string;
  text?: string;
  content?: JsonNode[];
};

export function tiptapJsonToText(doc: Record<string, unknown>): string {
  const parts: string[] = [];
  function walk(n: JsonNode) {
    if (n.type === 'text' && n.text) parts.push(n.text);
    if (n.type === 'heading' && n.content) {
      parts.push('\n## ');
      n.content.forEach(walk);
      parts.push('\n');
      return;
    }
    (n.content ?? []).forEach(walk);
    if (['paragraph', 'listItem', 'blockquote'].includes(n.type ?? '')) parts.push('\n');
  }
  walk(doc as JsonNode);
  return parts.join('').replace(/\n{3,}/g, '\n\n').trim();
}

export function extractHeadingTexts(doc: Record<string, unknown>): string[] {
  const headings: string[] = [];
  function walk(n: JsonNode) {
    if (n.type === 'heading') {
      const t = (n.content ?? []).map((c) => c.text ?? '').join('');
      if (t) headings.push(t);
    }
    (n.content ?? []).forEach(walk);
  }
  walk(doc as JsonNode);
  return headings;
}

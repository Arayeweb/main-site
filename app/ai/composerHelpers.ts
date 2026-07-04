export type PendingAttachment = { url: string; mime: string; preview: string };

const CODE_HINT = "پاسخ را با کد و مثال فنی بده.";

export function wrapPromptWithModes(
  prompt: string,
  opts: { codeMode?: boolean }
): string {
  if (!opts.codeMode) return prompt;
  return `${CODE_HINT}\n\n${prompt}`;
}

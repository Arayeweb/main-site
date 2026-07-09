import { ALL_PROMPTS, getPromptBySlug } from "./promptData";
import type { AraayePrompt } from "./promptTypes";

/** A prompt page is indexable only when content is complete and useful. */
export function isPromptComplete(prompt: AraayePrompt): boolean {
  if (!prompt.slug || !prompt.title) return false;
  if (!prompt.basePrompt || prompt.basePrompt.trim().length < 80) return false;
  if (!prompt.exampleOutput || prompt.exampleOutput.trim().length < 40) return false;
  if (!prompt.shortDescription || !prompt.metaTitle || !prompt.metaDescription) return false;
  if (!prompt.canonicalPath.startsWith("/prompts/")) return false;
  if (prompt.useCases.length < 3) return false;
  if (prompt.commonMistakes.length < 3) return false;
  if (prompt.faq.length < 3) return false;
  if (prompt.relatedPrompts.length < 2) return false;
  // Reject obvious placeholders
  const blob = `${prompt.basePrompt}${prompt.exampleOutput}${prompt.metaDescription}`;
  if (/TODO|placeholder|lorem ipsum|\[fill\]/i.test(blob)) return false;
  return true;
}

export function isPromptIndexable(slug: string): boolean {
  const prompt = getPromptBySlug(slug);
  if (!prompt) return false;
  return isPromptComplete(prompt);
}

export function getIndexablePrompts(): AraayePrompt[] {
  return ALL_PROMPTS.filter(isPromptComplete);
}

export function getIndexablePromptPaths(): string[] {
  return ["/prompts", ...getIndexablePrompts().map((p) => p.canonicalPath)];
}

type AraayePromptUrlOptions = {
  /** side_by_side = Compare Mode (GPT + Claude + Gemini) */
  mode?: "side_by_side";
};

/** Build /ai URL with prompt prefilled + prompts attribution. */
export function buildAraayePromptUrl(
  prompt: string,
  slug: string,
  options?: AraayePromptUrlOptions
): string {
  const params = new URLSearchParams();
  params.set("prompt", prompt);
  params.set("source", "prompts");
  params.set("promptSlug", slug);
  if (options?.mode) params.set("mode", options.mode);
  return `/ai?${params.toString()}`;
}

/** Compare Mode: same prompt across GPT, Claude and Gemini. */
export function buildAraayeComparePromptUrl(prompt: string, slug: string): string {
  return buildAraayePromptUrl(prompt, slug, { mode: "side_by_side" });
}

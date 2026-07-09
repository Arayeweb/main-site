/** Build /ai URL with prompt prefilled + prompts attribution. */
export function buildAraayePromptUrl(prompt: string, slug: string): string {
  const params = new URLSearchParams();
  params.set("prompt", prompt);
  params.set("source", "prompts");
  params.set("promptSlug", slug);
  return `/ai?${params.toString()}`;
}

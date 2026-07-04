export const CS_BOOTSTRAP_PROMPT_KEY = "cs:bootstrap-prompt";

/** پرامپت پکیج را در sessionStorage می‌گذارد و به چت AI می‌برد */
export function openPromptInAi(prompt: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CS_BOOTSTRAP_PROMPT_KEY, prompt);
  } catch {
    /* ignore */
  }
  window.location.assign("/ai");
}

export function consumeContentSalesBootstrapPrompt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = sessionStorage.getItem(CS_BOOTSTRAP_PROMPT_KEY);
    if (!v) return null;
    sessionStorage.removeItem(CS_BOOTSTRAP_PROMPT_KEY);
    return v;
  } catch {
    return null;
  }
}

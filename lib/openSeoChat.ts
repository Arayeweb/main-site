export type SeoChatSource = "final_cta" | "launcher" | string;

export function openSeoChat(business: string, source: SeoChatSource = "final_cta") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("araaye:open-seo-chat", { detail: { business: business.trim(), source } })
  );
}

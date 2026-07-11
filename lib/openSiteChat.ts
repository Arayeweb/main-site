export type SiteChatSource =
  | "launcher"
  | "navbar"
  | "navbar_mobile"
  | "hero"
  | "home_final_cta"
  | "collaboration_process"
  | "sticky_mobile_cta"
  | string;

export function openSiteChat(source: SiteChatSource = "launcher") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("araaye:open-chat", { detail: { source } })
  );
}

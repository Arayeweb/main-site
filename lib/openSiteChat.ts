export type SiteChatSource =
  | "launcher"
  | "navbar"
  | "navbar_mobile"
  | "hero"
  | "home_final_cta"
  | "collaboration_process"
  | "sticky_mobile_cta"
  | string;

export type WebsiteDesignProjectType = "new" | "redesign";

export interface SiteChatPrefill {
  flow: "website_design_hero";
  projectType: WebsiteDesignProjectType;
  contact: string;
}

export function openSiteChat(
  source: SiteChatSource = "launcher",
  prefill?: SiteChatPrefill
) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("araaye:open-chat", { detail: { source, prefill } })
  );
}

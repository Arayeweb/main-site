// Growth Hub shared constants. No secrets here.

export const GROWTH_HUB_ANALYTICS_SOURCE = "growth_hub" as const;

/** Client route prefixes. */
export const APP_LOGIN_PATH = "/app/login";
export const APP_SELECT_WORKSPACE_PATH = "/app/select-workspace";

/** Staff route prefix (behind existing /admin middleware). */
export const ADMIN_GROWTH_HUB_PATH = "/admin/growth-hub";

/** Invite lifetime, in days, when not explicitly provided. */
export const DEFAULT_INVITE_EXPIRY_DAYS = 7;
export const MIN_INVITE_EXPIRY_DAYS = 1;
export const MAX_INVITE_EXPIRY_DAYS = 30;

/** Growth Hub product events implemented in Sprint 1B (see EVENT-CATALOG.md). */
export const GROWTH_HUB_EVENTS = {
  workspaceInvited: "workspace_invited",
  workspaceActivated: "workspace_activated",
  workspaceOpened: "workspace_opened",
  serviceViewed: "service_viewed",
} as const;

export type GrowthHubEventName =
  (typeof GROWTH_HUB_EVENTS)[keyof typeof GROWTH_HUB_EVENTS];

/** Roles a client_owner / staff may assign through the invite flow. */
export const INVITE_ROLES = ["client_owner", "client_member"] as const;

/** All membership roles. */
export const MEMBER_ROLES = [
  "client_owner",
  "client_member",
  "araaye_manager",
] as const;

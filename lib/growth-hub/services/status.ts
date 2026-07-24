import type {
  GrowthHubMilestoneStatus,
  GrowthHubServiceStatus,
} from "@/lib/growth-hub/database.types";

/** Canonical service statuses (DB + TS). Persian labels live in presentation. */
export const SERVICE_STATUSES = [
  "starting",
  "active",
  "in_progress",
  "waiting_on_client",
  "paused",
  "completed",
  "cancelled",
] as const satisfies readonly GrowthHubServiceStatus[];

export const MILESTONE_STATUSES = [
  "pending",
  "in_progress",
  "blocked",
  "completed",
  "skipped",
] as const satisfies readonly GrowthHubMilestoneStatus[];

/** Statuses that appear as “active work” on Home / lists. */
export const ACTIVE_SERVICE_STATUSES: GrowthHubServiceStatus[] = [
  "starting",
  "active",
  "in_progress",
  "waiting_on_client",
  "paused",
];

export const SERVICE_STATUS_LABELS_FA: Record<GrowthHubServiceStatus, string> = {
  starting: "در حال شروع",
  active: "فعال",
  in_progress: "در حال انجام",
  waiting_on_client: "در انتظار شما",
  paused: "متوقف",
  completed: "تکمیل‌شده",
  cancelled: "لغوشده",
};

export const MILESTONE_STATUS_LABELS_FA: Record<GrowthHubMilestoneStatus, string> = {
  pending: "در صف",
  in_progress: "در حال انجام",
  blocked: "مسدود",
  completed: "انجام‌شده",
  skipped: "ردشده",
};

/**
 * Allowed staff transitions. completed / cancelled are terminal unless an
 * explicit privileged reopen action is used (separate path).
 */
export const SERVICE_TRANSITIONS: Record<
  GrowthHubServiceStatus,
  GrowthHubServiceStatus[]
> = {
  starting: ["active", "in_progress", "paused", "cancelled"],
  active: ["in_progress", "waiting_on_client", "paused", "completed", "cancelled"],
  in_progress: ["waiting_on_client", "paused", "completed", "cancelled"],
  waiting_on_client: ["in_progress", "paused", "completed", "cancelled"],
  paused: ["active", "in_progress", "cancelled"],
  completed: [],
  cancelled: [],
};

export function canTransitionService(
  from: GrowthHubServiceStatus,
  to: GrowthHubServiceStatus,
): boolean {
  if (from === to) return true;
  return SERVICE_TRANSITIONS[from].includes(to);
}

export function isTerminalServiceStatus(status: GrowthHubServiceStatus): boolean {
  return status === "completed" || status === "cancelled";
}

export function isActiveServiceStatus(status: GrowthHubServiceStatus): boolean {
  return ACTIVE_SERVICE_STATUSES.includes(status);
}

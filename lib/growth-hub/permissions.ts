import type { GrowthHubMemberRole } from "@/lib/growth-hub/database.types";

// Application-level mirror of rls-matrix.md. RLS at the database is the source
// of truth for tenancy; these helpers gate UI + server actions and keep the
// role model explicit. They never replace RLS.

export const CLIENT_ROLES: GrowthHubMemberRole[] = [
  "client_owner",
  "client_member",
];

export function isClientRole(role: GrowthHubMemberRole): boolean {
  return role === "client_owner" || role === "client_member";
}

export function isStaffRole(role: GrowthHubMemberRole): boolean {
  return role === "araaye_manager";
}

/** Owner-only client capability (manage client members, etc.). */
export function canManageClientMembers(role: GrowthHubMemberRole): boolean {
  return role === "client_owner";
}

/** Clients can never grant the araaye_manager role (column-level rule). */
export function canAssignRole(
  actorIsStaffAdmin: boolean,
  targetRole: GrowthHubMemberRole,
): boolean {
  if (targetRole === "araaye_manager") return actorIsStaffAdmin;
  // client_owner / client_member assignment is allowed for staff admins in MVP
  // (client_owner self-management is deferred). Managers do not assign roles.
  return actorIsStaffAdmin;
}

export const ROLE_LABELS_FA: Record<GrowthHubMemberRole, string> = {
  client_owner: "مالک فضای کاری",
  client_member: "عضو فضای کاری",
  araaye_manager: "مدیر حساب آرایه",
};

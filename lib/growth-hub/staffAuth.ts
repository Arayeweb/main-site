import "server-only";

import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ADMIN_COOKIE, verifyUserToken, type AdminSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Database } from "@/lib/growth-hub/database.types";

// Centralized staff authorization gateway (D-007, ARCHITECTURE §3.2/§7).
//
// EVERY Growth Hub staff mutation that needs service-role access MUST obtain it
// through assertGrowthHubStaffAccess(). Service-role parsing/access is not
// scattered across route handlers. This gateway:
//   - validates the existing admin session (ary_admin HMAC cookie)
//   - validates the staff role (araaye_admin === admin)
//   - fails closed on anything unexpected
//   - returns a typed staff identity plus the scoped service client.
//
// The returned service client bypasses RLS, so it is only ever reachable AFTER
// authorization here. It is never exported for client routes.

export type GrowthHubStaffRole = "araaye_admin";

export interface GrowthHubStaff {
  userId: string;
  role: GrowthHubStaffRole;
}

export interface GrowthHubStaffAccess {
  staff: GrowthHubStaff;
  service: SupabaseClient<Database>;
}

export class GrowthHubStaffAuthError extends Error {
  constructor(message = "دسترسی مدیریتی مرکز رشد ندارید.") {
    super(message);
    this.name = "GrowthHubStaffAuthError";
  }
}

/** Reads and verifies the current admin session from cookies. */
function readAdminSession(): AdminSession | null {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return verifyUserToken(token);
}

/**
 * Maps an admin panel role to a Growth Hub staff role. Only global `admin`
 * (araaye_admin, D-015) may operate Growth Hub staff features in MVP. All other
 * panel roles are rejected (fail closed).
 */
function mapStaffRole(session: AdminSession): GrowthHubStaffRole | null {
  return session.role === "admin" ? "araaye_admin" : null;
}

/**
 * Authorize a staff Growth Hub mutation. Throws GrowthHubStaffAuthError when
 * the caller is not an authorized araaye_admin. Returns the typed staff
 * identity and the service-role client to use for the mutation.
 */
export function assertGrowthHubStaffAccess(): GrowthHubStaffAccess {
  const session = readAdminSession();
  if (!session) throw new GrowthHubStaffAuthError();

  const role = mapStaffRole(session);
  if (!role) throw new GrowthHubStaffAuthError();

  return {
    staff: { userId: session.userId, role },
    service: getSupabaseAdmin() as unknown as SupabaseClient<Database>,
  };
}

/** Non-throwing variant for read-only staff pages (returns null if unauthorized). */
export function getGrowthHubStaffAccess(): GrowthHubStaffAccess | null {
  try {
    return assertGrowthHubStaffAccess();
  } catch {
    return null;
  }
}

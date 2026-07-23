import "server-only";

import { redirect, notFound } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getGrowthHubServerClient } from "@/lib/growth-hub/supabase/server";
import { isValidSlug } from "@/lib/growth-hub/slug";
import { APP_LOGIN_PATH, APP_SELECT_WORKSPACE_PATH } from "@/lib/growth-hub/constants";
import type {
  GhWorkspaceRow,
  GrowthHubMemberRole,
} from "@/lib/growth-hub/database.types";

// Centralized client workspace access helper (route-map "Unauthorized behavior").
// ALWAYS uses the user-scoped Supabase client (RLS) — never service role.

/** Public projection of a workspace for the client portal (no internal fields). */
export interface PortalWorkspace {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  industry: string | null;
  website_url: string | null;
  status: GhWorkspaceRow["status"];
}

export interface WorkspaceMembership {
  role: GrowthHubMemberRole;
  status: "active";
}

export interface PortalContext {
  user: User;
  workspace: PortalWorkspace;
  membership: WorkspaceMembership;
}

function loginRedirect(next?: string): never {
  const target = next
    ? `${APP_LOGIN_PATH}?next=${encodeURIComponent(next)}`
    : APP_LOGIN_PATH;
  redirect(target);
}

/** Requires a valid Supabase Auth session; redirects to login otherwise. */
export async function requirePortalSession(next?: string): Promise<User> {
  const supabase = getGrowthHubServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) loginRedirect(next);
  return user;
}

/** Active workspaces the current user can access (RLS-filtered). */
export async function listAccessibleWorkspaces(): Promise<
  Array<PortalWorkspace & { role: GrowthHubMemberRole }>
> {
  const supabase = getGrowthHubServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("gh_workspace_members")
    .select(
      "role, status, workspace:gh_workspaces!inner(id, name, slug, logo_url, industry, website_url, status)",
    )
    .eq("user_id", user.id)
    .eq("status", "active");

  if (error || !data) return [];

  const result: Array<PortalWorkspace & { role: GrowthHubMemberRole }> = [];
  for (const row of data) {
    const ws = row.workspace as unknown as GhWorkspaceRow | null;
    if (!ws || ws.status === "archived") continue;
    result.push({
      id: ws.id,
      name: ws.name,
      slug: ws.slug,
      logo_url: ws.logo_url,
      industry: ws.industry,
      website_url: ws.website_url,
      status: ws.status,
      role: row.role as GrowthHubMemberRole,
    });
  }
  return result;
}

/**
 * Resolves the workspace for a slug and verifies the caller has an active
 * membership. Redirects unauthenticated users to login. For an authenticated
 * user without access to this slug:
 *   - if they have other active memberships → 404 (notFound) so we never leak
 *     whether the workspace exists or confirm cross-tenant slugs;
 *   - if they have no memberships at all → redirect to select-workspace.
 *
 * Changing the slug or a workspace_id in a payload cannot bypass this because
 * RLS returns zero rows for non-members.
 */
export async function requireWorkspaceMembership(
  workspaceSlug: string,
): Promise<PortalContext> {
  const nextPath = `/app/${workspaceSlug}/home`;
  const supabase = getGrowthHubServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) loginRedirect(nextPath);

  if (!isValidSlug(workspaceSlug)) {
    // Malformed slug can never match a real workspace.
    return denyAccess(supabase, user.id);
  }

  const { data: ws } = await supabase
    .from("gh_workspaces")
    .select("id, name, slug, logo_url, industry, website_url, status")
    .eq("slug", workspaceSlug)
    .maybeSingle();

  if (!ws) {
    return denyAccess(supabase, user.id);
  }

  const { data: member } = await supabase
    .from("gh_workspace_members")
    .select("role, status")
    .eq("workspace_id", ws.id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!member) {
    return denyAccess(supabase, user.id);
  }

  return {
    user,
    workspace: {
      id: ws.id,
      name: ws.name,
      slug: ws.slug,
      logo_url: ws.logo_url,
      industry: ws.industry,
      website_url: ws.website_url,
      status: ws.status,
    },
    membership: { role: member.role as GrowthHubMemberRole, status: "active" },
  };
}

async function denyAccess(
  supabase: ReturnType<typeof getGrowthHubServerClient>,
  userId: string,
): Promise<never> {
  const { count } = await supabase
    .from("gh_workspace_members")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active");

  if (!count || count === 0) {
    redirect(APP_SELECT_WORKSPACE_PATH);
  }
  // Has access to some workspace, just not this one → do not leak existence.
  notFound();
}

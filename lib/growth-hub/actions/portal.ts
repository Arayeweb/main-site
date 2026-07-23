"use server";

import { getGrowthHubServerClient } from "@/lib/growth-hub/supabase/server";
import { trackGrowthHubEvent } from "@/lib/growth-hub/analytics";
import { GROWTH_HUB_EVENTS } from "@/lib/growth-hub/constants";
import { uuidSchema } from "@/lib/growth-hub/validation";

/**
 * Records workspace_opened after verifying (via RLS) that the caller is an
 * active member. Debouncing is handled client-side (once per session). Uses the
 * user-scoped client for the membership check; the analytics write is a trusted
 * server-side sink.
 */
export async function recordWorkspaceOpenedAction(
  workspaceId: unknown,
  path?: string,
): Promise<{ ok: boolean }> {
  const parsed = uuidSchema.safeParse(workspaceId);
  if (!parsed.success) return { ok: false };

  const supabase = getGrowthHubServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  // RLS ensures a row is returned only for an active member of this workspace.
  const { data: member } = await supabase
    .from("gh_workspace_members")
    .select("role")
    .eq("workspace_id", parsed.data)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (!member) return { ok: false };

  await trackGrowthHubEvent({
    event: GROWTH_HUB_EVENTS.workspaceOpened,
    workspaceId: parsed.data,
    userRole: member.role,
    path,
    properties: { path },
  });
  return { ok: true };
}

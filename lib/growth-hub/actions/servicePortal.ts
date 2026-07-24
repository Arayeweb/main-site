"use server";

import { getGrowthHubServerClient } from "@/lib/growth-hub/supabase/server";
import { trackGrowthHubEvent } from "@/lib/growth-hub/analytics";
import { GROWTH_HUB_EVENTS } from "@/lib/growth-hub/constants";
import { uuidSchema } from "@/lib/growth-hub/validation";
import type { GrowthHubMemberRole, GrowthHubServiceStatus } from "@/lib/growth-hub/database.types";

/**
 * Records service_viewed after verifying the caller is an active member of the
 * service's workspace. User-scoped client only — no service-role.
 */
export async function recordServiceViewedAction(
  serviceId: unknown,
  workspaceId: unknown,
): Promise<{ ok: boolean }> {
  const sid = uuidSchema.safeParse(serviceId);
  const wid = uuidSchema.safeParse(workspaceId);
  if (!sid.success || !wid.success) return { ok: false };

  const supabase = getGrowthHubServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data: membership } = await supabase
    .from("gh_workspace_members")
    .select("role")
    .eq("workspace_id", wid.data)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (!membership) return { ok: false };

  const { data: service } = await supabase
    .from("gh_services")
    .select("id, status, workspace_id")
    .eq("id", sid.data)
    .eq("workspace_id", wid.data)
    .maybeSingle();
  if (!service) return { ok: false };

  await trackGrowthHubEvent({
    event: GROWTH_HUB_EVENTS.serviceViewed,
    workspaceId: service.workspace_id,
    userRole: membership.role as GrowthHubMemberRole,
    properties: {
      service_id: service.id,
      service_status: service.status as GrowthHubServiceStatus,
    },
  });

  return { ok: true };
}

import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  GhServiceMilestoneRow,
  GhServiceRow,
  GhServiceTemplateRow,
  GrowthHubServiceStatus,
} from "@/lib/growth-hub/database.types";
import { ACTIVE_SERVICE_STATUSES } from "@/lib/growth-hub/services/status";

type AnyClient = SupabaseClient<Database>;

export type ServiceWithTemplate = GhServiceRow & {
  template: Pick<GhServiceTemplateRow, "id" | "key" | "title"> | null;
};

export async function listWorkspaceServices(
  client: AnyClient,
  workspaceId: string,
): Promise<ServiceWithTemplate[]> {
  const { data, error } = await client
    .from("gh_services")
    .select(
      "*, template:gh_service_templates(id, key, title)",
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[gh/services] list", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const template = Array.isArray(row.template) ? row.template[0] : row.template;
    return {
      ...(row as GhServiceRow),
      template: (template as ServiceWithTemplate["template"]) ?? null,
    };
  });
}

export async function getWorkspaceService(
  client: AnyClient,
  workspaceId: string,
  serviceId: string,
): Promise<ServiceWithTemplate | null> {
  const { data, error } = await client
    .from("gh_services")
    .select("*, template:gh_service_templates(id, key, title)")
    .eq("workspace_id", workspaceId)
    .eq("id", serviceId)
    .maybeSingle();

  if (error || !data) return null;
  const template = Array.isArray(data.template) ? data.template[0] : data.template;
  return {
    ...(data as GhServiceRow),
    template: (template as ServiceWithTemplate["template"]) ?? null,
  };
}

export async function listServiceMilestones(
  client: AnyClient,
  workspaceId: string,
  serviceId: string,
): Promise<GhServiceMilestoneRow[]> {
  const { data, error } = await client
    .from("gh_service_milestones")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("service_id", serviceId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[gh/services] milestones", error.message);
    return [];
  }
  return (data ?? []) as GhServiceMilestoneRow[];
}

/** Pick the most important current service for Home. */
export function pickPrimaryService(
  services: ServiceWithTemplate[],
): ServiceWithTemplate | null {
  if (!services.length) return null;
  const waiting = services.find((s) => s.status === "waiting_on_client");
  if (waiting) return waiting;
  const active = services.find((s) =>
    ACTIVE_SERVICE_STATUSES.includes(s.status as GrowthHubServiceStatus),
  );
  if (active) return active;
  return services[0] ?? null;
}

export function countActiveServices(services: ServiceWithTemplate[]): number {
  return services.filter((s) =>
    ACTIVE_SERVICE_STATUSES.includes(s.status as GrowthHubServiceStatus),
  ).length;
}

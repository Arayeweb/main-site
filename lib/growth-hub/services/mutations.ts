import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  GhServiceMilestoneRow,
  GhServiceRow,
  GhServiceTemplateRow,
  GrowthHubMilestoneStatus,
  GrowthHubServiceStatus,
} from "@/lib/growth-hub/database.types";
import {
  assertServiceTransition,
  type CreateServiceFromTemplateInput,
  type UpdateMilestoneInput,
  type UpdateServiceInput,
} from "@/lib/growth-hub/services/validation";
import { isTerminalServiceStatus } from "@/lib/growth-hub/services/status";

type ServiceClient = SupabaseClient<Database>;

export type ServiceMutationResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; stale?: boolean };

function fail(error: string, stale = false): { ok: false; error: string; stale?: boolean } {
  return stale ? { ok: false, error, stale: true } : { ok: false, error };
}

async function writeActivity(
  service: ServiceClient,
  params: {
    workspaceId: string;
    entityType: string;
    entityId: string;
    eventType: string;
    metadata?: Record<string, unknown>;
    staffUserId: string;
  },
): Promise<void> {
  await service.from("gh_activity_events").insert({
    workspace_id: params.workspaceId,
    actor_id: null,
    entity_type: params.entityType,
    entity_id: params.entityId,
    event_type: params.eventType,
    metadata: {
      ...params.metadata,
      staff_user_id: params.staffUserId,
    },
  });
}

export async function createServiceFromTemplate(params: {
  service: ServiceClient;
  staffUserId: string;
  input: CreateServiceFromTemplateInput;
}): Promise<ServiceMutationResult<{ serviceId: string }>> {
  const { service, staffUserId, input } = params;

  const { data: serviceId, error } = await service.rpc(
    "gh_create_service_from_template",
    {
      p_workspace_id: input.workspace_id,
      p_template_id: input.template_id,
      p_title: input.title,
      p_start_date: input.start_date ?? null,
      p_due_date: input.due_date ?? null,
      p_actor_label: staffUserId,
    },
  );

  if (error || !serviceId) {
    const msg = error?.message ?? "";
    if (msg.includes("gh_service_template_inactive")) {
      return fail("این قالب خدمت غیرفعال است.");
    }
    if (msg.includes("gh_service_template_missing")) {
      return fail("قالب خدمت پیدا نشد.");
    }
    if (msg.includes("gh_service_workspace_missing")) {
      return fail("فضای کاری پیدا نشد.");
    }
    if (msg.includes("gh_service_workspace_inactive")) {
      return fail("فضای کاری فعال نیست.");
    }
    if (msg.includes("gh_service_invalid_dates")) {
      return fail("تاریخ‌ها نامعتبر هستند.");
    }
    console.error("[gh/services] create", error?.message);
    return fail("ساخت خدمت ناموفق بود.");
  }

  return { ok: true, data: { serviceId: String(serviceId) } };
}

export async function updateServiceFields(params: {
  service: ServiceClient;
  staffUserId: string;
  input: UpdateServiceInput;
}): Promise<ServiceMutationResult<{ service: GhServiceRow }>> {
  const { service, staffUserId, input } = params;

  const { data: current, error: readErr } = await service
    .from("gh_services")
    .select("*")
    .eq("id", input.service_id)
    .maybeSingle();

  if (readErr || !current) return fail("خدمت پیدا نشد.");

  if (current.updated_at !== input.expected_updated_at) {
    return fail("این خدمت توسط فرد دیگری به‌روز شده. لطفاً صفحه را تازه کنید.", true);
  }

  const nextStatus = (input.status ?? current.status) as GrowthHubServiceStatus;
  if (input.status && input.status !== current.status) {
    const transitionErr = assertServiceTransition(
      current.status as GrowthHubServiceStatus,
      input.status,
    );
    if (transitionErr) return fail(transitionErr);
  }

  // Merge waiting / next_action invariants against the resulting row.
  const waitingReason =
    input.waiting_reason !== undefined ? input.waiting_reason : current.waiting_reason;
  let nextAction =
    input.next_action !== undefined ? input.next_action : current.next_action;

  if (nextStatus === "waiting_on_client") {
    if (!waitingReason?.trim()) {
      return fail("برای وضعیت «در انتظار شما» باید دلیل انتظار مشخص شود.");
    }
    if (!nextAction?.trim()) {
      return fail("برای وضعیت «در انتظار شما» باید اقدام بعدی مشتری مشخص شود.");
    }
  }

  if (nextStatus === "completed") {
    nextAction = null;
  }

  const patch: Partial<GhServiceRow> = {
    status: nextStatus,
    latest_update:
      input.latest_update !== undefined ? input.latest_update : current.latest_update,
    next_action: nextAction,
    waiting_reason:
      nextStatus === "waiting_on_client" ? waitingReason : waitingReason,
    start_date: input.start_date !== undefined ? input.start_date : current.start_date,
    due_date: input.due_date !== undefined ? input.due_date : current.due_date,
    renewal_date:
      input.renewal_date !== undefined ? input.renewal_date : current.renewal_date,
  };

  if (nextStatus === "completed") {
    patch.progress = 100;
    patch.next_action = null;
  }

  const { data: updated, error: updErr } = await service
    .from("gh_services")
    .update(patch)
    .eq("id", current.id)
    .eq("updated_at", input.expected_updated_at)
    .select("*")
    .maybeSingle();

  if (updErr) {
    console.error("[gh/services] update", updErr.message);
    return fail("به‌روزرسانی خدمت ناموفق بود.");
  }
  if (!updated) {
    return fail("این خدمت توسط فرد دیگری به‌روز شده. لطفاً صفحه را تازه کنید.", true);
  }

  // Activity events
  if (input.status && input.status !== current.status) {
    let eventType = "service_status_changed";
    if (input.status === "waiting_on_client") eventType = "service_waiting_for_client";
    if (input.status === "completed") eventType = "service_completed";
    if (input.status === "cancelled") eventType = "service_cancelled";
    await writeActivity(service, {
      workspaceId: updated.workspace_id,
      entityType: "service",
      entityId: updated.id,
      eventType,
      staffUserId,
      metadata: {
        from: current.status,
        to: input.status,
        client_visible: true,
      },
    });
  }

  if (
    input.next_action !== undefined &&
    (input.next_action ?? "") !== (current.next_action ?? "")
  ) {
    await writeActivity(service, {
      workspaceId: updated.workspace_id,
      entityType: "service",
      entityId: updated.id,
      eventType: "service_next_action_changed",
      staffUserId,
      metadata: { client_visible: true },
    });
  }

  return { ok: true, data: { service: updated } };
}

export async function updateMilestoneStatus(params: {
  service: ServiceClient;
  staffUserId: string;
  input: UpdateMilestoneInput;
}): Promise<ServiceMutationResult<{ milestone: GhServiceMilestoneRow; progress: number }>> {
  const { service, staffUserId, input } = params;

  const { data: milestone, error: readErr } = await service
    .from("gh_service_milestones")
    .select("*")
    .eq("id", input.milestone_id)
    .eq("service_id", input.service_id)
    .maybeSingle();

  if (readErr || !milestone) return fail("مرحله پیدا نشد.");

  const { data: parent } = await service
    .from("gh_services")
    .select("id, workspace_id, status")
    .eq("id", input.service_id)
    .maybeSingle();
  if (!parent) return fail("خدمت پیدا نشد.");
  if (isTerminalServiceStatus(parent.status as GrowthHubServiceStatus) && input.status !== milestone.status) {
    return fail("خدمت تکمیل یا لغوشده است؛ مرحله قابل تغییر نیست.");
  }

  // Cross-tenant guard: milestone.workspace must match parent.
  if (milestone.workspace_id !== parent.workspace_id) {
    return fail("مرحله متعلق به این خدمت نیست.");
  }

  const nextStatus = input.status as GrowthHubMilestoneStatus;
  const patch: Partial<GhServiceMilestoneRow> = {
    status: nextStatus,
    completed_at: nextStatus === "completed" ? new Date().toISOString() : null,
  };

  const { data: updated, error: updErr } = await service
    .from("gh_service_milestones")
    .update(patch)
    .eq("id", milestone.id)
    .eq("service_id", input.service_id)
    .eq("workspace_id", milestone.workspace_id)
    .select("*")
    .maybeSingle();

  if (updErr || !updated) {
    console.error("[gh/services] milestone", updErr?.message);
    return fail("به‌روزرسانی مرحله ناموفق بود.");
  }

  const { data: progress, error: progErr } = await service.rpc(
    "gh_recalc_service_progress",
    { p_service_id: input.service_id },
  );
  if (progErr) {
    console.error("[gh/services] progress", progErr.message);
  }

  let eventType = "milestone_started";
  if (nextStatus === "blocked") eventType = "milestone_blocked";
  if (nextStatus === "completed") eventType = "milestone_completed";
  if (
    milestone.status === "completed" &&
    nextStatus !== "completed"
  ) {
    eventType = "milestone_reopened";
  } else if (nextStatus === "in_progress") {
    eventType = "milestone_started";
  } else if (nextStatus === "pending" || nextStatus === "skipped") {
    eventType =
      milestone.status === "completed" ? "milestone_reopened" : "milestone_started";
  }

  await writeActivity(service, {
    workspaceId: milestone.workspace_id,
    entityType: "milestone",
    entityId: milestone.id,
    eventType,
    staffUserId,
    metadata: {
      service_id: input.service_id,
      from: milestone.status,
      to: nextStatus,
      client_visible: true,
    },
  });

  return {
    ok: true,
    data: { milestone: updated, progress: Number(progress ?? 0) },
  };
}

export async function listActiveTemplates(
  service: ServiceClient,
): Promise<GhServiceTemplateRow[]> {
  const { data } = await service
    .from("gh_service_templates")
    .select("*")
    .eq("is_active", true)
    .order("title", { ascending: true });
  return (data ?? []) as GhServiceTemplateRow[];
}

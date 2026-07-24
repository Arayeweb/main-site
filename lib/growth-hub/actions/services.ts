"use server";

import { revalidatePath } from "next/cache";
import {
  assertGrowthHubStaffAccess,
  GrowthHubStaffAuthError,
} from "@/lib/growth-hub/staffAuth";
import {
  createServiceFromTemplateSchema,
  updateMilestoneSchema,
  updateServiceSchema,
} from "@/lib/growth-hub/services/validation";
import {
  createServiceFromTemplate,
  updateMilestoneStatus,
  updateServiceFields,
} from "@/lib/growth-hub/services/mutations";

export type StaffServiceResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; stale?: boolean };

function authFail(error: unknown): StaffServiceResult<never> | null {
  if (error instanceof GrowthHubStaffAuthError) {
    return { ok: false, error: error.message };
  }
  return null;
}

export async function createServiceAction(
  input: unknown,
): Promise<StaffServiceResult<{ serviceId: string }>> {
  let access;
  try {
    access = assertGrowthHubStaffAccess();
  } catch (error) {
    return authFail(error) ?? (() => { throw error; })();
  }

  const parsed = createServiceFromTemplateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است." };
  }

  const result = await createServiceFromTemplate({
    service: access.service,
    staffUserId: access.staff.userId,
    input: parsed.data,
  });

  if (!result.ok) return result;

  revalidatePath("/admin/growth-hub/services");
  revalidatePath(`/admin/growth-hub/workspaces/${parsed.data.workspace_id}`);
  revalidatePath(`/admin/growth-hub/services/${result.data.serviceId}`);
  return result;
}

export async function updateServiceAction(
  input: unknown,
): Promise<StaffServiceResult<{ serviceId: string }>> {
  let access;
  try {
    access = assertGrowthHubStaffAccess();
  } catch (error) {
    return authFail(error) ?? (() => { throw error; })();
  }

  const parsed = updateServiceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است." };
  }

  const result = await updateServiceFields({
    service: access.service,
    staffUserId: access.staff.userId,
    input: parsed.data,
  });

  if (!result.ok) return result;

  revalidatePath(`/admin/growth-hub/services/${result.data.service.id}`);
  revalidatePath("/admin/growth-hub/services");
  revalidatePath(`/admin/growth-hub/workspaces/${result.data.service.workspace_id}`);
  return { ok: true, data: { serviceId: result.data.service.id } };
}

export async function updateMilestoneAction(
  input: unknown,
): Promise<StaffServiceResult<{ progress: number }>> {
  let access;
  try {
    access = assertGrowthHubStaffAccess();
  } catch (error) {
    return authFail(error) ?? (() => { throw error; })();
  }

  const parsed = updateMilestoneSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است." };
  }

  const result = await updateMilestoneStatus({
    service: access.service,
    staffUserId: access.staff.userId,
    input: parsed.data,
  });

  if (!result.ok) return result;

  revalidatePath(`/admin/growth-hub/services/${parsed.data.service_id}`);
  return { ok: true, data: { progress: result.data.progress } };
}

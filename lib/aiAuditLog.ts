import type { SupabaseClient } from "@supabase/supabase-js";

export async function logAiAdminAction(
  supabase: SupabaseClient,
  params: {
    adminId: string;
    adminRole: string;
    adminName?: string | null;
    action: string;
    entityType?: string;
    entityId?: string;
    meta?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await supabase.from("ai_admin_audit_log").insert({
      admin_id: params.adminId,
      admin_name: params.adminName ?? null,
      admin_role: params.adminRole,
      action: params.action,
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
      meta: params.meta ?? {},
    });
  } catch (e) {
    console.error("[aiAuditLog] failed:", e);
  }
}

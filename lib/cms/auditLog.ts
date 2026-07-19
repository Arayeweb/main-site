import type { SupabaseClient } from '@supabase/supabase-js';

export async function logCmsAudit(
  supabase: SupabaseClient,
  params: {
    actorId: string | null;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await supabase.from('cms_audit_logs').insert({
      actor_id: params.actorId,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      metadata: params.metadata ?? {},
    });
  } catch (e) {
    console.error('[cms/audit]', e);
  }
}

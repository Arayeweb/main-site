import type { SupabaseClient } from '@supabase/supabase-js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseUuid(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return UUID_RE.test(s) ? s : null;
}

/** Update lead CRM status and append activity log (best-effort). */
export async function syncLeadStatus(
  supabase: SupabaseClient,
  leadId: string,
  status: string,
  authorRole: string,
  authorUserId: string,
  activityBody: string
) {
  const { error } = await supabase
    .from('leads')
    .update({ crm_status: status, crm_updated_at: new Date().toISOString() })
    .eq('id', leadId);
  if (error) {
    console.error('[crmWorkflow] lead status update failed:', error.message);
    return;
  }
  await supabase.from('lead_activities').insert({
    lead_id: leadId,
    author_id: authorUserId === 'admin' ? null : parseUuid(authorUserId),
    author_name: authorRole === 'admin' ? 'مدیر' : authorRole === 'sales' ? 'فروش' : 'سیستم',
    kind: 'status_change',
    body: activityBody,
  });
}

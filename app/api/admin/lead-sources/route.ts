import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { resolveSourceLabel } from '@/lib/adminMappers';
import { dbError, requireSession, unauthorized } from '@/lib/adminRouteHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// آمار تجمیعی منابع لید از جدول leads
export async function GET(req: NextRequest) {
  if (!requireSession(req)) return unauthorized();

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('leads').select('source, crm_status, created_at');
    if (error) return dbError(error.message);

    const map = new Map<string, {
      source: string;
      leads: number;
      qualifiedLeads: number;
      seriousTalks: number;
      proposals: number;
      sales: number;
      revenue: number;
    }>();

    for (const row of data ?? []) {
      const source = (row.source as string) || 'other';
      const status = (row.crm_status as string) || 'new';
      const entry = map.get(source) ?? {
        source,
        leads: 0,
        qualifiedLeads: 0,
        seriousTalks: 0,
        proposals: 0,
        sales: 0,
        revenue: 0,
      };
      entry.leads++;
      if (['qualified', 'proposal', 'won'].includes(status)) entry.qualifiedLeads++;
      if (['proposal', 'won', 'contacted'].includes(status)) entry.seriousTalks++;
      if (status === 'proposal') entry.proposals++;
      if (status === 'won') {
        entry.sales++;
        entry.revenue += 30000000;
      }
      map.set(source, entry);
    }

    const sources = Array.from(map.values())
      .map((s) => ({
        ...s,
        label: resolveSourceLabel(s.source),
        conversionRate: s.leads > 0 ? Math.round((s.sales / s.leads) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({ ok: true, sources });
  } catch (e) {
    return dbError(String(e));
  }
}

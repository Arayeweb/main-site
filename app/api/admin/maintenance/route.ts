import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  dbError,
  isMissingTableError,
  normDate,
  num,
  requireAdmin,
  requireSession,
  str,
  unauthorized,
} from '@/lib/adminRouteHelpers';
import { serverDebugLog } from '@/lib/debugLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLAN_TYPES = new Set([
  'basic_support', 'pro_support', 'monthly_seo', 'monthly_ai', 'monthly_crm', 'custom',
]);
const SUPPORT_STATUSES = new Set(['active', 'pending_payment', 'expired', 'cancelled']);
const PAYMENT_STATUSES = new Set(['paid', 'pending', 'overdue']);

export async function GET(req: NextRequest) {
  if (!requireSession(req)) return unauthorized();

  const id = req.nextUrl.searchParams.get('id');
  const summary = req.nextUrl.searchParams.get('summary');

  try {
    const supabase = getSupabaseAdmin();

    if (summary) {
      const { data, error } = await supabase.from('crm_maintenance_plans').select('monthly_fee, support_status, renewal_date, payment_status');
      if (error) {
        if (isMissingTableError(error.message)) {
          serverDebugLog('api/admin/maintenance:GET', 'missing_table', { mode: 'summary' }, 'H5');
          return NextResponse.json({
            ok: true,
            summary: { mrr: 0, active_count: 0, upcoming_renewals: 0, overdue_payments: 0 },
          });
        }
        return dbError(error.message);
      }
      const rows = data ?? [];
      const active = rows.filter((r) => r.support_status === 'active');
      const mrr = active.reduce((s, r) => s + (Number(r.monthly_fee) || 0), 0);
      const today = new Date().toISOString().slice(0, 10);
      const monthEnd = new Date();
      monthEnd.setDate(monthEnd.getDate() + 30);
      const upcoming = active.filter((r) => {
        if (!r.renewal_date) return false;
        return String(r.renewal_date) <= monthEnd.toISOString().slice(0, 10);
      });
      const overdue = rows.filter((r) => r.payment_status === 'overdue').length;
      return NextResponse.json({
        ok: true,
        summary: { mrr, active_count: active.length, upcoming_renewals: upcoming.length, overdue_payments: overdue },
      });
    }

    if (id) {
      const { data, error } = await supabase.from('crm_maintenance_plans').select('*').eq('id', id).maybeSingle();
      if (error) {
        if (isMissingTableError(error.message)) {
          serverDebugLog('api/admin/maintenance:GET', 'missing_table', { mode: 'by_id' }, 'H5');
          return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
        }
        return dbError(error.message);
      }
      if (!data) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
      return NextResponse.json({ ok: true, plan: data });
    }

    const { data, error } = await supabase
      .from('crm_maintenance_plans')
      .select('*')
      .order('renewal_date', { ascending: true })
      .limit(500);

    if (error) {
      if (isMissingTableError(error.message)) {
        serverDebugLog('api/admin/maintenance:GET', 'missing_table', { mode: 'list' }, 'H5');
        return NextResponse.json({ ok: true, plans: [] });
      }
      return dbError(error.message);
    }
    serverDebugLog('api/admin/maintenance:GET', 'success', { count: data?.length ?? 0 }, 'H1');
    return NextResponse.json({ ok: true, plans: data ?? [] });
  } catch (e) {
    return dbError(String(e));
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const client_name = str(body.client_name, 200);
  if (!client_name) return NextResponse.json({ ok: false, error: 'missing_client' }, { status: 422 });

  const plan_type = str(body.plan_type, 50);
  const row = {
    client_id: str(body.client_id, 64),
    client_name,
    plan_type: plan_type && PLAN_TYPES.has(plan_type) ? plan_type : 'basic_support',
    monthly_fee: num(body.monthly_fee),
    start_date: normDate(body.start_date),
    renewal_date: normDate(body.renewal_date),
    payment_status: 'pending',
    support_status: 'active',
    included_services: Array.isArray(body.included_services) ? body.included_services : [],
    project_id: str(body.project_id, 64),
    upsell_opportunities: Array.isArray(body.upsell_opportunities) ? body.upsell_opportunities : [],
  };

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('crm_maintenance_plans').insert(row).select().single();
    if (error) return dbError(error.message);
    return NextResponse.json({ ok: true, plan: data });
  } catch (e) {
    return dbError(String(e));
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const id = str(body.id, 64);
  if (!id) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 422 });

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if ('monthly_fee' in body) patch.monthly_fee = num(body.monthly_fee);
  if ('renewal_date' in body) patch.renewal_date = normDate(body.renewal_date);
  if ('support_status' in body) {
    const s = str(body.support_status, 30);
    if (s && SUPPORT_STATUSES.has(s)) patch.support_status = s;
  }
  if ('payment_status' in body) {
    const p = str(body.payment_status, 30);
    if (p && PAYMENT_STATUSES.has(p)) patch.payment_status = p;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('crm_maintenance_plans').update(patch).eq('id', id).select().maybeSingle();
    if (error) return dbError(error.message);
    if (!data) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    return NextResponse.json({ ok: true, plan: data });
  } catch (e) {
    return dbError(String(e));
  }
}

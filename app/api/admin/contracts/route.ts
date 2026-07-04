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

const CONTRACT_TYPES = new Set([
  'website_design', 'custom_software', 'maintenance', 'seo', 'ai_chatbot', 'crm_dashboard', 'feature_development',
]);
const SIGNATURE_STATUSES = new Set([
  'draft', 'sent', 'awaiting_signature', 'signed', 'active', 'completed', 'cancelled',
]);
const PAYMENT_STATUSES = new Set(['unpaid', 'partial', 'paid', 'overdue']);

async function nextContractNumber(): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('crm_contracts')
    .select('contract_number')
    .like('contract_number', 'CNT-%')
    .order('created_at', { ascending: false })
    .limit(1);
  if (!data?.length) return 'CNT-1403-001';
  const last = data[0].contract_number as string;
  const n = parseInt(last.split('-').pop() || '0', 10);
  return `CNT-1403-${String(n + 1).padStart(3, '0')}`;
}

export async function GET(req: NextRequest) {
  if (!requireSession(req)) return unauthorized();

  const id = req.nextUrl.searchParams.get('id');
  const clientId = req.nextUrl.searchParams.get('client_id');
  const projectId = req.nextUrl.searchParams.get('project_id');

  try {
    const supabase = getSupabaseAdmin();

    if (id) {
      const { data, error } = await supabase.from('crm_contracts').select('*').eq('id', id).maybeSingle();
      if (error) {
        if (isMissingTableError(error.message)) {
          serverDebugLog('api/admin/contracts:GET', 'missing_table', { mode: 'by_id' }, 'H5');
          return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
        }
        return dbError(error.message);
      }
      if (!data) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
      return NextResponse.json({ ok: true, contract: data });
    }

    let q = supabase.from('crm_contracts').select('*').order('created_at', { ascending: false }).limit(500);
    if (clientId) q = q.eq('client_id', clientId);
    if (projectId) q = q.eq('project_id', projectId);

    const { data, error } = await q;
    if (error) {
      if (isMissingTableError(error.message)) {
        serverDebugLog('api/admin/contracts:GET', 'missing_table', { mode: 'list' }, 'H5');
        return NextResponse.json({ ok: true, contracts: [] });
      }
      return dbError(error.message);
    }
    serverDebugLog('api/admin/contracts:GET', 'success', { count: data?.length ?? 0 }, 'H1');
    return NextResponse.json({ ok: true, contracts: data ?? [] });
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

  const contract_type = str(body.contract_type, 50);
  const signature_status = str(body.signature_status, 30);

  const row = {
    contract_number: str(body.contract_number, 50) || (await nextContractNumber()),
    client_id: str(body.client_id, 64),
    client_name,
    contract_type: contract_type && CONTRACT_TYPES.has(contract_type) ? contract_type : 'website_design',
    amount: num(body.amount),
    start_date: normDate(body.start_date),
    end_date: normDate(body.end_date),
    signature_status: signature_status && SIGNATURE_STATUSES.has(signature_status) ? signature_status : 'draft',
    payment_status: 'unpaid',
    scope_of_work: str(body.scope_of_work, 8000),
    deliverables: Array.isArray(body.deliverables) ? body.deliverables : [],
    payment_terms: str(body.payment_terms, 2000),
    support_terms: str(body.support_terms, 2000),
    project_id: str(body.project_id, 64),
    notes: str(body.notes, 4000),
  };

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('crm_contracts').insert(row).select().single();
    if (error) return dbError(error.message);
    return NextResponse.json({ ok: true, contract: data });
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
  if ('amount' in body) patch.amount = num(body.amount);
  if ('scope_of_work' in body) patch.scope_of_work = str(body.scope_of_work, 8000);
  if ('payment_terms' in body) patch.payment_terms = str(body.payment_terms, 2000);
  if ('support_terms' in body) patch.support_terms = str(body.support_terms, 2000);
  if ('notes' in body) patch.notes = str(body.notes, 4000);
  if ('deliverables' in body && Array.isArray(body.deliverables)) patch.deliverables = body.deliverables;
  if ('signature_status' in body) {
    const s = str(body.signature_status, 30);
    if (s && SIGNATURE_STATUSES.has(s)) patch.signature_status = s;
  }
  if ('payment_status' in body) {
    const p = str(body.payment_status, 30);
    if (p && PAYMENT_STATUSES.has(p)) patch.payment_status = p;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('crm_contracts').update(patch).eq('id', id).select().maybeSingle();
    if (error) return dbError(error.message);
    if (!data) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    return NextResponse.json({ ok: true, contract: data });
  } catch (e) {
    return dbError(String(e));
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  bool,
  dbError,
  isMissingTableError,
  num,
  requireAdmin,
  requireSession,
  str,
  unauthorized,
} from '@/lib/adminRouteHelpers';
import { serverDebugLog } from '@/lib/debugLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REQUEST_TYPES = new Set([
  'text_change', 'design_change', 'add_page', 'add_feature', 'bug_fix', 'form_change', 'seo_change', 'other',
]);
const STATUSES = new Set([
  'new', 'reviewing', 'needs_client_approval', 'approved', 'in_progress', 'done', 'rejected',
]);
const APPROVALS = new Set(['pending', 'approved', 'rejected', 'not_required']);

export async function GET(req: NextRequest) {
  if (!requireSession(req)) return unauthorized();

  const id = req.nextUrl.searchParams.get('id');
  const status = req.nextUrl.searchParams.get('status');

  try {
    const supabase = getSupabaseAdmin();

    if (id) {
      const { data, error } = await supabase.from('crm_change_requests').select('*').eq('id', id).maybeSingle();
      if (error) {
        if (isMissingTableError(error.message)) {
          serverDebugLog('api/admin/change-requests:GET', 'missing_table', { mode: 'by_id' }, 'H5');
          return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
        }
        return dbError(error.message);
      }
      if (!data) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
      return NextResponse.json({ ok: true, change_request: data });
    }

    let q = supabase.from('crm_change_requests').select('*').order('created_at', { ascending: false }).limit(500);
    if (status && STATUSES.has(status)) q = q.eq('status', status);

    const { data, error } = await q;
    if (error) {
      if (isMissingTableError(error.message)) {
        serverDebugLog('api/admin/change-requests:GET', 'missing_table', { mode: 'list' }, 'H5');
        return NextResponse.json({ ok: true, change_requests: [] });
      }
      return dbError(error.message);
    }
    serverDebugLog('api/admin/change-requests:GET', 'success', { count: data?.length ?? 0 }, 'H1');
    return NextResponse.json({ ok: true, change_requests: data ?? [] });
  } catch (e) {
    return dbError(String(e));
  }
}

export async function POST(req: NextRequest) {
  if (!requireSession(req)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const title = str(body.title, 300);
  const client_name = str(body.client_name, 200);
  if (!title || !client_name) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 422 });
  }

  const request_type = str(body.request_type, 50);
  const row = {
    title,
    description: str(body.description, 4000),
    client_id: str(body.client_id, 64),
    client_name,
    project_id: str(body.project_id, 64),
    project_name: str(body.project_name, 300),
    request_type: request_type && REQUEST_TYPES.has(request_type) ? request_type : 'other',
    status: 'new',
    cost: num(body.cost),
    assigned_to: str(body.assigned_to, 100),
    included_in_contract: bool(body.included_in_contract),
    is_paid: bool(body.is_paid),
    estimated_cost: num(body.estimated_cost),
    estimated_time: str(body.estimated_time, 100),
    customer_approval: 'pending',
  };

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('crm_change_requests').insert(row).select().single();
    if (error) return dbError(error.message);
    return NextResponse.json({ ok: true, change_request: data });
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
  if ('status' in body) {
    const s = str(body.status, 30);
    if (s && STATUSES.has(s)) patch.status = s;
  }
  if ('assigned_to' in body) patch.assigned_to = str(body.assigned_to, 100);
  if ('cost' in body) patch.cost = num(body.cost);
  if ('estimated_cost' in body) patch.estimated_cost = num(body.estimated_cost);
  if ('customer_approval' in body) {
    const a = str(body.customer_approval, 30);
    if (a && APPROVALS.has(a)) patch.customer_approval = a;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('crm_change_requests').update(patch).eq('id', id).select().maybeSingle();
    if (error) return dbError(error.message);
    if (!data) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    return NextResponse.json({ ok: true, change_request: data });
  } catch (e) {
    return dbError(String(e));
  }
}

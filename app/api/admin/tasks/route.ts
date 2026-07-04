import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  dbError,
  isMissingTableError,
  normDate,
  requireAdmin,
  requireSession,
  str,
  unauthorized,
} from '@/lib/adminRouteHelpers';
import { serverDebugLog } from '@/lib/debugLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATUSES = new Set(['todo', 'in_progress', 'waiting_client', 'needs_review', 'done']);
const PRIORITIES = new Set(['urgent', 'high', 'medium', 'low']);

export async function GET(req: NextRequest) {
  if (!requireSession(req)) return unauthorized();

  const id = req.nextUrl.searchParams.get('id');
  const status = req.nextUrl.searchParams.get('status');
  const due = req.nextUrl.searchParams.get('due');

  try {
    const supabase = getSupabaseAdmin();

    if (id) {
      const { data, error } = await supabase.from('crm_tasks').select('*').eq('id', id).maybeSingle();
      if (error) {
        if (isMissingTableError(error.message)) {
          serverDebugLog('api/admin/tasks:GET', 'missing_table', { mode: 'by_id' }, 'H5');
          return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
        }
        return dbError(error.message);
      }
      if (!data) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
      return NextResponse.json({ ok: true, task: data });
    }

    let q = supabase.from('crm_tasks').select('*').order('due_date', { ascending: true }).limit(500);
    if (status && STATUSES.has(status)) q = q.eq('status', status);
    if (due === 'today') {
      const today = new Date().toISOString().slice(0, 10);
      q = q.eq('due_date', today).neq('status', 'done');
    }
    if (due === 'overdue') {
      const today = new Date().toISOString().slice(0, 10);
      q = q.lt('due_date', today).neq('status', 'done');
    }
    if (due === 'waiting_client') q = q.eq('status', 'waiting_client');

    const { data, error } = await q;
    if (error) {
      if (isMissingTableError(error.message)) {
        serverDebugLog('api/admin/tasks:GET', 'missing_table', { mode: 'list' }, 'H5');
        return NextResponse.json({ ok: true, tasks: [] });
      }
      return dbError(error.message);
    }
    serverDebugLog('api/admin/tasks:GET', 'success', { count: data?.length ?? 0 }, 'H1');
    return NextResponse.json({ ok: true, tasks: data ?? [] });
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

  const title = str(body.title, 300);
  if (!title) return NextResponse.json({ ok: false, error: 'missing_title' }, { status: 422 });

  const priority = str(body.priority, 20);
  const status = str(body.status, 30);

  const row = {
    title,
    description: str(body.description, 4000),
    project_id: str(body.project_id, 64),
    client_id: str(body.client_id, 64),
    project_name: str(body.project_name, 300),
    client_name: str(body.client_name, 200),
    assigned_to: str(body.assigned_to, 100),
    priority: priority && PRIORITIES.has(priority) ? priority : 'medium',
    status: status && STATUSES.has(status) ? status : 'todo',
    due_date: normDate(body.due_date),
    checklist: Array.isArray(body.checklist) ? body.checklist : [],
  };

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('crm_tasks').insert(row).select().single();
    if (error) return dbError(error.message);
    return NextResponse.json({ ok: true, task: data });
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
  if ('title' in body) patch.title = str(body.title, 300);
  if ('description' in body) patch.description = str(body.description, 4000);
  if ('assigned_to' in body) patch.assigned_to = str(body.assigned_to, 100);
  if ('due_date' in body) patch.due_date = normDate(body.due_date);
  if ('checklist' in body && Array.isArray(body.checklist)) patch.checklist = body.checklist;
  if ('status' in body) {
    const s = str(body.status, 30);
    if (s && STATUSES.has(s)) patch.status = s;
  }
  if ('priority' in body) {
    const p = str(body.priority, 20);
    if (p && PRIORITIES.has(p)) patch.priority = p;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('crm_tasks').update(patch).eq('id', id).select().maybeSingle();
    if (error) return dbError(error.message);
    if (!data) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    return NextResponse.json({ ok: true, task: data });
  } catch (e) {
    return dbError(String(e));
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  dbError,
  normDate,
  num,
  requireRoles,
  requireSession,
  str,
  unauthorized,
} from '@/lib/adminRouteHelpers';
import type { AdminRole } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CLIENT_WRITE_ROLES: AdminRole[] = ['admin', 'sales'];

const CLIENT_TYPES = new Set([
  'doctor', 'clinic', 'service_company', 'online_store', 'art_brand', 'startup', 'b2b', 'other',
]);
const CLIENT_STATUSES = new Set([
  'lead', 'active_client', 'active_project', 'active_support', 'inactive', 'lost',
]);

export async function GET(req: NextRequest) {
  if (!requireSession(req)) return unauthorized();

  const id = req.nextUrl.searchParams.get('id');
  try {
    const supabase = getSupabaseAdmin();

    if (id) {
      const { data, error } = await supabase.from('crm_clients').select('*').eq('id', id).maybeSingle();
      if (error) return dbError(error.message);
      if (!data) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
      return NextResponse.json({ ok: true, client: data });
    }

    const { data, error } = await supabase
      .from('crm_clients')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(500);

    if (error) return dbError(error.message);
    return NextResponse.json({ ok: true, clients: data ?? [] });
  } catch (e) {
    return dbError(String(e));
  }
}

export async function POST(req: NextRequest) {
  if (!requireRoles(req, CLIENT_WRITE_ROLES)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const name = str(body.name, 200);
  if (!name) return NextResponse.json({ ok: false, error: 'missing_name' }, { status: 422 });

  const client_type = str(body.client_type, 50);
  const status = str(body.status, 50);

  const row = {
    name,
    client_type: client_type && CLIENT_TYPES.has(client_type) ? client_type : 'other',
    phone: str(body.phone, 50),
    email: str(body.email, 200),
    address: str(body.address, 500),
    city: str(body.city, 100),
    website: str(body.website, 300),
    instagram: str(body.instagram, 200),
    lead_source: str(body.lead_source, 100),
    sales_owner: str(body.sales_owner, 100),
    project_owner: str(body.project_owner, 100),
    status: status && CLIENT_STATUSES.has(status) ? status : 'active_client',
    internal_note: str(body.internal_note, 4000),
    total_revenue: num(body.total_revenue),
    last_contact_at: body.last_contact_at ? new Date(String(body.last_contact_at)).toISOString() : new Date().toISOString(),
  };

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('crm_clients').insert(row).select().single();
    if (error) return dbError(error.message);
    return NextResponse.json({ ok: true, client: data });
  } catch (e) {
    return dbError(String(e));
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireRoles(req, CLIENT_WRITE_ROLES)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const id = str(body.id, 64);
  if (!id) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 422 });

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if ('name' in body) patch.name = str(body.name, 200);
  if ('client_type' in body) {
    const t = str(body.client_type, 50);
    if (t && CLIENT_TYPES.has(t)) patch.client_type = t;
  }
  if ('status' in body) {
    const s = str(body.status, 50);
    if (s && CLIENT_STATUSES.has(s)) patch.status = s;
  }
  for (const key of ['phone', 'email', 'address', 'city', 'website', 'instagram', 'lead_source', 'sales_owner', 'project_owner', 'internal_note'] as const) {
    if (key in body) patch[key] = str(body[key], 500);
  }
  if ('total_revenue' in body) patch.total_revenue = num(body.total_revenue);
  if ('last_contact_at' in body) {
    const d = normDate(body.last_contact_at);
    if (d) patch.last_contact_at = new Date(d).toISOString();
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('crm_clients').update(patch).eq('id', id).select().maybeSingle();
    if (error) return dbError(error.message);
    if (!data) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    return NextResponse.json({ ok: true, client: data });
  } catch (e) {
    return dbError(String(e));
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireRoles(req, CLIENT_WRITE_ROLES)) return unauthorized();

  const id = str(req.nextUrl.searchParams.get('id'), 64);
  if (!id) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 422 });

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('crm_clients')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();
    if (error) return dbError(error.message);
    if (!data) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    return NextResponse.json({ ok: true, id: data.id });
  } catch (e) {
    return dbError(String(e));
  }
}

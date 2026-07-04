import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { DEFAULT_COMPANY_SETTINGS } from '@/lib/adminTypes';
import { dbError, requireAdmin, requireSession, unauthorized } from '@/lib/adminRouteHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!requireSession(req)) return unauthorized();

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('company_settings').select('data, updated_at').eq('id', 1).maybeSingle();
    if (error) return dbError(error.message);

    const stored = (data?.data as Record<string, unknown>) ?? {};
    const settings = {
      ...DEFAULT_COMPANY_SETTINGS,
      ...stored,
      company: { ...DEFAULT_COMPANY_SETTINGS.company, ...(stored.company as object) },
      bank: { ...DEFAULT_COMPANY_SETTINGS.bank, ...(stored.bank as object) },
      invoice: { ...DEFAULT_COMPANY_SETTINGS.invoice, ...(stored.invoice as object) },
      defaults: { ...DEFAULT_COMPANY_SETTINGS.defaults, ...(stored.defaults as object) },
    };

    const { data: users } = await supabase.from('admin_users').select('role').eq('is_active', true);
    const roleCounts: Record<string, number> = {};
    for (const u of users ?? []) {
      roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
    }
    settings.roles = DEFAULT_COMPANY_SETTINGS.roles.map((r) => ({
      ...r,
      count: roleCounts[r.role === 'manager' ? 'admin' : r.role] ?? 0,
    }));

    return NextResponse.json({ ok: true, settings, updated_at: data?.updated_at });
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

  try {
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase.from('company_settings').select('data').eq('id', 1).maybeSingle();
    const current = (existing?.data as Record<string, unknown>) ?? {};
    const merged = { ...current, ...body };

    const { data, error } = await supabase
      .from('company_settings')
      .upsert({ id: 1, data: merged, updated_at: new Date().toISOString() })
      .select('data, updated_at')
      .single();

    if (error) return dbError(error.message);
    return NextResponse.json({ ok: true, settings: data?.data, updated_at: data?.updated_at });
  } catch (e) {
    return dbError(String(e));
  }
}

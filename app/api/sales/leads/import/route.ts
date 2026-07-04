import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getSession, type AdminRole } from '@/lib/auth';
import { normalizeContact } from '@/lib/validateContact';
import { agentDebugLog } from '@/lib/agentDebug';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SALES_ROLES: AdminRole[] = ['sales', 'admin'];

function salesSession(req: NextRequest) {
  const session = getSession(req);
  if (!session || !SALES_ROLES.includes(session.role)) return null;
  return session;
}

function unauthorized() {
  return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
}

function str(v: unknown, max = 500): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

export async function POST(req: NextRequest) {
  const session = salesSession(req);
  if (!session) return unauthorized();

  let body: { rows?: Record<string, unknown>[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const rows = Array.isArray(body.rows) ? body.rows : [];
  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: 'empty_rows' }, { status: 422 });
  }
  if (rows.length > 500) {
    return NextResponse.json({ ok: false, error: 'too_many_rows' }, { status: 422 });
  }

  const supabase = getSupabaseAdmin();
  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rawContact = str(row.contact ?? row.phone ?? row.mobile, 200);
    if (!rawContact) {
      failed++;
      errors.push(`ردیف ${i + 1}: تماس خالی`);
      continue;
    }
    const { kind, value } = normalizeContact(rawContact);
    if (kind === 'invalid') {
      failed++;
      errors.push(`ردیف ${i + 1}: تماس نامعتبر`);
      continue;
    }

    const insert = {
      source: str(row.source, 120) || 'csv_import',
      name: str(row.name, 200),
      company: str(row.company ?? row.business, 200),
      contact: value,
      goal: str(row.goal ?? row.need, 500),
      budget: str(row.budget, 64),
      plan: str(row.plan, 120),
      channel: str(row.channel, 120),
      crm_status: 'new' as const,
      crm_note: str(row.note ?? row.crm_note, 1000),
      crm_updated_at: new Date().toISOString(),
      consent: true,
    };

    const { data, error } = await supabase.from('leads').insert(insert).select('id').single();
    if (error) {
      failed++;
      errors.push(`ردیف ${i + 1}: ${error.message}`);
      continue;
    }
    imported++;
    await supabase.from('lead_activities').insert({
      lead_id: data.id,
      author_name: session.role === 'admin' ? 'مدیر' : 'فروش',
      kind: 'note',
      body: 'لید از فایل CSV/XLSX وارد شد',
    });
  }

  agentDebugLog(
    'app/api/sales/leads/import/route.ts:POST',
    'leads_import_done',
    { imported, failed, total: rows.length },
    'H2',
    'post-fix'
  );

  return NextResponse.json({ ok: true, imported, failed, errors: errors.slice(0, 20) });
}

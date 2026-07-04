import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 });
  }

  // Fetch fresh user details
  const supabase = getSupabaseAdmin();
  const { data: user, error } = await supabase
    .from('admin_users')
    .select('id, name, email, role, is_active')
    .eq('id', session.userId)
    .single();

  if (error || !user || !user.is_active) {
    return NextResponse.json({ ok: false, error: 'user_not_found' }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    exp: session.exp,
  });
}

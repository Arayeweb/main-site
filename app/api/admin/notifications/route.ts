import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { dbError, isMissingTableError, requireSession, unauthorized } from '@/lib/adminRouteHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface AdminNotificationRow {
  id: string;
  type: 'ticket' | 'task' | 'lead' | 'invoice' | 'change_request';
  title: string;
  description: string;
  href: string;
  created_at: string;
}

export async function GET(req: NextRequest) {
  const session = requireSession(req);
  if (!session) return unauthorized();

  const today = new Date().toISOString().slice(0, 10);
  const notifications: AdminNotificationRow[] = [];

  try {
    const supabase = getSupabaseAdmin();

    if (session.role === 'admin' || session.role === 'support') {
      const { data: tickets, error: ticketErr } = await supabase
        .from('support_tickets')
        .select('id, subject, priority, status, created_at, ticket_code')
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(8);

      if (ticketErr && !isMissingTableError(ticketErr.message)) return dbError(ticketErr.message);

      for (const t of tickets ?? []) {
        notifications.push({
          id: `ticket-${t.id}`,
          type: 'ticket',
          title: t.priority === 'urgent' ? 'تیکت فوری' : 'تیکت باز',
          description: `${t.ticket_code} · ${t.subject}`,
          href: '/admin/support/tickets',
          created_at: t.created_at,
        });
      }
    }

    if (session.role === 'admin' || session.role === 'sales') {
      const { data: leads, error: leadErr } = await supabase
        .from('leads')
        .select('id, name, contact, next_followup_at, crm_status')
        .not('next_followup_at', 'is', null)
        .lte('next_followup_at', `${today}T23:59:59`)
        .not('crm_status', 'in', '("won","lost")')
        .order('next_followup_at', { ascending: true })
        .limit(8);

      if (leadErr && !isMissingTableError(leadErr.message)) return dbError(leadErr.message);

      for (const l of leads ?? []) {
        notifications.push({
          id: `lead-${l.id}`,
          type: 'lead',
          title: 'پیگیری سررسید',
          description: `${l.name ?? 'بدون نام'} · ${l.contact}`,
          href: '/admin/sales/followups',
          created_at: l.next_followup_at ?? new Date().toISOString(),
        });
      }

      const { data: invoices, error: invErr } = await supabase
        .from('invoices')
        .select('id, invoice_number, customer_name, status, due_date, created_at')
        .eq('status', 'sent')
        .lte('due_date', today)
        .order('due_date', { ascending: true })
        .limit(5);

      if (invErr && !isMissingTableError(invErr.message)) return dbError(invErr.message);

      for (const inv of invoices ?? []) {
        notifications.push({
          id: `invoice-${inv.id}`,
          type: 'invoice',
          title: 'فاکتور معوقه',
          description: `${inv.invoice_number} · ${inv.customer_name}`,
          href: '/admin/manager/payments',
          created_at: inv.due_date ?? inv.created_at,
        });
      }
    }

    if (session.role === 'admin') {
      const { data: tasks, error: taskErr } = await supabase
        .from('crm_tasks')
        .select('id, title, due_date, status, created_at, client_name')
        .neq('status', 'done')
        .not('due_date', 'is', null)
        .lte('due_date', today)
        .order('due_date', { ascending: true })
        .limit(6);

      if (taskErr && !isMissingTableError(taskErr.message)) return dbError(taskErr.message);

      for (const task of tasks ?? []) {
        notifications.push({
          id: `task-${task.id}`,
          type: 'task',
          title: 'تسک سررسید گذشته',
          description: `${task.title}${task.client_name ? ` · ${task.client_name}` : ''}`,
          href: `/admin/manager/tasks/${task.id}`,
          created_at: task.due_date ?? task.created_at,
        });
      }

      const { data: crs, error: crErr } = await supabase
        .from('crm_change_requests')
        .select('id, title, status, created_at, client_name')
        .in('status', ['new', 'reviewing', 'needs_client_approval'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (crErr && !isMissingTableError(crErr.message)) return dbError(crErr.message);

      for (const cr of crs ?? []) {
        notifications.push({
          id: `cr-${cr.id}`,
          type: 'change_request',
          title: 'درخواست تغییر جدید',
          description: `${cr.title} · ${cr.client_name}`,
          href: '/admin/manager/change-requests',
          created_at: cr.created_at,
        });
      }
    }

    notifications.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({
      ok: true,
      notifications: notifications.slice(0, 12),
      unread_count: notifications.length,
    });
  } catch (e) {
    return dbError(String(e));
  }
}

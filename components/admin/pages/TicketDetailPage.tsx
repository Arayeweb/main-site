'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { Ticket, ArrowRight } from 'lucide-react';
import { fetchTicketById, updateTicket } from '@/lib/adminApi';
import {
  API_TICKET_CATEGORY_LABELS,
  API_TICKET_PRIORITY_COLORS,
  API_TICKET_PRIORITY_LABELS,
  API_TICKET_STATUS_COLORS,
  API_TICKET_STATUS_LABELS,
  formatFaDateTime,
  mapTicketRow,
} from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';

interface TicketDetailPageProps {
  id: string;
  backHref: string;
  panelLabel: string;
}

export function TicketDetailPage({ id, backHref, panelLabel }: TicketDetailPageProps) {
  const [busy, setBusy] = useState(false);
  const { data, loading, error, refetch } = useAdminFetch(() => fetchTicketById(id), [id]);
  const ticket = useMemo(() => (data?.ticket ? mapTicketRow(data.ticket) : null), [data]);
  const raw = data?.ticket;

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  if (!ticket || !raw) {
    return (
      <div className="text-center py-20 text-slate-500" dir="rtl">
        <p>تیکت یافت نشد</p>
        <Link href={backHref} className="text-blue-600 text-sm mt-2 inline-block">بازگشت</Link>
      </div>
    );
  }

  async function patch(body: Record<string, string>) {
    setBusy(true);
    try {
      const res = await updateTicket(id, body);
      if (!res.ok) alert(res.error);
      else refetch();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title={ticket.title}
        description={`${ticket.code} · ${ticket.client}`}
        icon={Ticket}
        breadcrumb={[{ label: panelLabel }, { label: 'تیکت‌ها', href: backHref }, { label: ticket.code }]}
        actions={
          <Link href={backHref} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
            <ArrowRight className="w-4 h-4" />
            بازگشت
          </Link>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              label={API_TICKET_PRIORITY_LABELS[ticket.priority] ?? ticket.priority}
              colorClass={API_TICKET_PRIORITY_COLORS[ticket.priority] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}
            />
            <StatusBadge
              label={API_TICKET_STATUS_LABELS[ticket.status] ?? ticket.status}
              colorClass={API_TICKET_STATUS_COLORS[ticket.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}
            />
            <span className="text-xs text-slate-500 self-center">
              {API_TICKET_CATEGORY_LABELS[ticket.category] ?? ticket.category}
            </span>
          </div>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{raw.message || '—'}</p>
          <p className="text-xs text-slate-400">ایجاد: {formatFaDateTime(raw.created_at)} · بروزرسانی: {formatFaDateTime(raw.updated_at)}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">عملیات</h3>
          <Field label="وضعیت">
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              value={ticket.status}
              disabled={busy}
              onChange={(e) => void patch({ status: e.target.value })}
            >
              {Object.entries(API_TICKET_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="اولویت">
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              value={ticket.priority}
              disabled={busy}
              onChange={(e) => void patch({ priority: e.target.value })}
            >
              {Object.entries(API_TICKET_PRIORITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
          <div className="text-sm space-y-1 pt-2 border-t border-slate-100">
            <p><span className="text-slate-400">مشتری: </span>{ticket.client}</p>
            {raw.customer_contact && <p dir="ltr"><span className="text-slate-400">تماس: </span>{raw.customer_contact}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

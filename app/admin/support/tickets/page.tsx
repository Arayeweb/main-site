'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { SearchInput } from '@/components/admin/ui/SearchInput';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { ActionMenu } from '@/components/admin/ui/ActionMenu';
import { Ticket, Plus } from 'lucide-react';
import { createTicket, fetchTickets } from '@/lib/adminApi';
import {
  API_TICKET_CATEGORY_LABELS,
  API_TICKET_PRIORITY_COLORS,
  API_TICKET_PRIORITY_LABELS,
  API_TICKET_STATUS_COLORS,
  API_TICKET_STATUS_LABELS,
  mapTicketRow,
} from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';

export default function TicketsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const { data, loading, error, refetch } = useAdminFetch(
    () => fetchTickets(statusFilter === 'all' ? {} : { status: statusFilter }),
    [statusFilter]
  );

  const tickets = useMemo(() => (data?.tickets ?? []).map(mapTicketRow), [data]);

  const filtered = tickets.filter((t) => {
    const matchSearch = !search || t.title.includes(search) || t.client.includes(search);
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="تیکت‌ها"
        description="مدیریت کامل تیکت‌های پشتیبانی"
        icon={Ticket}
        breadcrumb={[{ label: 'پشتیبانی' }, { label: 'تیکت‌ها' }]}
        actions={
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            تیکت جدید
          </button>
        }
      />

      {showForm && (
        <form
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-3 max-w-xl"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const res = await createTicket({
              subject,
              customer_name: customerName || undefined,
              customer_contact: customerContact || undefined,
              message: message || undefined,
            });
            setBusy(false);
            if (!res.ok) {
              alert(res.error);
              return;
            }
            setShowForm(false);
            setSubject('');
            setCustomerName('');
            setCustomerContact('');
            setMessage('');
            refetch();
            if (res.data?.ticket.id) {
              router.push(`/admin/support/tickets/${res.data.ticket.id}`);
            }
          }}
        >
          <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="موضوع تیکت" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="نام مشتری" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="تماس مشتری" value={customerContact} onChange={(e) => setCustomerContact(e.target.value)} dir="ltr" />
          <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[80px]" placeholder="پیام" value={message} onChange={(e) => setMessage(e.target.value)} />
          <button type="submit" disabled={busy} className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60">
            {busy ? 'در حال ذخیره...' : 'ثبت تیکت'}
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-52">
              <SearchInput value={search} onChange={setSearch} placeholder="جستجوی تیکت..." />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              dir="rtl"
            >
              <option value="all">همه وضعیت‌ها</option>
              {Object.entries(API_TICKET_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              dir="rtl"
            >
              <option value="all">همه اولویت‌ها</option>
              {Object.entries(API_TICKET_PRIORITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <span className="text-xs text-slate-500">{filtered.length} تیکت</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]" dir="rtl">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {['عنوان', 'مشتری', 'اولویت', 'وضعیت', 'دسته‌بندی', 'ایجاد شده', 'آخرین بروزرسانی', ''].map((h) => (
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/support/tickets/${ticket.id}`)}
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-800">{ticket.title}</p>
                      <p className="text-xs text-slate-400 font-mono">{ticket.code}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{ticket.client}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge
                        label={API_TICKET_PRIORITY_LABELS[ticket.priority] ?? ticket.priority}
                        colorClass={API_TICKET_PRIORITY_COLORS[ticket.priority] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge
                        label={API_TICKET_STATUS_LABELS[ticket.status] ?? ticket.status}
                        colorClass={API_TICKET_STATUS_COLORS[ticket.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {API_TICKET_CATEGORY_LABELS[ticket.category] ?? ticket.category}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums">{ticket.createdAt}</td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums text-xs">{ticket.lastUpdated}</td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <ActionMenu actions={[{ label: 'مشاهده', onClick: () => router.push(`/admin/support/tickets/${ticket.id}`) }]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

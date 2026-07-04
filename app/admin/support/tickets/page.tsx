'use client';

import { useMemo, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { SearchInput } from '@/components/admin/ui/SearchInput';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { Ticket, MoreHorizontal, Plus } from 'lucide-react';
import { fetchTickets } from '@/lib/adminApi';
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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const { data, loading, error } = useAdminFetch(
    () => fetchTickets(statusFilter === 'all' ? undefined : statusFilter),
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
          <button className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            <Plus className="w-4 h-4" />
            تیکت جدید
          </button>
        }
      />

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
                  <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
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
                    <td className="px-4 py-3.5">
                      <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
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

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { StatCard } from '@/components/admin/ui/StatCard';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import {
  Headphones, Ticket, AlertTriangle, GitPullRequest, FolderOpen, Wrench, Calendar,
} from 'lucide-react';
import { fetchProjects, fetchTickets } from '@/lib/adminApi';
import {
  API_TICKET_CATEGORY_LABELS,
  API_TICKET_PRIORITY_COLORS,
  API_TICKET_PRIORITY_LABELS,
  API_TICKET_STATUS_COLORS,
  API_TICKET_STATUS_LABELS,
  mapTicketRow,
} from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';

export default function SupportDashboard() {
  const { data: ticketsData, loading: tLoading, error: tError } = useAdminFetch(() => fetchTickets(), []);
  const { data: projectsData, loading: pLoading, error: pError } = useAdminFetch(() => fetchProjects(), []);

  const tickets = useMemo(() => (ticketsData?.tickets ?? []).map(mapTicketRow), [ticketsData]);

  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress');
  const urgentTickets = tickets.filter((t) => t.priority === 'urgent');
  const changeRequests = tickets.filter((t) => t.category === 'change_request' && t.status !== 'closed');
  const supportProjects = useMemo(
    () => (projectsData?.projects ?? []).filter((p) => p.status === 'delivered' || p.status === 'review'),
    [projectsData]
  );

  if (tLoading || pLoading) return <AdminLoadingState />;
  if (tError) return <AdminErrorState error={tError} />;
  if (pError) return <AdminErrorState error={pError} />;

  const KPI = [
    { title: 'تیکت‌های باز', value: String(openTickets.length), subtitle: 'نیاز به بررسی', icon: Ticket, iconColor: 'text-red-600' },
    { title: 'تیکت‌های فوری', value: String(urgentTickets.length), subtitle: 'اقدام فوری', icon: AlertTriangle, iconColor: 'text-orange-600' },
    { title: 'درخواست‌های تغییر', value: String(changeRequests.length), subtitle: 'باز', icon: GitPullRequest, iconColor: 'text-violet-600' },
    { title: 'پروژه‌های پشتیبانی', value: String(supportProjects.length), subtitle: 'فعال/تحویل', icon: FolderOpen, iconColor: 'text-blue-600' },
    { title: 'پلن‌های نگهداری', value: '—', subtitle: 'به‌زودی', icon: Wrench, iconColor: 'text-teal-600' },
    { title: 'تمدیدهای نزدیک', value: '—', subtitle: 'به‌زودی', icon: Calendar, iconColor: 'text-amber-600' },
  ];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="داشبورد پشتیبانی"
        description="مدیریت تیکت‌ها، تغییرات و پروژه‌ها"
        icon={Headphones}
        breadcrumb={[{ label: 'آرایه' }, { label: 'پشتیبانی' }, { label: 'داشبورد' }]}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {KPI.map((k) => (
          <StatCard key={k.title} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-slate-900">تیکت‌های فوری ({urgentTickets.length})</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {urgentTickets.length === 0 && (
              <div className="px-5 py-6 text-sm text-slate-400 text-center">تیکت فوری ندارید</div>
            )}
            {urgentTickets.map((t) => (
              <Link key={t.id} href={`/admin/support/tickets/${t.id}`} className="block px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <p className="text-sm font-semibold text-slate-800">{t.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.client}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">درخواست‌های تغییر ({changeRequests.length})</h2>
            <Link href="/admin/support/change-requests" className="text-xs text-blue-600 hover:underline">همه</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {changeRequests.length === 0 && (
              <div className="px-5 py-6 text-sm text-slate-400 text-center">درخواست تغییری نیست</div>
            )}
            {changeRequests.slice(0, 4).map((cr) => (
              <Link key={cr.id} href={`/admin/support/change-requests/${cr.id}`} className="block px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <p className="text-sm font-medium text-slate-800">{cr.title}</p>
                <p className="text-xs text-slate-500">{cr.client}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">پروژه‌های تحویل‌شده</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {supportProjects.length === 0 && (
              <div className="px-5 py-6 text-sm text-slate-400 text-center">پروژه‌ای نیست</div>
            )}
            {supportProjects.slice(0, 4).map((p) => (
              <div key={p.id} className="px-5 py-3.5">
                <p className="text-sm font-medium text-slate-800">{p.title}</p>
                <p className="text-xs text-slate-500">{p.customer_name ?? '—'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">تیکت‌های باز ({openTickets.length})</h2>
          <Link href="/admin/support/tickets" className="text-xs text-blue-600 hover:underline">مشاهده همه</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100">
                {['عنوان', 'مشتری', 'اولویت', 'وضعیت', 'دسته‌بندی'].map((h) => (
                  <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {openTickets.slice(0, 6).map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3.5 font-medium text-slate-800">{ticket.title}</td>
                  <td className="px-4 py-3.5 text-slate-600">{ticket.client}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge label={API_TICKET_PRIORITY_LABELS[ticket.priority] ?? ticket.priority} colorClass={API_TICKET_PRIORITY_COLORS[ticket.priority] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge label={API_TICKET_STATUS_LABELS[ticket.status] ?? ticket.status} colorClass={API_TICKET_STATUS_COLORS[ticket.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{API_TICKET_CATEGORY_LABELS[ticket.category] ?? ticket.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

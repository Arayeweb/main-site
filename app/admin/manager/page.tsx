'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { StatCard } from '@/components/admin/ui/StatCard';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ActivityTimeline } from '@/components/admin/ui/ActivityTimeline';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import {
  TrendingUp, FolderOpen, CreditCard, FileCheck, Ticket, CheckSquare,
  LayoutDashboard, MoreHorizontal, Repeat, Receipt, Eye, Users, LineChart,
} from 'lucide-react';
import {
  fetchContracts,
  fetchInvoiceSummary,
  fetchInvoices,
  fetchMaintenanceSummary,
  fetchProjects,
  fetchSalesLeads,
  fetchTasks,
  fetchTickets,
  fetchAdminStats,
} from '@/lib/adminApi';
import {
  API_PROJECT_STATUS_COLORS,
  API_PROJECT_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  buildRecentActivities,
  formatAmount,
  mapInvoiceRow,
  mapProjectRow,
} from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { formatCurrency } from '@/lib/utils';

export default function ManagerDashboard() {
  const { data: projectsData, loading: pLoading, error: pError } = useAdminFetch(() => fetchProjects(), []);
  const { data: ticketsData, loading: tLoading, error: tError } = useAdminFetch(() => fetchTickets(), []);
  const { data: summaryData, loading: sLoading, error: sError } = useAdminFetch(() => fetchInvoiceSummary('invoice'), []);
  const { data: leadsData } = useAdminFetch(() => fetchSalesLeads(), []);
  const { data: invoicesData } = useAdminFetch(() => fetchInvoices({ kind: 'invoice' }), []);
  const { data: tasksData } = useAdminFetch(() => fetchTasks(), []);
  const { data: contractsData } = useAdminFetch(() => fetchContracts(), []);
  const { data: maintenanceData } = useAdminFetch(() => fetchMaintenanceSummary(), []);
  const { data: analyticsData } = useAdminFetch(() => fetchAdminStats(), []);

  const activeProjects = useMemo(() => {
    const list = (projectsData?.projects ?? []).map(mapProjectRow);
    return list.filter((p) => p.status !== 'delivered' && p.status !== 'paused');
  }, [projectsData]);

  const openTickets = useMemo(
    () => (ticketsData?.tickets ?? []).filter((t) => t.status === 'open' || t.status === 'in_progress'),
    [ticketsData]
  );

  const unpaidInvoices = useMemo(
    () => (invoicesData?.invoices ?? []).map(mapInvoiceRow).filter((i) => i.status === 'sent' || i.status === 'draft'),
    [invoicesData]
  );

  const openTasks = useMemo(
    () => (tasksData?.tasks ?? []).filter((t) => t.status !== 'done'),
    [tasksData]
  );

  const activeContracts = useMemo(
    () => (contractsData?.contracts ?? []).filter((c) => c.signature_status === 'active' || c.signature_status === 'signed'),
    [contractsData]
  );

  const mrr = maintenanceData?.summary?.mrr ?? 0;

  const activities = useMemo(() => {
    if (!leadsData || !ticketsData || !projectsData) return [];
    return buildRecentActivities(leadsData.leads ?? [], ticketsData.tickets ?? [], projectsData.projects ?? []);
  }, [leadsData, ticketsData, projectsData]);

  if (pLoading || tLoading || sLoading) return <AdminLoadingState />;
  if (pError) return <AdminErrorState error={pError} />;
  if (tError) return <AdminErrorState error={tError} />;
  if (sError) return <AdminErrorState error={sError} />;

  const paid = summaryData?.summary?.paid?.IRR ?? 0;
  const outstanding = summaryData?.summary?.outstanding?.IRR ?? 0;
  const paidThisMonth = summaryData?.summary?.paidThisMonth?.IRR ?? 0;
  const unpaidCount = (summaryData?.summary?.counts?.sent ?? 0) + (summaryData?.summary?.counts?.draft ?? 0);

  const KPI = [
    { title: 'درآمد دریافت‌شده', value: formatAmount(paid), subtitle: 'تومان', icon: CreditCard, iconColor: 'text-teal-600' },
    { title: 'مانده قابل دریافت', value: formatAmount(outstanding), subtitle: 'تومان', icon: Receipt, iconColor: 'text-amber-600' },
    { title: 'پروژه‌های فعال', value: String(activeProjects.length), subtitle: 'در جریان', icon: FolderOpen, iconColor: 'text-blue-600' },
    { title: 'فاکتورهای پرداخت‌نشده', value: String(unpaidCount), subtitle: 'صورت‌حساب', icon: Receipt, iconColor: 'text-orange-600' },
    { title: 'تیکت‌های باز', value: String(openTickets.length), subtitle: 'نیاز به پیگیری', icon: Ticket, iconColor: 'text-red-600' },
    { title: 'فروش ماه', value: formatAmount(paidThisMonth), subtitle: 'دریافتی', icon: TrendingUp, iconColor: 'text-green-600' },
    { title: 'قراردادها', value: String(activeContracts.length), subtitle: 'فعال', icon: FileCheck, iconColor: 'text-violet-600' },
    { title: 'تسک‌ها', value: String(openTasks.length), subtitle: 'باز', icon: CheckSquare, iconColor: 'text-rose-600' },
    { title: 'درآمد تکرارشونده', value: formatAmount(mrr), subtitle: 'MRR تومان', icon: Repeat, iconColor: 'text-cyan-600' },
  ];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="داشبورد مدیریت"
        description="نمای کلی عملکرد شرکت"
        icon={LayoutDashboard}
        breadcrumb={[{ label: 'آرایه' }, { label: 'مدیریت' }, { label: 'داشبورد' }]}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {KPI.map((k) => (
          <StatCard key={k.title} {...k} />
        ))}
      </div>

      {analyticsData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/admin/manager/analytics" className="block">
            <StatCard title="بازدید سایت" value={analyticsData.total_views.toLocaleString('fa-IR')} subtitle="کل — مشاهده آمار" icon={Eye} iconColor="text-blue-600" />
          </Link>
          <Link href="/admin/manager/analytics" className="block">
            <StatCard title="بازدید این هفته" value={analyticsData.views_this_week.toLocaleString('fa-IR')} subtitle="UTM و صفحات" icon={LineChart} iconColor="text-teal-600" />
          </Link>
          <Link href="/admin/manager/analytics" className="block">
            <StatCard title="لیدها" value={analyticsData.total_leads.toLocaleString('fa-IR')} subtitle="کل ثبت‌شده" icon={Users} iconColor="text-violet-600" />
          </Link>
          <Link href="/admin/manager/analytics" className="block">
            <StatCard title="لید این هفته" value={analyticsData.this_week.toLocaleString('fa-IR')} subtitle="GTM + UTM" icon={TrendingUp} iconColor="text-green-600" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">پروژه‌های جاری</h2>
            <Link href="/admin/manager/projects" className="text-xs text-blue-600 hover:underline">مشاهده همه</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" dir="rtl">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {['نام پروژه', 'مشتری', 'وضعیت', 'ددلاین', ''].map((h) => (
                    <th key={h} className="text-right px-5 py-3 text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeProjects.slice(0, 5).map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/manager/projects/${project.id}`} className="font-medium text-slate-800 text-sm hover:text-blue-600">{project.name}</Link>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{project.client}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge label={API_PROJECT_STATUS_LABELS[project.status] ?? project.status} colorClass={API_PROJECT_STATUS_COLORS[project.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-500 tabular-nums">{project.deadline}</td>
                    <td className="px-4 py-3.5">
                      <Link href={`/admin/manager/projects/${project.id}`}>
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">آخرین فعالیت‌ها</h2>
          </div>
          <div className="px-5 py-4">
            {activities.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">فعالیتی ثبت نشده</p>
            ) : (
              <ActivityTimeline activities={activities} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">فاکتورهای پرداخت‌نشده</h2>
            <Link href="/admin/manager/payments" className="text-xs text-blue-600 hover:underline">همه</Link>
          </div>
          <div className="space-y-3">
            {unpaidInvoices.length === 0 && <p className="text-sm text-slate-400">فاکتور معوقی نیست</p>}
            {unpaidInvoices.slice(0, 4).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{inv.client}</p>
                  <p className="text-xs text-slate-400">{inv.invoice}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium tabular-nums">{formatCurrency(inv.amount)}</p>
                  <StatusBadge label={INVOICE_STATUS_LABELS[inv.status] ?? inv.status} colorClass={INVOICE_STATUS_COLORS[inv.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">تیکت‌های باز ({openTickets.length})</h2>
          <div className="space-y-3">
            {openTickets.slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-start justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{t.subject}</p>
                  <p className="text-xs text-slate-400">{t.customer_name ?? '—'}</p>
                </div>
                <StatusBadge label={t.priority} colorClass="bg-amber-50 text-amber-700 ring-amber-200" />
              </div>
            ))}
            {openTickets.length === 0 && <p className="text-sm text-slate-400">تیکت بازی نیست</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

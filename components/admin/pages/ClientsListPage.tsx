'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { FilterBar } from '@/components/admin/ui/FilterBar';
import { ActionMenu } from '@/components/admin/ui/ActionMenu';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { Users, Plus } from 'lucide-react';
import { fetchClients, fetchProjects, createClient } from '@/lib/adminApi';
import { deriveClientsFromProjects, mapClientRow } from '@/lib/adminMappers';
import { CLIENT_STATUS_LABELS, CLIENT_STATUS_COLORS, CLIENT_TYPE_LABELS } from '@/lib/adminTypes';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { SimpleFormModal } from '@/components/admin/ui/SimpleFormModal';
import { formatCurrency } from '@/lib/utils';

interface ClientsListPageProps {
  panel: 'manager' | 'sales' | 'support';
  detailBasePath: string;
  title?: string;
  description?: string;
}

export function ClientsListPage({
  panel,
  detailBasePath,
  title = 'مشتریان',
  description = 'مدیریت مشتریان و اطلاعات تماس',
}: ClientsListPageProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', client_type: 'other' });

  const { data: clientsData, loading: cLoading, error: cError, refetch: refetchClients } = useAdminFetch(() => fetchClients(), []);
  const { data: projectsData, loading: pLoading, error: pError } = useAdminFetch(() => fetchProjects(), []);

  const clients = useMemo(() => {
    const fromDb = (clientsData?.clients ?? []).map(mapClientRow);
    const projects = projectsData?.projects ?? [];
    const activeByClient = new Map<string, number>();
    for (const p of projects) {
      if (p.status === 'delivered' || p.status === 'paused') continue;
      const key = p.client_id ?? p.customer_contact ?? p.customer_name ?? '';
      if (key) activeByClient.set(key, (activeByClient.get(key) ?? 0) + 1);
    }
    if (fromDb.length > 0) {
      return fromDb.map((c) => ({
        ...c,
        activeProjects: activeByClient.get(c.id) ?? activeByClient.get(c.phone) ?? 0,
      }));
    }
    return deriveClientsFromProjects(projects);
  }, [clientsData, projectsData]);

  const filtered = clients.filter((c) => {
    const matchSearch = !search || c.name.includes(search) || c.phone.includes(search) || (c.email?.includes(search));
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const panelLabel = panel === 'manager' ? 'مدیریت' : panel === 'sales' ? 'فروش' : 'پشتیبانی';
  const loading = cLoading || pLoading;
  const error = cError || pError;

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  const hasRichClients = (clientsData?.clients?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title={title}
        description={description}
        icon={Users}
        breadcrumb={[{ label: panelLabel }, { label: 'مشتریان' }]}
        actions={
          panel === 'manager' ? (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              مشتری جدید
            </button>
          ) : undefined
        }
      />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="جستجوی مشتری..."
          count={filtered.length}
          countLabel="مشتری"
          filters={[{
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'همه وضعیت‌ها' },
              ...Object.entries(CLIENT_STATUS_LABELS).map(([k, v]) => ({ value: k, label: v })),
            ],
          }]}
        />

        {filtered.length === 0 ? (
          <EmptyState title="مشتریی یافت نشد" description="پس از ثبت مشتری یا پروژه، اینجا نمایش داده می‌شود." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]" dir="rtl">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {(hasRichClients
                    ? ['نام مشتری', 'نوع', 'تماس', 'شهر', 'پروژه‌های فعال', 'مبلغ همکاری', 'وضعیت', 'آخرین ارتباط', '']
                    : ['نام مشتری', 'تماس', 'پروژه‌های فعال', 'وضعیت', 'آخرین بروزرسانی', '']
                  ).map((h) => (
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`${detailBasePath}/${client.id}`)}
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-800">{client.name}</p>
                    </td>
                    {hasRichClients && (
                      <>
                        <td className="px-4 py-3.5 text-slate-600">{CLIENT_TYPE_LABELS[client.type] ?? client.type}</td>
                        <td className="px-4 py-3.5 text-slate-500 tabular-nums" dir="ltr">{client.phone}</td>
                        <td className="px-4 py-3.5 text-slate-600">{client.city}</td>
                      </>
                    )}
                    {!hasRichClients && (
                      <td className="px-4 py-3.5 text-slate-500 tabular-nums" dir="ltr">{client.phone}</td>
                    )}
                    <td className="px-4 py-3.5 text-center text-slate-700 tabular-nums">{client.activeProjects}</td>
                    {hasRichClients && (
                      <td className="px-4 py-3.5 tabular-nums">{formatCurrency(client.totalRevenue)}</td>
                    )}
                    <td className="px-4 py-3.5">
                      <StatusBadge label={CLIENT_STATUS_LABELS[client.status] ?? client.status} colorClass={CLIENT_STATUS_COLORS[client.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums">{client.lastContact}</td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <ActionMenu actions={[{ label: 'مشاهده پروفایل', onClick: () => router.push(`${detailBasePath}/${client.id}`) }]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SimpleFormModal
        title="مشتری جدید"
        open={creating}
        onClose={() => setCreating(false)}
        busy={busy}
        error={formError}
        onSubmit={async () => {
          setBusy(true);
          setFormError('');
          const res = await createClient(form);
          setBusy(false);
          if (!res.ok) {
            setFormError(res.error);
            return;
          }
          setCreating(false);
          setForm({ name: '', phone: '', email: '', city: '', client_type: 'other' });
          refetchClients();
        }}
      >
        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="نام *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="موبایل" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="ایمیل" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="شهر" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.client_type} onChange={(e) => setForm({ ...form, client_type: e.target.value })}>
          {Object.entries(CLIENT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </SimpleFormModal>
    </div>
  );
}

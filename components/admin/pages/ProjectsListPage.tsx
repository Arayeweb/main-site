'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { FilterBar } from '@/components/admin/ui/FilterBar';
import { ProgressBar } from '@/components/admin/ui/ProjectCard';
import { ActionMenu } from '@/components/admin/ui/ActionMenu';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { FolderOpen, Plus } from 'lucide-react';
import { fetchProjects, createProject } from '@/lib/adminApi';
import { API_PROJECT_STATUS_COLORS, API_PROJECT_STATUS_LABELS, mapProjectRow } from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { SimpleFormModal } from '@/components/admin/ui/SimpleFormModal';

interface ProjectsListProps {
  panelLabel: string;
  detailBasePath: string;
  showCreate?: boolean;
}

export function ProjectsListPage({ panelLabel, detailBasePath, showCreate = true }: ProjectsListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ title: '', customer_name: '', customer_contact: '', service_type: 'website' });

  const { data, loading, error, refetch } = useAdminFetch(() => fetchProjects(), []);
  const projects = useMemo(() => (data?.projects ?? []).map(mapProjectRow), [data]);

  const filtered = projects.filter((p) => {
    const matchSearch = !search || p.name.includes(search) || p.client.includes(search);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="پروژه‌ها"
        description="مدیریت پروژه‌های جاری و تحویل‌شده"
        icon={FolderOpen}
        breadcrumb={[{ label: panelLabel }, { label: 'پروژه‌ها' }]}
        actions={showCreate ? (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            پروژه جدید
          </button>
        ) : undefined}
      />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="جستجوی پروژه..."
          count={filtered.length}
          countLabel="پروژه"
          filters={[{
            value: statusFilter,
            onChange: setStatusFilter,
            options: [{ value: 'all', label: 'همه وضعیت‌ها' }, ...Object.entries(API_PROJECT_STATUS_LABELS).map(([k, v]) => ({ value: k, label: v }))],
          }]}
        />

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]" dir="rtl">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {['نام پروژه', 'مشتری', 'نوع', 'وضعیت', 'ددلاین', 'پیشرفت', ''].map((h) => (
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`${detailBasePath}/${project.id}`)}
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-800">{project.name}</p>
                      <p className="text-xs text-slate-400">{project.code}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{project.client}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs">{project.type}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge label={API_PROJECT_STATUS_LABELS[project.status] ?? project.status} colorClass={API_PROJECT_STATUS_COLORS[project.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums">{project.deadline}</td>
                    <td className="px-4 py-3.5 w-28"><ProgressBar value={project.progress} /></td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <ActionMenu actions={[{ label: 'مشاهده', onClick: () => router.push(`${detailBasePath}/${project.id}`) }]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SimpleFormModal
        title="پروژه جدید"
        open={creating}
        onClose={() => setCreating(false)}
        busy={busy}
        error={formError}
        onSubmit={async () => {
          setBusy(true);
          setFormError('');
          const res = await createProject(form);
          setBusy(false);
          if (!res.ok) {
            setFormError(res.error);
            return;
          }
          setCreating(false);
          setForm({ title: '', customer_name: '', customer_contact: '', service_type: 'website' });
          refetch();
        }}
      >
        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="عنوان پروژه *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="نام مشتری" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="تماس مشتری" dir="ltr" value={form.customer_contact} onChange={(e) => setForm({ ...form, customer_contact: e.target.value })} />
        <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })}>
          <option value="website">وب‌سایت</option>
          <option value="landing">لندینگ</option>
          <option value="chatbot">چت‌بات</option>
          <option value="other">سایر</option>
        </select>
      </SimpleFormModal>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { PriorityBadge } from '@/components/admin/ui/PriorityBadge';
import { FilterBar } from '@/components/admin/ui/FilterBar';
import { ActionMenu } from '@/components/admin/ui/ActionMenu';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { CheckSquare, Plus } from 'lucide-react';
import { fetchTasks, createTask } from '@/lib/adminApi';
import { mapTaskRow } from '@/lib/adminMappers';
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
} from '@/lib/adminTypes';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { SimpleFormModal } from '@/components/admin/ui/SimpleFormModal';

export default function TasksPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ title: '', assigned_to: '', due_date: '', priority: 'medium' });

  const { data, loading, error, refetch } = useAdminFetch(() => fetchTasks(), []);
  const tasks = useMemo(() => (data?.tasks ?? []).map(mapTaskRow), [data]);

  const filtered = tasks.filter((t) => {
    const matchSearch = !search || t.title.includes(search) || t.project.includes(search) || t.client.includes(search);
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="تسک‌ها"
        description="مدیریت وظایف تیم و پیگیری ددلاین‌ها"
        icon={CheckSquare}
        breadcrumb={[{ label: 'مدیریت' }, { label: 'تسک‌ها' }]}
        actions={
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            تسک جدید
          </button>
        }
      />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="جستجوی تسک..."
          count={filtered.length}
          countLabel="تسک"
          filters={[
            {
              value: statusFilter,
              onChange: setStatusFilter,
              options: [{ value: 'all', label: 'همه وضعیت‌ها' }, ...Object.entries(TASK_STATUS_LABELS).map(([k, v]) => ({ value: k, label: v }))],
            },
            {
              value: priorityFilter,
              onChange: setPriorityFilter,
              options: [{ value: 'all', label: 'همه اولویت‌ها' }, ...Object.entries(TASK_PRIORITY_LABELS).map(([k, v]) => ({ value: k, label: v }))],
            },
          ]}
        />

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]" dir="rtl">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {['عنوان تسک', 'پروژه', 'مشتری', 'مسئول', 'اولویت', 'وضعیت', 'ددلاین', ''].map((h) => (
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/manager/tasks/${task.id}`)}
                  >
                    <td className="px-4 py-3.5 font-medium text-slate-800">{task.title}</td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs">{task.project}</td>
                    <td className="px-4 py-3.5 text-slate-600">{task.client}</td>
                    <td className="px-4 py-3.5 text-slate-600">{task.assignedTo}</td>
                    <td className="px-4 py-3.5">
                      <PriorityBadge label={TASK_PRIORITY_LABELS[task.priority] ?? task.priority} colorClass={TASK_PRIORITY_COLORS[task.priority] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge label={TASK_STATUS_LABELS[task.status] ?? task.status} colorClass={TASK_STATUS_COLORS[task.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums">{task.dueDate}</td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <ActionMenu actions={[{ label: 'مشاهده', onClick: () => router.push(`/admin/manager/tasks/${task.id}`) }]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SimpleFormModal
        title="تسک جدید"
        open={creating}
        onClose={() => setCreating(false)}
        busy={busy}
        error={formError}
        onSubmit={async () => {
          setBusy(true);
          setFormError('');
          const res = await createTask(form);
          setBusy(false);
          if (!res.ok) {
            setFormError(res.error);
            return;
          }
          setCreating(false);
          setForm({ title: '', assigned_to: '', due_date: '', priority: 'medium' });
          refetch();
        }}
      >
        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="عنوان تسک *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="مسئول" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} />
        <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
        <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          {Object.entries(TASK_PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </SimpleFormModal>
    </div>
  );
}

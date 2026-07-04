'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { PriorityBadge } from '@/components/admin/ui/PriorityBadge';
import { CheckSquare, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchTaskById } from '@/lib/adminApi';
import { mapTaskRow } from '@/lib/adminMappers';
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
} from '@/lib/adminTypes';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error } = useAdminFetch(() => fetchTaskById(id), [id]);
  const task = useMemo(() => (data?.task ? mapTaskRow(data.task) : null), [data]);
  const [checklist, setChecklist] = useState<{ id: string; label: string; done: boolean }[]>([]);

  useEffect(() => {
    if (task?.checklist?.length) setChecklist(task.checklist);
  }, [task]);

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  if (!task) {
    return (
      <div className="text-center py-20 text-slate-500" dir="rtl">
        <p>تسک یافت نشد</p>
        <Link href="/admin/manager/tasks" className="text-blue-600 text-sm mt-2 inline-block">بازگشت</Link>
      </div>
    );
  }

  const items = checklist.length > 0 ? checklist : task.checklist;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title={task.title}
        description={`${task.project} · ${task.client}`}
        icon={CheckSquare}
        breadcrumb={[{ label: 'مدیریت' }, { label: 'تسک‌ها', href: '/admin/manager/tasks' }, { label: task.title }]}
        actions={
          <Link href="/admin/manager/tasks" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
            <ArrowRight className="w-4 h-4" />
            بازگشت
          </Link>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">توضیحات</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{task.description ?? 'توضیحاتی ثبت نشده'}</p>
          </div>

          {items.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">چک‌لیست</h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <button
                      onClick={() => setChecklist((prev) => prev.map((c) => c.id === item.id ? { ...c, done: !c.done } : c))}
                      className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center',
                        item.done ? 'bg-green-500 border-green-500' : 'border-slate-300'
                      )}
                    >
                      {item.done && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className={item.done ? 'line-through text-slate-400' : 'text-slate-700'}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">نظرات</h3>
            <p className="text-sm text-slate-400 text-center py-6 bg-slate-50 rounded-lg">نظری ثبت نشده</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">وضعیت</span>
            <StatusBadge label={TASK_STATUS_LABELS[task.status] ?? task.status} colorClass={TASK_STATUS_COLORS[task.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">اولویت</span>
            <PriorityBadge label={TASK_PRIORITY_LABELS[task.priority] ?? task.priority} colorClass={TASK_PRIORITY_COLORS[task.priority] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">مسئول</span>
            <span className="text-sm text-slate-700">{task.assignedTo}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">ددلاین</span>
            <span className="text-sm text-slate-700 tabular-nums">{task.dueDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">پروژه</span>
            <span className="text-sm text-slate-700">{task.project}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { FilterBar } from '@/components/admin/ui/FilterBar';
import { ActionMenu } from '@/components/admin/ui/ActionMenu';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { GitPullRequest, ArrowRight } from 'lucide-react';
import { fetchChangeRequestById, fetchChangeRequests, updateChangeRequest } from '@/lib/adminApi';
import { mapChangeRequestRow } from '@/lib/adminMappers';
import { CHANGE_REQUEST_STATUS_COLORS, CHANGE_REQUEST_STATUS_LABELS, CHANGE_REQUEST_TYPE_LABELS } from '@/lib/adminTypes';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { formatCurrency } from '@/lib/utils';

interface ChangeRequestsListProps {
  panelLabel: string;
  detailBasePath: string;
}

export function ChangeRequestsListPage({ panelLabel, detailBasePath }: ChangeRequestsListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, loading, error } = useAdminFetch(() => fetchChangeRequests(), []);
  const changeRequests = useMemo(() => (data?.change_requests ?? []).map(mapChangeRequestRow), [data]);

  const filtered = changeRequests.filter((cr) => {
    const matchSearch = !search || cr.title.includes(search) || cr.client.includes(search);
    const matchStatus = statusFilter === 'all' || cr.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="درخواست‌های تغییر"
        description="مدیریت درخواست‌های تغییر مشتریان"
        icon={GitPullRequest}
        breadcrumb={[{ label: panelLabel }, { label: 'درخواست تغییرات' }]}
      />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="جستجو..."
          count={filtered.length}
          countLabel="درخواست"
          filters={[{
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'همه وضعیت‌ها' },
              ...Object.entries(CHANGE_REQUEST_STATUS_LABELS).map(([k, v]) => ({ value: k, label: v })),
            ],
          }]}
        />

        {filtered.length === 0 ? (
          <EmptyState title="درخواست تغییری یافت نشد" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]" dir="rtl">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {['عنوان', 'مشتری', 'پروژه', 'نوع', 'وضعیت', 'هزینه', ''].map((h) => (
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((cr) => (
                  <tr
                    key={cr.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`${detailBasePath}/${cr.id}`)}
                  >
                    <td className="px-4 py-3.5 font-medium text-slate-800">{cr.title}</td>
                    <td className="px-4 py-3.5 text-slate-600">{cr.client}</td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs">{cr.project}</td>
                    <td className="px-4 py-3.5 text-slate-600">{CHANGE_REQUEST_TYPE_LABELS[cr.type] ?? cr.type}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge label={CHANGE_REQUEST_STATUS_LABELS[cr.status] ?? cr.status} colorClass={CHANGE_REQUEST_STATUS_COLORS[cr.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
                    </td>
                    <td className="px-4 py-3.5 tabular-nums">{formatCurrency(cr.cost)}</td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <ActionMenu actions={[{ label: 'مشاهده', onClick: () => router.push(`${detailBasePath}/${cr.id}`) }]} />
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

export function ChangeRequestDetailPage({ id, backHref, panelLabel }: { id: string; backHref: string; panelLabel: string }) {
  const [busy, setBusy] = useState(false);
  const [assignee, setAssignee] = useState('');
  const { data, loading, error, refetch } = useAdminFetch(() => fetchChangeRequestById(id), [id]);
  const cr = useMemo(() => (data?.change_request ? mapChangeRequestRow(data.change_request) : null), [data]);

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  if (!cr) {
    return (
      <div className="text-center py-20 text-slate-500" dir="rtl">
        <p>درخواست یافت نشد</p>
        <Link href={backHref} className="text-blue-600 text-sm mt-2 inline-block">بازگشت</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title={cr.title}
        description={`${cr.client} · ${cr.project}`}
        icon={GitPullRequest}
        breadcrumb={[{ label: panelLabel }, { label: 'درخواست تغییرات', href: backHref }, { label: cr.title }]}
        actions={
          <Link href={backHref} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
            <ArrowRight className="w-4 h-4" />
            بازگشت
          </Link>
        }
      />
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <StatusBadge label={CHANGE_REQUEST_STATUS_LABELS[cr.status] ?? cr.status} colorClass={CHANGE_REQUEST_STATUS_COLORS[cr.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-slate-400">نوع: </span><span className="text-slate-700">{CHANGE_REQUEST_TYPE_LABELS[cr.type] ?? cr.type}</span></div>
          <div><span className="text-slate-400">مسئول: </span><span className="text-slate-700">{cr.assignedTo}</span></div>
          <div><span className="text-slate-400">هزینه تخمینی: </span><span className="text-slate-700">{formatCurrency(cr.estimatedCost)}</span></div>
          <div><span className="text-slate-400">زمان تخمینی: </span><span className="text-slate-700">{cr.estimatedTime}</span></div>
        </div>
        {cr.description && <p className="text-sm text-slate-700">{cr.description}</p>}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">تغییر وضعیت</label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              value={cr.status}
              disabled={busy}
              onChange={async (e) => {
                setBusy(true);
                const res = await updateChangeRequest(id, { status: e.target.value });
                setBusy(false);
                if (!res.ok) alert(res.error);
                else refetch();
              }}
            >
              {Object.entries(CHANGE_REQUEST_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">مسئول</label>
            <div className="flex gap-2">
              <input
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="نام مسئول"
                defaultValue={cr.assignedTo === '—' ? '' : cr.assignedTo}
                onChange={(e) => setAssignee(e.target.value)}
              />
              <button
                type="button"
                disabled={busy}
                className="text-sm bg-slate-900 text-white px-3 py-2 rounded-lg disabled:opacity-60"
                onClick={async () => {
                  setBusy(true);
                  const res = await updateChangeRequest(id, { assigned_to: assignee });
                  setBusy(false);
                  if (!res.ok) alert(res.error);
                  else refetch();
                }}
              >
                ذخیره
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              className="text-sm border border-green-200 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 disabled:opacity-60"
              onClick={async () => {
                setBusy(true);
                const res = await updateChangeRequest(id, { customer_approval: 'approved', status: 'approved' });
                setBusy(false);
                if (!res.ok) alert(res.error);
                else refetch();
              }}
            >
              تایید مشتری
            </button>
            <button
              type="button"
              disabled={busy}
              className="text-sm border border-red-200 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-60"
              onClick={async () => {
                setBusy(true);
                const res = await updateChangeRequest(id, { customer_approval: 'rejected', status: 'rejected' });
                setBusy(false);
                if (!res.ok) alert(res.error);
                else refetch();
              }}
            >
              رد درخواست
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { Briefcase, RefreshCw, ExternalLink } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ActionMenu } from '@/components/admin/ui/ActionMenu';
import { fetchFreelanceProjects, patchFreelanceProject, scanFreelanceProjects } from '@/lib/adminApi';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { formatFaDateTime } from '@/lib/adminMappers';

const STATUS_LABELS: Record<string, string> = {
  new: 'جدید',
  applied: 'درخواست داده شد',
  won: 'برنده',
  lost: 'از دست رفته',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 ring-blue-200',
  applied: 'bg-amber-50 text-amber-700 ring-amber-200',
  won: 'bg-green-50 text-green-700 ring-green-200',
  lost: 'bg-red-50 text-red-700 ring-red-200',
};

const SOURCE_LABELS: Record<string, string> = {
  ponisha: 'پونیشا',
  karlancer: 'کارلنسر',
};

export default function FreelanceProjectsPage() {
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState('');
  const { data, loading, error, refetch } = useAdminFetch(() => fetchFreelanceProjects(), []);

  const projects = useMemo(() => data?.projects ?? [], [data]);

  async function handleScan() {
    setScanning(true);
    setScanMsg('');
    try {
      const res = await scanFreelanceProjects();
      if (!res.ok) setScanMsg(`خطا: ${res.error}`);
      else setScanMsg(`${res.data.new} پروژه جدید از ${res.data.scanned} مورد اسکن‌شده`);
      refetch();
    } catch {
      setScanMsg('خطا در اسکن');
    }
    setScanning(false);
  }

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="پروژه‌های فریلنس"
        description="پروژه‌های باز از پونیشا و کارلنسر"
        icon={Briefcase}
        breadcrumb={[{ label: 'فروش' }, { label: 'فریلنس' }]}
        actions={
          <button
            type="button"
            disabled={scanning}
            onClick={() => void handleScan()}
            className="flex items-center gap-2 text-sm border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'در حال اسکن...' : 'اسکن جدید'}
          </button>
        }
      />

      {scanMsg && (
        <div className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700">{scanMsg}</div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {projects.length === 0 ? (
          <EmptyState title="پروژه‌ای یافت نشد" description="دکمه اسکن جدید را بزنید." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]" dir="rtl">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {['عنوان', 'منبع', 'وضعیت', 'آخرین اسکن', ''].map((h) => (
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-slate-800 hover:text-blue-600 inline-flex items-center gap-1"
                      >
                        {row.title}
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                      {row.budget ? <p className="text-xs text-slate-500 mt-0.5">{row.budget}</p> : null}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{SOURCE_LABELS[row.source] ?? row.source}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge
                        label={STATUS_LABELS[row.status] ?? row.status}
                        colorClass={STATUS_COLORS[row.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                      {formatFaDateTime(row.scanned_at)}
                    </td>
                    <td className="px-4 py-3.5">
                      <ActionMenu
                        actions={[
                          { label: 'درخواست داده شد', onClick: () => void patchFreelanceProject(row.id, { status: 'applied' }).then(() => refetch()) },
                          { label: 'برنده', onClick: () => void patchFreelanceProject(row.id, { status: 'won' }).then(() => refetch()) },
                          { label: 'از دست رفته', variant: 'danger', onClick: () => void patchFreelanceProject(row.id, { status: 'lost' }).then(() => refetch()) },
                        ]}
                      />
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

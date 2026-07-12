'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { DetailTabs } from '@/components/admin/ui/DetailTabs';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ProgressBar } from '@/components/admin/ui/ProjectCard';
import { FolderOpen, ArrowRight, Loader2 } from 'lucide-react';
import { fetchProjects, fetchTickets, updateProject } from '@/lib/adminApi';
import {
  API_PROJECT_STATUS_COLORS,
  API_PROJECT_STATUS_LABELS,
  API_TICKET_STATUS_LABELS,
  mapProjectRow,
  mapTicketRow,
} from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';

const PROJECT_STATUSES = ['intake', 'design', 'development', 'review', 'delivered', 'paused'] as const;

interface ProjectDetailPageProps {
  id: string;
  backHref: string;
  panelLabel: string;
  canEditStatus?: boolean;
}

export function ProjectDetailPage({ id, backHref, panelLabel, canEditStatus = true }: ProjectDetailPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [statusBusy, setStatusBusy] = useState(false);
  const { data: projectsData, loading: pLoading, error: pError, refetch } = useAdminFetch(() => fetchProjects(), [id]);
  const { data: ticketsData, loading: tLoading, error: tError } = useAdminFetch(() => fetchTickets(), [id]);

  const project = useMemo(() => {
    const raw = (projectsData?.projects ?? []).find((p) => p.id === id);
    return raw ? mapProjectRow(raw) : null;
  }, [projectsData, id]);

  const tickets = useMemo(() => {
    return (ticketsData?.tickets ?? [])
      .filter((t) => t.project_id === id || t.customer_name === project?.client)
      .map(mapTicketRow);
  }, [ticketsData, id, project]);

  if (pLoading || tLoading) return <AdminLoadingState />;
  if (pError) return <AdminErrorState error={pError} />;
  if (tError) return <AdminErrorState error={tError} />;

  if (!project) {
    return (
      <div className="text-center py-20 text-slate-500" dir="rtl">
        <p>پروژه یافت نشد</p>
        <Link href={backHref} className="text-blue-600 text-sm mt-2 inline-block">بازگشت</Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'نمای کلی' },
    { id: 'tickets', label: 'تیکت‌ها', count: tickets.length },
    { id: 'notes', label: 'یادداشت‌ها' },
  ];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title={project.name}
        description={`${project.client} · ${project.type}`}
        icon={FolderOpen}
        breadcrumb={[{ label: panelLabel }, { label: 'پروژه‌ها', href: backHref }, { label: project.name }]}
        actions={
          <Link href={backHref} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
            <ArrowRight className="w-4 h-4" />
            بازگشت
          </Link>
        }
      />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-4">
          {canEditStatus ? (
            <div className="flex items-center gap-2">
              <select
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white"
                value={project.status}
                disabled={statusBusy}
                onChange={async (e) => {
                  const next = e.target.value;
                  setStatusBusy(true);
                  const res = await updateProject(id, { status: next });
                  setStatusBusy(false);
                  if (!res.ok) {
                    alert(res.error);
                    return;
                  }
                  refetch();
                }}
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>{API_PROJECT_STATUS_LABELS[s] ?? s}</option>
                ))}
              </select>
              {statusBusy && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
            </div>
          ) : (
            <StatusBadge
              label={API_PROJECT_STATUS_LABELS[project.status] ?? project.status}
              colorClass={API_PROJECT_STATUS_COLORS[project.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}
            />
          )}
          <div className="flex-1 min-w-[200px] max-w-md">
            <ProgressBar value={project.progress} />
          </div>
        </div>

        <DetailTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="p-5">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 text-sm">
                <Row label="کد پروژه" value={project.code} />
                <Row label="ددلاین" value={project.deadline} />
                <Row label="تماس مشتری" value={project.contact} />
                <Row label="پیشرفت" value={`${project.progress}٪`} />
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-bold text-slate-900 mb-2">مشتری</h4>
                <p className="text-sm text-slate-700">{project.client}</p>
                <p className="text-xs text-slate-500 mt-1" dir="ltr">{project.contact}</p>
              </div>
            </div>
          )}
          {activeTab === 'tickets' && (
            <ul className="space-y-2">
              {tickets.map((t) => (
                <li key={t.id} className="text-sm py-2 border-b border-slate-100 flex justify-between gap-2">
                  <span className="text-slate-800">{t.title}</span>
                  <span className="text-slate-400 text-xs">{API_TICKET_STATUS_LABELS[t.status] ?? t.status}</span>
                </li>
              ))}
              {tickets.length === 0 && <p className="text-sm text-slate-400 text-center py-4">تیکتی ثبت نشده</p>}
            </ul>
          )}
          {activeTab === 'notes' && (
            <p className="text-sm text-slate-700">{project.note ?? 'یادداشتی ثبت نشده'}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-800 font-medium">{value}</span>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { DetailTabs } from '@/components/admin/ui/DetailTabs';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ActivityTimeline } from '@/components/admin/ui/ActivityTimeline';
import { Users, ArrowRight, Phone, Mail, Globe, AtSign } from 'lucide-react';
import {
  fetchClientById,
  fetchContracts,
  fetchInvoices,
  fetchProjectsByClient,
  fetchSalesLeads,
  fetchTickets,
} from '@/lib/adminApi';
import {
  buildRecentActivities,
  mapContractRow,
  mapClientRow,
  mapInvoiceRow,
  mapProjectRow,
  mapTicketRow,
} from '@/lib/adminMappers';
import { CLIENT_TYPE_LABELS, CLIENT_STATUS_LABELS, CLIENT_STATUS_COLORS } from '@/lib/adminTypes';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { formatCurrency } from '@/lib/utils';

interface ClientDetailPageProps {
  clientId: string;
  backHref: string;
  panelLabel: string;
}

export function ClientDetailPage({ clientId, backHref, panelLabel }: ClientDetailPageProps) {
  const [activeTab, setActiveTab] = useState('info');

  const { data: clientData, loading: cLoading, error: cError } = useAdminFetch(() => fetchClientById(clientId), [clientId]);
  const { data: projectsData } = useAdminFetch(() => fetchProjectsByClient(clientId), [clientId]);
  const { data: contractsData } = useAdminFetch(() => fetchContracts({ client_id: clientId }), [clientId]);

  const clientNameForFetch = clientData?.client?.name;
  const clientPhoneForFetch = clientData?.client?.phone;

  const { data: invoicesData } = useAdminFetch(
    () => fetchInvoices({
      kind: 'invoice',
      ...(clientId ? { client_id: clientId } : {}),
      ...(!clientId && clientNameForFetch ? { customer_name: clientNameForFetch } : {}),
    }),
    [clientId, clientNameForFetch]
  );
  const { data: ticketsData } = useAdminFetch(
    () => fetchTickets({
      ...(clientNameForFetch ? { customer_name: clientNameForFetch } : {}),
      ...(clientPhoneForFetch ? { customer_contact: clientPhoneForFetch } : {}),
    }),
    [clientNameForFetch, clientPhoneForFetch]
  );
  const { data: leadsData } = useAdminFetch(() => fetchSalesLeads(), []);

  const client = useMemo(() => {
    if (clientData?.client) return mapClientRow(clientData.client);
    const p = projectsData?.projects?.[0];
    if (p) {
      return {
        id: clientId,
        name: p.customer_name ?? '—',
        type: 'other',
        phone: p.customer_contact ?? '—',
        email: '—',
        city: '—',
        status: 'active',
        salesOwner: '—',
        projectOwner: p.owner_name ?? '—',
        leadSource: '—',
        activeProjects: 0,
        lastContact: '—',
        totalRevenue: Number(p.contract_amount) || 0,
        internalNote: p.last_note,
        website: undefined as string | undefined,
        instagram: undefined as string | undefined,
        address: undefined as string | undefined,
      };
    }
    return null;
  }, [clientData, projectsData, clientId]);

  const projects = useMemo(() => (projectsData?.projects ?? []).map(mapProjectRow), [projectsData]);
  const contracts = useMemo(() => (contractsData?.contracts ?? []).map(mapContractRow), [contractsData]);
  const invoices = useMemo(
    () => (invoicesData?.invoices ?? []).map(mapInvoiceRow),
    [invoicesData]
  );
  const tickets = useMemo(
    () => (ticketsData?.tickets ?? []).map(mapTicketRow),
    [ticketsData]
  );
  const activities = useMemo(() => {
    if (!client) return [];
    const name = client.name;
    const phone = client.phone;
    const clientLeads = (leadsData?.leads ?? []).filter(
      (l) => l.name === name || (phone && phone !== '—' && l.contact === phone)
    );
    const clientTickets = (ticketsData?.tickets ?? []).filter(
      (t) => t.customer_name === name || (phone && phone !== '—' && t.customer_contact === phone)
    );
    return buildRecentActivities(clientLeads, clientTickets, projectsData?.projects ?? []);
  }, [leadsData, ticketsData, projectsData, client]);

  if (cLoading) return <AdminLoadingState />;
  if (cError && !client) return <AdminErrorState error={cError} />;

  if (!client) {
    return (
      <div className="text-center py-20 text-slate-500" dir="rtl">
        <p>مشتری یافت نشد</p>
        <Link href={backHref} className="text-blue-600 text-sm mt-2 inline-block">بازگشت</Link>
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: 'اطلاعات کلی' },
    { id: 'projects', label: 'پروژه‌ها', count: projects.length },
    { id: 'contracts', label: 'قراردادها', count: contracts.length },
    { id: 'invoices', label: 'فاکتورها', count: invoices.length },
    { id: 'tickets', label: 'تیکت‌ها', count: tickets.length },
    { id: 'files', label: 'فایل‌ها' },
    { id: 'notes', label: 'یادداشت‌ها' },
    { id: 'activities', label: 'فعالیت‌ها' },
  ];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title={client.name}
        description={`${CLIENT_TYPE_LABELS[client.type] ?? client.type} · ${client.city}`}
        icon={Users}
        breadcrumb={[{ label: panelLabel }, { label: 'مشتریان', href: backHref }, { label: client.name }]}
        actions={
          <Link href={backHref} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
            <ArrowRight className="w-4 h-4" />
            بازگشت
          </Link>
        }
      />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <StatusBadge label={CLIENT_STATUS_LABELS[client.status] ?? client.status} colorClass={CLIENT_STATUS_COLORS[client.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>مسئول فروش: <strong className="text-slate-700">{client.salesOwner}</strong></span>
            <span>مسئول پروژه: <strong className="text-slate-700">{client.projectOwner}</strong></span>
          </div>
        </div>

        <DetailTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="p-5">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <InfoRow label="نام" value={client.name} />
                <InfoRow label="نوع مشتری" value={CLIENT_TYPE_LABELS[client.type] ?? client.type} />
                <InfoRow label="شماره تماس" value={client.phone} dir="ltr" icon={Phone} />
                <InfoRow label="ایمیل" value={client.email} dir="ltr" icon={Mail} />
                {client.address && <InfoRow label="آدرس" value={client.address} />}
                <InfoRow label="شهر" value={client.city} />
              </div>
              <div className="space-y-4">
                {client.website && <InfoRow label="وب‌سایت" value={client.website} icon={Globe} />}
                {client.instagram && <InfoRow label="اینستاگرام" value={client.instagram} icon={AtSign} />}
                <InfoRow label="منبع آشنایی" value={client.leadSource} />
                <InfoRow label="مبلغ همکاری" value={formatCurrency(client.totalRevenue)} />
                {client.internalNote && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <p className="text-xs text-amber-700 font-medium mb-1">یادداشت داخلی</p>
                    <p className="text-sm text-amber-900">{client.internalNote}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'projects' && <SimpleTable headers={['نام', 'وضعیت', 'پیشرفت', 'ددلاین']} rows={projects.map((p) => [p.name, p.status, `${p.progress}٪`, p.deadline])} empty="پروژه‌ای ثبت نشده" />}
          {activeTab === 'contracts' && <SimpleTable headers={['شماره', 'نوع', 'مبلغ', 'وضعیت']} rows={contracts.map((c) => [c.number, c.type, formatCurrency(c.amount), c.signatureStatus])} empty="قراردادی ثبت نشده" />}
          {activeTab === 'invoices' && <SimpleTable headers={['شماره', 'مبلغ', 'وضعیت', 'تاریخ']} rows={invoices.map((i) => [i.invoice, formatCurrency(i.amount), i.status, i.sentDate])} empty="فاکتوری ثبت نشده" />}
          {activeTab === 'tickets' && <SimpleTable headers={['عنوان', 'اولویت', 'وضعیت']} rows={tickets.map((t) => [t.title, t.priority, t.status])} empty="تیکتی ثبت نشده" />}
          {activeTab === 'files' && <p className="text-sm text-slate-400 text-center py-8">فایلی آپلود نشده است</p>}
          {activeTab === 'notes' && <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-4">{client.internalNote ?? 'یادداشتی ثبت نشده'}</p>}
          {activeTab === 'activities' && <ActivityTimeline activities={activities.slice(0, 8)} />}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, dir, icon: Icon }: { label: string; value: string; dir?: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />}
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm text-slate-800 font-medium" dir={dir}>{value}</p>
      </div>
    </div>
  );
}

function SimpleTable({ headers, rows, empty }: { headers: string[]; rows: string[][]; empty: string }) {
  if (rows.length === 0) return <p className="text-sm text-slate-400 text-center py-8">{empty}</p>;
  return (
    <table className="w-full text-sm" dir="rtl">
      <thead>
        <tr className="border-b border-slate-100">
          {headers.map((h) => <th key={h} className="text-right py-2 text-xs font-semibold text-slate-500">{h}</th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((row, i) => (
          <tr key={i}>{row.map((cell, j) => <td key={j} className="py-2.5 text-slate-700">{cell}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

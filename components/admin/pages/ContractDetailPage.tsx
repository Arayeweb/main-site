'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { DocumentStatusBadge } from '@/components/admin/ui/PriorityBadge';
import { FileCheck, ArrowRight, Download, Send, PenLine, FolderOpen, Receipt, Loader2 } from 'lucide-react';
import {
  createInvoice,
  createProject,
  fetchContractById,
  updateContract,
} from '@/lib/adminApi';
import { mapContractRow } from '@/lib/adminMappers';
import {
  CONTRACT_TYPE_LABELS,
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
  CONTRACT_PAYMENT_STATUS_LABELS,
  CONTRACT_PAYMENT_STATUS_COLORS,
} from '@/lib/adminTypes';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { formatCurrency } from '@/lib/utils';
import { printContract } from '@/lib/contractPrint';

interface ContractDetailPageProps {
  id: string;
  backHref: string;
  panelLabel: string;
  /** Admin-only actions: convert to project, create invoice */
  showAdminActions?: boolean;
  projectBasePath?: string;
  paymentsHref?: string;
  /** When true, project creation shows alert instead of navigating (for roles without support panel access) */
  projectHandoffOnly?: boolean;
}

export function ContractDetailPage({
  id,
  backHref,
  panelLabel,
  showAdminActions = true,
  projectBasePath = '/admin/manager/projects',
  paymentsHref = '/admin/manager/payments',
  projectHandoffOnly = false,
}: ContractDetailPageProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const { data, loading, error, refetch } = useAdminFetch(() => fetchContractById(id), [id]);
  const contract = useMemo(() => (data?.contract ? mapContractRow(data.contract) : null), [data]);
  const rawContract = data?.contract;

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  if (!contract || !rawContract) {
    return (
      <div className="text-center py-20 text-slate-500" dir="rtl">
        <p>قرارداد یافت نشد</p>
        <Link href={backHref} className="text-blue-600 text-sm mt-2 inline-block">بازگشت</Link>
      </div>
    );
  }

  async function runAction(key: string, fn: () => Promise<void>) {
    setBusy(key);
    try {
      await fn();
      refetch();
    } finally {
      setBusy(null);
    }
  }

  const actions = [
    {
      key: 'pdf',
      label: 'دانلود PDF',
      icon: Download,
      onClick: () => printContract(rawContract),
    },
    {
      key: 'send',
      label: 'ارسال برای مشتری',
      icon: Send,
      onClick: () => runAction('send', async () => {
        const res = await updateContract(id, { signature_status: 'sent' });
        if (!res.ok) { alert(res.error); return; }
        alert('وضعیت قرارداد به «ارسال‌شده» تغییر کرد.');
      }),
    },
    {
      key: 'sign',
      label: 'ثبت امضا',
      icon: PenLine,
      onClick: () => runAction('sign', async () => {
        const res = await updateContract(id, { signature_status: 'signed' });
        if (!res.ok) { alert(res.error); return; }
        alert('امضای قرارداد ثبت شد.');
      }),
    },
    {
      key: 'project',
      label: 'تبدیل به پروژه',
      icon: FolderOpen,
      adminOnly: true,
      onClick: () => runAction('project', async () => {
        if (contract.projectId) {
          if (projectHandoffOnly) {
            alert('پروژه از قبل برای این قرارداد ثبت شده است.');
            return;
          }
          router.push(`${projectBasePath}/${contract.projectId}`);
          return;
        }
        const res = await createProject({
          title: `${contract.client} — ${CONTRACT_TYPE_LABELS[contract.type] ?? contract.type}`,
          customer_name: contract.client,
          client_id: contract.clientId,
          contract_id: id,
          contract_amount: contract.amount,
          service_type: contract.type === 'website_design' ? 'website' : 'other',
          status: 'intake',
        });
        if (!res.ok) { alert(res.error); return; }
        const projectId = res.data?.project.id;
        if (projectId) {
          await updateContract(id, { project_id: projectId });
          if (projectHandoffOnly) {
            alert('پروژه ثبت شد و به تیم پشتیبانی ارجاع شد.');
            return;
          }
          router.push(`${projectBasePath}/${projectId}`);
        }
      }),
    },
    {
      key: 'invoice',
      label: 'ایجاد فاکتور',
      icon: Receipt,
      adminOnly: true,
      onClick: () => runAction('invoice', async () => {
        const res = await createInvoice({
          kind: 'invoice',
          status: 'draft',
          customer_name: contract.client,
          client_id: rawContract.client_id,
          project_id: contract.projectId,
          note: `بابت قرارداد ${contract.number}`,
          items: [{
            title: contract.scopeOfWork?.slice(0, 200) || `قرارداد ${contract.number}`,
            qty: 1,
            unit_price: contract.amount,
          }],
        });
        if (!res.ok) { alert(res.error); return; }
        router.push(paymentsHref);
      }),
    },
  ].filter((a) => showAdminActions || !('adminOnly' in a && a.adminOnly));

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title={contract.number}
        description={`${contract.client} · ${CONTRACT_TYPE_LABELS[contract.type] ?? contract.type}`}
        icon={FileCheck}
        breadcrumb={[{ label: panelLabel }, { label: 'قراردادها', href: backHref }, { label: contract.number }]}
        actions={
          <Link href={backHref} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
            <ArrowRight className="w-4 h-4" />
            بازگشت
          </Link>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Section title="شرح کار">
            <p className="text-sm text-slate-600 leading-relaxed">{contract.scopeOfWork || '—'}</p>
          </Section>
          <Section title="تحویل‌دادنی‌ها">
            {contract.deliverables.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                {contract.deliverables.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">ثبت نشده</p>
            )}
          </Section>
          <Section title="شرایط پرداخت">
            <p className="text-sm text-slate-600">{contract.paymentTerms || '—'}</p>
          </Section>
          {contract.supportTerms && (
            <Section title="شرایط پشتیبانی">
              <p className="text-sm text-slate-600">{contract.supportTerms}</p>
            </Section>
          )}
          {contract.notes && (
            <Section title="یادداشت‌ها">
              <p className="text-sm text-slate-600">{contract.notes}</p>
            </Section>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">مبلغ</span>
              <span className="text-lg font-bold text-slate-900">{formatCurrency(contract.amount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">وضعیت امضا</span>
              <StatusBadge label={CONTRACT_STATUS_LABELS[contract.signatureStatus] ?? contract.signatureStatus} colorClass={CONTRACT_STATUS_COLORS[contract.signatureStatus] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">وضعیت پرداخت</span>
              <DocumentStatusBadge label={CONTRACT_PAYMENT_STATUS_LABELS[contract.paymentStatus] ?? contract.paymentStatus} colorClass={CONTRACT_PAYMENT_STATUS_COLORS[contract.paymentStatus] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">تاریخ شروع</span>
              <span className="text-sm text-slate-700">{contract.startDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">تاریخ پایان</span>
              <span className="text-sm text-slate-700">{contract.endDate}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">عملیات</h3>
            <div className="space-y-2">
              {actions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  disabled={busy !== null}
                  onClick={action.onClick}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-right disabled:opacity-60"
                >
                  {busy === action.key ? (
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                  ) : (
                    <action.icon className="w-4 h-4 text-slate-400" />
                  )}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}

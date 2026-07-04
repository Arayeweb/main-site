'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { DocumentStatusBadge } from '@/components/admin/ui/PriorityBadge';
import { FileCheck, ArrowRight, Download, Send, PenLine, FolderOpen, Receipt } from 'lucide-react';
import { fetchContractById } from '@/lib/adminApi';
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

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error } = useAdminFetch(() => fetchContractById(id), [id]);
  const contract = useMemo(() => (data?.contract ? mapContractRow(data.contract) : null), [data]);

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  if (!contract) {
    return (
      <div className="text-center py-20 text-slate-500" dir="rtl">
        <p>قرارداد یافت نشد</p>
        <Link href="/admin/manager/contracts" className="text-blue-600 text-sm mt-2 inline-block">بازگشت</Link>
      </div>
    );
  }

  const actions = [
    { label: 'دانلود PDF', icon: Download, onClick: () => {} },
    { label: 'ارسال برای مشتری', icon: Send, onClick: () => {} },
    { label: 'ثبت امضا', icon: PenLine, onClick: () => {} },
    { label: 'تبدیل به پروژه', icon: FolderOpen, onClick: () => {} },
    { label: 'ایجاد فاکتور', icon: Receipt, onClick: () => {} },
  ];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title={contract.number}
        description={`${contract.client} · ${CONTRACT_TYPE_LABELS[contract.type] ?? contract.type}`}
        icon={FileCheck}
        breadcrumb={[{ label: 'مدیریت' }, { label: 'قراردادها', href: '/admin/manager/contracts' }, { label: contract.number }]}
        actions={
          <Link href="/admin/manager/contracts" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
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
          <Section title="فایل‌ها">
            <p className="text-sm text-slate-400 text-center py-4">فایلی پیوست نشده</p>
          </Section>
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

          {contract.client && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3">اطلاعات مشتری</h3>
              <div className="space-y-2 text-sm">
                <p className="text-slate-700 font-medium">{contract.client}</p>
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">عملیات</h3>
            <div className="space-y-2">
              {actions.map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-right"
                >
                  <action.icon className="w-4 h-4 text-slate-400" />
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

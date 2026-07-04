'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { FileCheck, ArrowRight } from 'lucide-react';
import { createContract, fetchClients } from '@/lib/adminApi';
import { mapClientRow } from '@/lib/adminMappers';
import { CONTRACT_TYPE_LABELS } from '@/lib/adminTypes';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';

export default function NewContractPage() {
  const router = useRouter();
  const { data, loading, error } = useAdminFetch(() => fetchClients(), []);
  const clients = useMemo(() => (data?.clients ?? []).map(mapClientRow), [data]);
  const [clientId, setClientId] = useState('');
  const [contractType, setContractType] = useState('website_design');
  const [amount, setAmount] = useState('');
  const [scope, setScope] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  const selectedClient = clients.find((c) => c.id === clientId);

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="قرارداد جدید"
        description="ایجاد قرارداد جدید برای مشتری"
        icon={FileCheck}
        breadcrumb={[{ label: 'مدیریت' }, { label: 'قراردادها', href: '/admin/manager/contracts' }, { label: 'جدید' }]}
        actions={
          <Link href="/admin/manager/contracts" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
            <ArrowRight className="w-4 h-4" />
            بازگشت
          </Link>
        }
      />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 max-w-2xl">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setFormError('');
            const res = await createContract({
              client_id: clientId || null,
              client_name: selectedClient?.name || 'مشتری',
              contract_type: contractType,
              amount: Number(String(amount).replace(/[^\d]/g, '')) || 0,
              scope_of_work: scope,
              payment_terms: paymentTerms,
              signature_status: 'draft',
            });
            setBusy(false);
            if (!res.ok) {
              setFormError(res.error);
              return;
            }
            router.push('/admin/manager/contracts');
          }}
        >
          <Field label="مشتری">
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" dir="rtl" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">انتخاب مشتری</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="نوع قرارداد">
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" dir="rtl" value={contractType} onChange={(e) => setContractType(e.target.value)}>
              {Object.entries(CONTRACT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="مبلغ (تومان)">
            <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="مثال: ۳۲۰۰۰۰۰۰" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="شرح کار">
            <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[100px]" placeholder="شرح دامنه کار..." value={scope} onChange={(e) => setScope(e.target.value)} />
          </Field>
          <Field label="شرایط پرداخت">
            <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="مثال: ۵۰٪ پیش‌پرداخت..." value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
          </Field>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <button type="submit" disabled={busy} className="bg-slate-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60">
            {busy ? 'در حال ذخیره...' : 'ذخیره پیش‌نویس'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { FileText, ArrowRight } from 'lucide-react';
import { fetchClients, fetchSalesLeadById, createInvoice } from '@/lib/adminApi';
import { mapClientRow, mapLeadRow } from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';

function NewProposalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');
  const [clientId, setClientId] = useState('');
  const [service, setService] = useState('');
  const [amount, setAmount] = useState('');
  const [timeline, setTimeline] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const { data: leadData, loading: lLoading, error: lError } = useAdminFetch(
    () => {
      if (!leadId) {
        return Promise.resolve({ ok: true as const, data: { lead: null as unknown as import('@/lib/adminApi').ApiLead } });
      }
      return fetchSalesLeadById(leadId);
    },
    [leadId]
  );
  const { data: clientsData, loading: cLoading, error: cError } = useAdminFetch(() => fetchClients(), []);

  const lead = useMemo(() => {
    if (!leadId || !leadData?.lead) return undefined;
    return mapLeadRow(leadData.lead);
  }, [leadData, leadId]);

  const clients = useMemo(() => (clientsData?.clients ?? []).map(mapClientRow), [clientsData]);

  if (lLoading && leadId) return <AdminLoadingState />;
  if (lError && leadId) return <AdminErrorState error={lError} />;
  if (cLoading) return <AdminLoadingState />;
  if (cError) return <AdminErrorState error={cError} />;

  const selectedClient = clients.find((c) => c.id === clientId);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 max-w-2xl">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          const customerName = selectedClient?.name || lead?.name || 'مشتری';
          const unitPrice = Number(String(amount).replace(/[^\d]/g, '')) || 0;
          const res = await createInvoice({
            kind: 'proforma',
            status: 'draft',
            customer_name: customerName,
            customer_contact: selectedClient?.phone || lead?.phone || null,
            lead_id: leadId || null,
            client_id: clientId || null,
            note: [note, timeline ? `زمان‌بندی: ${timeline}` : ''].filter(Boolean).join('\n'),
            items: [{ title: service || lead?.need || 'خدمت', qty: 1, unit_price: unitPrice }],
          });
          setBusy(false);
          if (!res.ok) {
            setError(res.error);
            return;
          }
          router.push('/admin/sales/proposals');
        }}
      >
        <Field label="مشتری">
          <select
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            dir="rtl"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="">انتخاب مشتری</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        {lead && (
          <>
            <Field label="منبع لید">
              <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" value={lead.sourceLabel} readOnly />
            </Field>
            <Field label="نیاز مشتری">
              <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" value={lead.need} readOnly />
            </Field>
          </>
        )}
        <Field label="خدمت پیشنهادی">
          <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="مثال: طراحی سایت شرکتی" value={service || lead?.need || ''} onChange={(e) => setService(e.target.value)} />
        </Field>
        <Field label="مبلغ (تومان)">
          <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="مثال: ۲۸۰۰۰۰۰۰" value={amount || lead?.budget || ''} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="زمان‌بندی">
          <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="مثال: ۲.۵ ماه" value={timeline} onChange={(e) => setTimeline(e.target.value)} />
        </Field>
        <Field label="یادداشت">
          <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[80px]" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="bg-slate-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60">
          {busy ? 'در حال ذخیره...' : 'ذخیره پیش‌نویس'}
        </button>
      </form>
    </div>
  );
}

export default function NewProposalPage() {
  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="پیشنهاد قیمت جدید"
        description="ایجاد پیشنهاد قیمت برای مشتری"
        icon={FileText}
        breadcrumb={[{ label: 'فروش' }, { label: 'پیشنهادها', href: '/admin/sales/proposals' }, { label: 'جدید' }]}
        actions={
          <Link href="/admin/sales/proposals" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
            <ArrowRight className="w-4 h-4" />
            بازگشت
          </Link>
        }
      />

      <Suspense fallback={<AdminLoadingState />}>
        <NewProposalForm />
      </Suspense>
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

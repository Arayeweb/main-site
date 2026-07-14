'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { createInvoice, fetchClients, fetchSalesLeadById } from '@/lib/adminApi';
import { mapClientRow, mapLeadRow } from '@/lib/adminMappers';

interface NewInvoiceFormProps {
  panelLabel: string;
  listHref: string;
}

function InvoiceFormBody({ panelLabel, listHref }: NewInvoiceFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');
  const [clientId, setClientId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [service, setService] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [terms, setTerms] = useState('');
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

          const name = customerName.trim() || selectedClient?.name || lead?.name || '';
          if (!name) {
            setError('نام مشتری الزامی است');
            setBusy(false);
            return;
          }

          const unitPrice = Number(String(amount).replace(/[^\d]/g, '')) || 0;
          const res = await createInvoice({
            kind: 'invoice',
            status: 'draft',
            customer_name: name,
            customer_contact: customerContact.trim() || selectedClient?.phone || lead?.phone || null,
            customer_address: customerAddress.trim() || null,
            lead_id: leadId || null,
            client_id: clientId || null,
            due_date: dueDate || null,
            note: note.trim() || null,
            terms: terms.trim() || null,
            items: [{ title: service.trim() || lead?.need || 'خدمت', qty: 1, unit_price: unitPrice }],
          });

          setBusy(false);
          if (!res.ok) {
            setError(res.error);
            return;
          }

          const invoiceId = res.data?.invoice.id;
          if (invoiceId) {
            router.push(listHref.replace(/\/$/, '') + `/${invoiceId}`);
          } else {
            router.push(listHref);
          }
        }}
      >
        <Field label="مشتری ثبت‌شده">
          <select
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            dir="rtl"
            value={clientId}
            onChange={(e) => {
              const id = e.target.value;
              setClientId(id);
              const client = clients.find((c) => c.id === id);
              if (client) {
                setCustomerName(client.name);
                setCustomerContact(client.phone !== '—' ? client.phone : '');
              }
            }}
          >
            <option value="">انتخاب مشتری (اختیاری)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="نام مشتری *">
          <input
            type="text"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            value={customerName || selectedClient?.name || lead?.name || ''}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </Field>

        <Field label="تماس">
          <input
            type="text"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            value={customerContact || selectedClient?.phone || lead?.phone || ''}
            onChange={(e) => setCustomerContact(e.target.value)}
          />
        </Field>

        <Field label="آدرس">
          <input
            type="text"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
          />
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

        <Field label="شرح خدمت / کالا">
          <input
            type="text"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            placeholder="مثال: طراحی سایت شرکتی"
            value={service || lead?.need || ''}
            onChange={(e) => setService(e.target.value)}
          />
        </Field>

        <Field label="مبلغ (تومان)">
          <input
            type="text"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            placeholder="مثال: ۲۸۰۰۰۰۰۰"
            value={amount || lead?.budget || ''}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>

        <Field label="تاریخ سررسید">
          <input
            type="date"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </Field>

        <Field label="شرایط پرداخت">
          <textarea
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[60px]"
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
          />
        </Field>

        <Field label="یادداشت">
          <textarea
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[80px]"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="bg-slate-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60"
        >
          {busy ? 'در حال ذخیره...' : 'ذخیره فاکتور'}
        </button>
      </form>
    </div>
  );
}

export function NewInvoicePage({ panelLabel, listHref }: NewInvoiceFormProps) {
  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="فاکتور جدید"
        description="صدور فاکتور برای مشتری"
        icon={FileText}
        breadcrumb={[{ label: panelLabel }, { label: 'فاکتورها', href: listHref }, { label: 'جدید' }]}
        actions={
          <Link href={listHref} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
            <ArrowRight className="w-4 h-4" />
            بازگشت
          </Link>
        }
      />

      <Suspense fallback={<AdminLoadingState />}>
        <InvoiceFormBody panelLabel={panelLabel} listHref={listHref} />
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

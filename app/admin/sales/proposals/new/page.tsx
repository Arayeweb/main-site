'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { FileText, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { fetchClients, fetchSalesLeadById, createInvoice } from '@/lib/adminApi';
import { mapClientRow, mapLeadRow } from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { formatCurrency } from '@/lib/utils';

type LineItem = {
  id: string;
  title: string;
  unitPrice: string;
  discount: string;
};

function newLine(partial?: Partial<Omit<LineItem, 'id'>>): LineItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: partial?.title ?? '',
    unitPrice: partial?.unitPrice ?? '',
    discount: partial?.discount ?? '',
  };
}

function parseMoney(value: string): number {
  return Number(String(value).replace(/[^\d]/g, '')) || 0;
}

function parsePercent(value: string): number {
  const n = Number(String(value).replace(/[^\d.]/g, ''));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(100, n);
}

function lineNet(unitPrice: number, discountPct: number): number {
  const disc = Math.round(unitPrice * (discountPct / 100));
  return unitPrice - disc;
}

function NewProposalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState<LineItem[]>([newLine()]);
  const [timeline, setTimeline] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [seededFromLead, setSeededFromLead] = useState(false);

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

  // پر کردن ردیف اول از لید (یک‌بار)
  useEffect(() => {
    if (seededFromLead || !lead) return;
    setItems([
      newLine({
        title: lead.need !== '—' ? lead.need : '',
        unitPrice: lead.budget !== '—' ? String(lead.budget).replace(/[^\d]/g, '') : '',
      }),
    ]);
    setSeededFromLead(true);
  }, [lead, seededFromLead]);

  const totals = useMemo(() => {
    let subtotal = 0;
    let discountTotal = 0;
    for (const it of items) {
      const price = parseMoney(it.unitPrice);
      const discPct = parsePercent(it.discount);
      const disc = Math.round(price * (discPct / 100));
      subtotal += price;
      discountTotal += disc;
    }
    return {
      subtotal,
      discountTotal,
      grandTotal: subtotal - discountTotal,
    };
  }, [items]);

  if (lLoading && leadId) return <AdminLoadingState />;
  if (lError && leadId) return <AdminErrorState error={lError} />;
  if (cLoading) return <AdminLoadingState />;
  if (cError) return <AdminErrorState error={cError} />;

  const selectedClient = clients.find((c) => c.id === clientId);

  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function removeItem(id: string) {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((it) => it.id !== id)));
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 max-w-3xl">
      <form
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');

          const payloadItems = items
            .map((it) => ({
              title: it.title.trim(),
              qty: 1,
              unit_price: parseMoney(it.unitPrice),
              discount: parsePercent(it.discount),
            }))
            .filter((it) => it.title || it.unit_price > 0);

          if (payloadItems.length === 0) {
            setBusy(false);
            setError('حداقل یک خدمت با عنوان یا مبلغ وارد کنید');
            return;
          }
          for (const it of payloadItems) {
            if (!it.title) {
              setBusy(false);
              setError('عنوان هر خدمت الزامی است');
              return;
            }
          }

          const customerName = selectedClient?.name || lead?.name || 'مشتری';
          const res = await createInvoice({
            kind: 'proforma',
            status: 'draft',
            customer_name: customerName,
            customer_contact: selectedClient?.phone || lead?.phone || null,
            lead_id: leadId || null,
            client_id: clientId || null,
            note: [note, timeline ? `زمان‌بندی: ${timeline}` : ''].filter(Boolean).join('\n'),
            items: payloadItems,
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
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        {lead && (
          <>
            <Field label="منبع لید">
              <input
                type="text"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50"
                value={lead.sourceLabel}
                readOnly
              />
            </Field>
            <Field label="نیاز مشتری">
              <input
                type="text"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50"
                value={lead.need}
                readOnly
              />
            </Field>
          </>
        )}

        <div>
          <div className="flex items-center justify-between gap-3 mb-2">
            <label className="block text-sm font-medium text-slate-700">خدمات پیشنهادی</label>
            <button
              type="button"
              onClick={() => setItems((prev) => [...prev, newLine()])}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50"
            >
              <Plus className="w-3.5 h-3.5" />
              افزودن خدمت
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const price = parseMoney(item.unitPrice);
              const discPct = parsePercent(item.discount);
              const net = lineNet(price, discPct);
              return (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-xl p-3 space-y-3 bg-slate-50/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500">خدمت {idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        aria-label="حذف خدمت"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                    placeholder="عنوان خدمت — مثال: طراحی سایت شرکتی"
                    value={item.title}
                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">قیمت (تومان)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        dir="ltr"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white tabular-nums"
                        placeholder="۲۸۰۰۰۰۰۰"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, { unitPrice: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">تخفیف (٪)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        dir="ltr"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white tabular-nums"
                        placeholder="۰"
                        value={item.discount}
                        onChange={(e) => updateItem(item.id, { discount: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">مبلغ پس از تخفیف</label>
                      <div className="w-full border border-slate-100 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 tabular-nums">
                        {formatCurrency(net)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 border border-slate-200 rounded-xl p-4 space-y-2 text-sm bg-white">
            <div className="flex items-center justify-between text-slate-600">
              <span>جمع خدمات</span>
              <span className="tabular-nums">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>جمع تخفیف</span>
              <span className="tabular-nums text-emerald-700">
                {totals.discountTotal > 0 ? `− ${formatCurrency(totals.discountTotal)}` : formatCurrency(0)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-bold text-slate-900">
              <span>مبلغ نهایی</span>
              <span className="tabular-nums">{formatCurrency(totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        <Field label="زمان‌بندی">
          <input
            type="text"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            placeholder="مثال: ۲.۵ ماه"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
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
        description="برای هر خدمت قیمت و تخفیف جداگانه ثبت کنید"
        icon={FileText}
        breadcrumb={[
          { label: 'فروش' },
          { label: 'پیشنهادها', href: '/admin/sales/proposals' },
          { label: 'جدید' },
        ]}
        actions={
          <Link
            href="/admin/sales/proposals"
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
          >
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

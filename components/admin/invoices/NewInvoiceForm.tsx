'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, FileText, Plus, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { createInvoice, fetchClients, fetchSalesLeadById } from '@/lib/adminApi';
import { mapClientRow, mapLeadRow } from '@/lib/adminMappers';
import { ShamsiDateInput } from '@/components/admin/ui/ShamsiDateInput';
import { formatCurrency } from '@/lib/utils';

interface NewInvoiceFormProps {
  panelLabel: string;
  listHref: string;
}

type LineItem = {
  id: string;
  title: string;
  description: string;
  qty: string;
  unitPrice: string;
  /** تخفیف به تومان (مطلق) — هنگام ذخیره به درصد تبدیل می‌شود */
  discountAmount: string;
};

function newLine(partial?: Partial<Omit<LineItem, 'id'>>): LineItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: partial?.title ?? '',
    description: partial?.description ?? '',
    qty: partial?.qty ?? '1',
    unitPrice: partial?.unitPrice ?? '',
    discountAmount: partial?.discountAmount ?? '',
  };
}

function parseMoney(value: string): number {
  return Number(String(value).replace(/[^\d]/g, '')) || 0;
}

function parseQty(value: string): number {
  const n = Number(String(value).replace(/[^\d.]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return 1;
  return n;
}

/** تخفیف تومان → درصد برای API موجود */
function discountToPercent(base: number, discountAmount: number): number {
  if (base <= 0 || discountAmount <= 0) return 0;
  const capped = Math.min(base, discountAmount);
  return Math.round((capped / base) * 10000) / 100;
}

function InvoiceFormBody({ listHref }: NewInvoiceFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');
  const [clientId, setClientId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [items, setItems] = useState<LineItem[]>([newLine()]);
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [terms, setTerms] = useState('');
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

  useEffect(() => {
    if (seededFromLead || !lead) return;
    setCustomerName(lead.name !== '—' ? lead.name : '');
    setCustomerContact(lead.phone || '');
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
      const qty = parseQty(it.qty);
      const price = parseMoney(it.unitPrice);
      const base = qty * price;
      const disc = Math.min(base, parseMoney(it.discountAmount));
      subtotal += base;
      discountTotal += disc;
    }
    return { subtotal, discountTotal, grandTotal: subtotal - discountTotal };
  }, [items]);

  if (lLoading && leadId) return <AdminLoadingState />;
  if (lError && leadId) return <AdminErrorState error={lError} />;
  if (cLoading) return <AdminLoadingState />;
  if (cError) return <AdminErrorState error={cError} />;

  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function removeItem(id: string) {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((it) => it.id !== id)));
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 max-w-4xl">
      <form
        className="space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');

          const name = customerName.trim();
          if (!name) {
            setError('نام خریدار الزامی است');
            setBusy(false);
            return;
          }

          const payloadItems = items
            .map((it) => {
              const qty = parseQty(it.qty);
              const unitPrice = parseMoney(it.unitPrice);
              const base = qty * unitPrice;
              const discAmount = Math.min(base, parseMoney(it.discountAmount));
              const titleBase = it.title.trim();
              const desc = it.description.trim();
              const title = desc ? `${titleBase} — ${desc}` : titleBase;
              return {
                title,
                qty,
                unit_price: unitPrice,
                discount: discountToPercent(base, discAmount),
              };
            })
            .filter((it) => it.title || it.unit_price > 0);

          if (payloadItems.length === 0) {
            setBusy(false);
            setError('حداقل یک کالا/خدمت وارد کنید');
            return;
          }
          for (const it of payloadItems) {
            if (!it.title) {
              setBusy(false);
              setError('نام کالا/خدمات برای هر ردیف الزامی است');
              return;
            }
          }

          const res = await createInvoice({
            kind: 'invoice',
            status: 'draft',
            customer_name: name,
            customer_contact: customerContact.trim() || null,
            customer_address: customerAddress.trim() || null,
            lead_id: leadId || null,
            client_id: clientId || null,
            due_date: dueDate || null,
            note: note.trim() || null,
            terms: terms.trim() || null,
            items: payloadItems,
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
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">مشخصات مشتری</h2>
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <Field label="مشتری ثبت‌شده">
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                dir="rtl"
                value={clientId}
                onChange={(e) => {
                  const id = e.target.value;
                  setClientId(id);
                  const client = clients.find((c) => c.id === id);
                  if (client) {
                    setCustomerName(client.name);
                    setCustomerContact(client.phone !== '—' ? client.phone : '');
                    if (client.city && client.city !== '—') {
                      setCustomerAddress((prev) => prev || client.city);
                    }
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="نام خریدار *">
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </Field>
              <Field label="موبایل / تلفن">
                <input
                  type="text"
                  dir="ltr"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                />
              </Field>
              <Field label="آدرس">
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                />
              </Field>
            </div>
          </div>
        </section>

        {lead && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="منبع لید">
              <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" value={lead.sourceLabel} readOnly />
            </Field>
            <Field label="نیاز مشتری">
              <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" value={lead.need} readOnly />
            </Field>
          </div>
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900">شرح کالا / خدمات</h2>
            <button
              type="button"
              onClick={() => setItems((prev) => [...prev, newLine()])}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-2"
            >
              <Plus className="w-3.5 h-3.5" />
              افزودن شرح کالا/خدمات جدید
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const qty = parseQty(item.qty);
              const unitPrice = parseMoney(item.unitPrice);
              const withoutDiscount = qty * unitPrice;
              const discount = Math.min(withoutDiscount, parseMoney(item.discountAmount));
              const rowTotal = withoutDiscount - discount;

              return (
                <div key={item.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/40">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500">ردیف {idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        aria-label="حذف ردیف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                    <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2">
                      <label className="block text-xs text-slate-500 mb-1">نام کالا / خدمات *</label>
                      <input
                        type="text"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                        placeholder="مثال: طراحی سایت"
                        value={item.title}
                        onChange={(e) => updateItem(item.id, { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">تعداد *</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        dir="ltr"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white tabular-nums"
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, { qty: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">قیمت واحد (تومان)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        dir="ltr"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white tabular-nums"
                        placeholder="0"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, { unitPrice: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">تخفیف (تومان)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        dir="ltr"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white tabular-nums"
                        placeholder="0"
                        value={item.discountAmount}
                        onChange={(e) => updateItem(item.id, { discountAmount: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">جمع کل (تومان)</label>
                      <div className="w-full border border-slate-100 rounded-lg px-3 py-2 text-sm bg-white text-slate-800 tabular-nums font-medium">
                        {formatCurrency(rowTotal)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500">
                    <p>
                      جمع بدون تخفیف:{' '}
                      <span className="tabular-nums text-slate-700">{formatCurrency(withoutDiscount)}</span>
                    </p>
                    {discount > 0 && (
                      <p>
                        تخفیف اعمال‌شده:{' '}
                        <span className="tabular-nums text-emerald-700">− {formatCurrency(discount)}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">شرح کالا / خدمات</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                      placeholder="در صورت نیاز به درج شرح یا مشخصات برای کالا در این بخش ثبت گردد."
                      value={item.description}
                      onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border border-slate-200 rounded-xl p-4 space-y-2 text-sm bg-white">
            <div className="flex items-center justify-between text-slate-600">
              <span>جمع بدون تخفیف</span>
              <span className="tabular-nums">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>جمع تخفیف</span>
              <span className="tabular-nums text-emerald-700">
                {totals.discountTotal > 0 ? `− ${formatCurrency(totals.discountTotal)}` : formatCurrency(0)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-bold text-slate-900">
              <span>مبلغ قابل پرداخت</span>
              <span className="tabular-nums">{formatCurrency(totals.grandTotal)}</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="تاریخ سررسید">
            <ShamsiDateInput value={dueDate} onChange={setDueDate} />
          </Field>
          <Field label="شرایط پرداخت">
            <textarea
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[72px]"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
            />
          </Field>
        </div>

        <Field label="یادداشت فاکتور">
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
        description="برای هر کالا/خدمت قیمت و تخفیف جداگانه ثبت کنید"
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

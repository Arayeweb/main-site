'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ShamsiDateInput } from '@/components/admin/ui/ShamsiDateInput';
import { UserPlus, ArrowRight, Phone, ExternalLink } from 'lucide-react';
import {
  fetchContracts,
  fetchInvoices,
  fetchLeadActivities,
  fetchSalesLeadById,
  fetchSalesTeam,
  patchSalesLead,
  postLeadActivity,
} from '@/lib/adminApi';
import {
  CRM_ACTIVITY_KIND_COLORS,
  CRM_ACTIVITY_KIND_LABELS,
  CRM_STATUS_COLORS,
  CRM_STATUS_LABELS,
  formatFaDateTime,
  mapLeadRow,
  resolveOwnerLabel,
  resolveSourceLabel,
} from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { cn } from '@/lib/utils';

interface LeadDetailPageProps {
  id: string;
  backHref?: string;
  panelLabel?: string;
}

type ActivityKind = 'note' | 'call' | 'followup';

const CALL_OUTCOMES = [
  { value: '', label: 'بدون نتیجه مشخص' },
  { value: 'پاسخ داد', label: 'پاسخ داد' },
  { value: 'مشغول / قطع شد', label: 'مشغول / قطع شد' },
  { value: 'پاسخگو نبود', label: 'پاسخگو نبود' },
  { value: 'بعداً تماس بگیرد', label: 'بعداً تماس بگیرد' },
  { value: 'علاقه‌مند است', label: 'علاقه‌مند است' },
  { value: 'رد کرد', label: 'رد کرد' },
];

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value || value === '—') return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold text-slate-500 w-32 shrink-0">{label}</span>
      <span className="text-sm text-slate-800 break-all">{value}</span>
    </div>
  );
}

export function LeadDetailPage({ id, backHref = '/admin/sales/leads', panelLabel = 'فروش' }: LeadDetailPageProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [activityKind, setActivityKind] = useState<ActivityKind>('call');
  const [callOutcome, setCallOutcome] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [ownerSelect, setOwnerSelect] = useState('');

  const { data, loading, error, refetch } = useAdminFetch(() => fetchSalesLeadById(id), [id]);
  const { data: actData, refetch: refetchActs } = useAdminFetch(() => fetchLeadActivities(id), [id]);
  const { data: invData } = useAdminFetch(() => fetchInvoices({ lead_id: id }), [id]);
  const { data: contractData } = useAdminFetch(() => fetchContracts({ lead_id: id }), [id]);
  const { data: teamData } = useAdminFetch(() => fetchSalesTeam(), []);

  const teamById = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of teamData?.team ?? []) {
      map.set(m.id, m.name?.trim() || m.email || m.id.slice(0, 8));
    }
    return map;
  }, [teamData]);

  const lead = useMemo(() => {
    if (!data?.lead) return null;
    const row = mapLeadRow(data.lead);
    return { ...row, assignedTo: resolveOwnerLabel(row.ownerId, teamById) };
  }, [data, teamById]);

  const raw = data?.lead;
  const activities = actData?.activities ?? [];
  const relatedInvoices = invData?.invoices ?? [];
  const relatedContracts = contractData?.contracts ?? [];

  useEffect(() => {
    const nf = data?.lead?.next_followup_at;
    if (nf) setFollowupDate(nf.slice(0, 10));
  }, [data?.lead?.next_followup_at]);

  useEffect(() => {
    setOwnerSelect(data?.lead?.owner_id ?? '');
  }, [data?.lead?.owner_id]);

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  if (!lead || !raw) {
    return (
      <div className="text-center py-20 text-slate-500" dir="rtl">
        <p>لید یافت نشد</p>
        <Link href={backHref} className="text-blue-600 text-sm mt-2 inline-block">
          بازگشت
        </Link>
      </div>
    );
  }

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await patchSalesLead(id, body);
      if (!res.ok) alert(res.error);
      else {
        refetch();
        refetchActs();
      }
    } finally {
      setBusy(false);
    }
  }

  async function markContacted() {
    setBusy(true);
    try {
      const statusRes = await patchSalesLead(id, { crm_status: 'contacted' });
      if (!statusRes.ok) {
        alert(statusRes.error);
        return;
      }
      await postLeadActivity(id, 'تماس سریع ثبت شد', 'call');
      refetch();
      refetchActs();
    } finally {
      setBusy(false);
    }
  }

  async function submitActivity() {
    if (!noteText.trim() && activityKind !== 'call') return;
    setBusy(true);
    try {
      let body = noteText.trim();
      if (activityKind === 'call') {
        const outcome = callOutcome.trim();
        if (outcome && body) body = `نتیجه: ${outcome} — ${body}`;
        else if (outcome) body = `نتیجه: ${outcome}`;
        else if (!body) body = 'تماس ثبت شد';
      }
      if (activityKind === 'followup' && !body) {
        body = followupDate ? `پیگیری برای ${followupDate} تنظیم شد` : 'پیگیری ثبت شد';
      }

      const res = await postLeadActivity(id, body, activityKind);
      if (!res.ok) {
        alert(res.error);
        return;
      }

      if (activityKind === 'followup' && followupDate) {
        await patchSalesLead(id, { next_followup_at: followupDate + 'T12:00:00' });
      }

      setNoteText('');
      setCallOutcome('');
      refetchActs();
      refetch();
    } finally {
      setBusy(false);
    }
  }

  async function saveOwner() {
    setBusy(true);
    try {
      const res = await patchSalesLead(id, {
        owner_id: ownerSelect || null,
      });
      if (!res.ok) alert(res.error);
      else refetch();
    } finally {
      setBusy(false);
    }
  }

  const rawJson = raw.raw ? JSON.stringify(raw.raw, null, 2) : null;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title={lead.name}
        description={`${lead.phone} · ${lead.sourceLabel} · مالک: ${lead.assignedTo}`}
        icon={UserPlus}
        breadcrumb={[{ label: panelLabel }, { label: 'لیدها', href: backHref }, { label: lead.name }]}
        actions={
          <div className="flex items-center gap-2">
            <a
              href={`tel:${lead.phone}`}
              className="flex items-center gap-1.5 text-sm border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50"
            >
              <Phone className="w-4 h-4" />
              تماس
            </a>
            <button
              type="button"
              disabled={busy}
              onClick={() => router.push(`/admin/sales/proposals/new?leadId=${id}`)}
              className="text-sm bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700 disabled:opacity-50"
            >
              پیشنهاد قیمت
            </button>
            <Link href={backHref} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
              <ArrowRight className="w-4 h-4" />
              بازگشت
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <div className="flex flex-wrap gap-2 mb-4">
              <StatusBadge
                label={CRM_STATUS_LABELS[lead.status] ?? lead.status}
                colorClass={CRM_STATUS_COLORS[lead.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}
              />
              <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">ثبت: {lead.createdAt}</span>
              <span className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-full">مالک: {lead.assignedTo}</span>
            </div>

            <InfoRow label="نام" value={lead.name} />
            <InfoRow label="موبایل" value={<span dir="ltr">{lead.phone}</span>} />
            <InfoRow label="کسب‌وکار" value={lead.business} />
            <InfoRow label="مالک" value={lead.assignedTo} />
            <InfoRow label="منبع" value={resolveSourceLabel(raw.source)} />
            <InfoRow label="صفحه" value={raw.page} />
            <InfoRow label="نیاز / هدف" value={lead.need} />
            <InfoRow label="پکیج" value={lead.plan} />
            <InfoRow label="بودجه" value={lead.budget} />
            <InfoRow label="نوع سایت" value={raw.sitetype} />
            <InfoRow label="کانال" value={raw.channel} />
            <InfoRow label="نیت (چت‌بات)" value={raw.intent} />
            <InfoRow label="جزئیات (چت‌بات)" value={raw.detail} />
            {lead.note && <InfoRow label="یادداشت CRM" value={lead.note} />}
          </div>

          {(relatedInvoices.length > 0 || relatedContracts.length > 0) && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3">مرتبط با این لید</h3>
              {relatedInvoices.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2">پیش‌فاکتور / فاکتور</p>
                  <div className="space-y-2">
                    {relatedInvoices.map((inv) => (
                      <Link
                        key={inv.id}
                        href={`/admin/sales/proposals/${inv.id}`}
                        className="flex items-center justify-between text-sm border border-slate-100 rounded-lg px-3 py-2 hover:bg-slate-50"
                      >
                        <span className="font-medium text-slate-800">{inv.invoice_number}</span>
                        <span className="text-xs text-slate-500">
                          {inv.kind} · {inv.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {relatedContracts.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">قراردادها</p>
                  <div className="space-y-2">
                    {relatedContracts.map((c) => (
                      <Link
                        key={c.id}
                        href={`/admin/sales/contracts/${c.id}`}
                        className="flex items-center justify-between text-sm border border-slate-100 rounded-lg px-3 py-2 hover:bg-slate-50"
                      >
                        <span className="font-medium text-slate-800">{c.contract_number}</span>
                        <span className="text-xs text-slate-500">{c.signature_status}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {(raw.utm_source || raw.referrer) && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3">UTM و ارجاع</h3>
              <InfoRow label="utm_source" value={raw.utm_source} />
              <InfoRow label="utm_medium" value={raw.utm_medium} />
              <InfoRow label="utm_campaign" value={raw.utm_campaign} />
              <InfoRow label="utm_content" value={raw.utm_content} />
              <InfoRow label="utm_term" value={raw.utm_term} />
              <InfoRow
                label="referrer"
                value={
                  raw.referrer ? (
                    <a
                      href={raw.referrer}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      {raw.referrer}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : null
                }
              />
            </div>
          )}

          {rawJson && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3">داده خام (raw)</h3>
              <pre className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-x-auto max-h-80" dir="ltr">
                {rawJson}
              </pre>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">تاریخچه فعالیت</h3>
            {activities.length === 0 ? (
              <p className="text-sm text-slate-400">فعالیتی ثبت نشده</p>
            ) : (
              <div className="space-y-3">
                {activities.map((a) => (
                  <div key={a.id} className="border-b border-slate-100 pb-3 last:border-0">
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          label={CRM_ACTIVITY_KIND_LABELS[a.kind] ?? a.kind}
                          colorClass={
                            CRM_ACTIVITY_KIND_COLORS[a.kind] ?? 'bg-slate-50 text-slate-600 ring-slate-200'
                          }
                        />
                        <span className="text-xs font-medium text-slate-600">{a.author_name ?? 'سیستم'}</span>
                      </div>
                      <span className="text-xs text-slate-400">{formatFaDateTime(a.created_at)}</span>
                    </div>
                    <p className="text-sm text-slate-800">{a.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">مالک لید</h3>
            <select
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
              value={ownerSelect}
              onChange={(e) => setOwnerSelect(e.target.value)}
              dir="rtl"
            >
              <option value="">بدون مالک</option>
              {(teamData?.team ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name?.trim() || m.email || m.id.slice(0, 8)}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void saveOwner()}
                className="flex-1 text-sm bg-slate-900 text-white rounded-lg py-2 hover:bg-slate-800 disabled:opacity-40"
              >
                ذخیره مالک
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void patch({ owner_id: 'me' })}
                className="flex-1 text-sm border border-slate-200 rounded-lg py-2 hover:bg-slate-50 disabled:opacity-40"
              >
                اختصاص به من
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">اقدامات CRM</h3>
            <button
              type="button"
              disabled={busy || lead.status === 'contacted'}
              onClick={() => void markContacted()}
              className="w-full text-xs border border-sky-200 bg-sky-50 text-sky-800 rounded-lg px-2 py-2 hover:bg-sky-100 disabled:opacity-40"
            >
              تماس شد (وضعیت + ثبت تماس)
            </button>
            <div className="grid grid-cols-2 gap-2">
              {(['contacted', 'qualified', 'proposal', 'won', 'lost'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={busy || lead.status === s}
                  onClick={() => void patch({ crm_status: s })}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-2 hover:bg-slate-50 disabled:opacity-40"
                >
                  {CRM_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">پیگیری بعدی</h3>
            <ShamsiDateInput value={followupDate} onChange={setFollowupDate} />
            <button
              type="button"
              disabled={busy || !followupDate}
              onClick={() => void patch({ next_followup_at: followupDate + 'T12:00:00' })}
              className="w-full text-sm bg-slate-800 text-white rounded-lg py-2 hover:bg-slate-900 disabled:opacity-40"
            >
              ثبت تاریخ پیگیری
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">ثبت فعالیت</h3>
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
              {(
                [
                  { id: 'call' as const, label: 'تماس' },
                  { id: 'followup' as const, label: 'پیگیری' },
                  { id: 'note' as const, label: 'یادداشت' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setActivityKind(opt.id)}
                  className={cn(
                    'flex-1 text-xs py-1.5 rounded-md transition-colors',
                    activityKind === opt.id
                      ? 'bg-white shadow-sm font-medium text-slate-900'
                      : 'text-slate-600'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {activityKind === 'call' && (
              <select
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
                value={callOutcome}
                onChange={(e) => setCallOutcome(e.target.value)}
                dir="rtl"
              >
                {CALL_OUTCOMES.map((o) => (
                  <option key={o.value || 'none'} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}

            {activityKind === 'followup' && (
              <p className="text-xs text-slate-500">
                با ثبت پیگیری، تاریخ بالا (اگر پر باشد) روی لید هم ذخیره می‌شود.
              </p>
            )}

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none"
              placeholder={
                activityKind === 'call'
                  ? 'جزئیات تماس (اختیاری)...'
                  : activityKind === 'followup'
                    ? 'یادداشت پیگیری...'
                    : 'یادداشت...'
              }
            />
            <button
              type="button"
              disabled={busy || (activityKind === 'note' && !noteText.trim())}
              onClick={() => void submitActivity()}
              className="w-full text-sm bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:opacity-40"
            >
              {activityKind === 'call'
                ? 'ثبت تماس'
                : activityKind === 'followup'
                  ? 'ثبت پیگیری'
                  : 'ثبت یادداشت'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

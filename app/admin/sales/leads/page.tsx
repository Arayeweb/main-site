'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { SearchInput } from '@/components/admin/ui/SearchInput';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { ActionMenu } from '@/components/admin/ui/ActionMenu';
import { UserPlus, Upload } from 'lucide-react';
import { fetchSalesLeads, importSalesLeads, patchSalesLead } from '@/lib/adminApi';
import { CRM_STATUS_COLORS, CRM_STATUS_LABELS, mapLeadRow } from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';

function parseDelimitedText(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(/[,;\t]/).map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map((line) => {
    const cols = line.split(/[,;\t]/).map((c) => c.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h.toLowerCase()] = cols[i] ?? '';
    });
    return row;
  });
}

async function parseSpreadsheetFile(file: File): Promise<Record<string, unknown>[]> {
  if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
    const XLSX = await import('xlsx');
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  }
  const text = await file.text();
  return parseDelimitedText(text);
}

export default function LeadsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const { data, loading, error, refetch } = useAdminFetch(
    () => fetchSalesLeads({ q: search || undefined }),
    [search]
  );

  const leads = useMemo(() => (data?.leads ?? []).map(mapLeadRow), [data]);

  async function handleImport(file: File) {
    setImporting(true);
    setImportMsg('');
    try {
      const rows = await parseSpreadsheetFile(file);
      const normalized = rows.map((r) => {
        const lower: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(r)) lower[k.toLowerCase()] = v;
        return lower;
      });
      const res = await importSalesLeads(normalized);
      if (!res.ok) {
        setImportMsg(`خطا: ${res.error}`);
      } else {
        setImportMsg(`${res.data.imported} لید وارد شد${res.data.failed ? ` · ${res.data.failed} خطا` : ''}`);
        refetch();
      }
    } catch {
      setImportMsg('خطا در خواندن فایل');
    }
    setImporting(false);
  }

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="مدیریت لیدها"
        description="لیست کامل لیدهای دریافتی"
        icon={UserPlus}
        breadcrumb={[{ label: 'فروش' }, { label: 'لیدها' }]}
        actions={
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls,.tsv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImport(file);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              disabled={importing}
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 border border-slate-200 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50"
            >
              <Upload className="w-4 h-4" />
              {importing ? 'در حال آپلود...' : 'آپلود CSV/XLSX'}
            </button>
          </>
        }
      />

      {importMsg && (
        <div className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700">{importMsg}</div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="w-64">
            <SearchInput value={search} onChange={setSearch} placeholder="جستجوی نام، موبایل..." />
          </div>
          <span className="text-xs text-slate-500">{leads.length} لید</span>
        </div>

        {leads.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[960px]" dir="rtl">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {['#', 'نام', 'موبایل', 'کسب‌وکار', 'منبع', 'نیاز', 'پکیج', 'وضعیت', 'بودجه', 'آخرین تماس', 'پیگیری', ''].map((h) => (
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead, idx) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 text-slate-400 text-xs">{idx + 1}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{lead.name}</td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums" dir="ltr">{lead.phone}</td>
                    <td className="px-4 py-3.5 text-slate-600">{lead.business}</td>
                    <td className="px-4 py-3.5 text-slate-500">{lead.sourceLabel}</td>
                    <td className="px-4 py-3.5 text-slate-600">{lead.need}</td>
                    <td className="px-4 py-3.5 text-slate-500">{lead.plan}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge
                        label={CRM_STATUS_LABELS[lead.status] ?? lead.status}
                        colorClass={CRM_STATUS_COLORS[lead.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{lead.budget}</td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums">{lead.lastContact}</td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums">{lead.nextFollowUp}</td>
                    <td className="px-4 py-3.5">
                      <ActionMenu
                        actions={[
                          { label: 'پیشنهاد قیمت', onClick: () => router.push(`/admin/sales/proposals/new?leadId=${lead.id}`) },
                          { label: 'تماس شد', onClick: () => void patchSalesLead(lead.id, { crm_status: 'contacted' }).then(() => refetch()) },
                          { label: 'واجد شرایط', onClick: () => void patchSalesLead(lead.id, { crm_status: 'qualified' }).then(() => refetch()) },
                          { label: 'برنده', onClick: () => void patchSalesLead(lead.id, { crm_status: 'won' }).then(() => refetch()) },
                          { label: 'از دست رفته', variant: 'danger', onClick: () => void patchSalesLead(lead.id, { crm_status: 'lost' }).then(() => refetch()) },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

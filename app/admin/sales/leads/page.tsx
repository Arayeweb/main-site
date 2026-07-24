'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { FilterBar } from '@/components/admin/ui/FilterBar';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { LeadCard } from '@/components/admin/ui/LeadCard';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ActionMenu } from '@/components/admin/ui/ActionMenu';
import { SimpleFormModal } from '@/components/admin/ui/SimpleFormModal';
import { UserPlus, Upload, Plus, ArrowRight, Layers, ChevronLeft } from 'lucide-react';
import {
  createSalesLead,
  fetchSalesLeads,
  fetchSalesTeam,
  importSalesLeads,
  patchSalesLead,
  type ApiLead,
} from '@/lib/adminApi';
import {
  CRM_GOAL_LABELS,
  CRM_PAGE_LABELS,
  CRM_PRIMARY_PAGES,
  CRM_STATUS_COLORS,
  CRM_STATUS_LABELS,
  mapLeadRow,
  normalizeCrmPageKey,
  resolveOwnerLabel,
  resolvePageLabel,
} from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { cn } from '@/lib/utils';

const OTHER_KEY = '_other';

const MANUAL_PAGE_OPTIONS = [
  { value: 'index', label: 'صفحه اصلی' },
  { value: 'seo', label: 'سئو' },
  { value: 'website-design', label: 'طراحی سایت' },
  { value: 'doctors', label: 'پزشکان' },
  { value: 'googlesabt', label: 'گوگل‌ثبت' },
  { value: 'clinic', label: 'کلینیک' },
  { value: 'contact', label: 'تماس' },
  { value: 'fastweb', label: 'سایت فوری' },
  { value: 'free-seo-audit', label: 'بررسی رایگان سئو' },
  { value: 'restaurant', label: 'رستوران' },
  { value: 'telegram', label: 'تلگرام' },
  { value: 'ai', label: 'هوش مصنوعی' },
  { value: 'modares', label: 'مدرسان' },
  { value: 'bizcard', label: 'کارت ویزیت' },
  { value: 'manual', label: 'ثبت دستی' },
  { value: '', label: 'بدون بخش' },
];

type MappedLead = ReturnType<typeof mapLeadRow>;
type ViewMode = 'workbench' | 'sections';

function pageKeyOf(lead: MappedLead): string {
  return normalizeCrmPageKey(lead.page === '—' ? null : lead.page);
}

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

const emptyForm = {
  name: '',
  contact: '',
  company: '',
  page: 'manual',
  goal: '',
  budget: '',
  channel: '',
  crm_note: '',
  assign_me: true,
};

export default function LeadsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('workbench');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [allLeads, setAllLeads] = useState<ApiLead[]>([]);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(emptyForm);

  const { data: teamData } = useAdminFetch(() => fetchSalesTeam(), []);

  const ownerParam =
    ownerFilter === 'all' ? undefined : ownerFilter === 'me' || ownerFilter === 'unassigned' ? ownerFilter : ownerFilter;

  const { data, loading, error, refetch } = useAdminFetch(
    () =>
      fetchSalesLeads({
        q: search || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        owner: ownerParam,
        page_num: page,
        page_size: 100,
      }),
    [search, statusFilter, ownerFilter, page]
  );

  const teamById = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of teamData?.team ?? []) {
      map.set(m.id, m.name?.trim() || m.email || m.id.slice(0, 8));
    }
    return map;
  }, [teamData]);

  useEffect(() => {
    setPage(0);
  }, [search, statusFilter, ownerFilter]);

  useEffect(() => {
    if (!data?.leads) return;
    setAllLeads((prev) => {
      if (page === 0) return data.leads;
      const ids = new Set(prev.map((l) => l.id));
      return [...prev, ...data.leads.filter((l) => !ids.has(l.id))];
    });
  }, [data, page]);

  const leads = useMemo(
    () =>
      allLeads.map((raw) => {
        const row = mapLeadRow(raw);
        return {
          ...row,
          assignedTo: resolveOwnerLabel(row.ownerId, teamById),
        };
      }),
    [allLeads, teamById]
  );

  const sections = useMemo(() => {
    const map = new Map<
      string,
      { key: string; label: string; count: number; newCount: number; latestAt: string }
    >();

    for (const key of CRM_PRIMARY_PAGES) {
      map.set(key, {
        key,
        label: resolvePageLabel(key),
        count: 0,
        newCount: 0,
        latestAt: '',
      });
    }

    for (const lead of leads) {
      const key = pageKeyOf(lead);
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        if (lead.status === 'new') existing.newCount += 1;
        if (!existing.latestAt) existing.latestAt = lead.createdAt;
      } else {
        map.set(key, {
          key,
          label: resolvePageLabel(key === OTHER_KEY ? null : key),
          count: 1,
          newCount: lead.status === 'new' ? 1 : 0,
          latestAt: lead.createdAt,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      const ai = CRM_PRIMARY_PAGES.indexOf(a.key as (typeof CRM_PRIMARY_PAGES)[number]);
      const bi = CRM_PRIMARY_PAGES.indexOf(b.key as (typeof CRM_PRIMARY_PAGES)[number]);
      if (ai >= 0 && bi >= 0) return ai - bi;
      if (ai >= 0) return -1;
      if (bi >= 0) return 1;
      return a.label.localeCompare(b.label, 'fa');
    });
  }, [leads]);

  const sectionLeads = useMemo(() => {
    if (!selectedSection) return [];
    return leads.filter((l) => pageKeyOf(l) === selectedSection);
  }, [leads, selectedSection]);

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

  function leadActions(lead: MappedLead) {
    return [
      { label: 'جزئیات', onClick: () => router.push(`/admin/sales/leads/${lead.id}`) },
      {
        label: 'پیشنهاد قیمت',
        onClick: () => router.push(`/admin/sales/proposals/new?leadId=${lead.id}`),
      },
      {
        label: 'اختصاص به من',
        onClick: () => void patchSalesLead(lead.id, { owner_id: 'me' }).then(() => refetch()),
      },
      {
        label: 'تماس شد',
        onClick: () => void patchSalesLead(lead.id, { crm_status: 'contacted' }).then(() => refetch()),
      },
      {
        label: 'واجد شرایط',
        onClick: () => void patchSalesLead(lead.id, { crm_status: 'qualified' }).then(() => refetch()),
      },
      {
        label: 'برنده',
        onClick: () => void patchSalesLead(lead.id, { crm_status: 'won' }).then(() => refetch()),
      },
      {
        label: 'از دست رفته',
        variant: 'danger' as const,
        onClick: () => void patchSalesLead(lead.id, { crm_status: 'lost' }).then(() => refetch()),
      },
    ];
  }

  if (loading && page === 0) return <AdminLoadingState />;
  if (error && !data) return <AdminErrorState error={error} />;

  const sectionMeta = selectedSection
    ? sections.find((s) => s.key === selectedSection) ?? {
        key: selectedSection,
        label: resolvePageLabel(selectedSection === OTHER_KEY ? null : selectedSection),
        count: sectionLeads.length,
        newCount: 0,
        latestAt: '',
      }
    : null;

  const ownerFilterOptions = [
    { value: 'all', label: 'همه مالک‌ها' },
    { value: 'me', label: 'لیدهای من' },
    { value: 'unassigned', label: 'بدون مالک' },
    ...(teamData?.team ?? []).map((m) => ({
      value: m.id,
      label: m.name?.trim() || m.email || m.id.slice(0, 8),
    })),
  ];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="مدیریت لیدها"
        description={
          viewMode === 'workbench'
            ? 'میز کار روزانه فروش — فیلتر مالک و وضعیت'
            : selectedSection
              ? `لیدهای بخش «${sectionMeta?.label}»`
              : 'بخش‌ها را باز کنید یا لید دستی ثبت کنید'
        }
        icon={UserPlus}
        breadcrumb={[
          { label: 'فروش' },
          { label: 'لیدها' },
          ...(viewMode === 'sections' && sectionMeta ? [{ label: sectionMeta.label }] : []),
        ]}
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
            <button
              type="button"
              onClick={() => {
                setForm({
                  ...emptyForm,
                  page:
                    selectedSection && selectedSection !== OTHER_KEY ? selectedSection : 'manual',
                });
                setFormError('');
                setCreating(true);
              }}
              className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
              لید دستی
            </button>
          </>
        }
      />

      {importMsg && (
        <div className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700">
          {importMsg}
        </div>
      )}

      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 self-start">
        <button
          type="button"
          onClick={() => {
            setViewMode('workbench');
            setSelectedSection(null);
          }}
          className={cn(
            'px-3 py-1.5 text-sm rounded-md transition-colors',
            viewMode === 'workbench' ? 'bg-white text-slate-900 shadow-sm font-medium' : 'text-slate-600'
          )}
        >
          میز کار
        </button>
        <button
          type="button"
          onClick={() => setViewMode('sections')}
          className={cn(
            'px-3 py-1.5 text-sm rounded-md transition-colors',
            viewMode === 'sections' ? 'bg-white text-slate-900 shadow-sm font-medium' : 'text-slate-600'
          )}
        >
          بر اساس بخش
        </button>
      </div>

      {viewMode === 'workbench' ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="جستجوی نام، موبایل..."
            count={leads.length}
            countLabel="لید"
            filters={[
              {
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: 'all', label: 'همه وضعیت‌ها' },
                  ...Object.entries(CRM_STATUS_LABELS).map(([k, v]) => ({ value: k, label: v })),
                ],
              },
              {
                value: ownerFilter,
                onChange: setOwnerFilter,
                options: ownerFilterOptions,
              },
            ]}
          />

          {leads.length === 0 ? (
            <EmptyState title="لیدی یافت نشد" description="فیلتر را عوض کنید یا لید دستی ثبت کنید." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1100px]" dir="rtl">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-100">
                    {['نام', 'تماس', 'منبع', 'وضعیت', 'مالک', 'بودجه', 'پیگیری', 'ثبت', ''].map((h) => (
                      <th
                        key={h || 'actions'}
                        className="text-right px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/sales/leads/${lead.id}`)}
                    >
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-800">{lead.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[160px]">{lead.need}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 tabular-nums" dir="ltr">
                        {lead.phone}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs">{lead.sourceLabel}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge
                          label={CRM_STATUS_LABELS[lead.status] ?? lead.status}
                          colorClass={CRM_STATUS_COLORS[lead.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}
                        />
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-xs">{lead.assignedTo}</td>
                      <td className="px-4 py-3.5 text-slate-500 tabular-nums text-xs">{lead.budget}</td>
                      <td className="px-4 py-3.5 text-slate-500 tabular-nums text-xs">{lead.nextFollowUp}</td>
                      <td className="px-4 py-3.5 text-slate-500 tabular-nums text-xs">{lead.createdAt}</td>
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <ActionMenu actions={leadActions(lead)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : selectedSection ? (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setSelectedSection(null)}
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 self-start"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت به بخش‌ها
          </button>

          {sectionLeads.length === 0 ? (
            <EmptyState title="لیدی در این بخش نیست" description="می‌توانید لید دستی ثبت کنید." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {sectionLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onOpen={() => router.push(`/admin/sales/leads/${lead.id}`)}
                  actions={leadActions(lead)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setSelectedSection(section.key)}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-right"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-slate-100 rounded-xl shrink-0">
                    <Layers className="w-5 h-5 text-slate-600" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{section.label}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 truncate" dir="ltr">
                      {section.key === OTHER_KEY ? '—' : section.key}
                    </p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-300 shrink-0 mt-1" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium tabular-nums">{section.count} لید</span>
                {section.newCount > 0 ? (
                  <span className="bg-blue-50 text-blue-700 ring-1 ring-blue-200 px-2 py-0.5 rounded-full font-medium tabular-nums">
                    {section.newCount} جدید
                  </span>
                ) : (
                  <span className="text-slate-400">بدون لید جدید</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {data?.has_more && (
        <div className="text-center">
          <button type="button" onClick={() => setPage((p) => p + 1)} className="text-sm text-blue-600 hover:underline">
            بارگذاری بیشتر
          </button>
        </div>
      )}

      <SimpleFormModal
        title="ثبت لید دستی"
        open={creating}
        onClose={() => setCreating(false)}
        busy={busy}
        error={formError}
        submitLabel="ثبت لید"
        onSubmit={async () => {
          if (!form.contact.trim()) {
            setFormError('شماره تماس الزامی است');
            return;
          }
          setBusy(true);
          setFormError('');
          const res = await createSalesLead({
            name: form.name || undefined,
            contact: form.contact,
            company: form.company || undefined,
            page: form.page || undefined,
            goal: form.goal || undefined,
            budget: form.budget || undefined,
            channel: form.channel || undefined,
            crm_note: form.crm_note || undefined,
            assign_me: form.assign_me,
          });
          setBusy(false);
          if (!res.ok) {
            setFormError(res.error);
            return;
          }
          setCreating(false);
          setForm(emptyForm);
          setViewMode('workbench');
          refetch();
        }}
      >
        <input
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          placeholder="نام"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          placeholder="موبایل / تماس *"
          dir="ltr"
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
        />
        <input
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          placeholder="شرکت / کسب‌وکار"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
        <select
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          value={form.page}
          onChange={(e) => setForm({ ...form, page: e.target.value })}
        >
          {MANUAL_PAGE_OPTIONS.map((opt) => (
            <option key={opt.value || 'none'} value={opt.value}>
              بخش: {opt.label}
            </option>
          ))}
          {selectedSection &&
            selectedSection !== OTHER_KEY &&
            !MANUAL_PAGE_OPTIONS.some((o) => o.value === selectedSection) && (
              <option value={selectedSection}>
                بخش: {CRM_PAGE_LABELS[selectedSection] ?? selectedSection}
              </option>
            )}
        </select>
        <select
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          value={form.goal}
          onChange={(e) => setForm({ ...form, goal: e.target.value })}
        >
          <option value="">نیاز / هدف (اختیاری)</option>
          {Object.entries(CRM_GOAL_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          placeholder="بودجه"
          value={form.budget}
          onChange={(e) => setForm({ ...form, budget: e.target.value })}
        />
        <input
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          placeholder="کانال (اینستاگرام، معرفی، …)"
          value={form.channel}
          onChange={(e) => setForm({ ...form, channel: e.target.value })}
        />
        <textarea
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[72px]"
          placeholder="یادداشت"
          value={form.crm_note}
          onChange={(e) => setForm({ ...form, crm_note: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.assign_me}
            onChange={(e) => setForm({ ...form, assign_me: e.target.checked })}
          />
          به من اختصاص بده
        </label>
      </SimpleFormModal>
    </div>
  );
}

import type { Activity } from '@/lib/adminTypes';
import type { ApiInvoice, ApiLead, ApiProject, ApiTicket } from '@/lib/adminApi';

// ── Date helpers ─────────────────────────────────────────

export function formatFaDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('fa-IR');
  } catch {
    return '—';
  }
}

export function formatFaDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return '—';
  }
}

export function isOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  return new Date(dueDate).getTime() < Date.now();
}

// ── CRM status labels (API keys) ─────────────────────────

export const CRM_STATUS_LABELS: Record<string, string> = {
  new: 'جدید',
  contacted: 'تماس گرفته شد',
  qualified: 'واجد شرایط',
  proposal: 'پیشنهاد ارسال شد',
  won: 'برنده',
  lost: 'از دست رفته',
};

export const CRM_STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 ring-blue-200',
  contacted: 'bg-sky-50 text-sky-700 ring-sky-200',
  qualified: 'bg-violet-50 text-violet-700 ring-violet-200',
  proposal: 'bg-amber-50 text-amber-700 ring-amber-200',
  won: 'bg-green-50 text-green-700 ring-green-200',
  lost: 'bg-red-50 text-red-700 ring-red-200',
};

export const CRM_SOURCE_LABELS: Record<string, string> = {
  multistep_form: 'فرم چندمرحله‌ای',
  chatbot: 'چت‌بات',
  hero_form: 'فرم هیرو',
  telegram_bot: 'تلگرام',
  partner_signup_form: 'فرم همکاری',
  manual_entry: 'ثبت دستی',
  homepage_chatbot: 'چت‌بات سایت',
  seo_hero: 'سئو — فرم هیرو',
  seo_hero_audit: 'سئو — بررسی اولیه هیرو',
  seo_hero_schedule: 'سئو — زمان تماس/واتساپ',
  seo_multistep: 'سئو — فرم پکیج',
  seo_package_quick: 'سئو — درخواست سریع پکیج',
  seo_chatbot: 'سئو — چت‌بات',
  seo_exit_intent: 'سئو — بررسی رایگان',
  seo_checkout: 'سئو — شروع پرداخت',
  seo_payment_confirmed: 'سئو — پرداخت تأییدشده',
  doctors_chatbot: 'پزشکان — چت‌بات',
  doctors_hero: 'پزشکان — فرم هیرو',
  doctors_multistep: 'پزشکان — فرم پکیج',
  doctors_direct_sale: 'پزشکان — فروش مستقیم',
  doctors_exit_intent: 'پزشکان — exit intent',
  doctors_scroll_intent: 'پزشکان — اسکرول موبایل',
  doctors_checkout: 'پزشکان — شروع پرداخت',
  doctors_payment_confirmed: 'پزشکان — پرداخت تأییدشده',
  teachers_sms: 'مدرسان — پیامک',
  googlesabt_multistep: 'گوگل‌ثبت — فرم پکیج',
  googlesabt_checkout: 'گوگل‌ثبت — شروع پرداخت',
  googlesabt_payment_confirmed: 'گوگل‌ثبت — پرداخت تأییدشده',
  'website-design': 'طراحی سایت',
  'website-design-hero': 'طراحی سایت — هیرو',
  'website-design-estimate': 'طراحی سایت — تخمین قیمت',
  website_design_hero: 'طراحی سایت — هیرو',
  website_design_landing: 'طراحی سایت — لندینگ',
  contact_page: 'صفحه تماس',
  demo_tool: 'ابزار دمو',
  demo_exit_intent: 'دمو — exit intent',
  'free-seo-audit': 'بررسی رایگان سئو',
  fastweb_site_form: 'سایت فوری — فرم تماس',
  csv_import: 'ورود از فایل',
  unknown: 'نامشخص',
  bizcard: 'کارت ویزیت',
  purchase: 'خرید',
  'showcase-kaveh-iron': 'شوکیس — کاوه آهن',
  'showcase-shiva-hearing': 'شوکیس — شیوا شنوایی',
  'showcase-medisa-studio': 'شوکیس — مدیسا استودیو',
  promoted_bizcard: 'کارت ویزیت (منتقل‌شده)',
  promoted_website_brief: 'بریف سایت (منتقل‌شده)',
  promoted_fastweb: 'سایت فوری (منتقل‌شده)',
  promoted_adready: 'AdReady (منتقل‌شده)',
};

/** برچسب فارسی منبع لید — شامل الگوهای پویا مثل industry_audit_* و showcase-* */
export function resolveSourceLabel(source: string): string {
  if (!source) return '—';
  if (CRM_SOURCE_LABELS[source]) return CRM_SOURCE_LABELS[source];
  if (source.startsWith('industry_audit_')) {
    return `ممیزی صنعت — ${source.replace('industry_audit_', '')}`;
  }
  if (source.startsWith('showcase-')) {
    return `شوکیس — ${source.replace('showcase-', '').replace(/-/g, ' ')}`;
  }
  if (source.startsWith('showdemoto-')) {
    return `دموی مشتری — ${source.replace('showdemoto-', '').replace(/-/g, ' ')}`;
  }
  return source;
}

export const CRM_GOAL_LABELS: Record<string, string> = {
  seo_service: 'خدمات سئو',
  seo_audit_free: 'بررسی رایگان سئو',
  doctor_site: 'سایت مطب / پزشک',
};

export const CRM_PLAN_LABELS: Record<string, string> = {
  basic: 'پکیج پایه',
  growth: 'پکیج رشد',
  pro: 'پکیج حرفه‌ای',
  bundle: 'ترکیبی سئو+گوگل',
  free_audit: 'بررسی رایگان',
};

// ── Project status labels (API keys) ─────────────────────

export const API_PROJECT_STATUS_LABELS: Record<string, string> = {
  intake: 'دریافت اطلاعات',
  design: 'در حال طراحی',
  development: 'در حال توسعه',
  review: 'بررسی نهایی',
  delivered: 'تحویل‌شده',
  paused: 'متوقف‌شده',
};

export const API_PROJECT_STATUS_COLORS: Record<string, string> = {
  intake: 'bg-slate-50 text-slate-600 ring-slate-200',
  design: 'bg-violet-50 text-violet-700 ring-violet-200',
  development: 'bg-blue-50 text-blue-700 ring-blue-200',
  review: 'bg-teal-50 text-teal-700 ring-teal-200',
  delivered: 'bg-green-50 text-green-700 ring-green-200',
  paused: 'bg-slate-50 text-slate-600 ring-slate-200',
};

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  website: 'وب‌سایت',
  landing: 'لندینگ',
  chatbot: 'چت‌بات',
  other: 'سایر',
};

// ── Ticket labels (API keys) ─────────────────────────────

export const API_TICKET_STATUS_LABELS: Record<string, string> = {
  open: 'باز',
  in_progress: 'در حال بررسی',
  answered: 'پاسخ داده‌شده',
  closed: 'بسته‌شده',
};

export const API_TICKET_STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-50 text-red-700 ring-red-200',
  in_progress: 'bg-amber-50 text-amber-700 ring-amber-200',
  answered: 'bg-green-50 text-green-700 ring-green-200',
  closed: 'bg-slate-50 text-slate-600 ring-slate-200',
};

export const API_TICKET_PRIORITY_LABELS: Record<string, string> = {
  urgent: 'فوری',
  high: 'بالا',
  normal: 'متوسط',
  low: 'پایین',
};

export const API_TICKET_PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 ring-red-200',
  high: 'bg-orange-50 text-orange-700 ring-orange-200',
  normal: 'bg-amber-50 text-amber-700 ring-amber-200',
  low: 'bg-slate-50 text-slate-600 ring-slate-200',
};

export const API_TICKET_CATEGORY_LABELS: Record<string, string> = {
  site_issue: 'مشکل سایت',
  change_request: 'درخواست تغییر',
  domain_hosting: 'دامنه و هاست',
  payment: 'پرداخت',
  chatbot: 'چت‌بات',
  crm: 'CRM',
  other: 'سایر',
};

// ── Invoice / proposal labels ────────────────────────────

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: 'پیش‌نویس',
  sent: 'ارسال‌شده',
  paid: 'پرداخت‌شده',
  cancelled: 'لغو شده',
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-50 text-slate-600 ring-slate-200',
  sent: 'bg-blue-50 text-blue-700 ring-blue-200',
  paid: 'bg-green-50 text-green-700 ring-green-200',
  cancelled: 'bg-red-50 text-red-700 ring-red-200',
};

export const ADMIN_ROLE_LABELS: Record<string, string> = {
  admin: 'مدیر',
  sales: 'فروش',
  support: 'پشتیبانی',
};

// ── Mappers ──────────────────────────────────────────────

export function mapLeadRow(lead: ApiLead) {
  return {
    id: lead.id,
    name: lead.name ?? '—',
    phone: lead.contact,
    business: lead.company ?? '—',
    source: lead.source,
    sourceLabel: resolveSourceLabel(lead.source),
    page: lead.page ?? '—',
    channel: lead.channel ?? '—',
    intent: lead.intent ?? '—',
    detail: lead.detail ?? '—',
    sitetype: lead.sitetype ?? '—',
    need: lead.goal ? (CRM_GOAL_LABELS[lead.goal] ?? lead.goal) : '—',
    plan: lead.plan ? (CRM_PLAN_LABELS[lead.plan] ?? lead.plan) : '—',
    status: lead.crm_status ?? 'new',
    lastContact: formatFaDate(lead.crm_updated_at ?? lead.created_at),
    createdAt: formatFaDateTime(lead.created_at),
    nextFollowUp: formatFaDate(lead.next_followup_at),
    nextFollowUpRaw: lead.next_followup_at,
    assignedTo: lead.owner_id ? 'اختصاص‌یافته' : '—',
    budget: lead.budget ?? '—',
    note: lead.crm_note,
    utmSource: lead.utm_source ?? '—',
    utmMedium: lead.utm_medium ?? '—',
    utmCampaign: lead.utm_campaign ?? '—',
    referrer: lead.referrer ?? '—',
  };
}

export function mapProjectRow(p: ApiProject) {
  return {
    id: p.id,
    code: p.project_code,
    name: p.title,
    client: p.customer_name ?? '—',
    clientId: p.client_id ?? null,
    contact: p.customer_contact ?? '—',
    status: p.status,
    progress: p.progress_percent ?? 0,
    deadline: formatFaDate(p.estimated_delivery_at),
    type: SERVICE_TYPE_LABELS[p.service_type ?? ''] ?? p.project_type ?? p.service_type ?? '—',
    owner: p.owner_name ?? '—',
    amount: p.contract_amount ?? 0,
    paymentStatus: p.payment_status ?? 'unpaid',
    note: p.last_note,
    updatedAt: p.updated_at,
  };
}

export function mapClientRow(c: import('@/lib/adminApi').ApiClient) {
  return {
    id: c.id,
    name: c.name,
    type: c.client_type,
    phone: c.phone ?? '—',
    email: c.email ?? '—',
    city: c.city ?? '—',
    status: c.status,
    activeProjects: 0,
    totalRevenue: Number(c.total_revenue) || 0,
    lastContact: formatFaDate(c.last_contact_at ?? c.updated_at),
    salesOwner: c.sales_owner ?? '—',
    projectOwner: c.project_owner ?? '—',
    leadSource: c.lead_source ?? '—',
    address: c.address,
    website: c.website,
    instagram: c.instagram,
    internalNote: c.internal_note,
  };
}

export function mapTaskRow(t: import('@/lib/adminApi').ApiTask) {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    projectId: t.project_id,
    project: t.project_name ?? '—',
    clientId: t.client_id,
    client: t.client_name ?? '—',
    assignedTo: t.assigned_to ?? '—',
    priority: t.priority,
    status: t.status,
    dueDate: formatFaDate(t.due_date),
    checklist: t.checklist ?? [],
  };
}

export function mapContractRow(c: import('@/lib/adminApi').ApiContract) {
  return {
    id: c.id,
    number: c.contract_number,
    clientId: c.client_id,
    client: c.client_name,
    type: c.contract_type,
    amount: Number(c.amount) || 0,
    startDate: formatFaDate(c.start_date),
    endDate: formatFaDate(c.end_date),
    signatureStatus: c.signature_status,
    paymentStatus: c.payment_status,
    scopeOfWork: c.scope_of_work ?? '',
    deliverables: Array.isArray(c.deliverables) ? c.deliverables : [],
    paymentTerms: c.payment_terms ?? '',
    supportTerms: c.support_terms,
    projectId: c.project_id,
    proformaId: c.proforma_id ?? null,
    leadId: c.lead_id ?? null,
    notes: c.notes,
  };
}

export function mapChangeRequestRow(cr: import('@/lib/adminApi').ApiChangeRequest) {
  return {
    id: cr.id,
    title: cr.title,
    description: cr.description,
    clientId: cr.client_id,
    client: cr.client_name,
    projectId: cr.project_id,
    project: cr.project_name ?? '—',
    type: cr.request_type,
    status: cr.status,
    cost: Number(cr.cost) || 0,
    assignedTo: cr.assigned_to ?? '—',
    createdAt: formatFaDate(cr.created_at),
    includedInContract: cr.included_in_contract,
    isPaid: cr.is_paid,
    estimatedCost: Number(cr.estimated_cost) || 0,
    estimatedTime: cr.estimated_time ?? '—',
    customerApproval: cr.customer_approval,
  };
}

export function mapMaintenancePlanRow(p: import('@/lib/adminApi').ApiMaintenancePlan) {
  return {
    id: p.id,
    clientId: p.client_id,
    client: p.client_name,
    planType: p.plan_type,
    monthlyFee: Number(p.monthly_fee) || 0,
    startDate: formatFaDate(p.start_date),
    renewalDate: formatFaDate(p.renewal_date),
    paymentStatus: p.payment_status,
    supportStatus: p.support_status,
    includedServices: p.included_services ?? [],
    upsellOpportunities: p.upsell_opportunities ?? [],
  };
}

export function mapLeadSourceRow(s: import('@/lib/adminApi').ApiLeadSourceStat) {
  return s;
}

export function mapTicketRow(t: ApiTicket) {
  return {
    id: t.id,
    code: t.ticket_code,
    title: t.subject,
    client: t.customer_name ?? '—',
    priority: t.priority,
    status: t.status,
    category: t.category ?? 'other',
    assignedTo: '—',
    lastUpdated: formatFaDateTime(t.updated_at),
    createdAt: formatFaDate(t.created_at),
    message: t.message,
  };
}

export function mapInvoiceRow(inv: ApiInvoice) {
  const service =
    inv.items && inv.items.length > 0
      ? inv.items.map((i) => i.title).join('، ')
      : inv.note ?? '—';
  return {
    id: inv.id,
    invoice: inv.invoice_number,
    client: inv.customer_name,
    project: service,
    service,
    amount: inv.grand_total ?? 0,
    status: inv.status,
    dueDate: formatFaDate(inv.due_date),
    paidDate: inv.paid_at ? formatFaDate(inv.paid_at) : undefined,
    sentDate: formatFaDate(inv.issue_date ?? inv.created_at),
    expiryDate: formatFaDate(inv.due_date),
    description: inv.note ?? '—',
    kind: inv.kind,
    isOverdue: inv.status === 'sent' && isOverdue(inv.due_date),
  };
}

export function mapUserRow(u: { id: string; name: string; email: string; role: string; created_at: string; is_active: boolean; last_login_at: string | null }) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    roleLabel: ADMIN_ROLE_LABELS[u.role] ?? u.role,
    joinDate: formatFaDate(u.created_at),
    isActive: u.is_active,
    lastLogin: u.last_login_at ? formatFaDate(u.last_login_at) : '—',
  };
}

export function buildRecentActivities(
  leads: ApiLead[],
  tickets: ApiTicket[],
  projects: ApiProject[]
): Activity[] {
  const items: { ts: number; activity: Activity }[] = [];

  for (const l of leads.slice(0, 3)) {
    items.push({
      ts: new Date(l.created_at).getTime(),
      activity: {
        id: `lead-${l.id}`,
        type: 'new_lead',
        title: 'لید جدید',
        description: `${l.name ?? 'بدون نام'} — ${l.goal ?? l.source}`,
        time: formatFaDateTime(l.created_at),
        user: resolveSourceLabel(l.source),
      },
    });
  }

  for (const t of tickets.slice(0, 3)) {
    items.push({
      ts: new Date(t.created_at).getTime(),
      activity: {
        id: `ticket-${t.id}`,
        type: 'new_ticket',
        title: 'تیکت جدید',
        description: `${t.subject} — ${t.customer_name ?? ''}`,
        time: formatFaDateTime(t.created_at),
        user: t.customer_name ?? 'مشتری',
      },
    });
  }

  for (const p of projects.slice(0, 2)) {
    items.push({
      ts: new Date(p.updated_at).getTime(),
      activity: {
        id: `project-${p.id}`,
        type: 'project_stage',
        title: 'بروزرسانی پروژه',
        description: `${p.title} — ${API_PROJECT_STATUS_LABELS[p.status] ?? p.status}`,
        time: formatFaDateTime(p.updated_at),
        user: p.customer_name ?? '—',
      },
    });
  }

  return items
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 6)
    .map((x) => x.activity);
}

export function formatAmount(amount: number): string {
  if (amount >= 1000000) {
    return new Intl.NumberFormat('fa-IR').format(Math.round(amount / 1000000)) + 'M';
  }
  return new Intl.NumberFormat('fa-IR').format(amount);
}

export function mapAdCampaign(ad: import('@/lib/adminApi').ApiAdCampaign) {
  const spend = Number(ad.spend) || 0;
  const leads = Number(ad.leads) || 0;
  return {
    id: ad.id,
    name: ad.campaign_name || ad.platform,
    channel: ad.platform,
    spend,
    leads,
    contacts: 0,
    proposals: 0,
    sales: 0,
    revenue: 0,
    status: 'active' as const,
    startDate: formatFaDate(ad.date),
    roi: spend > 0 ? 0 : 0,
  };
}

export function mapProposalFromInvoice(inv: ApiInvoice) {
  return {
    id: inv.id,
    number: inv.invoice_number,
    client: inv.customer_name,
    clientId: inv.client_id ?? null,
    leadId: inv.lead_id ?? null,
    service: inv.items?.map((i) => i.title).join('، ') || inv.note || '—',
    amount: inv.grand_total ?? 0,
    status: inv.status,
    sentDate: formatFaDate(inv.issue_date ?? inv.created_at),
    expiryDate: formatFaDate(inv.due_date),
    assignedTo: '—',
    leadSource: '—',
    packageName: undefined as string | undefined,
    timeline: undefined as string | undefined,
    notes: inv.note ?? undefined,
    nextAction: undefined as string | undefined,
  };
}

export function deriveClientsFromProjects(projects: ApiProject[]) {
  const map = new Map<string, {
    id: string;
    name: string;
    phone: string;
    email: string;
    city: string;
    type: string;
    status: string;
    activeProjects: number;
    totalRevenue: number;
    lastContact: string;
  }>();

  for (const p of projects) {
    const key = p.customer_contact || p.customer_name || p.id;
    const existing = map.get(key);
    const isActive = p.status !== 'delivered' && p.status !== 'paused';
    if (existing) {
      if (isActive) existing.activeProjects += 1;
      if (new Date(p.updated_at) > new Date(existing.lastContact)) {
        existing.lastContact = p.updated_at;
      }
    } else {
      map.set(key, {
        id: p.id,
        name: p.customer_name ?? '—',
        phone: p.customer_contact ?? '—',
        email: '—',
        city: '—',
        type: 'business',
        status: isActive ? 'active' : p.status === 'delivered' ? 'completed' : 'paused',
        activeProjects: isActive ? 1 : 0,
        totalRevenue: 0,
        lastContact: p.updated_at,
      });
    }
  }

  return Array.from(map.values()).map((c) => ({
    ...c,
    lastContact: formatFaDate(c.lastContact),
  }));
}

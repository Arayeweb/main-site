import { agentDebugLog } from '@/lib/agentDebug';

const DEBUG_ENDPOINT = 'http://127.0.0.1:7292/ingest/5edfe92e-8eff-41b7-9393-ff5814f12f32';
const SESSION_ID = 'a7930e';

function debugLog(
  location: string,
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string
) {
  // #region agent log
  fetch(DEBUG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': SESSION_ID },
    body: JSON.stringify({
      sessionId: SESSION_ID,
      location,
      message,
      data,
      timestamp: Date.now(),
      hypothesisId,
    }),
  }).catch(() => {});
  // #endregion
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function adminFetch<T>(
  url: string,
  options?: RequestInit,
  hypothesisId = 'H1'
): Promise<ApiResult<T>> {
  const method = options?.method ?? 'GET';
  const agentHypothesisId = hypothesisForAdminRequest(url, method);
  debugLog('adminApi.ts:fetch', 'request_start', { url, method: options?.method ?? 'GET' }, hypothesisId);
  try {
    const res = await fetch(url, {
      credentials: 'include',
      cache: 'no-store',
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
    const json = await res.json().catch(() => ({}));
    debugLog(
      'adminApi.ts:fetch',
      'request_done',
      { url, status: res.status, ok: json?.ok, error: json?.error },
      hypothesisId
    );
    agentDebugLog(
      'lib/adminApi.ts:adminFetch',
      'admin_api_response',
      { ...safeRequestData(url), method, status: res.status, ok: json?.ok, error: json?.error },
      agentHypothesisId
    );
    if (!res.ok || !json.ok) {
      return { ok: false, error: json.error ?? `http_${res.status}` };
    }
    return { ok: true, data: json as T };
  } catch {
    agentDebugLog(
      'lib/adminApi.ts:adminFetch',
      'admin_api_network_error',
      { ...safeRequestData(url), method },
      agentHypothesisId
    );
    debugLog('adminApi.ts:fetch', 'request_failed', { url }, hypothesisId);
    return { ok: false, error: 'network_error' };
  }
}

function safeRequestData(url: string) {
  const parsed = new URL(url, 'http://admin.local');
  return {
    path: parsed.pathname,
    queryKeys: Array.from(parsed.searchParams.keys()).sort(),
  };
}

function hypothesisForAdminRequest(url: string, method: string) {
  const path = safeRequestData(url).path;
  if (path.includes('/invoices') || path.includes('/contracts')) return 'H3';
  if (method !== 'GET' || path.includes('/clients') || path.includes('/projects') || path.includes('/tasks') || path.includes('/users') || path.includes('/sales/leads')) {
    return 'H2';
  }
  return 'H2';
}

// ── Leads (CRM) ──────────────────────────────────────────

export interface ApiLead {
  id: string;
  created_at: string;
  source: string;
  page?: string;
  name: string | null;
  contact: string;
  company?: string | null;
  goal?: string | null;
  budget?: string | null;
  plan?: string | null;
  crm_status?: string;
  owner_id?: string | null;
  next_followup_at?: string | null;
  crm_note?: string | null;
  crm_updated_at?: string | null;
  channel?: string | null;
}

export function fetchSalesLeads(params?: {
  status?: string;
  q?: string;
  followup?: string;
  page_num?: number;
}) {
  const sp = new URLSearchParams();
  if (params?.status) sp.set('status', params.status);
  if (params?.q) sp.set('q', params.q);
  if (params?.followup) sp.set('followup', params.followup);
  if (params?.page_num != null) sp.set('page_num', String(params.page_num));
  const qs = sp.toString();
  return adminFetch<{ leads: ApiLead[]; has_more: boolean }>(
    `/api/sales/leads${qs ? `?${qs}` : ''}`,
    undefined,
    'H1'
  );
}

export interface SalesStats {
  total: number;
  active: number;
  pipeline: Record<string, number>;
  my_leads: number;
  unassigned: number;
  won_this_month: number;
  new_this_week: number;
  followups_due: number;
  win_rate: number;
  last_7_days: { date: string; leads: number }[];
  by_source?: { key: string; count: number }[];
  by_channel?: { key: string; count: number }[];
}

export function fetchSalesStats() {
  return adminFetch<SalesStats>('/api/sales/stats', undefined, 'H1');
}

// ── Projects ─────────────────────────────────────────────

export interface ApiProject {
  id: string;
  created_at: string;
  updated_at: string;
  project_code: string;
  customer_name: string | null;
  customer_contact: string | null;
  title: string;
  service_type: string | null;
  status: string;
  progress_percent: number;
  estimated_delivery_at: string | null;
  last_note: string | null;
  has_password?: boolean;
  client_id?: string | null;
  owner_name?: string | null;
  contract_amount?: number | null;
  payment_status?: string | null;
  project_type?: string | null;
}

export function fetchProjects() {
  return adminFetch<{ projects: ApiProject[] }>('/api/admin/projects', undefined, 'H1');
}

// ── Tickets ──────────────────────────────────────────────

export interface ApiTicket {
  id: string;
  created_at: string;
  updated_at: string;
  ticket_code: string;
  project_id: string | null;
  customer_name: string | null;
  customer_contact: string | null;
  subject: string;
  category: string | null;
  priority: string;
  status: string;
  message: string | null;
}

export function fetchTickets(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return adminFetch<{ tickets: ApiTicket[] }>(`/api/admin/tickets${qs}`, undefined, 'H1');
}

// ── Invoices ─────────────────────────────────────────────

export interface ApiInvoice {
  id: string;
  invoice_number: string;
  kind: string;
  status: string;
  issue_date: string | null;
  due_date: string | null;
  customer_name: string;
  customer_contact: string | null;
  grand_total: number;
  currency: string;
  created_at: string;
  paid_at: string | null;
  note: string | null;
  items?: { title: string }[];
}

export function fetchInvoices(params?: { kind?: string; status?: string }) {
  const sp = new URLSearchParams();
  if (params?.kind) sp.set('kind', params.kind);
  if (params?.status) sp.set('status', params.status);
  const qs = sp.toString();
  return adminFetch<{ invoices: ApiInvoice[] }>(
    `/api/admin/invoices${qs ? `?${qs}` : ''}`,
    undefined,
    'H1'
  );
}

export function fetchInvoiceSummary() {
  return adminFetch<{
    summary: {
      paid: Record<string, number>;
      outstanding: Record<string, number>;
      counts: Record<string, number>;
    };
  }>('/api/admin/invoices?summary=1', undefined, 'H1');
}

// ── Users ────────────────────────────────────────────────

export interface ApiAdminUser {
  id: string;
  created_at: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
}

export function fetchAdminUsers() {
  return adminFetch<{ users: ApiAdminUser[] }>('/api/admin/users', undefined, 'H1');
}

// ── Stats ────────────────────────────────────────────────

export interface AdminStatsGroup {
  key: string;
  count: number;
}

export interface AdminStats {
  total_leads: number;
  total_views: number;
  this_week: number;
  this_month: number;
  views_this_week: number;
  by_source?: AdminStatsGroup[];
  by_utm_source?: AdminStatsGroup[];
  by_utm_campaign?: AdminStatsGroup[];
  by_page?: AdminStatsGroup[];
  last_7_days?: { date: string; leads: number; views: number }[];
}

export function fetchAdminStats() {
  return adminFetch<AdminStats>('/api/admin/stats', undefined, 'H1');
}

// ── GTM analytics events ─────────────────────────────────

export interface AnalyticsEventsStats {
  total_events: number;
  this_week: number;
  this_month: number;
  by_event: AdminStatsGroup[];
  by_page: AdminStatsGroup[];
  by_source: AdminStatsGroup[];
  by_package: AdminStatsGroup[];
  funnel: Record<string, number>;
  checkout_to_purchase_rate: number;
  last_7_days: { date: string; count: number }[];
  last_30_days: { date: string; count: number }[];
}

export function fetchAnalyticsEvents() {
  return adminFetch<AnalyticsEventsStats>('/api/admin/analytics/events', undefined, 'H1');
}

// ── Ads / campaigns ──────────────────────────────────────

export interface ApiAdCampaign {
  id: string;
  created_at: string;
  updated_at: string;
  date: string;
  platform: string;
  campaign_name: string | null;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  currency: string;
  note: string | null;
}

export function fetchAds() {
  return adminFetch<{ ads: ApiAdCampaign[] }>('/api/admin/ads', undefined, 'H1');
}

export function fetchProjectById(id: string) {
  return adminFetch<{ project: ApiProject }>(
    `/api/admin/projects?id=${encodeURIComponent(id)}`,
    undefined,
    'H1'
  );
}

export function fetchProjectsByClient(clientId: string) {
  return adminFetch<{ projects: ApiProject[] }>(
    `/api/admin/projects?client_id=${encodeURIComponent(clientId)}`,
    undefined,
    'H1'
  );
}

// ── Clients ──────────────────────────────────────────────

export interface ApiClient {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  client_type: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  website: string | null;
  instagram: string | null;
  lead_source: string | null;
  sales_owner: string | null;
  project_owner: string | null;
  status: string;
  internal_note: string | null;
  total_revenue: number;
  last_contact_at: string | null;
}

export function fetchClients() {
  return adminFetch<{ clients: ApiClient[] }>('/api/admin/clients', undefined, 'H1');
}

export function fetchClientById(id: string) {
  return adminFetch<{ client: ApiClient }>(
    `/api/admin/clients?id=${encodeURIComponent(id)}`,
    undefined,
    'H1'
  );
}

// ── Tasks ────────────────────────────────────────────────

export interface ApiTask {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  project_id: string | null;
  client_id: string | null;
  project_name: string | null;
  client_name: string | null;
  assigned_to: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  checklist: { id: string; label: string; done: boolean }[];
}

export function fetchTasks(params?: { status?: string; due?: string }) {
  const sp = new URLSearchParams();
  if (params?.status) sp.set('status', params.status);
  if (params?.due) sp.set('due', params.due);
  const qs = sp.toString();
  return adminFetch<{ tasks: ApiTask[] }>(`/api/admin/tasks${qs ? `?${qs}` : ''}`, undefined, 'H1');
}

export function fetchTaskById(id: string) {
  return adminFetch<{ task: ApiTask }>(
    `/api/admin/tasks?id=${encodeURIComponent(id)}`,
    undefined,
    'H1'
  );
}

// ── Contracts ────────────────────────────────────────────

export interface ApiContract {
  id: string;
  created_at: string;
  updated_at: string;
  contract_number: string;
  client_id: string | null;
  client_name: string;
  contract_type: string;
  amount: number;
  start_date: string | null;
  end_date: string | null;
  signature_status: string;
  payment_status: string;
  scope_of_work: string | null;
  deliverables: string[];
  payment_terms: string | null;
  support_terms: string | null;
  project_id: string | null;
  notes: string | null;
}

export function fetchContracts(params?: { client_id?: string; project_id?: string }) {
  const sp = new URLSearchParams();
  if (params?.client_id) sp.set('client_id', params.client_id);
  if (params?.project_id) sp.set('project_id', params.project_id);
  const qs = sp.toString();
  return adminFetch<{ contracts: ApiContract[] }>(
    `/api/admin/contracts${qs ? `?${qs}` : ''}`,
    undefined,
    'H1'
  );
}

export function fetchContractById(id: string) {
  return adminFetch<{ contract: ApiContract }>(
    `/api/admin/contracts?id=${encodeURIComponent(id)}`,
    undefined,
    'H1'
  );
}

// ── Change requests ──────────────────────────────────────

export interface ApiChangeRequest {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  client_id: string | null;
  client_name: string;
  project_id: string | null;
  project_name: string | null;
  request_type: string;
  status: string;
  cost: number;
  assigned_to: string | null;
  included_in_contract: boolean;
  is_paid: boolean;
  estimated_cost: number;
  estimated_time: string | null;
  customer_approval: string;
}

export function fetchChangeRequests(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return adminFetch<{ change_requests: ApiChangeRequest[] }>(
    `/api/admin/change-requests${qs}`,
    undefined,
    'H1'
  );
}

export function fetchChangeRequestById(id: string) {
  return adminFetch<{ change_request: ApiChangeRequest }>(
    `/api/admin/change-requests?id=${encodeURIComponent(id)}`,
    undefined,
    'H1'
  );
}

// ── Maintenance ──────────────────────────────────────────

export interface ApiMaintenancePlan {
  id: string;
  created_at: string;
  updated_at: string;
  client_id: string | null;
  client_name: string;
  plan_type: string;
  monthly_fee: number;
  start_date: string | null;
  renewal_date: string | null;
  payment_status: string;
  support_status: string;
  included_services: string[];
  project_id: string | null;
  upsell_opportunities: string[];
}

export function fetchMaintenancePlans() {
  return adminFetch<{ plans: ApiMaintenancePlan[] }>('/api/admin/maintenance', undefined, 'H1');
}

export function fetchMaintenanceSummary() {
  return adminFetch<{
    summary: { mrr: number; active_count: number; upcoming_renewals: number; overdue_payments: number };
  }>('/api/admin/maintenance?summary=1', undefined, 'H1');
}

// ── Settings ─────────────────────────────────────────────

export function fetchCompanySettings() {
  return adminFetch<{ settings: Record<string, unknown> }>('/api/admin/settings', undefined, 'H1');
}

// ── Lead sources ─────────────────────────────────────────

export interface ApiLeadSourceStat {
  source: string;
  label: string;
  leads: number;
  qualifiedLeads: number;
  seriousTalks: number;
  proposals: number;
  sales: number;
  revenue: number;
  conversionRate: number;
}

export function fetchLeadSources() {
  return adminFetch<{ sources: ApiLeadSourceStat[] }>('/api/admin/lead-sources', undefined, 'H1');
}

export function fetchAdminMe() {
  return adminFetch<{ user: { id: string; name: string; email: string; role: string } }>(
    '/api/admin/auth/me',
    undefined,
    'H1'
  );
}

export interface ApiNotification {
  id: string;
  type: 'ticket' | 'task' | 'lead' | 'invoice' | 'change_request';
  title: string;
  description: string;
  href: string;
  created_at: string;
}

export function fetchAdminNotifications() {
  return adminFetch<{ notifications: ApiNotification[]; unread_count: number }>(
    '/api/admin/notifications',
    undefined,
    'H1'
  );
}

export function fetchInvoiceById(id: string) {
  return adminFetch<{ invoice: ApiInvoice }>(
    `/api/admin/invoices?id=${encodeURIComponent(id)}&full=1`,
    undefined,
    'H1'
  );
}

// ── Mutations ─────────────────────────────────────────────

export function createClient(body: Record<string, unknown>) {
  return adminFetch<{ client: ApiClient }>('/api/admin/clients', {
    method: 'POST',
    body: JSON.stringify(body),
  }, 'H2');
}

export function createProject(body: Record<string, unknown>) {
  return adminFetch<{ project: { id: string; project_code: string } }>('/api/admin/projects', {
    method: 'POST',
    body: JSON.stringify(body),
  }, 'H2');
}

export function createTask(body: Record<string, unknown>) {
  return adminFetch<{ task: ApiTask }>('/api/admin/tasks', {
    method: 'POST',
    body: JSON.stringify(body),
  }, 'H2');
}

export function createContract(body: Record<string, unknown>) {
  return adminFetch<{ contract: ApiContract }>('/api/admin/contracts', {
    method: 'POST',
    body: JSON.stringify(body),
  }, 'H3');
}

export function createInvoice(body: Record<string, unknown>) {
  return adminFetch<{ invoice: ApiInvoice }>('/api/admin/invoices', {
    method: 'POST',
    body: JSON.stringify(body),
  }, 'H3');
}

export function createAdminUser(body: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  return adminFetch<{ user: ApiAdminUser }>('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(body),
  }, 'H2');
}

export function updateAdminUser(
  id: string,
  body: { name?: string; role?: string; is_active?: boolean; password?: string }
) {
  return adminFetch<{ user: ApiAdminUser }>('/api/admin/users', {
    method: 'PATCH',
    body: JSON.stringify({ id, ...body }),
  }, 'H2');
}

export function deactivateAdminUser(id: string) {
  return adminFetch<{ user: ApiAdminUser }>(
    `/api/admin/users?id=${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    'H2'
  );
}

export function patchSalesLead(id: string, body: Record<string, unknown>) {
  return adminFetch<{ lead: ApiLead }>('/api/sales/leads', {
    method: 'PATCH',
    body: JSON.stringify({ id, ...body }),
  }, 'H2');
}

export function importSalesLeads(rows: Record<string, unknown>[]) {
  return adminFetch<{ imported: number; failed: number; errors: string[] }>(
    '/api/sales/leads/import',
    {
      method: 'POST',
      body: JSON.stringify({ rows }),
    },
    'H2'
  );
}

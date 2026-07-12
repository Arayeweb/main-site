// Client-side API helpers for the Araaye AI ops admin panel (app/admin/ai-ops)
// Mirrors the conventions in lib/adminApi.ts
import { agentDebugLog } from '@/lib/agentDebug';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function aiOpsFetch<T>(url: string, options?: RequestInit): Promise<ApiResult<T>> {
  const method = options?.method ?? "GET";
  const hypothesisId = hypothesisForAiOpsRequest(url);
  try {
    const res = await fetch(url, {
      credentials: "include",
      cache: "no-store",
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
    const json = await res.json().catch(() => ({}));
    agentDebugLog(
      'lib/aiAdminApi.ts:aiOpsFetch',
      'ai_ops_api_response',
      { ...safeAiRequestData(url), method, status: res.status, ok: json?.ok, error: json?.error },
      hypothesisId
    );
    if (!res.ok || !json.ok) {
      return { ok: false, error: json.error ?? `http_${res.status}` };
    }
    return { ok: true, data: json as T };
  } catch {
    agentDebugLog(
      'lib/aiAdminApi.ts:aiOpsFetch',
      'ai_ops_api_network_error',
      { ...safeAiRequestData(url), method },
      hypothesisId
    );
    return { ok: false, error: "network_error" };
  }
}

function safeAiRequestData(url: string) {
  const parsed = new URL(url, 'http://admin.local');
  return {
    path: parsed.pathname,
    queryKeys: Array.from(parsed.searchParams.keys()).sort(),
  };
}

function hypothesisForAiOpsRequest(url: string) {
  const path = safeAiRequestData(url).path;
  if (path.includes('/costs')) return 'H4';
  if (path.includes('/content') || path.includes('/campaign-attribution')) return 'H5';
  return 'H5';
}

function qs(params?: Record<string, string | number | undefined | null>): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// ── Overview ─────────────────────────────────────────────

export interface AiOverview {
  kpis: {
    total_users: number;
    active_users_30d: number;
    mrr_toman: number;
    revenue_30d_toman: number;
    cost_30d_usd: number;
    gross_margin_percent: number;
    credits_consumed_30d: number;
    churn_percent: number;
  };
  revenue_vs_cost: { date: string; revenue_toman: number; cost_usd: number }[];
  plan_distribution: { plan: string; count: number }[];
  alerts: {
    failing_providers: { id: string; name: string; status: string; error_rate: number }[];
    failed_payments: { id: string; user_phone: string; amount_toman: number; created_at: string }[];
    urgent_tickets: { id: string; subject: string; priority: string; created_at: string }[];
    negative_margin_users: { id: string; phone: string; revenue_toman: number; cost_usd: number }[];
  };
}

export function fetchAiOverview() {
  return aiOpsFetch<AiOverview>("/api/admin/ai-ops/overview");
}

// ── Users ────────────────────────────────────────────────

export interface AiUserRow {
  id: string;
  phone: string;
  plan: string;
  status: string;
  credits: number;
  abuse_score: number;
  created_at: string;
  last_login_at: string | null;
  total_spend_toman: number;
  total_cost_usd: number;
}

export function fetchAiUsers(params?: { q?: string; plan?: string; status?: string; page?: number }) {
  return aiOpsFetch<{ users: AiUserRow[]; total: number }>(`/api/admin/ai-ops/users${qs(params)}`);
}

export interface AiUserDetail {
  user: AiUserRow;
  usage: { date: string; tokens: number; requests: number }[];
  ledger: { id: string; created_at: string; delta: number; reason: string; note: string | null; balance_after: number | null }[];
  battles: { id: string; created_at: string; prompt: string; tier: string; cost_usd: number; credit_cost: number }[];
  orders: { id: string; created_at: string; package_id: string; amount_toman: number; status: string }[];
  tickets: { id: string; subject: string; status: string; priority: string; created_at: string }[];
}

export function fetchAiUserDetail(id: string) {
  return aiOpsFetch<AiUserDetail>(`/api/admin/ai-ops/users/${id}`);
}

export function updateAiUser(
  id: string,
  body: { status?: string; plan?: string; credit_delta?: number; credit_reason?: string; admin_note?: string }
) {
  return aiOpsFetch<{ user: AiUserRow }>(`/api/admin/ai-ops/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// ── Plans ────────────────────────────────────────────────

export interface AiPlanRow {
  id: string;
  name: string;
  price_toman: number;
  credits: number;
  description: string | null;
  features: string[];
  is_active: boolean;
  is_featured: boolean;
  active_subscribers: number;
  revenue_toman: number;
  cost_usd: number;
  margin_percent: number;
}

export function fetchAiPlans() {
  return aiOpsFetch<{ plans: AiPlanRow[] }>("/api/admin/ai-ops/plans");
}

export function upsertAiPlan(body: Partial<AiPlanRow> & { id: string }) {
  return aiOpsFetch<{ plan: AiPlanRow }>("/api/admin/ai-ops/plans", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── Credits ──────────────────────────────────────────────

export interface AiCreditLedgerRow {
  id: string;
  created_at: string;
  user_id: string;
  user_phone: string;
  delta: number;
  balance_after: number | null;
  reason: string;
  note: string | null;
  admin_name: string | null;
}

export function fetchAiCreditLedger(params?: { q?: string; page?: number }) {
  return aiOpsFetch<{ entries: AiCreditLedgerRow[]; total: number }>(`/api/admin/ai-ops/credits${qs(params)}`);
}

export function grantAiCredits(body: { user_id: string; delta: number; reason: string; note?: string }) {
  return aiOpsFetch<{ ok: true }>("/api/admin/ai-ops/credits", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── Models ───────────────────────────────────────────────

export interface AiModelRow {
  id: string;
  route_id: string;
  kind: string;
  brand: string;
  name: string;
  persona_name: string | null;
  tier: string;
  cost_per_1k_tokens: number;
  credit_cost: number | null;
  enabled: boolean;
  notes: string | null;
  usage_count_30d: number;
  cost_usd_30d: number;
}

export function fetchAiModels() {
  return aiOpsFetch<{ models: AiModelRow[] }>("/api/admin/ai-ops/models");
}

export function updateAiModel(id: string, body: Partial<AiModelRow>) {
  return aiOpsFetch<{ model: AiModelRow }>(`/api/admin/ai-ops/models/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// ── Providers ────────────────────────────────────────────

export interface AiProviderRow {
  id: string;
  name: string;
  base_url: string | null;
  api_key_masked: string | null;
  status: string;
  enabled: boolean;
  error_rate: number;
  avg_latency_ms: number | null;
  uptime_percent: number;
  last_checked_at: string | null;
  notes: string | null;
  cost_usd_30d: number;
}

export function fetchAiProviders() {
  return aiOpsFetch<{ providers: AiProviderRow[] }>("/api/admin/ai-ops/providers");
}

export function updateAiProvider(id: string, body: Partial<AiProviderRow>) {
  return aiOpsFetch<{ provider: AiProviderRow }>(`/api/admin/ai-ops/providers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// ── Prompt templates ─────────────────────────────────────

export interface AiPromptRow {
  id: string;
  name: string;
  category: string;
  persona_key: string | null;
  content: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export function fetchAiPrompts() {
  return aiOpsFetch<{ prompts: AiPromptRow[] }>("/api/admin/ai-ops/prompts");
}

export function upsertAiPrompt(body: Partial<AiPromptRow>) {
  return aiOpsFetch<{ prompt: AiPromptRow }>("/api/admin/ai-ops/prompts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function deleteAiPrompt(id: string) {
  return aiOpsFetch<{ ok: true }>(`/api/admin/ai-ops/prompts?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ── Conversations ────────────────────────────────────────

export interface AiConversationRow {
  id: string;
  created_at: string;
  user_phone: string | null;
  prompt: string;
  model_a: string;
  model_b: string;
  tier: string;
  cost_usd: number;
  tokens_used: number | null;
  credit_cost: number;
  winner: string | null;
}

export function fetchAiConversations(params?: { q?: string; tier?: string; page?: number }) {
  return aiOpsFetch<{ conversations: AiConversationRow[]; total: number }>(
    `/api/admin/ai-ops/conversations${qs(params)}`
  );
}

export function fetchAiConversationDetail(id: string) {
  return aiOpsFetch<{ conversation: AiConversationRow & { response_a: string; response_b: string; attachments: unknown[] } }>(
    `/api/admin/ai-ops/conversations/${id}`
  );
}

// ── Costs ────────────────────────────────────────────────

export interface AiCostsReport {
  kpis: {
    total_ai_revenue_toman: number;
    total_provider_cost_usd: number;
    total_provider_cost_toman: number;
    gross_profit_toman: number;
    gross_margin_percent: number;
  };
  by_model: {
    model: string;
    requests: number;
    cost_usd: number;
    revenue_toman: number;
    gross_profit_toman: number;
    margin_percent: number;
  }[];
  by_feature: {
    feature: string;
    runs: number;
    revenue_toman: number;
    cost_usd: number;
    margin_percent: number;
  }[];
  by_plan: { plan: string; revenue_toman: number; cost_usd: number; margin_percent: number }[];
  by_day: { date: string; cost_usd: number }[];
  anomalies: { user_id: string; phone: string; z_score: number; cost_usd_7d: number }[];
  loss_makers: { kind: string; key: string; margin_percent: number }[];
}

export function fetchAiCosts() {
  return aiOpsFetch<AiCostsReport>("/api/admin/ai-ops/costs");
}

// ── Payments ─────────────────────────────────────────────

export interface AiPaymentRow {
  id: string;
  created_at: string;
  user_phone: string;
  package_id: string;
  amount_toman: number;
  list_amount_toman: number | null;
  discount_toman: number;
  status: string;
  promo_code: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  paid_at: string | null;
}

export interface AiCampaignGroupRow {
  key: string;
  promo_code: string | null;
  utm_source: string | null;
  orders: number;
  paid_orders: number;
  revenue_toman: number;
  signups: number;
}

export interface AiCampaignAttribution {
  groupBy: string;
  groups: AiCampaignGroupRow[];
  totals: {
    orders: number;
    paid_orders: number;
    revenue_toman: number;
    signups_with_utm: number;
  };
}

export function fetchAiCampaignAttribution(groupBy: "promo" | "utm" = "promo") {
  return aiOpsFetch<AiCampaignAttribution>(
    `/api/admin/ai-ops/campaign-attribution?group=${groupBy}`
  );
}

export function fetchAiPayments(params?: { status?: string; q?: string; page?: number }) {
  return aiOpsFetch<{ payments: AiPaymentRow[]; total: number }>(`/api/admin/ai-ops/payments${qs(params)}`);
}

// ── Coupons ──────────────────────────────────────────────

export interface AiCouponRow {
  id: string;
  code: string;
  kind: string;
  value: number;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  active: boolean;
  redeemed_orders: number;
  discount_given_toman: number;
}

export function fetchAiCoupons() {
  return aiOpsFetch<{ coupons: AiCouponRow[] }>("/api/admin/ai-ops/coupons");
}

export function upsertAiCoupon(body: Partial<AiCouponRow>) {
  return aiOpsFetch<{ coupon: AiCouponRow }>("/api/admin/ai-ops/coupons", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── Tickets ──────────────────────────────────────────────

export interface AiTicketRow {
  id: string;
  created_at: string;
  updated_at: string;
  user_phone: string;
  subject: string;
  body: string;
  status: string;
  priority: string;
  admin_reply: string | null;
  replied_at: string | null;
}

export function fetchAiTickets(params?: { status?: string; q?: string }) {
  return aiOpsFetch<{ tickets: AiTicketRow[] }>(`/api/admin/ai-ops/tickets${qs(params)}`);
}

export function fetchAiTicketDetail(id: string) {
  return aiOpsFetch<{ ticket: AiTicketRow }>(`/api/admin/ai-ops/tickets/${id}`);
}

export function replyAiTicket(id: string, body: { admin_reply?: string; status?: string; priority?: string }) {
  return aiOpsFetch<{ ticket: AiTicketRow }>(`/api/admin/ai-ops/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// ── Notifications ────────────────────────────────────────

export interface AiNotificationRow {
  id: string;
  created_at: string;
  title: string;
  body: string;
  audience: string;
  target_plan: string | null;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  sent_count: number;
}

export function fetchAiNotifications() {
  return aiOpsFetch<{ notifications: AiNotificationRow[] }>("/api/admin/ai-ops/notifications");
}

export function createAiNotification(body: {
  title: string;
  body: string;
  audience: string;
  target_plan?: string;
  send_now?: boolean;
}) {
  return aiOpsFetch<{ notification: AiNotificationRow }>("/api/admin/ai-ops/notifications", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── Content ──────────────────────────────────────────────

export interface AiContentBlockRow {
  id: string;
  title: string;
  body: string;
  kind: string;
  is_published: boolean;
  updated_at: string;
}

export function fetchAiContent() {
  return aiOpsFetch<{ blocks: AiContentBlockRow[] }>("/api/admin/ai-ops/content");
}

export function upsertAiContent(body: Partial<AiContentBlockRow> & { id: string }) {
  return aiOpsFetch<{ block: AiContentBlockRow }>("/api/admin/ai-ops/content", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── Logs ─────────────────────────────────────────────────

export interface AiLogRow {
  id: string;
  created_at: string;
  kind: "request" | "audit";
  summary: string;
  detail: string;
  actor: string | null;
}

export function fetchAiLogs(params?: { kind?: string }) {
  return aiOpsFetch<{ logs: AiLogRow[] }>(`/api/admin/ai-ops/logs${qs(params)}`);
}

// ── Settings ─────────────────────────────────────────────

export function fetchAiSettings() {
  return aiOpsFetch<{ settings: Record<string, unknown> }>("/api/admin/ai-ops/settings");
}

export function saveAiSettings(data: Record<string, unknown>) {
  return aiOpsFetch<{ settings: Record<string, unknown> }>("/api/admin/ai-ops/settings", {
    method: "PATCH",
    body: JSON.stringify({ data }),
  });
}

// ── Team (admin users with ai_* roles) ───────────────────

export interface AiTeamMemberRow {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

export function fetchAiTeam() {
  return aiOpsFetch<{ members: AiTeamMemberRow[] }>("/api/admin/ai-ops/team");
}

export function createAiTeamMember(body: { name: string; email: string; password: string; role: string }) {
  return aiOpsFetch<{ member: AiTeamMemberRow }>("/api/admin/ai-ops/team", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateAiTeamMember(id: string, body: { role?: string; is_active?: boolean }) {
  return aiOpsFetch<{ member: AiTeamMemberRow }>(`/api/admin/ai-ops/team/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// ── Audit log ────────────────────────────────────────────

export interface AiAuditLogRow {
  id: string;
  created_at: string;
  admin_name: string | null;
  admin_role: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  meta: Record<string, unknown>;
}

export function fetchAiAuditLog() {
  return aiOpsFetch<{ entries: AiAuditLogRow[] }>("/api/admin/ai-ops/audit-log");
}

export function fetchAiMe() {
  return aiOpsFetch<{ user: { id: string; name: string; email: string; role: string } }>("/api/admin/auth/me");
}

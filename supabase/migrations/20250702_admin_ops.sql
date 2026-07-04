-- پنل عملیاتی آرایه: مشتریان، تسک‌ها، قراردادها، پشتیبانی، تنظیمات
-- در Supabase SQL Editor اجرا کنید.

-- ── مشتریان ──────────────────────────────────────────────
create table if not exists public.crm_clients (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  name            text not null,
  client_type     text not null default 'other',
  phone           text,
  email           text,
  address         text,
  city            text,
  website         text,
  instagram       text,
  lead_source     text,
  sales_owner     text,
  project_owner   text,
  status          text not null default 'active_client',
  internal_note   text,
  total_revenue   numeric(14,0) not null default 0,
  last_contact_at timestamptz
);

create index if not exists crm_clients_status_idx on public.crm_clients (status);
create index if not exists crm_clients_name_idx on public.crm_clients (name);
alter table public.crm_clients enable row level security;

-- ── تسک‌ها ───────────────────────────────────────────────
create table if not exists public.crm_tasks (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  title        text not null,
  description  text,
  project_id   uuid references public.support_projects (id) on delete set null,
  client_id    uuid references public.crm_clients (id) on delete set null,
  project_name text,
  client_name  text,
  assigned_to  text,
  priority     text not null default 'medium',
  status       text not null default 'todo',
  due_date     date,
  checklist    jsonb not null default '[]'
);

create index if not exists crm_tasks_status_idx on public.crm_tasks (status);
create index if not exists crm_tasks_due_idx on public.crm_tasks (due_date);
alter table public.crm_tasks enable row level security;

-- ── قراردادها ────────────────────────────────────────────
create table if not exists public.crm_contracts (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  contract_number   text not null unique,
  client_id         uuid references public.crm_clients (id) on delete set null,
  client_name       text not null,
  contract_type     text not null default 'website_design',
  amount            numeric(14,0) not null default 0,
  start_date        date,
  end_date          date,
  signature_status  text not null default 'draft',
  payment_status    text not null default 'unpaid',
  scope_of_work     text,
  deliverables      jsonb not null default '[]',
  payment_terms     text,
  support_terms     text,
  project_id        uuid references public.support_projects (id) on delete set null,
  notes             text
);

create index if not exists crm_contracts_client_idx on public.crm_contracts (client_id);
create index if not exists crm_contracts_status_idx on public.crm_contracts (signature_status);
alter table public.crm_contracts enable row level security;

-- ── درخواست تغییرات ──────────────────────────────────────
create table if not exists public.crm_change_requests (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  title                 text not null,
  description           text,
  client_id             uuid references public.crm_clients (id) on delete set null,
  client_name           text not null,
  project_id            uuid references public.support_projects (id) on delete set null,
  project_name          text,
  request_type          text not null default 'other',
  status                text not null default 'new',
  cost                  numeric(14,0) not null default 0,
  assigned_to           text,
  included_in_contract  boolean not null default false,
  is_paid               boolean not null default false,
  estimated_cost        numeric(14,0) not null default 0,
  estimated_time        text,
  customer_approval     text not null default 'pending'
);

create index if not exists crm_change_requests_status_idx on public.crm_change_requests (status);
alter table public.crm_change_requests enable row level security;

-- ── پلن‌های پشتیبانی ─────────────────────────────────────
create table if not exists public.crm_maintenance_plans (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  client_id             uuid references public.crm_clients (id) on delete set null,
  client_name           text not null,
  plan_type             text not null default 'basic_support',
  monthly_fee           numeric(14,0) not null default 0,
  start_date            date,
  renewal_date          date,
  payment_status        text not null default 'pending',
  support_status        text not null default 'active',
  included_services     jsonb not null default '[]',
  project_id            uuid references public.support_projects (id) on delete set null,
  upsell_opportunities  jsonb not null default '[]'
);

create index if not exists crm_maintenance_status_idx on public.crm_maintenance_plans (support_status);
alter table public.crm_maintenance_plans enable row level security;

-- ── تنظیمات شرکت (تک‌ردیفی) ───────────────────────────────
create table if not exists public.company_settings (
  id         int primary key default 1 check (id = 1),
  updated_at timestamptz not null default now(),
  data       jsonb not null default '{}'
);

alter table public.company_settings enable row level security;

insert into public.company_settings (id, data)
values (1, '{}')
on conflict (id) do nothing;

-- ── گسترش پروژه‌های پشتیبانی ─────────────────────────────
alter table public.support_projects add column if not exists client_id uuid references public.crm_clients (id) on delete set null;
alter table public.support_projects add column if not exists owner_name text;
alter table public.support_projects add column if not exists contract_amount numeric(14,0) default 0;
alter table public.support_projects add column if not exists payment_status text default 'unpaid';
alter table public.support_projects add column if not exists project_type text;

-- گسترش دسته‌بندی تیکت برای درخواست تغییر
-- (مقادیر جدید در اپلیکیشن استفاده می‌شوند؛ محدودیت DB اعمال نشده)

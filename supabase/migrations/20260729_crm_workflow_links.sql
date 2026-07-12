-- CRM workflow: link leads → proforma → contract → project via FKs

alter table public.invoices
  add column if not exists lead_id uuid references public.leads (id) on delete set null,
  add column if not exists client_id uuid references public.crm_clients (id) on delete set null;

create index if not exists invoices_lead_idx on public.invoices (lead_id);
create index if not exists invoices_client_idx on public.invoices (client_id);

alter table public.crm_contracts
  add column if not exists proforma_id uuid references public.invoices (id) on delete set null,
  add column if not exists lead_id uuid references public.leads (id) on delete set null;

create index if not exists crm_contracts_proforma_idx on public.crm_contracts (proforma_id);
create index if not exists crm_contracts_lead_idx on public.crm_contracts (lead_id);

alter table public.support_projects
  add column if not exists contract_id uuid references public.crm_contracts (id) on delete set null;

create index if not exists support_projects_contract_idx on public.support_projects (contract_id);

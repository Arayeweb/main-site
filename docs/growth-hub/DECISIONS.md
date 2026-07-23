# Growth Hub — Architecture & Product Decisions

**Status:** Accepted (Sprint 0)  
**Owner:** Product / Engineering  
**Related:** [Prd.md](./Prd.md), [ARCHITECTURE.md](./ARCHITECTURE.md)

Decisions are numbered for reference in code reviews and migrations. Reversing a decision requires a new entry, not silent edits.

---

## D-001 — Bounded context in modular monolith

**Decision:** Growth Hub remains inside the existing Next.js app (`arayeh-site`). No new deployable service for MVP.

**Rationale:** PRD §13; preserves Vercel deploy and shared infra (email, analytics sink).

**Consequences:** Code lives under `app/app`, `app/admin/growth-hub`, `lib/growth-hub`, `components/growth-hub`.

---

## D-002 — Client identity: Supabase Auth + `gh_profiles`

**Decision:** Portal users authenticate with **Supabase Auth**. Application profile row: `gh_profiles.id` = `auth.users.id`.

**Rationale:** RLS requires `auth.uid()`; custom HMAC cookies used elsewhere do not map to Postgres policies.

**Consequences:** Add `@supabase/ssr` in **Sprint 1B** (after visual sign-off); distinct from `ary_ai_session` / `ary_adready_session`.

---

## D-003 — No reuse of product identities as tenants

**Decision:** `ai_users`, `adready_users`, FastWeb order tokens, bizcard owner tokens, and `/support` project passwords are **not** tenant identities for Growth Hub.

**Rationale:** PRD §735–747; backwards compatibility for existing products.

**Consequences:** Optional future **manual link** fields on `gh_workspaces` (`crm_client_id`, `support_project_id`) only; no sync engine.

---

## D-004 — `gh_` table prefix and `workspace_id`

**Decision:** All tenant-owned Growth Hub tables use prefix `gh_` and carry `workspace_id` where applicable.

**Rationale:** Avoid collision with `public.invoices`, `ai_notifications`, and PRD bare names.

---

## D-005 — User-scoped Supabase clients for client-facing data

**Decision:** Routes under `/app/*` load data only through **user-scoped** Supabase clients (SSR cookie session).

**Rationale:** Enforce RLS at the database; UI checks are insufficient.

---

## D-006 — Service role forbidden in client loaders and components

**Decision:** `getSupabaseAdmin()` and service-role keys **must not** be imported in:

- Client Components
- Server Components / loaders for `/app/*`
- Shared modules imported by the above

**Rationale:** Service role bypasses RLS.

---

## D-007 — Service role only for verified staff mutations

**Decision:** Service-role writes are allowed only after `assertGrowthHubStaffAccess()` (or successor) validates staff identity (`ary_admin` / mapped role) and workspace scope.

**Rationale:** Staff UI uses existing admin cookie; mutations still need explicit authorization and audit.

---

## D-008 — Legacy CRM, support, invoices unchanged in MVP

**Decision:** `crm_*`, `support_*`, `public.invoices`, and related admin UIs are not modified for Growth Hub MVP.

**Rationale:** Avoid operational regression; pilot runs in parallel.

---

## D-009 — No dual-write or sync engine in MVP

**Decision:** No background job copies data between CRM/support and `gh_*`.

**Rationale:** Reduces failure modes; ops onboard workspaces manually in pilot.

---

## D-010 — Published reports are immutable snapshots

**Decision:** On publish, persist a **snapshot** (JSON document and/or frozen child rows). Published rows are not edited in place; new draft = new version or new row.

**Rationale:** PRD §10.5; client trust and audit.

---

## D-011 — Payments MVP: status, file, payment URL only

**Decision:** `gh_invoices` supports amount, status, dates, invoice file, `payment_url`, manual paid marking by staff. No in-portal Zibal checkout, tax engine, or ledger.

**Rationale:** PRD §10.7, §30; existing `payment-service` stays product-specific.

---

## D-012 — Phone authentication: post-pilot decision

**Decision:** MVP ships **email magic link + password** via Supabase Auth. Phone OTP is **not rejected permanently**; evaluate after pilot (may reuse Kavenegar patterns without sharing `ai_otp_challenges`).

**Rationale:** PRD invite mentions phone; Iran UX uncertainty — document as follow-up ADR.

---

## D-013 — MVP exclusions (explicit non-goals)

**Decision:** MVP does **not** include: CRM module, accounting, realtime chat, AI assistant, workflow builder, Google Analytics / Search Console integration, public Araaye tracker generalization (P1).

**Rationale:** PRD scope and stop conditions.

---

## D-014 — Staff admin URL namespace

**Decision:** Staff Growth Hub UI lives at `/admin/growth-hub/*`, not `/admin/workspaces` at manager root.

**Rationale:** Avoid confusion with `/admin/manager/clients` and CRM “مشتریان”.

---

## D-015 — Staff role mapping

| PRD role | Implementation |
|----------|----------------|
| `client_owner` | `gh_workspace_members.role` |
| `client_member` | `gh_workspace_members.role` |
| `araaye_manager` | `gh_workspace_members.role = 'araaye_manager'` with `status = 'active'`; sees only workspaces where so assigned |
| `araaye_admin` | Global staff: `admin_users.role = 'admin'` (or dedicated staff flag); all workspaces via RLS helper `gh_is_staff_admin()` |

**Note:** Workspace access and manager assignment are **only** expressed in `gh_workspace_members` (see D-022).

---

## D-016 — UI: thin Growth Hub kit, not full shadcn

**Decision:** `components/growth-hub/ui/*` — thin primitives; may wrap existing Radix deps. No `components.json` / full shadcn init in MVP.

**Rationale:** Repo has no shadcn; client portal must not look like internal admin (see DESIGN-BRIEF).

---

## D-017 — Client portal visual system separate from admin

**Decision:** Client `/app/*` uses Growth Hub tokens (DESIGN-BRIEF). Staff `/admin/growth-hub` may reuse admin layout patterns but not vice versa.

---

## D-018 — Product analytics destination

**Decision:** Growth Hub product events insert into `analytics_events` with `source = 'growth_hub'` and structured `metadata` JSON until a dedicated table is justified.

**Rationale:** Existing pipeline in repo; PRD §21.

---

## D-019 — Storage bucket `gh-uploads`

**Decision:** Private bucket; object key prefix `{workspace_id}/…`; policies tied to membership (see rls-matrix).

---

## D-020 — Vertical slice gate

**Decision:** No production work on **reports, opportunities, charts, files, or billing** until **G3** (services vertical slice) passes (see ACCEPTANCE-CRITERIA).

**Rationale:** PRD §33; audit risk of building UI without tenancy.

---

## D-021 — Sprint 1 split: visual before production foundation

**Decision:** Sprint 1 is **sequential**, not parallel:

1. **Sprint 1A — Visual prototype** (fixture-only UI at `/dev/growth-hub`, no auth/DB).
2. **Sprint 1B — Production foundation** begins **only after G1** (visual sign-off).

**Rationale:** Separates design approval from tenancy/auth work; avoids protected `/app` routes during visual iteration.

**Consequences:** No Supabase, middleware, migrations, or `/app/login` in Sprint 1A. Reusable components live under `components/growth-hub/`.

---

## D-022 — Account manager source of truth (MVP)

**Decision:** `gh_workspace_members` is the **sole authoritative** source for workspace access and the `araaye_manager` relationship. **`account_manager_id` is not on `gh_workspaces` in MVP.**

**Rationale:** Avoid dual sources of truth for authorization and manager assignment.

**Consequences:**

- Assign or remove an Araaye manager by inserting/updating/deactivating a `gh_workspace_members` row with `role = 'araaye_manager'`.
- RLS helper `gh_is_workspace_manager(workspace_id)` checks active membership only.
- Add index e.g. `gh_workspace_members_manager_idx` on `(user_id, workspace_id)` WHERE `role = 'araaye_manager' AND status = 'active'` for staff workspace lists.
- Manager must still have valid staff auth (`ary_admin` / `admin_users`) for `/admin/growth-hub` mutations.

**Not in MVP:** Denormalized `account_manager_id` on `gh_workspaces`. If added post-pilot, it must be display-only with rules in a future ADR (no authorization).

---

## Open questions (not blocking Sprint 0)

| ID | Topic | Default until decided |
|----|--------|------------------------|
| Q-1 | Subdomain per workspace | Path-based `/app/[workspaceSlug]` only |
| Q-2 | `araaye_manager` modeling | **Resolved:** D-022 — membership only |
| Q-3 | Report versioning table | `gh_reports.version` + `published_snapshot` on same row |

# Growth Hub — Acceptance Criteria

**Status:** Sprint 0 (patched)  
**Gate rule:** Production work on **reports, opportunities, charts, files, and billing** **must not start** until **G3** passes.

---

## G0 — Sprint 0 documentation

- [ ] All docs in `docs/growth-hub/` listed in IMPLEMENTATION-PLAN exist and cross-link
- [ ] DECISIONS D-001–D-022 recorded (including 1A/1B split and D-022 manager modeling)
- [ ] DATA-MODEL covers all 17 `gh_*` tables (no `account_manager_id` on workspaces)
- [ ] RLS matrix covers all tables + storage + all 6 actor types
- [ ] Route map covers client + staff MVP routes + `/dev/growth-hub` (1A)
- [ ] DESIGN-BRIEF prohibits admin/AI visual clone; visual sign-off viewports defined
- [ ] Cursor rules under `.cursor/rules/growth-hub-*.mdc` present
- [ ] Growth-Hub-Audit.md documents repo verification corrections
- [ ] Team review: no open blocking contradictions with Prd.md

**Exit:** Product owner signs G0.

---

## G1 — Visual Home approved (Sprint 1A)

**Scope:** Visual-only prototype; **no** Supabase or production authentication code.

- [ ] Route `/dev/growth-hub` (or documented subpaths) uses **typed fixtures only**
- [ ] Route blocked in production (`NODE_ENV === 'production'` or equivalent) or returns 404
- [ ] No `/app/login`, invite routes, or middleware changes in this phase
- [ ] Growth Hub tokens only — not AdminLayout or AI visual system
- [ ] Portal shell, desktop sidebar, mobile navigation prototyped
- [ ] Home implements DESIGN-BRIEF hierarchy; answers **current status**, **Araaye activity**, **next customer action**
- [ ] Fixture states implemented: **loading**, **populated**, **partial-data**, **empty**, **error**
- [ ] **Populated Home:** **3–4** `MetricSummary` tiles; each with Persian label, current value, comparison/context, plain-language interpretation, source or last-update time
- [ ] **Partial-data Home:** **1–2** KPIs only; other sections may appear without fake KPI filler
- [ ] **No-data / empty Home:** meaningful empty state — **no fake KPI values**
- [ ] Visual review at **1440×1000**, **1024×900**, **768×1024**, **390×844** (screenshots or review session)
- [ ] Visual gate checklist (DESIGN-BRIEF §8): no horizontal overflow; RTL; directional icons; hierarchy; Persian layout; clear primary action; status not color-only; usable mobile nav; not generic AI SaaS dashboard

**Exit:** Product/design sign-off → **Sprint 1B may start**.

---

## G2 — Production foundation approved (Sprint 1B)

**Prerequisite:** G1 passed.

- [ ] `@supabase/ssr` integrated; session refresh on `/app/*`
- [ ] `gh_profiles`, `gh_workspaces`, `gh_workspace_members`, `gh_workspace_invites` migrated with RLS
- [ ] **No** `account_manager_id` on `gh_workspaces`; managers via `gh_workspace_members.role = 'araaye_manager'`
- [ ] User-scoped client reads membership; service role not imported in `/app` tree
- [ ] `/app/login`, `/app/invite/[token]`, `/app/select-workspace` functional
- [ ] Production `PortalShell` wired to session + membership
- [ ] `/admin/growth-hub/workspaces` CRUD + invite (staff)
- [ ] `PublicOnlyChrome` excludes `/app`
- [ ] Cross-tenant tests: user A cannot read workspace B
- [ ] `/dev/growth-hub` removed or disabled after visual handoff
- [ ] Lint or CI rule: ban `getSupabaseAdmin` in `app/app/**`

**Exit:** G2 green in CI → **Sprint 2 may start**.

---

## G3 — Services vertical slice approved (Sprint 2)

**Prerequisite:** G2 passed.

**Scenario:**

1. Araaye admin creates workspace  
2. Customer invited  
3. Service assigned (status + next action)  
4. Customer enters workspace and sees status + next action (home and/or services)  
5. User in another workspace **denied**  

**Criteria:**

- [ ] End-to-end on staging with real Supabase
- [ ] Invite delivered (or dev log)
- [ ] Activity logged for service creation
- [ ] Playwright e2e happy path + cross-tenant denial
- [ ] RLS cases from rls-matrix for services/members

**Exit:** **Mandatory** before Sprint 3+ and before **reports, opportunities, charts, files, billing** implementation.

---

## G4 — Requests module (Sprint 3)

- [ ] Client create request + attachment
- [ ] Staff assign, status, internal comment
- [ ] Client cannot see `is_internal`
- [ ] Notification on status change
- [ ] Full request lifecycle e2e

---

## G5 — Reports module (Sprint 4)

- [ ] Staff build draft &lt; 10 min (repeat customer)
- [ ] Publish creates immutable snapshot
- [ ] Client view + acknowledge
- [ ] Client cannot read draft

---

## G6 — Opportunities, files, billing (Sprint 5)

- [ ] Max 2 visible opportunities
- [ ] File upload RLS + storage policy
- [ ] `gh_invoices` status + payment URL (no in-app checkout)
- [ ] Home billing summary

---

## G7 — Pilot readiness (Sprint 6)

- [ ] 3 pilot workspaces seeded
- [ ] STATE-MATRIX states on production routes
- [ ] Product events from EVENT-CATALOG
- [ ] RLS regression suite
- [ ] `noindex` on `/app`
- [ ] Ops runbook

**Exit:** First real customer invited.

---

## Non-goals verification (any sprint)

Reject PR if introduces:

- CRM replacement, accounting, realtime chat, AI assistant
- Google Analytics / Search Console OAuth
- Dual-write to `crm_*` / `support_*`
- `getSupabaseAdmin` in client portal loaders
- Supabase/auth/migrations in a Sprint **1A** PR

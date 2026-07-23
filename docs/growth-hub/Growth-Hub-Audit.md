# Araaye Growth Hub — Implementation Audit

**Status:** Sprint 0 baseline  
**Sources:** Repository inspection, [`Prd.md`](./Prd.md)  
**Purpose:** Record what exists today, what conflicts, and what to build. Superseded in detail by sibling Sprint 0 docs; this file retains **verified repository facts** and **corrections**.

---

## Repository verification (2026-07-23)

Facts below were re-checked against the working tree. Corrections vs earlier informal audit notes are called out.

| Claim | Verified | Notes |
|-------|----------|-------|
| Next.js App Router only | Yes | `app/` with 200+ `page.tsx`; no `pages/` |
| `next@^14.2.5` | Yes | Lockfile: **14.2.35** (`package-lock.json`) |
| React 18 | Yes | `package.json` |
| Package name `arayeh-site` | Yes | `package.json` |
| No `@supabase/ssr` | Yes | Not in `package.json` |
| No `components.json` / shadcn | Yes | No file; no `components/ui/` |
| Service-role only client | Yes | [`lib/supabase.ts`](../../lib/supabase.ts) |
| Supabase Auth for staff login | Yes | [`lib/adminLogin.ts`](../../lib/adminLogin.ts) → `ary_admin` cookie |
| Middleware protects `/admin` only | Yes | [`middleware.ts`](../../middleware.ts) |
| Root `lang=fa` `dir=rtl` | Yes | [`app/layout.tsx`](../../app/layout.tsx) |
| Vazirmatn in Tailwind | Yes | [`tailwind.config.js`](../../tailwind.config.js) |
| No `workspaces` / `profiles` tables | Yes | [`supabase/schema.sql`](../../supabase/schema.sql) |
| Legacy `public.invoices` | Yes | CRM/support-linked; not tenant-scoped |
| `crm_*` migrations | Yes | [`supabase/migrations/20250702_admin_ops.sql`](../../supabase/migrations/20250702_admin_ops.sql) |
| Vitest + Playwright | Yes | ~**100** test files under `tests/` (audit previously said ~99) |
| 43 SQL migrations | Yes | `supabase/migrations/*.sql` |
| `docs/growth-hub/Growth-Hub-Audit.md` missing before Sprint 0 | **Corrected** | Created in Sprint 0 |
| PRD path `Prd.md` vs `PRD.md` | **Corrected** | Repo file is [`Prd.md`](./Prd.md) (case-sensitive on Linux/CI) |
| Global brand color is “Araaye teal” in Tailwind theme | **Partially wrong** | Theme defines `navy`, `brand` (blue), `violet`, `cyan`; **teal** appears in marketing/SEO components (`teal-600`), not as a named Tailwind scale. Portal design defines teal accent explicitly in [`DESIGN-BRIEF.md`](./DESIGN-BRIEF.md). |
| Radix in use | **Partially wrong** | `@radix-ui/react-dialog` and `dropdown-menu` in `package.json` but **no imports** in app source yet; safe to use for Growth Hub thin UI. |
| `payment-service/` | Yes | Separate Express Zibal service; out of Growth Hub MVP checkout scope |

---

## Executive summary

Growth Hub is a **new bounded context** in the existing Next.js modular monolith. Current production auth and data access are **not** suitable for multi-tenant client RLS. MVP adds `gh_*` tables, Supabase Auth for clients, user-scoped Supabase clients for portal routes, and staff operations under `/admin/growth-hub` using existing admin gate + centralized authorization before service-role writes.

**Go:** Conditional — proceed after Sprint 0 docs (this package).  
**Stop:** Sharing AI/AdReady identity, skipping RLS tests, CRM replacement in v1, or building reports/opportunities before the first vertical slice passes.

---

## Conflicts and risks (abbreviated)

1. Service-role bypass everywhere today — portal must not copy this pattern for reads.
2. Table name collisions — use `gh_` prefix (`gh_invoices` ≠ `public.invoices`).
3. CRM / `/support` / product `/dashboard/*` remain parallel; no dual-write in MVP.
4. `PublicOnlyChrome` does not yet exclude `/app` — change in **Sprint 1B**.
5. Middleware does not protect `/app/*` — portal session refresh + layout guards in **Sprint 1B**.
6. **Sprint 1** is split into **1A** (visual `/dev/growth-hub`) then **1B** (production foundation) — sequential, not parallel.

Full architecture, data model, RLS, and routes: see [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`DATA-MODEL.md`](./DATA-MODEL.md), [`rls-matrix.md`](./rls-matrix.md), [`route-map.md`](./route-map.md).

---

## Sprint 0 deliverables

| Document | Role |
|----------|------|
| [DECISIONS.md](./DECISIONS.md) | ADRs |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System shape |
| [DATA-MODEL.md](./DATA-MODEL.md) | ERD specification |
| [route-map.md](./route-map.md) | Routes and UX states |
| [rls-matrix.md](./rls-matrix.md) | Security matrix |
| [DESIGN-BRIEF.md](./DESIGN-BRIEF.md) | Client portal visual system |
| [UI-INVENTORY.md](./UI-INVENTORY.md) | Components |
| [STATE-MATRIX.md](./STATE-MATRIX.md) | Page states |
| [EVENT-CATALOG.md](./EVENT-CATALOG.md) | Product analytics |
| [ACCEPTANCE-CRITERIA.md](./ACCEPTANCE-CRITERIA.md) | Gates |
| [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md) | Phased delivery |

# Growth Hub — Implementation Plan

**Status:** Sprint 0 (patched)  
**Timeline reference:** PRD §25–26 (~18–21 working days to pilot after Sprint 0; Sprint 1A adds visual review time)

---

## Sprint 0 — Documentation

**Duration:** 2 days  
**Deliverables:** All `docs/growth-hub/*` specs + `.cursor/rules/growth-hub-*.mdc`  
**No:** migrations, production routes, auth code  
**Gate:** [ACCEPTANCE-CRITERIA.md](./ACCEPTANCE-CRITERIA.md) G0

---

## Sprint 1A — Visual prototype (fixture-only)

**Duration:** ~2–3 days  
**Prerequisite:** G0 complete  
**Gate:** **G1** — visual Home approved  
**Next:** Sprint 1B starts **only after G1 sign-off** (not in parallel)

### Includes

| Area | Deliverable |
|------|-------------|
| Tokens | Customer portal visual tokens (`components/growth-hub/theme/`) |
| Shell | `PortalShell`, desktop `PortalSidebar`, `MobileNavigation` prototypes |
| Home | Customer Home page with full DESIGN-BRIEF hierarchy |
| Fixtures | Typed scenarios: populated, partial-data, empty, loading, error |
| Route | `/dev/growth-hub` (dev-only; see DESIGN-BRIEF §7–8) |
| Review | Responsive + accessibility checklist at defined viewports |

### Explicit exclusions (Sprint 1A)

- Supabase Auth  
- Middleware changes  
- Database migrations  
- RLS  
- API routes  
- Server mutations  
- Workspace CRUD  
- Invitation flow  
- Admin application (`/admin/growth-hub`)  
- Production billing UI with real data  
- Real product analytics  

### Components

All reusable UI under `components/growth-hub/` (consumed later by production routes in 1B+).

---

## Sprint 1B — Production foundation

**Duration:** 3–4 days  
**Prerequisite:** **G1 passed**  
**Gate:** **G2** — production foundation approved

### Includes

| Work | Details |
|------|---------|
| Dependencies | `@supabase/ssr` |
| Database | `*_gh_foundation.sql` — `gh_profiles`, `gh_workspaces`, `gh_workspace_members`, `gh_workspace_invites`, RLS helpers |
| Auth | Login, invite accept, workspace selector on **`/app/*`** |
| UI | Wire **production** `PortalShell` to real session + membership |
| Staff | `/admin/growth-hub/workspaces` CRUD + invite |
| Infra | Middleware session refresh; `PublicOnlyChrome` excludes `/app` |
| Tests | Cross-tenant integration tests |
| Dev route | Remove or hard-disable `/dev/growth-hub` after sign-off |

### Does not include

- Services vertical slice (Sprint 2)  
- Reports, opportunities, files, billing modules  

---

## Sprint 2 — Services (production vertical slice)

**Duration:** 3 days  
**Prerequisite:** **G2 passed**  
**Gate:** **G3** — services vertical slice approved

| Work | Details |
|------|---------|
| Database | `*_gh_services.sql` — templates, services, milestones |
| Staff | Create service from template &lt; 2 min |
| Client | Services list + detail; home shows active service + next action |
| Seed | 5 PRD templates |
| Activity | Status change events |
| E2E | Admin → invite → assign service → client view → cross-tenant deny |

**Blocks:** Sprint 3+ production work on reports, opportunities, charts, **files**, and **billing** until G3 passes.

---

## Sprint 3 — Requests

**Duration:** 2–3 days  
**Gate:** G4  
**Blocked until:** G3 pass

---

## Sprint 4 — Reports

**Duration:** 3 days  
**Gate:** G5  
**Blocked until:** G3 pass

---

## Sprint 5 — Opportunities, files, billing

**Duration:** 2–3 days  
**Gate:** G6  
**Blocked until:** G3 pass

---

## Sprint 6 — Hardening and pilot

**Duration:** 3 days  
**Gate:** G7  

---

## Dependency graph

```text
Sprint 0 (docs) → G0
    → Sprint 1A (visual /dev/growth-hub) → G1
        → Sprint 1B (auth + RLS + /app) → G2
            → Sprint 2 (services) → G3
                → Sprint 3 (requests)
                → Sprint 4 (reports)
                → Sprint 5 (opp / files / billing)
                    → Sprint 6 (pilot) → G7
```

Sprint 1A and 1B are **never** parallel.

---

## File creation forecast

| Phase | Paths |
|-------|--------|
| 1A | `app/dev/growth-hub/**`, `components/growth-hub/**`, fixtures in `lib/growth-hub/fixtures/` (types only, no DB) |
| 1B+ | `app/app/**`, `app/admin/growth-hub/**`, `lib/growth-hub/supabase/**`, migrations |

**Changed (1B+):** `middleware.ts`, `PublicOnlyChrome.tsx`, `sidebarConfig.ts`, `package.json`, `.env.example`

---

## Service templates (Sprint 2 seed)

| key | title (fa) |
|-----|------------|
| `fastweb` | FastWeb |
| `website_design` | طراحی سایت |
| `seo` | سئو |
| `site_maintenance` | نگهداری سایت |
| `google_business` | گوگل بیزینس |

---

## Risk mitigations

| Risk | Mitigation |
|------|------------|
| Service role leak | ESLint + review; only after G2 |
| Visual / prod conflation | Strict 1A vs 1B gates |
| Scope creep | G3 blocks reports/opp/files/billing |
| Auth friction | Measure at G3 activation |

See [Growth-Hub-Audit.md](./Growth-Hub-Audit.md).

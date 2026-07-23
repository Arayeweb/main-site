# Growth Hub — Route Map

**Client prefix:** `/app`  
**Staff prefix:** `/admin/growth-hub`  
**MVP:** Marked per route. Do not modify CRM, `/support`, `/ai`, `/adready`, `/fastweb`, or legacy `/dashboard/*` routes.

**Unauthorized behavior (client):** Redirect to `/app/login?next=…` if no session; redirect to `/app/select-workspace` if session but no membership; show **403** page «دسترسی به این فضای کاری ندارید» if wrong slug; never leak other workspace names.

**Unauthorized behavior (staff):** Existing admin middleware → `/admin/login`; insufficient Growth Hub role → «دسترسی ندارید» within admin shell.

---

## Development-only — Sprint 1A visual prototype

### `/dev/growth-hub`

| Field | Value |
|-------|--------|
| **Roles** | None |
| **Auth** | None |
| **Phase** | Sprint 1A only (before G1) |
| **Data** | Typed fixtures only |
| **Production** | Unavailable (`NODE_ENV === 'production'` or explicit dev flag) |
| **Main actions** | View fixture states: loading, populated, partial-data, empty, error |
| **Post-G1** | Remove or disable when Sprint 1B ships |

Components live under `components/growth-hub/`. No `/app/login`, invite, middleware, or Supabase in 1A.

---

## Client — authentication (Sprint 1B+)

### `/app/login`

| Field | Value |
|-------|--------|
| **Roles** | Public (pre-auth) |
| **Auth** | None |
| **MVP** | Sprint 1B |
| **Data loaded** | — |
| **Main actions** | Magic link request; password sign-in |
| **Empty** | N/A |
| **Error** | Invalid credentials; rate limit message |
| **Unauthorized** | N/A |

---

### `/app/invite/[token]`

| Field | Value |
|-------|--------|
| **Roles** | Public + post-auth accept |
| **Auth** | Token valid; then Supabase session to accept |
| **MVP** | Sprint 1B |
| **Data loaded** | Invite metadata (workspace name, role) via server |
| **Main actions** | Accept invite → create membership |
| **Empty** | Invalid/expired token message |
| **Error** | Expired; already accepted |
| **Unauthorized** | Expired token → dedicated page |

---

### `/app/select-workspace`

| Field | Value |
|-------|--------|
| **Roles** | Any authenticated user with ≥0 memberships |
| **Auth** | Supabase session |
| **MVP** | Sprint 1B |
| **Data loaded** | `gh_workspaces` via member join |
| **Main actions** | Pick workspace → navigate to `/app/[slug]/home` |
| **Empty** | «هنوز به هیچ فضای کاری دعوت نشده‌اید» + support contact |
| **Error** | Load failure retry |
| **Unauthorized** | Redirect login |

---

## Client — workspace shell

### `/app/[workspaceSlug]/home`

| Field | Value |
|-------|--------|
| **Roles** | `client_owner`, `client_member`, `araaye_manager` (preview) |
| **Auth** | Session + active membership + slug match |
| **MVP** | Sprint 1B (shell); full home data Sprint 2+ |
| **Data loaded** | Workspace, business status, KPIs (entitled), active services, pending actions, activity, latest report summary, one opportunity, billing summary |
| **Main actions** | Open primary action; navigate to sections |
| **Empty** | Onboarding empty: «خدمت فعالی ثبت نشده» with staff contact hint |
| **Error** | Partial cards fail independently |
| **Unauthorized** | 403 / redirect |

---

### `/app/[workspaceSlug]/services`

| Field | Value |
|-------|--------|
| **Roles** | Client roles |
| **Auth** | Session + membership |
| **MVP** | Sprint 2 (G3 vertical slice) |
| **Data loaded** | `gh_services` list |
| **Main actions** | Open service detail |
| **Empty** | «هنوز خدمتی برای شما ثبت نشده است» |
| **Error** | Retry |
| **Unauthorized** | 403 |

---

### `/app/[workspaceSlug]/services/[serviceId]`

| Field | Value |
|-------|--------|
| **Roles** | Client roles |
| **Auth** | Session + membership + service in workspace |
| **MVP** | Sprint 2 (G3 vertical slice) |
| **Data loaded** | Service, milestones, related files |
| **Main actions** | View next action; open linked request |
| **Empty** | N/A if reachable |
| **Error** | Not found |
| **Unauthorized** | 403 if wrong `serviceId` workspace |

---

### `/app/[workspaceSlug]/requests`

| Field | Value |
|-------|--------|
| **Roles** | Client roles |
| **Auth** | Session + membership |
| **MVP** | Sprint 3 |
| **Data loaded** | Request list |
| **Main actions** | Create request; open detail |
| **Empty** | «درخواستی ثبت نکرده‌اید» + CTA create |
| **Error** | Retry |
| **Unauthorized** | 403 |

---

### `/app/[workspaceSlug]/requests/[requestId]`

| Field | Value |
|-------|--------|
| **Roles** | Client roles |
| **Auth** | Session + membership + request in ws |
| **MVP** | Sprint 3 |
| **Data loaded** | Request, public comments, attachments |
| **Main actions** | Comment; upload |
| **Empty** | — |
| **Error** | Not found |
| **Unauthorized** | 403 |

---

### `/app/[workspaceSlug]/reports`

| Field | Value |
|-------|--------|
| **Roles** | Client roles |
| **Auth** | Session + membership |
| **MVP** | Sprint 4 (blocked until vertical slice) |
| **Data loaded** | Published reports list |
| **Main actions** | Open report |
| **Empty** | «گزارشی منتشر نشده است» |
| **Error** | Retry |
| **Unauthorized** | 403 |

---

### `/app/[workspaceSlug]/reports/[reportId]`

| Field | Value |
|-------|--------|
| **Roles** | Client roles |
| **Auth** | Session + published report only |
| **MVP** | Sprint 4 |
| **Data loaded** | Snapshot + metrics |
| **Main actions** | Acknowledge receipt |
| **Empty** | — |
| **Error** | Draft → not found for client |
| **Unauthorized** | 403 |

---

### `/app/[workspaceSlug]/files`

| Field | Value |
|-------|--------|
| **Roles** | Client roles (visibility rules) |
| **Auth** | Session + membership |
| **MVP** | Sprint 5 |
| **Data loaded** | `gh_files` filtered |
| **Main actions** | Download; upload (allowed categories) |
| **Empty** | «فایلی موجود نیست» |
| **Error** | Upload failure message |
| **Unauthorized** | 403 |

---

### `/app/[workspaceSlug]/billing`

| Field | Value |
|-------|--------|
| **Roles** | Client roles |
| **Auth** | Session + membership |
| **MVP** | Sprint 5 |
| **Data loaded** | `gh_invoices` |
| **Main actions** | View invoice; open payment URL |
| **Empty** | «فاکتوری صادر نشده است» |
| **Error** | Retry |
| **Unauthorized** | 403 |

---

## Staff — Growth Hub admin

All routes: **Auth** = `ary_admin` cookie + admin middleware. **Roles** = `araaye_admin` (admin) or `araaye_manager` where noted.

### `/admin/growth-hub`

| Field | Value |
|-------|--------|
| **MVP** | Sprint 1B (minimal); full widgets Sprint 6 |
| **Data** | Counts: active workspaces, open requests, drafts, overdue invoices |
| **Actions** | Navigate to modules |
| **Empty** | Zero workspaces onboarding CTA |
| **Error** | Dashboard partial failure |
| **Unauthorized** | Admin login redirect |

---

### `/admin/growth-hub/workspaces`

| Field | Value |
|-------|--------|
| **MVP** | Sprint 1B |
| **Data** | Workspace list (scoped for manager) |
| **Actions** | Create; edit; invite; add/remove `araaye_manager` membership (D-022) |
| **Empty** | «اولین فضای کاری را بسازید» |
| **Error** | Form validation |
| **Unauthorized** | Manager sees only assigned |

---

### `/admin/growth-hub/workspaces/[workspaceId]`

| Field | Value |
|-------|--------|
| **MVP** | Sprint 1B |
| **Data** | Workspace detail, members, invites |
| **Actions** | Invite; deactivate member |
| **Empty** | No members |
| **Error** | — |
| **Unauthorized** | Scope check |

---

### `/admin/growth-hub/services`

| Field | Value |
|-------|--------|
| **MVP** | Yes (Sprint 2) |
| **Data** | Templates + instances filter |
| **Actions** | Create instance; update status |
| **Empty** | — |
| **Error** | — |
| **Unauthorized** | Staff |

---

### `/admin/growth-hub/services/[serviceId]`

| Field | Value |
|-------|--------|
| **MVP** | Sprint 2 |
| **Data** | Service + milestones |
| **Actions** | Milestone update; post update |
| **Empty** | — |
| **Error** | — |
| **Unauthorized** | Staff |

---

### `/admin/growth-hub/requests`

| Field | Value |
|-------|--------|
| **MVP** | Sprint 3 |
| **Data** | All requests (filter) |
| **Actions** | Assign; status; priority |
| **Empty** | «درخواست بازی نیست» |
| **Error** | — |
| **Unauthorized** | Staff |

---

### `/admin/growth-hub/reports`

| Field | Value |
|-------|--------|
| **MVP** | Sprint 4 |
| **Data** | Drafts + published |
| **Actions** | Builder; publish |
| **Empty** | — |
| **Error** | — |
| **Unauthorized** | Staff |

---

### `/admin/growth-hub/opportunities`

| Field | Value |
|-------|--------|
| **MVP** | Sprint 5 |
| **Data** | Opportunities |
| **Actions** | Create; publish |
| **Empty** | — |
| **Error** | — |
| **Unauthorized** | Staff |

---

### `/admin/growth-hub/invoices`

| Field | Value |
|-------|--------|
| **MVP** | Sprint 5 |
| **Data** | `gh_invoices` |
| **Actions** | Issue; mark paid; set payment URL |
| **Empty** | — |
| **Error** | — |
| **Unauthorized** | Staff |

---

## API routes (minimal)

Prefer Server Actions in `lib/growth-hub/actions/*`. Documented endpoints only when needed:

| Route | MVP | Purpose |
|-------|-----|---------|
| `POST /api/growth-hub/invites/accept` | Sprint 1 | Token accept (if not pure Server Action) |
| `POST /api/growth-hub/analytics` | Sprint 6 | Product event ingest (optional; may use shared `/api/analytics/event`) |

No other `/api/growth-hub/*` required in Sprint 0 plan.

---

## Navigation (client MVP)

Persian labels in shell:

1. خانه → `home`
2. خدمات → `services`
3. درخواست‌ها → `requests` (Sprint 3+)
4. گزارش‌ها → `reports` (Sprint 4+)
5. فایل‌ها و مالی → `files` + `billing` (Sprint 5+; may be one nav item with sub-routes)

---

## Redirects and aliases

| From | To |
|------|-----|
| `/app` | `/app/select-workspace` or last workspace |
| `/app/[workspaceSlug]` | `/app/[workspaceSlug]/home` |

No changes to existing site redirects in `next.config.js` / `vercel.json`.

# Growth Hub — Page State Matrix

**Status:** Sprint 0  
**Convention:** Each page implements explicit UI for listed states. Default fallbacks are not sufficient for pilot.

---

## Global states (all authenticated workspace pages)

| State | Behavior |
|-------|----------|
| **Loading** | Section-level `LoadingSkeleton`; preserve shell |
| **Unauthorized** | 403 page or redirect login / select-workspace |
| **Error** | `ErrorState` with retry; no tenant leak |

---

## Home — production `/app/[workspaceSlug]/home`

| State | UI |
|-------|-----|
| Loading | Skeleton for status, action, **3–4** KPI slots, services |
| Populated | Full hierarchy per DESIGN-BRIEF; **3–4** KPIs each with label, value, comparison/context, interpretation, source/time |
| Empty | No services/KPI data: meaningful empty states — **no fake KPI values**; status «در حال آماده‌سازی» + contact hint |
| Partial data | **1–2** KPIs only where data exists; omit invalid tiles; other sections may show |
| Error | Card-level errors; shell remains |
| Unauthorized | 403 |
| Waiting for customer | `BusinessStatusPanel` = «منتظر اقدام شما»; `CustomerActionItem` prominent |
| Completed | All services completed: status «همه‌چیز طبق برنامه»; reduce action urgency |
| Expired/overdue | Billing summary shows overdue; status may include «یک مورد نیاز به بررسی دارد» |

---

## Home — visual prototype `/dev/growth-hub` (Sprint 1A only)

Same state semantics as production Home, driven by **typed fixtures** (query param or fixture switcher):

| State | Fixture expectation |
|-------|---------------------|
| Loading | Skeleton demo |
| Populated | 3–4 KPIs with full Persian copy contract |
| Partial data | 1–2 KPIs |
| Empty | KPI block empty state, no fabricated metrics |
| Error | `ErrorState` demo |

No authentication. Route unavailable in production. Removed after G1.

---

## Services list — `/app/[workspaceSlug]/services`

| State | UI |
|-------|-----|
| Loading | List skeleton (3 rows) |
| Populated | `ServiceStatusItem` list |
| Empty | «هنوز خدمتی ثبت نشده» |
| Partial | — |
| Error | `ErrorState` |
| Unauthorized | 403 |
| Waiting for customer | Badge on services in `waiting_on_client` |
| Completed | Show completed section collapsed optional |
| Expired | Renewal date passed — label «نیاز به تمدید» (display only MVP) |

---

## Service detail — `/app/[workspaceSlug]/services/[serviceId]`

| State | UI |
|-------|-----|
| Loading | Header + milestone skeleton |
| Populated | Status, progress, milestones, next action, files |
| Empty milestones | «مراحل به‌زودی ثبت می‌شود» |
| Partial | Some milestones without dates |
| Error | Not found |
| Unauthorized | 403 wrong id |
| Waiting for customer | `waiting_reason` + CTA |
| Completed | Milestones all done; archive tone |
| Expired | Past `due_date` with explanation |

---

## Requests list — `/app/[workspaceSlug]/requests`

| State | UI |
|-------|-----|
| Loading | List skeleton |
| Populated | Filter chips optional MVP; rows with status text |
| Empty | CTA «ثبت درخواست» |
| Partial | — |
| Error | Retry |
| Unauthorized | 403 |
| Waiting for customer | Rows in `waiting_on_client` highlighted |
| Completed | `done`/`closed` in history section |
| Expired | `due_at` passed — «موعد پاسخ گذشته» label |

---

## Request detail — `/app/[workspaceSlug]/requests/[requestId]`

| State | UI |
|-------|-----|
| Loading | Thread skeleton |
| Populated | Title, status, comments, attachments |
| Empty thread | Prompt to add comment |
| Partial | Upload in progress |
| Error | Not found |
| Unauthorized | 403 |
| Waiting for customer | Banner «پاسخ شما نیاز است» |
| Completed | Resolved timestamp; reopen note (staff only MVP) |
| Expired | — |

---

## Reports list — `/app/[workspaceSlug]/reports`

| State | UI |
|-------|-----|
| Loading | Card skeleton |
| Populated | Published reports by date |
| Empty | «گزارشی منتشر نشده» |
| Partial | — |
| Error | Retry |
| Unauthorized | 403 |
| Waiting for customer | Report awaiting acknowledge badge |
| Completed | All acknowledged |
| Expired | — |

---

## Report detail — `/app/[workspaceSlug]/reports/[reportId]`

| State | UI |
|-------|-----|
| Loading | Content skeleton |
| Populated | Snapshot sections + acknowledge button |
| Empty sections | Hide empty KPI block |
| Partial | Manual KPI missing previous — show value only with note |
| Error | Not found (draft) |
| Unauthorized | 403 |
| Waiting for customer | Acknowledge CTA |
| Completed | Acknowledged state + thanks |
| Expired | — |

---

## Files — `/app/[workspaceSlug]/files`

| State | UI |
|-------|-----|
| Loading | Table skeleton |
| Populated | Category filters; download |
| Empty | «فایلی نیست» + upload if allowed |
| Partial | Upload errors per file |
| Error | Retry |
| Unauthorized | 403 |
| Waiting for customer | CTA upload content |
| Completed | — |
| Expired | — |

---

## Billing — `/app/[workspaceSlug]/billing`

| State | UI |
|-------|-----|
| Loading | Row skeleton |
| Populated | Invoice list with status text |
| Empty | «فاکتوری صادر نشده» |
| Partial | — |
| Error | Retry |
| Unauthorized | 403 |
| Waiting for customer | `pending_payment` CTA payment link |
| Completed | All paid |
| Expired/overdue | `overdue` status + due date |

---

## Workspace selector — `/app/select-workspace`

| State | UI |
|-------|-----|
| Loading | Card skeleton |
| Populated | Workspace cards with name + logo |
| Empty | No memberships message |
| Partial | — |
| Error | Retry |
| Unauthorized | Redirect login |
| Waiting for customer | — |
| Completed | Auto-redirect if single workspace (optional Sprint 1) |
| Expired | — |

---

## Invitation acceptance — `/app/invite/[token]`

| State | UI |
|-------|-----|
| Loading | Verifying token |
| Populated | Welcome + workspace name + accept |
| Empty | — |
| Partial | Logged in as different email warning |
| Error | Invalid token |
| Unauthorized | Must login to accept |
| Waiting for customer | — |
| Completed | Redirect to workspace home |
| Expired | «لینک منقضی شده» + contact staff |

---

## Login — `/app/login`

| State | UI |
|-------|-----|
| Loading | Submit loading |
| Populated | Form |
| Empty | — |
| Partial | Magic link sent confirmation |
| Error | Auth error Persian message |
| Unauthorized | — |
| Waiting for customer | Check email inbox |
| Completed | Redirect `next` |
| Expired | Magic link expired message |

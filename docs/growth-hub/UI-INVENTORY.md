# Growth Hub — UI Component Inventory

**Status:** Sprint 0  
**Location:** `components/growth-hub/`  
**Primitives:** `components/growth-hub/ui/` — thin wrappers; may use `@radix-ui/react-dialog` / `dropdown-menu` and `cn()` from [`lib/utils.ts`](../../lib/utils.ts). **No** full shadcn adoption.

---

## Layering

```text
components/growth-hub/
  layout/       PortalShell, PortalSidebar, MobileNavigation, WorkspaceSwitcher
  home/         BusinessStatusPanel, MetricSummary, …
  services/     ServiceStatusItem, …
  shared/       PageHeader, EmptyState, ErrorState, LoadingSkeleton, StatusBadge, DataList, ConfirmDialog
  ui/           Button, Input, Textarea, Label, Dialog, DropdownMenu, Skeleton
  admin/        Staff-only widgets (Sprint 1B+)
  theme/        portal-tokens.css
```

---

## Layout

### `PortalShell`

| | |
|--|--|
| **Responsibility** | Page frame: sidebar/bottom nav slot, header, main content, workspace context |
| **May** | Provide `workspace`, `user`, nav active state |
| **Must not** | Fetch data with service role; import admin layout |
| **Children** | `PortalSidebar`, `MobileNavigation`, `PageHeader` |

### `PortalSidebar`

| | |
|--|--|
| **Responsibility** | Desktop RTL nav (خانه، خدمات، …) |
| **May** | Collapse on narrow desktop |
| **Must not** | CRM links; English labels |

### `MobileNavigation`

| | |
|--|--|
| **Responsibility** | Fixed bottom nav, max 5 items |
| **Must not** | Hide primary CTA behind “more” without label |

### `WorkspaceSwitcher`

| | |
|--|--|
| **Responsibility** | List memberships; switch slug |
| **May** | Link to `/app/select-workspace` |
| **Must not** | Show workspaces user is not member of |

### `PageHeader`

| | |
|--|--|
| **Responsibility** | Title, optional description, one primary action slot |
| **Must not** | Duplicate BusinessStatusPanel |

---

## Home & status

### `BusinessStatusPanel`

| | |
|--|--|
| **Responsibility** | Single overall status message (PRD four states + copy) |
| **Must not** | Multiple competing alerts; color-only status |

### `MetricSummary`

| | |
|--|--|
| **Responsibility** | KPI with label, value, comparison, interpretation, source/time |
| **Must not** | Render without interpretation; sparkline charts in MVP |

### `ServiceStatusItem`

| | |
|--|--|
| **Responsibility** | One line service title + status text + optional progress |
| **Must not** | Full milestone editor |

### `CustomerActionItem`

| | |
|--|--|
| **Responsibility** | Primary pending action CTA |
| **Must not** | Stack more than one primary per page |

### `ActivityItem`

| | |
|--|--|
| **Responsibility** | One activity feed row (icon, text, time) |
| **Must not** | Internal staff notes |

### `ReportSummary`

| | |
|--|--|
| **Responsibility** | Title, period, 1–2 sentence teaser, link to report |
| **Must not** | Full report body |

### `GrowthOpportunity`

| | |
|--|--|
| **Responsibility** | Evidence, problem, recommendation, CTA |
| **Must not** | Show without evidence; pop-up behavior |

### `BillingSummary`

| | |
|--|--|
| **Responsibility** | Next invoice / overdue one-liner + link |
| **Must not** | Payment gateway embed |

---

## Shared

### `EmptyState`

| | |
|--|--|
| **Responsibility** | Persian title, explanation, optional CTA |
| **Must not** | Generic “No data” English |

### `ErrorState`

| | |
|--|--|
| **Responsibility** | Retry action; non-technical message |
| **Must not** | Expose stack traces or other tenant ids |

### `LoadingSkeleton`

| | |
|--|--|
| **Responsibility** | Layout-preserving placeholders |
| **Must not** | Full-page spinner only (use section skeletons) |

### `StatusBadge`

| | |
|--|--|
| **Responsibility** | Status text + subtle color chip |
| **Must not** | Color alone |

### `DataList`

| | |
|--|--|
| **Responsibility** | Accessible list/table for mobile-first rows |
| **Must not** | Admin `DataTable` density |

### `ConfirmDialog`

| | |
|--|--|
| **Responsibility** | Radix dialog; destructive confirm |
| **Must not** | Business logic |

---

## UI primitives (`components/growth-hub/ui/`)

| Component | Responsibility | Must not |
|-----------|----------------|----------|
| `Button` | Primary/secondary/ghost variants | Admin slate styles |
| `Input` | Text, email, password | Fetch |
| `Textarea` | Multiline | — |
| `Label` | Accessible labels | — |
| `Dialog` | Modal shell | Domain copy hardcoded |
| `DropdownMenu` | User menu | — |
| `Skeleton` | Pulse block | — |

---

## Staff admin components (Sprint 1+)

Reuse **patterns** from `components/admin/ui` only under `components/growth-hub/admin/` with Growth Hub data — never import admin StatCard into client `/app`.

---

## Prohibited global imports in client tree

- `components/admin/**`
- `getSupabaseAdmin`
- `app/ai/**` styles

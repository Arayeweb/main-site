# Growth Hub — Client Portal Design Brief

**Status:** Sprint 0  
**Audience:** Design + frontend  
**Scope:** Client routes `/app/*` only. Staff `/admin/growth-hub` uses existing admin patterns but must not dictate client visuals.

---

## 1. Design intent

مرکز رشد آرایه باید برای صاحب کسب‌وکار شبیه **دفتر کار روشن و آرام** باشد، نه پنل فنی داخلی و نه محصول هوش مصنوعی.

| Principle | Direction |
|-----------|-----------|
| Language | Persian-first copy; English only for unavoidable proper nouns |
| Direction | RTL-first; LTR islands for URLs, codes, numbers when needed |
| Tone | Calm, premium B2B, respectful |
| Density | Moderate — one primary focus per viewport section |
| Motion | Subtle; no decorative animation |
| Data | Every number explained in plain Persian |

---

## 2. Visual system (distinct from admin)

**Do not reuse** `AdminLayout` slate grid, dense `StatCard` walls, or AI purple (`#635BFF` / `--ar-*` accent) as primary client chrome.

### Color tokens (CSS variables — implement in `components/growth-hub/theme/portal-tokens.css`)

| Token | Value | Usage |
|-------|-------|--------|
| `--gh-bg` | `#F7F6F3` | Page background (warm neutral) |
| `--gh-surface` | `#FFFFFF` | Cards |
| `--gh-surface-muted` | `#EFEDE8` | Secondary panels |
| `--gh-border` | `#E2DFD6` | Dividers |
| `--gh-text` | `#1C1917` | Primary text (deep neutral) |
| `--gh-text-muted` | `#57534E` | Secondary |
| `--gh-text-subtle` | `#78716C` | Meta, timestamps |
| `--gh-accent` | `#0F766E` | Araaye teal — links, primary button, focus ring |
| `--gh-accent-hover` | `#0D9488` | Hover |
| `--gh-accent-soft` | `#CCFBF1` | Soft highlight backgrounds |
| `--gh-warning` | `#B45309` | Needs attention (with text label) |
| `--gh-danger` | `#B91C1C` | Overdue, errors (with text label) |
| `--gh-success` | `#15803D` | Completed (with text label) |

Teal aligns with existing marketing accents (`teal-600` on site) but portal uses **controlled** accent surface area (&lt;15% of viewport).

### Typography

| Role | Spec |
|------|------|
| Family | Vazirmatn (existing global) |
| Page title | 1.25–1.5rem, weight 700 |
| Section title | 1rem, weight 600 |
| Body | 0.9375rem (15px), line-height 1.7 |
| Meta | 0.8125rem, muted |

### Spacing & radius

| Token | Value |
|-------|-------|
| Card radius | `12px` (`rounded-xl`) — not oversized 24px+ |
| Card padding | 16–20px mobile; 24px desktop |
| Section gap | 24px mobile; 32px desktop |
| Shadow | `0 1px 2px rgba(28,25,23,0.06)` — **no** glow, glass, or heavy elevation |

### Icons

Lucide, 20px default, stroke 1.75; paired with Persian label for status.

---

## 3. Explicit prohibitions

- Generic AI SaaS dashboard (purple/blue gradients, neon, “assistant” chrome)
- Glassmorphism, backdrop blur cards, glow effects
- Excessive shadows (`shadow-2xl`, `shadow-glow`)
- Wall of identical KPI cards (max **4** on home)
- Decorative charts without decision purpose
- Oversized rounded containers (`rounded-3xl` hero cards)
- English UI labels where Persian is natural (“Dashboard”, “Submit”)
- Status **only** by color — always text + icon
- Lorem ipsum, random numbers, placeholder names in pilot UI

---

## 4. Home page hierarchy (approved)

Order top → bottom on mobile and desktop (desktop may use two columns but **priority order** preserved):

1. **وضعیت کلی کسب‌وکار** — `BusinessStatusPanel` (one of PRD states)
2. **اقدام اصلی شما** — single primary `CustomerActionItem`
3. **شاخص‌های کلیدی** — 3–4 `MetricSummary` max
4. **خدمات فعال** — compact list `ServiceStatusItem`
5. **منتظر اقدام شما** — pending customer actions
6. **آخرین فعالیت آرایه** — `ActivityItem` list (short)
7. **خلاصه آخرین گزارش** — `ReportSummary` (if published)
8. **پیشنهاد رشد** — one `GrowthOpportunity` (evidence-based)
9. **وضعیت مالی فشرده** — `BillingSummary` (next due / overdue)

### KPI card contract (`MetricSummary`)

Each KPI **must** include:

| Field | Persian example |
|-------|-----------------|
| Label | «بازدید ماه» |
| Value | `۱۲٬۴۰۰` |
| Comparison / context | «نسبت به ماه قبل: ۸٪+» |
| Interpretation | «بازدید بیشتر شده؛ تماس‌ها تقریباً ثابت مانده‌اند.» |
| Source / updated | «منبع: ورود دستی · به‌روزرسانی: ۱۵ تیر» |

If comparison, interpretation, or source/time is missing, **do not render** the KPI tile.

**Populated Home (production and visual sign-off):** show **3–4** meaningful KPIs meeting the contract above.

**Partial-data Home:** **1–2** KPIs only; do not pad with placeholder metrics.

**No-data Home:** use a meaningful empty state for the KPI block — **no fake values**.

---

## 5. Layout

### Desktop

- Fixed **right** sidebar (RTL): logo, workspace name, nav, user menu
- Content max-width ~ `1120px`
- Sticky section headers optional; no parallax

### Mobile

- Bottom `MobileNavigation` (5 items max)
- Primary action above fold
- Workspace switcher in header

---

## 6. Accessibility

- WCAG AA contrast on text and interactive elements
- Focus visible: 2px `--gh-accent` outline
- Keyboard: nav traps in modals; logical tab order RTL
- Touch targets ≥ 44px
- `aria-live` for async status updates

---

## 7. Sprint 1A — Visual prototype scope

**Phase:** Sprint 1A only (before G1). **Not** Sprint 1B.

### Route

- Temporary: **`/dev/growth-hub`** (and optional subpaths e.g. `/dev/growth-hub?state=empty`)
- **Fixtures only** — no authentication
- **Production:** route must 404 or be blocked by explicit dev check (`NODE_ENV !== 'production'` or dedicated flag)
- **Removed or disabled** after G1 sign-off (before or during Sprint 1B)

**Do not** use `/app/*`, `/app/login`, or invite routes in Sprint 1A.

### Deliverables

- Customer portal visual tokens
- `PortalShell`, desktop sidebar, mobile navigation prototypes
- Customer **Home** with all fixture states: loading, populated (3–4 KPIs), partial-data (1–2 KPIs), empty, error
- Realistic Persian fixture scenarios (see `lib/growth-hub/fixtures/` when implemented)
- Components under `components/growth-hub/` for reuse in 1B

### Exclusions

Supabase Auth, middleware, migrations, RLS, API routes, server mutations, workspace CRUD, invitation flow, admin app, production billing, real analytics.

---

## 8. Visual sign-off requirements (G1)

Review at these viewport sizes:

| Viewport | Size |
|----------|------|
| Desktop large | 1440 × 1000 |
| Desktop | 1024 × 900 |
| Tablet | 768 × 1024 |
| Mobile | 390 × 844 |

**Checklist:**

- [ ] No horizontal overflow
- [ ] Correct RTL alignment
- [ ] Directional icons behave correctly (chevrons, back)
- [ ] Information hierarchy matches §4 (status → action → KPIs → …)
- [ ] Persian content does not break layout (wrapping, numbers)
- [ ] Primary action is obvious
- [ ] Status understandable **without** color alone
- [ ] Mobile navigation usable (touch targets, labels)
- [ ] Page does **not** resemble a generic AI-generated SaaS dashboard

---

## 9. Reference (do not copy visually)

| Area | Path | Note |
|------|------|------|
| Admin dashboard | `components/admin/layout/` | Staff only |
| AI product | `app/ai/tokens.css` | Separate brand |
| AdReady dashboard | `components/adready/dashboard.module.css` | Green accent — not portal |

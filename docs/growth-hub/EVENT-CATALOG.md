# Growth Hub — Product Event Catalog

**Status:** Sprint 0  
**Destination:** `analytics_events` table via server insert; `source = 'growth_hub'`; `metadata` JSON for properties.  
**Global required properties (all events):** `workspace_id`, `user_role`, `source` (`growth_hub`), `timestamp` (ISO), `event_name`

**Forbidden in any event payload:** passwords, magic link tokens, full phone numbers in clear text, payment card data, internal comment bodies, draft report content, other users’ PII.

---

## `workspace_invited`

| Field | Value |
|-------|--------|
| **Trigger** | Staff creates `gh_workspace_invites` row and email sends |
| **Actor** | `araaye_admin` \| `araaye_manager` (staff user id in metadata) |
| **Required properties** | `workspace_id`, `invite_id`, `invited_role`, `channel` (`email` \| `phone`) |
| **Forbidden** | `token`, raw email/phone (use hash or last-4 only if needed) |
| **Question answered** | How many invites sent per workspace? |

---

## `workspace_activated`

| Field | Value |
|-------|--------|
| **Trigger** | First `client_owner` or `client_member` `joined_at` set |
| **Actor** | Invited user |
| **Required properties** | `workspace_id`, `member_role` |
| **Question answered** | Activation rate from invite funnel |

---

## `workspace_opened`

| Field | Value |
|-------|--------|
| **Trigger** | User lands on any `/app/[workspaceSlug]/*` with valid membership (once per session debounced 30m) |
| **Actor** | Client or manager member |
| **Required properties** | `workspace_id`, `path` |
| **Question answered** | Engaged workspaces (North Star input) |

---

## `service_viewed`

| Field | Value |
|-------|--------|
| **Trigger** | Service detail page view |
| **Actor** | Client member |
| **Required properties** | `workspace_id`, `service_id`, `service_status` |
| **Question answered** | Do clients check delivery status? |

---

## `customer_action_viewed`

| Field | Value |
|-------|--------|
| **Trigger** | Primary action panel viewed or expanded |
| **Actor** | Client |
| **Required properties** | `workspace_id`, `action_type`, `entity_type`, `entity_id` |
| **Question answered** | Are pending actions seen? |

---

## `request_created`

| Field | Value |
|-------|--------|
| **Trigger** | Successful `gh_requests` insert by client |
| **Actor** | `client_owner` \| `client_member` |
| **Required properties** | `workspace_id`, `request_id`, `request_type` |
| **Forbidden** | Full description text (use length only) |
| **Question answered** | Request volume vs WhatsApp |

---

## `request_commented`

| Field | Value |
|-------|--------|
| **Trigger** | New public comment |
| **Actor** | Client or staff |
| **Required properties** | `workspace_id`, `request_id`, `is_internal` (must be false for client-fired) |
| **Forbidden** | Comment body |
| **Question answered** | Thread engagement |

---

## `request_resolved`

| Field | Value |
|-------|--------|
| **Trigger** | Status → `done` or `closed` |
| **Actor** | Staff (client event when notified optional) |
| **Required properties** | `workspace_id`, `request_id`, `resolution_status` |
| **Question answered** | Time to resolve |

---

## `report_published`

| Field | Value |
|-------|--------|
| **Trigger** | Report publish action |
| **Actor** | Staff |
| **Required properties** | `workspace_id`, `report_id`, `period_start`, `period_end` |
| **Question answered** | Reporting cadence |

---

## `report_viewed`

| Field | Value |
|-------|--------|
| **Trigger** | Client opens published report |
| **Actor** | Client |
| **Required properties** | `workspace_id`, `report_id` |
| **Question answered** | Report consumption |

---

## `report_acknowledged`

| Field | Value |
|-------|--------|
| **Trigger** | Client confirms receipt |
| **Actor** | Client |
| **Required properties** | `workspace_id`, `report_id` |
| **Question answered** | Explicit receipt rate |

---

## `opportunity_viewed`

| Field | Value |
|-------|--------|
| **Trigger** | Growth card viewed on home or report |
| **Actor** | Client |
| **Required properties** | `workspace_id`, `opportunity_id` |
| **Question answered** | Upsell exposure |

---

## `opportunity_requested`

| Field | Value |
|-------|--------|
| **Trigger** | CTA «دریافت پیشنهاد اجرا» |
| **Actor** | Client |
| **Required properties** | `workspace_id`, `opportunity_id` |
| **Question answered** | Upsell conversion intent |

---

## `invoice_viewed`

| Field | Value |
|-------|--------|
| **Trigger** | Billing detail or list expand |
| **Actor** | Client |
| **Required properties** | `workspace_id`, `invoice_id`, `invoice_status` |
| **Question answered** | Billing awareness |

---

## `payment_link_clicked`

| Field | Value |
|-------|--------|
| **Trigger** | External payment URL click |
| **Actor** | Client |
| **Required properties** | `workspace_id`, `invoice_id` |
| **Forbidden** | Full payment URL with secrets |
| **Question answered** | Payment funnel start |

---

## `file_uploaded`

| Field | Value |
|-------|--------|
| **Trigger** | Successful `gh_files` + storage upload |
| **Actor** | Client or staff |
| **Required properties** | `workspace_id`, `file_id`, `category`, `size_bytes` |
| **Forbidden** | File contents |
| **Question answered** | Content submission via portal |

---

## Implementation notes

- Client events: fire from Server Actions after success (trusted).
- Staff events: same from staff mutations.
- Debounce high-frequency views (`workspace_opened`).
- Align with PRD §21; extend only via ADR in DECISIONS.md.

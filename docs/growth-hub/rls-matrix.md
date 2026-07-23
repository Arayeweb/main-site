# Growth Hub — Row Level Security Matrix

**Status:** Sprint 0  
**Default:** Deny all unless a cell explicitly allows.  
**Roles:** `client_owner`, `client_member`, `araaye_manager`, `araaye_admin`, `anonymous`, `service_role`

**Legend**

- **Y** — Allowed (subject to workspace match)
- **N** — Denied (zero rows / policy false)
- **S** — Staff-only via service role after `assertGrowthHubStaffAccess`
- **O** — Own row only (`user_id` / `created_by`)
- **—** — Operation not applicable

**Cross-workspace denial:** Every policy includes `workspace_id` (directly or via join) matching the member’s active workspace. Tampering `workspace_id` in API body must not grant access; RLS still denies.

**Service role:** Bypasses RLS in Postgres; allowed only for staff mutation paths documented in [DECISIONS.md](./DECISIONS.md) D-007. Treat as **S** in matrix for staff operations, **N** for any client-facing code path.

---

## Helper predicates (implementation)

| Predicate | Meaning |
|-----------|---------|
| `M(ws)` | `gh_is_active_member(ws, null)` |
| `M_owner(ws)` | active member with `client_owner` |
| `M_client(ws)` | active `client_owner` or `client_member` |
| `M_mgr(ws)` | Active `gh_workspace_members` with `role = 'araaye_manager'` for `ws` |
| `A()` | `gh_is_staff_admin()` |
| `Staff(ws)` | `A()` OR `M_mgr(ws)` |

Suspended workspace: all client roles **N** on tenant data; staff may still SELECT for ops.

---

## `gh_profiles`

| Operation | client_owner | client_member | araaye_manager | araaye_admin | anonymous | service_role |
|-----------|--------------|---------------|----------------|--------------|-----------|--------------|
| SELECT | O | O | O + co-members in assigned ws (display name only) | Y | N | S |
| INSERT | O (on signup) | O | N | N | N | S (invite accept bootstrap) |
| UPDATE | O | O | N | S | N | S |
| DELETE | N | N | N | N | N | S (Auth cascade) |

**Column restrictions (server):** Phone visible to owner + staff; not exposed in public APIs.

---

## `gh_workspaces`

| Operation | client_owner | client_member | araaye_manager | araaye_admin | anonymous | service_role |
|-----------|--------------|---------------|----------------|--------------|-----------|--------------|
| SELECT | M_client | M_client | M_mgr | A | N | S |
| INSERT | N | N | N | S | N | S |
| UPDATE | N (name/logo via staff in MVP) | N | S (limited fields) | S | N | S |
| DELETE | N | N | N | S (archive) | N | S |

**Internal-only fields (server mutations):** `crm_client_id`, `support_project_id` — clients never receive in SELECT projection.

---

## `gh_workspace_members`

| Operation | client_owner | client_member | araaye_manager | araaye_admin | anonymous | service_role |
|-----------|--------------|---------------|----------------|--------------|-----------|--------------|
| SELECT | M_client (same ws) | M_client | Staff(ws) | A | N | S |
| INSERT | S (invite client roles only) | N | S | S | N | S |
| UPDATE | S (client roles, not self-demote last owner) | N | S | S | N | S |
| DELETE | N | N | N | S (soft remove) | N | S |

**Column restrictions:** Clients cannot set `role = araaye_manager`.

---

## `gh_workspace_invites`

| Operation | client_owner | client_member | araaye_manager | araaye_admin | anonymous | service_role |
|-----------|--------------|---------------|----------------|--------------|-----------|--------------|
| SELECT | N (use email flow) | N | Staff(ws) | A | N | S |
| INSERT | S | N | S | S | N | S |
| UPDATE | N | N | S (revoke) | S | N | S |
| DELETE | N | N | S | S | N | S |

**Anonymous:** No direct DB access; accept via server validates `token_hash` then S insert membership.

---

## `gh_service_templates`

| Operation | client_owner | client_member | araaye_manager | araaye_admin | anonymous | service_role |
|-----------|--------------|---------------|----------------|--------------|-----------|--------------|
| SELECT | Y (`is_active`) | Y | Y | Y | N | S |
| INSERT | N | N | N | S | N | S |
| UPDATE | N | N | N | S | N | S |
| DELETE | N | N | N | S | N | S |

---

## `gh_services`

| Operation | client_owner | client_member | araaye_manager | araaye_admin | anonymous | service_role |
|-----------|--------------|---------------|----------------|--------------|-----------|--------------|
| SELECT | M_client(ws) | M_client(ws) | Staff(ws) | A | N | S |
| INSERT | N | N | S | S | N | S |
| UPDATE | N | N | S | S | N | S |
| DELETE | N | N | N | S | N | S |

**Internal:** `owner_id` visible to clients as display name only.

---

## `gh_service_milestones`

| Operation | client_owner | client_member | araaye_manager | araaye_admin | anonymous | service_role |
|-----------|--------------|---------------|----------------|--------------|-----------|--------------|
| SELECT | via service ws | via service ws | Staff(ws) | A | N | S |
| INSERT | N | N | S | S | N | S |
| UPDATE | N | N | S | S | N | S |
| DELETE | N | N | S | S | N | S |

---

## `gh_requests`

| Operation | client_owner | client_member | araaye_manager | araaye_admin | anonymous | service_role |
|-----------|--------------|---------------|----------------|--------------|-----------|--------------|
| SELECT | M_client(ws) | M_client(ws) | Staff(ws) | A | N | S |
| INSERT | M_client(ws) | M_client(ws) | S | S | N | S |
| UPDATE | O (limited: add info while new) | O (limited) | S | S | N | S |
| DELETE | N | N | N | S | N | S |

**Server mutations:** `priority`, `assigned_to`, `status` — staff only.

---

## `gh_request_comments`

| Operation | client_owner | client_member | araaye_manager | araaye_admin | anonymous | service_role |
|-----------|--------------|---------------|----------------|--------------|-----------|--------------|
| SELECT | `is_internal=false` | `is_internal=false` | Y | Y | N | S |
| INSERT | M_client + `is_internal=false` | same | Staff + any | Staff | N | S |
| UPDATE | N | N | S | S | N | S |
| DELETE | N | N | S | S | N | S |

**Internal-only field:** `is_internal` — clients cannot SET true.

---

## `gh_reports`

| Operation | client_owner | client_member | araaye_manager | araaye_admin | anonymous | service_role |
|-----------|--------------|---------------|----------------|--------------|-----------|--------------|
| SELECT | `status IN (published, viewed, acknowledged)` | same | Staff(ws) incl. draft | A | N | S |
| INSERT | N | N | S | S | N | S |
| UPDATE | N | N | S (draft only) | S (draft only) | N | S |
| DELETE | N | N | N | S (draft) | N | S |

**Client UPDATE via RPC:** `viewed_at`, `acknowledged_at` only on published rows.

**Immutable:** `published_snapshot` — no UPDATE after publish.

---

## `gh_report_metrics` / `gh_report_actions`

| Operation | client_owner | client_member | araaye_manager | araaye_admin | anonymous | service_role |
|-----------|--------------|---------------|----------------|--------------|-----------|--------------|
| SELECT | if parent report visible | if parent visible | Staff draft+ | A | N | S |
| INSERT | N | N | S (draft parent) | S | N | S |
| UPDATE | N | N | S (draft parent) | S | N | S |
| DELETE | N | N | S (draft) | S | N | S |

After publish, child rows frozen via snapshot; live rows locked by trigger or immutability check.

---

## `gh_opportunities`

| Operation | client_owner | client_member | araaye_manager | araaye_admin | anonymous | service_role |
|-----------|--------------|---------------|----------------|--------------|-----------|--------------|
| SELECT | `status IN (visible, viewed, proposal_requested, …)` not draft | same | Staff(ws) | A | N | S |
| INSERT | N | N | S | S | N | S |
| UPDATE | N | N | S | S | N | S |
| DELETE | N | N | N | S | N | S |

**Client RPC:** transition to `viewed`, `proposal_requested` only.

---

## `gh_files`

| Operation | client_owner | client_member | araaye_manager | araaye_admin | anonymous | service_role |
|-----------|--------------|---------------|----------------|--------------|-----------|--------------|
| SELECT | visibility allows | visibility allows | Staff(ws) | A | N | S |
| INSERT | M_client (client categories) | M_client | S | S | N | S |
| UPDATE | N | N | S | S | N | S |
| DELETE | N | N | S (soft) | S | N | S |

**Visibility:** `staff_only` hidden from clients; `client_owner_only` hidden from `client_member`.

---

## `gh_invoices`

| Operation | client_owner | client_member | araaye_manager | araaye_admin | anonymous | service_role |
|-----------|--------------|---------------|----------------|--------------|-----------|--------------|
| SELECT | M_client(ws) | M_client(ws) | Staff(ws) | A | N | S |
| INSERT | N | N | S | S | N | S |
| UPDATE | N | N | S | S | N | S |
| DELETE | N | N | N | S | N | S |

**Server:** `paid_at`, `status` — staff only.

---

## `gh_activity_events`

| Operation | client_owner | client_member | araaye_manager | araaye_admin | anonymous | service_role |
|-----------|--------------|---------------|----------------|--------------|-----------|--------------|
| SELECT | client-safe `event_type` filter | same | Y | Y | N | S |
| INSERT | N | N | S | S | N | S |
| UPDATE | N | N | N | N | N | S |
| DELETE | N | N | N | N | N | N |

---

## `gh_notifications`

| Operation | client_owner | client_member | araaye_manager | araaye_admin | anonymous | service_role |
|-----------|--------------|---------------|----------------|--------------|-----------|--------------|
| SELECT | O (`user_id`) | O | O | O (own) | N | S |
| INSERT | N | N | S | S | N | S |
| UPDATE | O (`read_at`) | O | O | O | N | S |
| DELETE | N | N | N | S | N | S |

---

## `gh_workspace_entitlements`

| Operation | client_owner | client_member | araaye_manager | araaye_admin | anonymous | service_role |
|-----------|--------------|---------------|----------------|--------------|-----------|--------------|
| SELECT | M_client (enabled only) | M_client | Staff(ws) | A | N | S |
| INSERT | N | N | N | S | N | S |
| UPDATE | N | N | N | S | N | S |
| DELETE | N | N | N | S | N | S |

---

## Storage: bucket `gh-uploads`

| Action | client_owner | client_member | araaye_manager | araaye_admin | anonymous | service_role |
|--------|--------------|---------------|----------------|--------------|-----------|--------------|
| SELECT (download) | object ws ∈ M_client | same | Staff(ws) | A | N | S |
| INSERT (upload) | path prefix = ws | same | S | S | N | S |
| UPDATE | N | N | N | S | N | S |
| DELETE | N | N | S | S | N | S |

**Policy shape:** `(storage.foldername(name))[1] = workspace_id::text` AND membership predicate.

**Cross-workspace:** Upload to another workspace prefix → **N**.

---

## Column-level restrictions (enforced in server mutations)

| Table | Field | Who can write |
|-------|-------|----------------|
| `gh_request_comments` | `is_internal` | Staff only |
| `gh_requests` | `priority`, `assigned_to`, `status` | Staff |
| `gh_services` | `status`, `progress`, `waiting_reason` | Staff |
| `gh_reports` | `published_snapshot`, `published_at` | Staff publish action |
| `gh_invoices` | `paid_at`, `status` | Staff |
| `gh_workspaces` | `crm_client_id`, `support_project_id` | Staff admin/manager |
| `gh_workspace_members` | `role` (e.g. granting `araaye_manager`) | Staff admin; client_owner for client roles only |

---

## Testing requirements (Sprint 1+)

- User A cannot SELECT workspace B by UUID or slug tampering.
- `client_member` cannot read `is_internal` comments.
- `client_member` cannot read draft reports.
- Anonymous cannot list `gh_workspaces`.
- Storage direct URL to other workspace path fails.
- Service role used from portal route (lint / integration test) → fail build or test.

See [ACCEPTANCE-CRITERIA.md](./ACCEPTANCE-CRITERIA.md).

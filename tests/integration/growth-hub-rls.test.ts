import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { generateInviteToken, hashInviteToken } from "@/lib/growth-hub/inviteToken";
import { computeInviteExpiresAt } from "@/lib/growth-hub/inviteExpiry";

// =============================================================================
// Cross-tenant + RLS integration tests for Growth Hub Sprint 1B.
//
// These exercise the REAL database (RLS policies, gh_accept_invite RPC). They
// require a Supabase project with migrations 20260741 + 20260742 applied and
// three env vars. They are SKIPPED when those are absent (e.g. local unit CI),
// and are the executable G2/G3 tenancy spec to run against staging:
//
//   GH_TEST_SUPABASE_URL   = https://<project>.supabase.co
//   GH_TEST_SERVICE_ROLE   = <service-role key>   (seed + admin auth only)
//   GH_TEST_ANON_KEY       = <anon/publishable key>
// =============================================================================

const URL = process.env.GH_TEST_SUPABASE_URL;
const SERVICE = process.env.GH_TEST_SERVICE_ROLE;
const ANON = process.env.GH_TEST_ANON_KEY;
const ENABLED = Boolean(URL && SERVICE && ANON);

const runId = Math.random().toString(36).slice(2, 8);
const slugA = `t-${runId}-a`;
const slugB = `t-${runId}-b`;
const emailA = `gh-a-${runId}@example.test`;
const emailB = `gh-b-${runId}@example.test`;
const password = "Test-Password-123!";

let admin: SupabaseClient;
let wsA = "";
let wsB = "";
let userA = "";
let userB = "";

async function makeUser(email: string): Promise<string> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user!.id;
}

async function signedInClient(email: string): Promise<SupabaseClient> {
  const c = createClient(URL!, ANON!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return c;
}

/** Insert an invite directly (mirrors staff createInviteAction). */
async function seedInvite(opts: {
  workspaceId: string;
  email: string;
  role: "client_owner" | "client_member";
  expiresAt?: string;
  revoked?: boolean;
}): Promise<string> {
  const raw = generateInviteToken();
  const tokenHash = hashInviteToken(raw);
  const { error } = await admin.from("gh_workspace_invites").insert({
    workspace_id: opts.workspaceId,
    email: opts.email,
    role: opts.role,
    token_hash: tokenHash,
    expires_at: opts.expiresAt ?? computeInviteExpiresAt(7),
    revoked_at: opts.revoked ? new Date().toISOString() : null,
  });
  if (error) throw error;
  return tokenHash;
}

describe.skipIf(!ENABLED)("Growth Hub — cross-tenant RLS + invitation flow", () => {
  beforeAll(async () => {
    admin = createClient(URL!, SERVICE!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: ws, error: wsErr } = await admin
      .from("gh_workspaces")
      .insert([
        { name: "Tenant A", slug: slugA },
        { name: "Tenant B", slug: slugB },
      ])
      .select("id, slug");
    if (wsErr) throw wsErr;
    wsA = ws!.find((w) => w.slug === slugA)!.id;
    wsB = ws!.find((w) => w.slug === slugB)!.id;

    userA = await makeUser(emailA);
    userB = await makeUser(emailB);
    await admin.from("gh_profiles").insert([{ id: userA }, { id: userB }]);
  });

  afterAll(async () => {
    if (!ENABLED) return;
    if (wsA) await admin.from("gh_workspaces").delete().eq("id", wsA);
    if (wsB) await admin.from("gh_workspaces").delete().eq("id", wsB);
    if (userA) await admin.auth.admin.deleteUser(userA);
    if (userB) await admin.auth.admin.deleteUser(userB);
  });

  it("accepts a valid invite atomically and grants membership", async () => {
    const hash = await seedInvite({ workspaceId: wsA, email: emailA, role: "client_owner" });
    const a = await signedInClient(emailA);
    const { data, error } = await a.rpc("gh_accept_invite", { p_token_hash: hash });
    expect(error).toBeNull();
    expect(data?.[0]?.workspace_slug).toBe(slugA);
    expect(data?.[0]?.member_role).toBe("client_owner");
  });

  it("makes an accepted invite single-use (reuse rejected)", async () => {
    const hash = await seedInvite({ workspaceId: wsA, email: emailA, role: "client_member" });
    const a = await signedInClient(emailA);
    const first = await a.rpc("gh_accept_invite", { p_token_hash: hash });
    expect(first.error).toBeNull();
    const second = await a.rpc("gh_accept_invite", { p_token_hash: hash });
    expect(second.error).not.toBeNull();
  });

  it("rejects expired invites", async () => {
    const hash = await seedInvite({
      workspaceId: wsA,
      email: emailA,
      role: "client_owner",
      expiresAt: computeInviteExpiresAt(-1),
    });
    const a = await signedInClient(emailA);
    const { error } = await a.rpc("gh_accept_invite", { p_token_hash: hash });
    expect(error).not.toBeNull();
  });

  it("rejects revoked invites", async () => {
    const hash = await seedInvite({
      workspaceId: wsA,
      email: emailA,
      role: "client_owner",
      revoked: true,
    });
    const a = await signedInClient(emailA);
    const { error } = await a.rpc("gh_accept_invite", { p_token_hash: hash });
    expect(error).not.toBeNull();
  });

  it("rejects invites whose email does not match the signed-in user", async () => {
    const hash = await seedInvite({ workspaceId: wsB, email: "someone-else@example.test", role: "client_owner" });
    const a = await signedInClient(emailA);
    const { error } = await a.rpc("gh_accept_invite", { p_token_hash: hash });
    expect(error).not.toBeNull();
  });

  it("rejects invalid tokens without revealing existence", async () => {
    const a = await signedInClient(emailA);
    const { error } = await a.rpc("gh_accept_invite", { p_token_hash: hashInviteToken("does-not-exist") });
    expect(error).not.toBeNull();
  });

  it("isolates tenants: A sees only workspace A, B sees only workspace B", async () => {
    // Ensure both are active members of their own workspace.
    await seedInvite({ workspaceId: wsA, email: emailA, role: "client_owner" }).then((h) =>
      signedInClient(emailA).then((a) => a.rpc("gh_accept_invite", { p_token_hash: h })),
    );
    await seedInvite({ workspaceId: wsB, email: emailB, role: "client_owner" }).then((h) =>
      signedInClient(emailB).then((b) => b.rpc("gh_accept_invite", { p_token_hash: h })),
    );

    const a = await signedInClient(emailA);
    const b = await signedInClient(emailB);

    const aRows = await a.from("gh_workspaces").select("id, slug");
    expect((aRows.data ?? []).map((r) => r.slug)).toEqual([slugA]);

    const bRows = await b.from("gh_workspaces").select("id, slug");
    expect((bRows.data ?? []).map((r) => r.slug)).toEqual([slugB]);

    // Changing the requested workspace_id does not expose the other tenant.
    const aPeekB = await a.from("gh_workspaces").select("id").eq("id", wsB);
    expect(aPeekB.data ?? []).toHaveLength(0);
    const aMembersB = await a.from("gh_workspace_members").select("id").eq("workspace_id", wsB);
    expect(aMembersB.data ?? []).toHaveLength(0);
  });

  it("prevents clients from changing their own role", async () => {
    const a = await signedInClient(emailA);
    const res = await a
      .from("gh_workspace_members")
      .update({ role: "araaye_manager" })
      .eq("workspace_id", wsA)
      .eq("user_id", userA)
      .select("id");
    // No update grant / no policy → error or zero rows affected.
    expect(res.error !== null || (res.data ?? []).length === 0).toBe(true);

    const check = await admin
      .from("gh_workspace_members")
      .select("role")
      .eq("workspace_id", wsA)
      .eq("user_id", userA)
      .single();
    expect(check.data?.role).not.toBe("araaye_manager");
  });

  it("prevents clients from inserting staff memberships", async () => {
    const a = await signedInClient(emailA);
    const res = await a
      .from("gh_workspace_members")
      .insert({ workspace_id: wsB, user_id: userA, role: "araaye_manager", status: "active" })
      .select("id");
    expect(res.error).not.toBeNull();

    const check = await admin
      .from("gh_workspace_members")
      .select("id")
      .eq("workspace_id", wsB)
      .eq("user_id", userA);
    expect(check.data ?? []).toHaveLength(0);
  });

  it("denies anonymous reads of tenant tables", async () => {
    const anon = createClient(URL!, ANON!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const ws = await anon.from("gh_workspaces").select("id");
    expect(ws.data ?? []).toHaveLength(0);
    const members = await anon.from("gh_workspace_members").select("id");
    expect(members.data ?? []).toHaveLength(0);
    const invites = await anon.from("gh_workspace_invites").select("id");
    expect(invites.data ?? []).toHaveLength(0);
  });

  it("revokes access when a membership is deactivated", async () => {
    // A is an active member of wsA from earlier tests.
    await admin
      .from("gh_workspace_members")
      .update({ status: "removed" })
      .eq("workspace_id", wsA)
      .eq("user_id", userA);

    const a = await signedInClient(emailA);
    const rows = await a.from("gh_workspaces").select("id").eq("id", wsA);
    expect(rows.data ?? []).toHaveLength(0);

    // Restore for any later ordering-independent assertions.
    await admin
      .from("gh_workspace_members")
      .update({ status: "active" })
      .eq("workspace_id", wsA)
      .eq("user_id", userA);
  });
});

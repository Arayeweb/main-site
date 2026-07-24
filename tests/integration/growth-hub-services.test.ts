import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { generateInviteToken, hashInviteToken } from "@/lib/growth-hub/inviteToken";
import { computeInviteExpiresAt } from "@/lib/growth-hub/inviteExpiry";
import { calculateServiceProgress } from "@/lib/growth-hub/services/progress";
import {
  createAdminClient,
  createAnonClient,
  createConfirmedUser,
  signedInClient as liveSignIn,
} from "../helpers/growthHubLive";

// Live staging tests for Sprint 2 services + G3 vertical slice.
// Requires GH_TEST_SUPABASE_URL, GH_TEST_SERVICE_ROLE, GH_TEST_ANON_KEY.
// Must not be skipped for G3 sign-off.

const URL = process.env.GH_TEST_SUPABASE_URL;
const SERVICE = process.env.GH_TEST_SERVICE_ROLE;
const ANON = process.env.GH_TEST_ANON_KEY;
const ENABLED = Boolean(URL && SERVICE && ANON);

const runId = Math.random().toString(36).slice(2, 8);
const slugA = `s2-${runId}-a`;
const slugB = `s2-${runId}-b`;
const emailA = `s2-a-${runId}@example.test`;
const emailB = `s2-b-${runId}@example.test`;
const password = "Test-Password-123!";

let admin: SupabaseClient;
let wsA = "";
let wsB = "";
let userA = "";
let userB = "";
let templateId = "";
let serviceA = "";
let milestoneA = "";

async function makeUser(email: string): Promise<string> {
  return createConfirmedUser(admin, email, password);
}

async function signedInClient(email: string): Promise<SupabaseClient> {
  return liveSignIn(URL!, ANON!, email, password);
}

async function acceptInvite(email: string, workspaceId: string) {
  const raw = generateInviteToken();
  const hash = hashInviteToken(raw);
  const { error } = await admin.from("gh_workspace_invites").insert({
    workspace_id: workspaceId,
    email,
    role: "client_owner",
    token_hash: hash,
    expires_at: computeInviteExpiresAt(7),
  });
  if (error) throw error;
  const client = await signedInClient(email);
  const res = await client.rpc("gh_accept_invite", { p_token_hash: hash });
  if (res.error) throw res.error;
}

describe.skipIf(!ENABLED)("Growth Hub Sprint 2 — services RLS + vertical slice", () => {
  beforeAll(async () => {
    admin = createAdminClient(URL!, SERVICE!);

    const { data: templates, error: tErr } = await admin
      .from("gh_service_templates")
      .select("id, key")
      .eq("key", "fastweb")
      .maybeSingle();
    if (tErr || !templates) {
      throw new Error(
        "gh_service_templates seed missing — apply 20260745_gh_services.sql first",
      );
    }
    templateId = templates.id;

    const { data: ws, error: wsErr } = await admin
      .from("gh_workspaces")
      .insert([
        { name: "S2 Tenant A", slug: slugA },
        { name: "S2 Tenant B", slug: slugB },
      ])
      .select("id, slug");
    if (wsErr) throw wsErr;
    wsA = ws!.find((w) => w.slug === slugA)!.id;
    wsB = ws!.find((w) => w.slug === slugB)!.id;

    userA = await makeUser(emailA);
    userB = await makeUser(emailB);
    await admin.from("gh_profiles").insert([{ id: userA }, { id: userB }]);
    await acceptInvite(emailA, wsA);
    await acceptInvite(emailB, wsB);
  }, 90000);

  afterAll(async () => {
    if (!ENABLED) return;
    if (wsA) await admin.from("gh_workspaces").delete().eq("id", wsA);
    if (wsB) await admin.from("gh_workspaces").delete().eq("id", wsB);
    if (userA) await admin.auth.admin.deleteUser(userA);
    if (userB) await admin.auth.admin.deleteUser(userB);
  });

  it("creates a service from template atomically with milestones", async () => {
    const { data: serviceId, error } = await admin.rpc(
      "gh_create_service_from_template",
      {
        p_workspace_id: wsA,
        p_template_id: templateId,
        p_title: "FastWeb فروشگاه",
        p_start_date: "2026-07-01",
        p_due_date: "2026-08-01",
        p_actor_label: "staff-test",
      },
    );
    expect(error).toBeNull();
    expect(serviceId).toBeTruthy();
    serviceA = String(serviceId);

    const { data: milestones } = await admin
      .from("gh_service_milestones")
      .select("id, title, sort_order, status, workspace_id")
      .eq("service_id", serviceA)
      .order("sort_order");
    expect((milestones ?? []).length).toBeGreaterThanOrEqual(5);
    expect(milestones![0].workspace_id).toBe(wsA);
    milestoneA = milestones![0].id;

    const { data: activity } = await admin
      .from("gh_activity_events")
      .select("event_type")
      .eq("entity_id", serviceA)
      .eq("event_type", "service_created");
    expect((activity ?? []).length).toBeGreaterThanOrEqual(1);
  });

  it("rejects inactive / missing template and bad workspace", async () => {
    const missing = await admin.rpc("gh_create_service_from_template", {
      p_workspace_id: wsA,
      p_template_id: "00000000-0000-4000-8000-000000000099",
      p_title: "X",
    });
    expect(missing.error).not.toBeNull();

    const badWs = await admin.rpc("gh_create_service_from_template", {
      p_workspace_id: "00000000-0000-4000-8000-000000000088",
      p_template_id: templateId,
      p_title: "X",
    });
    expect(badWs.error).not.toBeNull();
  });

  it("updates status to waiting_on_client with reason + next action", async () => {
    const { data, error } = await admin
      .from("gh_services")
      .update({
        status: "waiting_on_client",
        waiting_reason: "منتظر لوگو",
        next_action: "ارسال فایل لوگو",
        latest_update: "در انتظار محتوای مشتری",
      })
      .eq("id", serviceA)
      .select("status, waiting_reason, next_action")
      .single();
    expect(error).toBeNull();
    expect(data?.status).toBe("waiting_on_client");
  });

  it("completes a milestone and recalculates progress", async () => {
    const { error } = await admin
      .from("gh_service_milestones")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", milestoneA)
      .eq("service_id", serviceA);
    expect(error).toBeNull();

    const { data: progress } = await admin.rpc("gh_recalc_service_progress", {
      p_service_id: serviceA,
    });
    const { data: after } = await admin
      .from("gh_service_milestones")
      .select("status")
      .eq("service_id", serviceA);
    expect(Number(progress)).toBe(calculateServiceProgress(after ?? []));

    const { data: svc } = await admin
      .from("gh_services")
      .select("progress")
      .eq("id", serviceA)
      .single();
    expect(svc?.progress).toBe(Number(progress));
  });

  it("isolates services across tenants", async () => {
    const a = await signedInClient(emailA);
    const b = await signedInClient(emailB);

    const aRows = await a.from("gh_services").select("id, workspace_id");
    expect((aRows.data ?? []).every((r) => r.workspace_id === wsA)).toBe(true);
    expect((aRows.data ?? []).some((r) => r.id === serviceA)).toBe(true);

    const bPeek = await b.from("gh_services").select("id").eq("id", serviceA);
    expect(bPeek.data ?? []).toHaveLength(0);

    const aTamper = await a
      .from("gh_services")
      .select("id")
      .eq("workspace_id", wsB);
    expect(aTamper.data ?? []).toHaveLength(0);

    const aMs = await a
      .from("gh_service_milestones")
      .select("id")
      .eq("id", milestoneA);
    expect((aMs.data ?? []).length).toBe(1);

    const bMs = await b
      .from("gh_service_milestones")
      .select("id")
      .eq("id", milestoneA);
    expect(bMs.data ?? []).toHaveLength(0);
  });

  it("denies client writes and anonymous reads", async () => {
    const a = await signedInClient(emailA);
    const upd = await a
      .from("gh_services")
      .update({ status: "completed", progress: 100, next_action: null })
      .eq("id", serviceA)
      .select("id");
    expect(upd.error !== null || (upd.data ?? []).length === 0).toBe(true);

    const msUpd = await a
      .from("gh_service_milestones")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", milestoneA)
      .select("id");
    expect(msUpd.error !== null || (msUpd.data ?? []).length === 0).toBe(true);

    const ins = await a.from("gh_services").insert({
      workspace_id: wsA,
      title: "hack",
      status: "active",
    });
    expect(ins.error).not.toBeNull();

    const anon = createAnonClient(URL!, ANON!);
    const anonSvc = await anon.from("gh_services").select("id");
    expect(anonSvc.data ?? []).toHaveLength(0);
    const anonMs = await anon.from("gh_service_milestones").select("id");
    expect(anonMs.data ?? []).toHaveLength(0);
  });

  it("revokes service visibility when membership is deactivated", async () => {
    await admin
      .from("gh_workspace_members")
      .update({ status: "removed" })
      .eq("workspace_id", wsA)
      .eq("user_id", userA);

    const a = await signedInClient(emailA);
    const rows = await a.from("gh_services").select("id").eq("id", serviceA);
    expect(rows.data ?? []).toHaveLength(0);

    await admin
      .from("gh_workspace_members")
      .update({ status: "active" })
      .eq("workspace_id", wsA)
      .eq("user_id", userA);
  });

  it("G3 vertical slice: client sees waiting service after staff assign", async () => {
    // Staff already created + set waiting; client A reads it.
    const a = await signedInClient(emailA);
    const { data } = await a
      .from("gh_services")
      .select("id, title, status, progress, next_action, waiting_reason")
      .eq("id", serviceA)
      .single();
    expect(data?.status).toBe("waiting_on_client");
    expect(data?.next_action).toBeTruthy();
    expect(data?.waiting_reason).toBeTruthy();

    const b = await signedInClient(emailB);
    const denied = await b.from("gh_services").select("id").eq("id", serviceA);
    expect(denied.data ?? []).toHaveLength(0);
  });
});

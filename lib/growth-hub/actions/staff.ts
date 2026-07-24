"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  assertGrowthHubStaffAccess,
  GrowthHubStaffAuthError,
} from "@/lib/growth-hub/staffAuth";
import {
  createWorkspaceSchema,
  createInviteSchema,
  memberActionSchema,
} from "@/lib/growth-hub/validation";
import { generateInviteToken, hashInviteToken } from "@/lib/growth-hub/inviteToken";
import { computeInviteExpiresAt } from "@/lib/growth-hub/inviteExpiry";
import { trackGrowthHubEvent } from "@/lib/growth-hub/analytics";
import { GROWTH_HUB_EVENTS } from "@/lib/growth-hub/constants";
import { resolvePublicOrigin } from "@/lib/siteUrl";
import { normalizePhoneE164, phoneE164ToLocal } from "@/lib/growth-hub/phone";
import { sendKavenegarSms } from "@/lib/kavenegar";

export type StaffActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

// Staff authenticate via the admin cookie (not Supabase Auth) and have no
// gh_profiles row, so audit actor_id / created_by stay null and the acting
// staff id is recorded in gh_activity_events.metadata.staff_user_id.

export async function createWorkspaceAction(
  input: unknown,
): Promise<StaffActionResult<{ workspaceId: string; slug: string }>> {
  let access;
  try {
    access = assertGrowthHubStaffAccess();
  } catch (error) {
    if (error instanceof GrowthHubStaffAuthError) return fail(error.message);
    throw error;
  }
  const { service, staff } = access;

  const parsed = createWorkspaceSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ورودی نامعتبر است.");
  }
  const { name, slug, industry, website_url } = parsed.data;

  const { data: existing } = await service
    .from("gh_workspaces")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return fail("این نشانی فضای کاری قبلاً استفاده شده است.");

  const { data: ws, error } = await service
    .from("gh_workspaces")
    .insert({ name, slug, industry: industry ?? null, website_url: website_url ?? null })
    .select("id, slug")
    .single();

  if (error || !ws) {
    console.error("[gh/staff] createWorkspace", error?.message);
    return fail("ساخت فضای کاری ناموفق بود.");
  }

  await service.from("gh_activity_events").insert({
    workspace_id: ws.id,
    actor_id: null,
    entity_type: "workspace",
    entity_id: ws.id,
    event_type: "workspace_created",
    metadata: { name, staff_user_id: staff.userId },
  });

  revalidatePath("/admin/growth-hub/workspaces");
  return { ok: true, data: { workspaceId: ws.id, slug: ws.slug } };
}

export async function createInviteAction(
  input: unknown,
): Promise<
  StaffActionResult<{ inviteId: string; inviteUrl: string; phoneMasked: string }>
> {
  let access;
  try {
    access = assertGrowthHubStaffAccess();
  } catch (error) {
    if (error instanceof GrowthHubStaffAuthError) return fail(error.message);
    throw error;
  }
  const { service, staff } = access;

  const parsed = createInviteSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ورودی نامعتبر است.");
  }
  const { workspace_id, phone, role, expiry_days } = parsed.data;
  const phoneE164 = normalizePhoneE164(phone);
  if (!phoneE164) return fail("شماره موبایل نامعتبر است.");

  const { data: ws } = await service
    .from("gh_workspaces")
    .select("id, name")
    .eq("id", workspace_id)
    .maybeSingle();
  if (!ws) return fail("فضای کاری یافت نشد.");

  const rawToken = generateInviteToken();
  const tokenHash = hashInviteToken(rawToken);
  const expiresAt = computeInviteExpiresAt(expiry_days);

  const { data: invite, error } = await service
    .from("gh_workspace_invites")
    .insert({
      workspace_id,
      email: null,
      phone: phoneE164ToLocal(phoneE164),
      invited_phone_e164: phoneE164,
      role,
      token_hash: tokenHash,
      expires_at: expiresAt,
      created_by: null,
    })
    .select("id")
    .single();

  if (error || !invite) {
    console.error("[gh/staff] createInvite", error?.message);
    return fail("ساخت دعوت ناموفق بود.");
  }

  const inviteUrl = `${resolvePublicOrigin()}/app/invite/${rawToken}`;
  const phoneMasked = `${phoneE164ToLocal(phoneE164).slice(0, 4)}•••${phoneE164ToLocal(phoneE164).slice(-4)}`;

  await service.from("gh_activity_events").insert({
    workspace_id,
    actor_id: null,
    entity_type: "invite",
    entity_id: invite.id,
    event_type: "invitation_created",
    metadata: {
      role,
      staff_user_id: staff.userId,
      channel: "phone",
      phone_last4: phoneE164.slice(-4),
    },
  });

  await trackGrowthHubEvent({
    event: GROWTH_HUB_EVENTS.workspaceInvited,
    workspaceId: workspace_id,
    userRole: "staff",
    properties: {
      invite_id: invite.id,
      invited_role: role,
      channel: "phone",
    },
  });

  revalidatePath(`/admin/growth-hub/workspaces/${workspace_id}`);
  return {
    ok: true,
    data: { inviteId: invite.id, inviteUrl, phoneMasked },
  };
}

/** Resend invite link SMS for an existing pending invite (no raw token reissue). */
export async function sendInviteSmsAction(
  input: unknown,
): Promise<StaffActionResult<{ sent: boolean }>> {
  let access;
  try {
    access = assertGrowthHubStaffAccess();
  } catch (error) {
    if (error instanceof GrowthHubStaffAuthError) return fail(error.message);
    throw error;
  }
  const { service } = access;

  const parsed = z
    .object({
      workspace_id: z.string().uuid(),
      invite_id: z.string().uuid(),
      invite_url: z.string().url().optional(),
    })
    .safeParse(input);
  if (!parsed.success) return fail("ورودی نامعتبر است.");

  const { data: invite } = await service
    .from("gh_workspace_invites")
    .select("id, invited_phone_e164, accepted_at, revoked_at, expires_at, workspace_id")
    .eq("id", parsed.data.invite_id)
    .eq("workspace_id", parsed.data.workspace_id)
    .maybeSingle();

  if (!invite?.invited_phone_e164) return fail("دعوت پیدا نشد.");
  if (invite.accepted_at || invite.revoked_at) return fail("این دعوت قابل ارسال نیست.");
  if (new Date(invite.expires_at).getTime() <= Date.now()) {
    return fail("این دعوت منقضی شده است.");
  }

  const { data: ws } = await service
    .from("gh_workspaces")
    .select("name")
    .eq("id", invite.workspace_id)
    .maybeSingle();

  // SMS body must not be logged. Link is only sent if staff just created it
  // and still has invite_url in the browser — we do not store raw tokens.
  if (!parsed.data.invite_url) {
    return fail("لینک دعوت فقط هنگام ساخت در دسترس است. دعوت تازه بسازید.");
  }
  if (!parsed.data.invite_url.includes("/app/invite/")) {
    return fail("لینک دعوت نامعتبر است.");
  }

  const message = `دعوت مرکز رشد آرایه برای «${ws?.name ?? "فضای کاری"}»:\n${parsed.data.invite_url}\nاین لینک یک‌بارمصرف است.`;
  const sms = await sendKavenegarSms({
    receptor: phoneE164ToLocal(invite.invited_phone_e164),
    message,
  });
  if (!sms.ok) {
    console.error("[gh/staff] invite sms", sms.error);
    return fail("ارسال پیامک ناموفق بود.");
  }

  return { ok: true, data: { sent: true } };
}

export async function revokeInviteAction(
  input: unknown,
): Promise<StaffActionResult> {
  let access;
  try {
    access = assertGrowthHubStaffAccess();
  } catch (error) {
    if (error instanceof GrowthHubStaffAuthError) return fail(error.message);
    throw error;
  }
  const { service, staff } = access;

  const parsed = memberActionSchema.safeParse({
    workspace_id: (input as { workspace_id?: string })?.workspace_id,
    member_id: (input as { invite_id?: string })?.invite_id,
  });
  if (!parsed.success) return fail("ورودی نامعتبر است.");
  const { workspace_id, member_id: invite_id } = parsed.data;

  const { error } = await service
    .from("gh_workspace_invites")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", invite_id)
    .eq("workspace_id", workspace_id)
    .is("accepted_at", null);

  if (error) {
    console.error("[gh/staff] revokeInvite", error.message);
    return fail("لغو دعوت ناموفق بود.");
  }

  await service.from("gh_activity_events").insert({
    workspace_id,
    actor_id: null,
    entity_type: "invite",
    entity_id: invite_id,
    event_type: "invitation_revoked",
    metadata: { staff_user_id: staff.userId },
  });

  revalidatePath(`/admin/growth-hub/workspaces/${workspace_id}`);
  return { ok: true, data: undefined };
}

export async function deactivateMemberAction(
  input: unknown,
): Promise<StaffActionResult> {
  let access;
  try {
    access = assertGrowthHubStaffAccess();
  } catch (error) {
    if (error instanceof GrowthHubStaffAuthError) return fail(error.message);
    throw error;
  }
  const { service, staff } = access;

  const parsed = memberActionSchema.safeParse(input);
  if (!parsed.success) return fail("ورودی نامعتبر است.");
  const { workspace_id, member_id } = parsed.data;

  const { data: member } = await service
    .from("gh_workspace_members")
    .select("id, role")
    .eq("id", member_id)
    .eq("workspace_id", workspace_id)
    .maybeSingle();
  if (!member) return fail("عضو یافت نشد.");

  // Do not remove the last active owner.
  if (member.role === "client_owner") {
    const { count } = await service
      .from("gh_workspace_members")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspace_id)
      .eq("role", "client_owner")
      .eq("status", "active");
    if ((count ?? 0) <= 1) {
      return fail("نمی‌توان تنها مالک فعال فضای کاری را غیرفعال کرد.");
    }
  }

  const { error } = await service
    .from("gh_workspace_members")
    .update({ status: "removed" })
    .eq("id", member_id)
    .eq("workspace_id", workspace_id);

  if (error) {
    console.error("[gh/staff] deactivateMember", error.message);
    return fail("غیرفعال‌سازی عضو ناموفق بود.");
  }

  await service.from("gh_activity_events").insert({
    workspace_id,
    actor_id: null,
    entity_type: "membership",
    entity_id: member_id,
    event_type: "membership_deactivated",
    metadata: { staff_user_id: staff.userId },
  });

  revalidatePath(`/admin/growth-hub/workspaces/${workspace_id}`);
  return { ok: true, data: undefined };
}

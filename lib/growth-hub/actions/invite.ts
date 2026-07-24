"use server";

import { getGrowthHubServerClient } from "@/lib/growth-hub/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { hashInviteToken } from "@/lib/growth-hub/inviteToken";
import { acceptInviteSchema } from "@/lib/growth-hub/validation";
import { trackGrowthHubEvent } from "@/lib/growth-hub/analytics";
import { GROWTH_HUB_EVENTS } from "@/lib/growth-hub/constants";
import type { GrowthHubMemberRole } from "@/lib/growth-hub/database.types";
import {
  ensurePhoneAuthUser,
  sendGrowthHubPhoneOtp,
  verifyGrowthHubPhoneOtp,
} from "@/lib/growth-hub/phoneOtp";
import { z } from "zod";

export type AcceptInviteResult =
  | { ok: true; slug: string }
  | { ok: false; error: string; needsAuth?: boolean; retryAfterSec?: number };

function messageForError(raw: string): string {
  if (raw.includes("gh_invite_not_authenticated")) {
    return "برای پذیرش دعوت ابتدا وارد شوید.";
  }
  if (raw.includes("gh_invite_expired")) return "این دعوت منقضی شده است.";
  if (raw.includes("gh_invite_revoked")) return "این دعوت لغو شده است.";
  if (raw.includes("gh_invite_used")) return "این دعوت قبلاً استفاده شده است.";
  if (raw.includes("gh_invite_phone_mismatch")) {
    return "این دعوت برای شماره دیگری صادر شده است.";
  }
  if (raw.includes("gh_invite_email_mismatch")) {
    return "این دعوت برای حساب دیگری صادر شده است.";
  }
  if (raw.includes("gh_invite_invalid")) return "این دعوت معتبر نیست.";
  return "پذیرش دعوت ناموفق بود.";
}

type InviteRow = {
  id: string;
  invited_phone_e164: string | null;
  email: string | null;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
};

async function loadValidInviteByTokenHash(
  tokenHash: string,
): Promise<InviteRow | null> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("gh_workspace_invites")
    .select("id, invited_phone_e164, email, expires_at, accepted_at, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (!data) return null;
  if (data.revoked_at || data.accepted_at) return null;
  if (new Date(data.expires_at).getTime() <= Date.now()) return null;
  return data as InviteRow;
}

async function finishAccept(tokenHash: string): Promise<AcceptInviteResult> {
  const supabase = getGrowthHubServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      error: "ورود انجام نشد. لطفاً دوباره تلاش کنید.",
      needsAuth: true,
    };
  }

  const { data, error } = await supabase.rpc("gh_accept_invite", {
    p_token_hash: tokenHash,
  });

  if (error) {
    return { ok: false, error: messageForError(error.message) };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return { ok: false, error: "این دعوت معتبر نیست." };
  }

  await trackGrowthHubEvent({
    event: GROWTH_HUB_EVENTS.workspaceActivated,
    workspaceId: row.accepted_workspace_id,
    userRole: row.accepted_member_role as GrowthHubMemberRole,
    properties: { member_role: row.accepted_member_role, channel: "phone" },
  });

  return { ok: true, slug: row.accepted_workspace_slug };
}

/** Accept for an already-authenticated session (rare on phone-first flow). */
export async function acceptInviteAction(
  input: unknown,
): Promise<AcceptInviteResult> {
  const parsed = acceptInviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "توکن دعوت نامعتبر است." };
  }
  return finishAccept(hashInviteToken(parsed.data.token));
}

/**
 * Sends OTP only to the phone bound on the invite.
 * Client never chooses the phone number.
 */
export async function sendInviteOtpAction(
  input: unknown,
): Promise<AcceptInviteResult & { cooldownSec?: number }> {
  const parsed = acceptInviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "توکن دعوت نامعتبر است." };
  }

  const tokenHash = hashInviteToken(parsed.data.token);
  const invite = await loadValidInviteByTokenHash(tokenHash);
  if (!invite?.invited_phone_e164) {
    return { ok: false, error: "این دعوت معتبر نیست یا شماره ندارد." };
  }

  const sent = await sendGrowthHubPhoneOtp({
    phoneE164: invite.invited_phone_e164,
    purpose: "invite_accept",
    inviteId: invite.id,
  });

  if (!sent.ok) {
    return {
      ok: false,
      error: sent.error,
      retryAfterSec: sent.retryAfterSec,
    };
  }

  return { ok: true, slug: "", cooldownSec: sent.cooldownSec };
}

const verifyInviteSchema = z.object({
  token: acceptInviteSchema.shape.token,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "کد تأیید باید ۶ رقم باشد."),
});

/**
 * Verify OTP for the invite-bound phone, establish Auth session, accept invite.
 * OTP phone is never taken from the client — only from the invite row.
 */
export async function verifyInviteOtpAndAcceptAction(
  input: unknown,
): Promise<AcceptInviteResult> {
  const parsed = verifyInviteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است.",
    };
  }

  const tokenHash = hashInviteToken(parsed.data.token);
  const invite = await loadValidInviteByTokenHash(tokenHash);
  if (!invite?.invited_phone_e164) {
    return { ok: false, error: "این دعوت معتبر نیست یا شماره ندارد." };
  }

  const verified = await verifyGrowthHubPhoneOtp({
    phoneE164: invite.invited_phone_e164,
    purpose: "invite_accept",
    code: parsed.data.code,
    inviteId: invite.id,
  });
  if (!verified.ok) return verified;

  const authUser = await ensurePhoneAuthUser(invite.invited_phone_e164);
  if (!authUser.ok) return authUser;

  const supabase = getGrowthHubServerClient();
  const { error: signErr } = await supabase.auth.signInWithPassword({
    email: authUser.email,
    password: authUser.password,
  });
  if (signErr) {
    console.error("[gh/invite] signIn", signErr.message);
    return { ok: false, error: "ورود پس از تأیید ناموفق بود." };
  }

  return finishAccept(tokenHash);
}

/** Non-sensitive invite preview for the landing page. */
export async function peekInviteAction(token: string): Promise<
  | {
      ok: true;
      workspaceName: string;
      role: GrowthHubMemberRole;
      phoneMasked: string | null;
    }
  | { ok: false }
> {
  const parsed = acceptInviteSchema.safeParse({ token });
  if (!parsed.success) return { ok: false };

  const supabase = getGrowthHubServerClient();
  const tokenHash = hashInviteToken(parsed.data.token);
  const { data, error } = await supabase.rpc("gh_peek_invite", {
    p_token_hash: tokenHash,
  });
  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row) return { ok: false };

  return {
    ok: true,
    workspaceName: row.workspace_name,
    role: row.member_role as GrowthHubMemberRole,
    phoneMasked: row.phone_masked ?? null,
  };
}

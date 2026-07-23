"use server";

import { getGrowthHubServerClient } from "@/lib/growth-hub/supabase/server";
import { hashInviteToken } from "@/lib/growth-hub/inviteToken";
import { acceptInviteSchema } from "@/lib/growth-hub/validation";
import { trackGrowthHubEvent } from "@/lib/growth-hub/analytics";
import { GROWTH_HUB_EVENTS } from "@/lib/growth-hub/constants";
import type { GrowthHubMemberRole } from "@/lib/growth-hub/database.types";

export type AcceptInviteResult =
  | { ok: true; slug: string }
  | { ok: false; error: string; needsAuth?: boolean };

// Maps the SECURITY DEFINER function's safe error codes to Persian messages.
// We deliberately do not distinguish "email mismatch" details to the user.
function messageForError(raw: string): string {
  if (raw.includes("gh_invite_not_authenticated")) {
    return "برای پذیرش دعوت ابتدا وارد شوید.";
  }
  if (raw.includes("gh_invite_expired")) return "این دعوت منقضی شده است.";
  if (raw.includes("gh_invite_revoked")) return "این دعوت لغو شده است.";
  if (raw.includes("gh_invite_used")) return "این دعوت قبلاً استفاده شده است.";
  if (raw.includes("gh_invite_email_mismatch")) {
    return "این دعوت برای حساب دیگری صادر شده است.";
  }
  if (raw.includes("gh_invite_invalid")) return "این دعوت معتبر نیست.";
  return "پذیرش دعوت ناموفق بود.";
}

/**
 * Accepts an invitation for the currently authenticated user. Runs entirely
 * through the user-scoped client and the atomic gh_accept_invite RPC — no
 * service role. The raw token never leaves this server action except as a hash.
 */
export async function acceptInviteAction(
  input: unknown,
): Promise<AcceptInviteResult> {
  const parsed = acceptInviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "توکن دعوت نامعتبر است." };
  }

  const supabase = getGrowthHubServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "برای پذیرش دعوت ابتدا وارد شوید.", needsAuth: true };
  }

  const tokenHash = hashInviteToken(parsed.data.token);
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
    workspaceId: row.workspace_id,
    userRole: row.member_role as GrowthHubMemberRole,
    properties: { member_role: row.member_role },
  });

  return { ok: true, slug: row.workspace_slug };
}

/** Non-sensitive invite preview (workspace name + role) for the landing page. */
export async function peekInviteAction(token: string): Promise<
  | { ok: true; workspaceName: string; role: GrowthHubMemberRole }
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
  };
}

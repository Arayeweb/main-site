import type { Metadata } from "next";
import { getGrowthHubServerClient } from "@/lib/growth-hub/supabase/server";
import { peekInviteAction } from "@/lib/growth-hub/actions/invite";
import { InviteClient } from "@/components/growth-hub/portal/InviteClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "پذیرش دعوت",
  robots: { index: false, follow: false },
};

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  // Non-sensitive preview via SECURITY DEFINER RPC — never exposes the invited
  // email or whether an account exists. Returns nothing for invalid invites.
  const peek = await peekInviteAction(params.token);
  if (!peek.ok) {
    return <InviteClient valid={false} />;
  }

  const supabase = getGrowthHubServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <InviteClient
      valid
      token={params.token}
      workspaceName={peek.workspaceName}
      role={peek.role}
      phoneMasked={peek.phoneMasked}
      isAuthenticated={Boolean(user)}
    />
  );
}

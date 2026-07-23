import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getGrowthHubServerClient } from "@/lib/growth-hub/supabase/server";
import { safeNextPath } from "@/lib/growth-hub/redirect";
import { LoginForm } from "@/components/growth-hub/portal/LoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "ورود",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const next = safeNextPath(searchParams.next);

  // Already signed in → skip login.
  const supabase = getGrowthHubServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(next);

  return <LoginForm next={next} />;
}

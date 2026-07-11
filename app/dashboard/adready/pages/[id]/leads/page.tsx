import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CampaignLeadsInbox from "@/components/adready/CampaignLeadsInbox";
import { AdReadyDashboardFrame } from "@/components/adready/AdReadyDashboardChrome";
import {
  getOwnedCampaignPage,
  requireAdReadySession,
} from "@/lib/adreadyServer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "لیدهای کمپین | کمپین‌ساز آرایه",
  robots: { index: false, follow: false },
};

export default async function AdReadyCampaignLeadsPage({
  params,
}: {
  params: { id: string };
}) {
  const returnTo = `/dashboard/adready/pages/${params.id}/leads`;
  const session = requireAdReadySession(returnTo);
  const page = await getOwnedCampaignPage(params.id, session.userId);
  if (!page) notFound();

  return (
    <AdReadyDashboardFrame>
      <CampaignLeadsInbox
          campaignId={page.id}
          campaignTitle={page.title || page.productOrServiceName || "صفحه کمپین"}
          plan={page.plan}
      />
    </AdReadyDashboardFrame>
  );
}

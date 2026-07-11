import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import CampaignPresentationEditor from "@/components/adready/CampaignPresentationEditor";
import {
  AdReadyDashboardFrame,
  CampaignStatusBadge,
  adReadyDashboardStyles as styles,
} from "@/components/adready/AdReadyDashboardChrome";
import {
  getOwnedCampaignPage,
  requireAdReadySession,
} from "@/lib/adreadyServer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ویرایش صفحه کمپین | کمپین‌ساز آرایه",
  robots: { index: false, follow: false },
};

export default async function EditAdReadyPage({
  params,
}: {
  params: { id: string };
}) {
  const returnTo = `/dashboard/adready/pages/${params.id}/edit`;
  const session = requireAdReadySession(returnTo);
  const campaign = await getOwnedCampaignPage(params.id, session.userId);
  if (!campaign) notFound();

  return (
    <AdReadyDashboardFrame>
      <section className={styles.detailHead}>
        <Link
          href={`/dashboard/adready/pages/${campaign.id}`}
          className={styles.backLink}
        >
          <ArrowRight size={15} />
          بازگشت به پیش‌نمایش
        </Link>
        <div className={styles.detailTitle}>
          <CampaignStatusBadge status={campaign.status} />
          <h1>ویرایش {campaign.title || "صفحه کمپین"}</h1>
        </div>
      </section>
      <CampaignPresentationEditor campaign={campaign} />
    </AdReadyDashboardFrame>
  );
}

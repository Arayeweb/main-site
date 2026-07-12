import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CampaignPageView from "@/components/adready/CampaignPageView";
import CampaignPageTracker from "@/components/adready/CampaignPageTracker";
import {
  hasRequiredPublicPresentation,
  mergeCampaignPresentation,
} from "@/lib/adreadyPresentation";
import { getPublishedCampaignPage } from "@/lib/adreadyServer";

export const dynamic = "force-dynamic";

type PageProps = { params: { slug: string } };

function publicUrl(slug: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com").replace(
    /\/$/,
    ""
  );
  return `${base}/campaign/${encodeURIComponent(slug)}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const campaign = await getPublishedCampaignPage(params.slug);
  if (!campaign) {
    return {
      title: "صفحه پیدا نشد | کمپین‌ساز آرایه",
      robots: { index: false, follow: false },
    };
  }

  const content = mergeCampaignPresentation(
    campaign.generatedContent,
    campaign.customContent
  );
  const title = content.headline || campaign.businessName || campaign.title;
  const description =
    content.subheadline ||
    campaign.shortDescription ||
    `صفحه کمپین ${campaign.businessName || campaign.title}`;
  const canIndex = campaign.seoVisibility === true;

  return {
    title,
    description,
    alternates: { canonical: publicUrl(campaign.slug) },
    robots: canIndex
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fa_IR",
      url: publicUrl(campaign.slug),
    },
  };
}

export default async function PublicCampaignPage({ params }: PageProps) {
  const campaign = await getPublishedCampaignPage(params.slug);
  if (!campaign) notFound();

  const content = mergeCampaignPresentation(
    campaign.generatedContent,
    campaign.customContent
  );
  const contacts = {
    contactPhone: campaign.contactPhone,
    whatsappNumber: campaign.whatsappNumber,
    telegramUsername: campaign.telegramUsername,
  };
  if (!hasRequiredPublicPresentation(content, contacts)) notFound();

  return (
    <CampaignPageTracker slug={campaign.slug} campaignPageId={campaign.id}>
      <CampaignPageView
        content={content}
        businessName={campaign.businessName}
        campaignGoal={campaign.goal}
        city={campaign.city}
        priceRange={campaign.priceRange}
        templateKey={campaign.templateKey}
        themeKey={campaign.themeKey}
        contacts={contacts}
        publicSlug={campaign.slug}
        campaignPageId={campaign.id}
      />
    </CampaignPageTracker>
  );
}

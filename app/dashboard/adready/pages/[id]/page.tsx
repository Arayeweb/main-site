import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, FileWarning, Info, Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import CampaignPageView from "@/components/adready/CampaignPageView";
import CampaignAnalyticsPanel from "@/components/adready/CampaignAnalyticsPanel";
import CampaignPublishPanel from "@/components/adready/CampaignPublishPanel";
import {
  AdReadyDashboardFrame,
  CampaignStatusBadge,
  adReadyDashboardStyles as styles,
} from "@/components/adready/AdReadyDashboardChrome";
import {
  hasRequiredPublicPresentation,
  mergeCampaignPresentation,
} from "@/lib/adreadyPresentation";
import {
  getOwnedCampaignPage,
  requireAdReadySession,
} from "@/lib/adreadyServer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "پیش‌نمایش کمپین | کمپین‌ساز آرایه",
  robots: { index: false, follow: false },
};

export default async function AdReadyPageDetail({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { paid?: string; payment?: string };
}) {
  const returnTo = `/dashboard/adready/pages/${params.id}`;
  const session = requireAdReadySession(returnTo);
  const page = await getOwnedCampaignPage(params.id, session.userId);
  if (!page) notFound();

  const content = mergeCampaignPresentation(
    page.generatedContent,
    page.customContent
  );
  const hasPreview = hasRequiredPublicPresentation(content, {
    contactPhone: page.contactPhone,
    whatsappNumber: page.whatsappNumber,
    telegramUsername: page.telegramUsername,
  });

  return (
    <AdReadyDashboardFrame>
      <section className={styles.detailHead}>
        <Link href="/dashboard/adready/pages" className={styles.backLink}>
          <ArrowRight size={15} />
          بازگشت به صفحه‌ها
        </Link>
        <div className={styles.detailTitle}>
          <CampaignStatusBadge status={page.status} />
          <h1>{page.title || page.productOrServiceName || "صفحه کمپین"}</h1>
        </div>
        <div className={styles.detailActions}>
          <Link
            href={`/dashboard/adready/pages/${page.id}/edit`}
            className={styles.primaryButton}
          >
            <Pencil size={15} />
            ویرایش محتوا
          </Link>
          {page.status === "published" && (
            <Link
              href={`/campaign/${encodeURIComponent(page.slug)}`}
              className={styles.secondaryButton}
              target="_blank"
            >
              <ExternalLink size={15} />
              صفحه عمومی
            </Link>
          )}
        </div>
      </section>

      <CampaignPublishPanel
        campaignId={page.id}
        status={page.status}
        paymentStatus={page.paymentStatus}
        activePackage={page.activePackage}
        expiresAt={page.expiresAt}
        publicSlug={page.slug}
        paid={searchParams?.paid === "1"}
        paymentResult={searchParams?.payment}
      />

      {page.status === "published" ? (
        <div className={styles.publishedNotice}>
          <ExternalLink size={17} />
          <span>
            صفحه عمومی در مسیر{" "}
            <Link href={`/campaign/${encodeURIComponent(page.slug)}`}>
              /campaign/{page.slug}
            </Link>{" "}
            در دسترس است.
          </span>
        </div>
      ) : (
        <div className={styles.notice}>
          <Info size={18} />
          <span>
            این صفحه هنوز عمومی منتشر نشده است. آمار فقط برای صفحات منتشرشده جمع‌آوری می‌شود.
          </span>
        </div>
      )}

      <CampaignAnalyticsPanel campaignId={page.id} />

      {hasPreview ? (
        <div className={styles.previewFrame}>
          <CampaignPageView
            content={content}
            businessName={page.businessName}
            campaignGoal={page.goal}
            city={page.city}
            priceRange={page.priceRange}
            templateKey={page.templateKey}
            themeKey={page.themeKey}
            contacts={{
              contactPhone: page.contactPhone,
              whatsappNumber: page.whatsappNumber,
              telegramUsername: page.telegramUsername,
            }}
            isPreview={page.status !== "published"}
            showAdCopyAngles
          />
        </div>
      ) : (
        <section className={styles.missingContent}>
          <FileWarning size={32} />
          <h2>محتوای قابل پیش‌نمایش کامل نیست.</h2>
          <p>
            تیتر، زیرتیتر، متن CTA، حداقل یک مزیت و یک راه تماس را در ویرایشگر تکمیل کنید.
          </p>
          <Link
            href={`/dashboard/adready/pages/${page.id}/edit`}
            className={styles.primaryButton}
          >
            تکمیل محتوا
          </Link>
        </section>
      )}
    </AdReadyDashboardFrame>
  );
}

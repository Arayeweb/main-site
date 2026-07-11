import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Eye, FilePlus2, Pencil, Users } from "lucide-react";
import {
  AdReadyDashboardFrame,
  CampaignStatusBadge,
  adReadyDashboardStyles as styles,
  formatCampaignDate,
} from "@/components/adready/AdReadyDashboardChrome";
import {
  normalizeAdReadyTemplateKey,
  type AdReadyTemplateKey,
} from "@/lib/adreadyPresentation";
import {
  listOwnedCampaignPages,
  getLeadCountsForPages,
  requireAdReadySession,
} from "@/lib/adreadyServer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "صفحه‌های کمپین | کمپین‌ساز آرایه",
  robots: { index: false, follow: false },
};

const TEMPLATE_LABELS: Record<AdReadyTemplateKey, string> = {
  "clean-service": "Clean Service",
  "local-business": "Local Business",
  "online-shop": "Online Shop",
  clinic: "Clinic",
  education: "Education",
  saas: "SaaS",
};

export default async function AdReadyPagesPage() {
  const session = requireAdReadySession("/dashboard/adready/pages");
  const pages = await listOwnedCampaignPages(session.userId);
  const leadCounts = await getLeadCountsForPages(
    session.userId,
    pages.map((page) => page.id)
  );

  return (
    <AdReadyDashboardFrame>
      <div className={styles.pageHead}>
        <div className={styles.pageHeadCopy}>
          <span className={styles.eyebrow}>داشبورد کمپین</span>
          <h1>صفحه‌های کمپین شما</h1>
          <p>پیش‌نویس‌ها، پیش‌نمایش‌ها و صفحه‌های منتشرشده را از اینجا مدیریت کنید.</p>
        </div>
      </div>

      {pages.length === 0 ? (
        <section className={styles.empty}>
          <span className={styles.emptyIcon}><FilePlus2 size={28} /></span>
          <h2>هنوز صفحه کمپینی نساخته‌ای.</h2>
          <p>اولین صفحه را با اطلاعات کسب‌وکارت و کمک AI آماده کن.</p>
          <Link href="/dashboard/adready/new" className={styles.primaryButton}>
            ساخت صفحه جدید
          </Link>
        </section>
      ) : (
        <section className={styles.cards} aria-label="فهرست صفحه‌های کمپین">
          {pages.map((page) => {
            const template = normalizeAdReadyTemplateKey(page.templateKey);
            return (
              <article className={styles.campaignCard} key={page.id}>
                <div className={styles.cardMain}>
                  <div className={styles.cardMeta}>
                    <CampaignStatusBadge status={page.status} />
                    <span className={styles.metaPill}>پلن {page.plan}</span>
                    <span className={styles.metaPill}>{TEMPLATE_LABELS[template]}</span>
                  </div>
                  <h2>{page.title || page.productOrServiceName || "صفحه کمپین"}</h2>
                  <p>{page.productOrServiceName || page.businessName || "کمپین‌ساز آرایه"}</p>
                  <div className={styles.dates}>
                    <span>ساخته‌شده: {formatCampaignDate(page.createdAt)}</span>
                    <span>آخرین تغییر: {formatCampaignDate(page.updatedAt)}</span>
                    <span>لیدها: {leadCounts[page.id] ?? 0}</span>
                  </div>
                  {page.status === "published" && (
                    <Link
                      href={`/campaign/${encodeURIComponent(page.slug)}`}
                      className={styles.publicLink}
                      target="_blank"
                    >
                      <ExternalLink size={13} />
                      <span>/campaign/{page.slug}</span>
                    </Link>
                  )}
                </div>
                <div className={styles.cardActions}>
                  <Link href={`/dashboard/adready/pages/${page.id}`}>
                    <Eye size={15} />
                    پیش‌نمایش
                  </Link>
                  <Link href={`/dashboard/adready/pages/${page.id}/edit`}>
                    <Pencil size={15} />
                    ویرایش
                  </Link>
                  <Link href={`/dashboard/adready/pages/${page.id}/leads`}>
                    <Users size={15} />
                    لیدها ({leadCounts[page.id] ?? 0})
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </AdReadyDashboardFrame>
  );
}

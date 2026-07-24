import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Compass, LifeBuoy, ArrowLeft } from "lucide-react";
import { requireWorkspaceMembership } from "@/lib/growth-hub/auth";
import { getGrowthHubServerClient } from "@/lib/growth-hub/supabase/server";
import { PortalChrome } from "@/components/growth-hub/portal/PortalChrome";
import { WorkspaceOpenedBeacon } from "@/components/growth-hub/portal/WorkspaceOpenedBeacon";
import {
  countActiveServices,
  listWorkspaceServices,
  pickPrimaryService,
} from "@/lib/growth-hub/services/queries";
import { SERVICE_STATUS_LABELS_FA } from "@/lib/growth-hub/services/status";
import type { GrowthHubServiceStatus } from "@/lib/growth-hub/database.types";
import styles from "@/components/growth-hub/growth-hub.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "خانه",
  robots: { index: false, follow: false },
};

async function resolveDisplayName(fallback: string): Promise<string> {
  const supabase = getGrowthHubServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fallback;
  const { data } = await supabase
    .from("gh_profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  return data?.full_name?.trim() || user.email?.split("@")[0] || fallback;
}

export default async function WorkspaceHomePage({
  params,
}: {
  params: { workspaceSlug: string };
}) {
  const ctx = await requireWorkspaceMembership(params.workspaceSlug);
  const displayName = await resolveDisplayName(ctx.workspace.name);
  const supabase = getGrowthHubServerClient();
  const services = await listWorkspaceServices(supabase, ctx.workspace.id);
  const primary = pickPrimaryService(services);
  const activeCount = countActiveServices(services);
  const waiting = primary?.status === "waiting_on_client";

  return (
    <PortalChrome
      workspace={{
        name: ctx.workspace.name,
        slug: ctx.workspace.slug,
        logo_url: ctx.workspace.logo_url,
      }}
      user={{ name: displayName, role: ctx.membership.role }}
      activeSegment="home"
    >
      <WorkspaceOpenedBeacon
        workspaceId={ctx.workspace.id}
        path={`/app/${ctx.workspace.slug}/home`}
      />

      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>سلام {displayName}</h1>
          <div className={styles.pageMeta}>
            <p className={styles.pageDescription}>
              به فضای کاری «{ctx.workspace.name}» در مرکز رشد آرایه خوش آمدید.
            </p>
          </div>
        </div>
      </header>

      {!primary ? (
        <>
          <section
            className={`${styles.statusPanel} ${styles.toneProgress}`}
            aria-labelledby="foundation-title"
          >
            <div className={styles.statusLabel}>
              <span className={styles.statusDot} aria-hidden="true" />
              <Sparkles size={13} aria-hidden="true" />
              آماده‌سازی حساب
            </div>
            <h2 className={styles.statusTitle} id="foundation-title">
              زیرساخت حساب شما آماده است
            </h2>
            <p className={styles.statusDescription}>
              دسترسی شما با موفقیت فعال شد. تیم آرایه در حال آماده‌سازی خدمات و
              اطلاعات کسب‌وکار شماست؛ به‌محض ثبت، وضعیت رشد، خدمات فعال و گزارش‌ها در
              همین صفحه نمایش داده می‌شوند.
            </p>
          </section>

          <div className={styles.priorityStack} style={{ marginTop: 20 }}>
            <div className={styles.emptyState}>
              <div>
                <span className={styles.emptyIcon} aria-hidden="true">
                  <Compass size={19} />
                </span>
                <h3 className={styles.emptyTitle}>خدمتی هنوز ثبت نشده است</h3>
                <p className={styles.emptyMessage}>
                  پس از تکمیل برنامه شروع همکاری توسط تیم آرایه، خدمات فعال شما اینجا
                  نمایش داده می‌شوند.
                </p>
              </div>
            </div>
            <div className={styles.emptyState}>
              <div>
                <span className={styles.emptyIcon} aria-hidden="true">
                  <LifeBuoy size={19} />
                </span>
                <h3 className={styles.emptyTitle}>نیاز به کمک دارید؟</h3>
                <p className={styles.emptyMessage}>
                  برای هر پرسش درباره حساب یا خدمات، از راه‌های ارتباطی آرایه با تیم
                  پشتیبانی در تماس باشید.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {waiting ? (
            <section className={styles.waitingBanner} aria-labelledby="home-waiting">
              <h2 className={styles.waitingBannerTitle} id="home-waiting">
                اقدام مورد نیاز از شما
              </h2>
              <p className={styles.waitingBannerText}>
                {primary.next_action}
                {primary.waiting_reason ? (
                  <>
                    <br />
                    دلیل: {primary.waiting_reason}
                  </>
                ) : null}
              </p>
              <Link
                href={`/app/${ctx.workspace.slug}/services/${primary.id}`}
                className={styles.listRowAction}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10 }}
              >
                مشاهده خدمت
                <ArrowLeft size={14} aria-hidden="true" />
              </Link>
            </section>
          ) : null}

          <section
            className={`${styles.statusPanel} ${styles.toneProgress}`}
            aria-labelledby="active-service-title"
          >
            <div className={styles.statusLabel}>
              <span className={styles.statusDot} aria-hidden="true" />
              {activeCount} خدمت فعال
            </div>
            <h2 className={styles.statusTitle} id="active-service-title">
              {primary.title}
            </h2>
            <p className={styles.statusDescription}>
              وضعیت:{" "}
              {SERVICE_STATUS_LABELS_FA[primary.status as GrowthHubServiceStatus]}
              {" · "}
              پیشرفت {primary.progress}٪
              {primary.latest_update ? (
                <>
                  <br />
                  آخرین به‌روزرسانی: {primary.latest_update}
                </>
              ) : null}
              {!waiting &&
              primary.next_action &&
              primary.status !== "completed" ? (
                <>
                  <br />
                  اقدام بعدی: {primary.next_action}
                </>
              ) : null}
              {primary.status === "completed" ? (
                <>
                  <br />
                  این خدمت تکمیل شده است و اقدام جاری برای شما ندارد.
                </>
              ) : null}
            </p>
            <div className={styles.progressTrack} aria-hidden="true">
              <div
                className={styles.progressBar}
                style={{ width: `${primary.progress}%` }}
              />
            </div>
            <p style={{ marginTop: 12 }}>
              <Link
                href={`/app/${ctx.workspace.slug}/services/${primary.id}`}
                className={styles.listRowAction}
              >
                جزئیات خدمت
              </Link>
              {" · "}
              <Link
                href={`/app/${ctx.workspace.slug}/services`}
                className={styles.listRowMeta}
              >
                همه خدمات
              </Link>
            </p>
          </section>

          <div className={styles.priorityStack} style={{ marginTop: 20 }}>
            <div className={styles.emptyState}>
              <div>
                <span className={styles.emptyIcon} aria-hidden="true">
                  <LifeBuoy size={19} />
                </span>
                <h3 className={styles.emptyTitle}>گزارش‌ها و فرصت‌ها</h3>
                <p className={styles.emptyMessage}>
                  این بخش‌ها در نسخه‌های بعدی فعال می‌شوند و فعلاً داده ساختگی نشان
                  داده نمی‌شود.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </PortalChrome>
  );
}

import type { Metadata } from "next";
import { Sparkles, Compass, LifeBuoy } from "lucide-react";
import { requireWorkspaceMembership } from "@/lib/growth-hub/auth";
import { getGrowthHubServerClient } from "@/lib/growth-hub/supabase/server";
import { PortalChrome } from "@/components/growth-hub/portal/PortalChrome";
import { WorkspaceOpenedBeacon } from "@/components/growth-hub/portal/WorkspaceOpenedBeacon";
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

      {/* Sprint 1B foundation state — no fabricated services/KPIs/reports. */}
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
    </PortalChrome>
  );
}

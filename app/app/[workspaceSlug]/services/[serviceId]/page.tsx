import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireWorkspaceMembership } from "@/lib/growth-hub/auth";
import { getGrowthHubServerClient } from "@/lib/growth-hub/supabase/server";
import { PortalChrome } from "@/components/growth-hub/portal/PortalChrome";
import { ServiceViewedBeacon } from "@/components/growth-hub/portal/ServiceViewedBeacon";
import {
  getWorkspaceService,
  listServiceMilestones,
} from "@/lib/growth-hub/services/queries";
import {
  MILESTONE_STATUS_LABELS_FA,
  SERVICE_STATUS_LABELS_FA,
} from "@/lib/growth-hub/services/status";
import { uuidSchema } from "@/lib/growth-hub/validation";
import type {
  GrowthHubMilestoneStatus,
  GrowthHubServiceStatus,
} from "@/lib/growth-hub/database.types";
import { formatJalaliDate } from "@/lib/jalali";
import styles from "@/components/growth-hub/growth-hub.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "جزئیات خدمت",
  robots: { index: false, follow: false },
};

export default async function ServiceDetailPage({
  params,
}: {
  params: { workspaceSlug: string; serviceId: string };
}) {
  const ctx = await requireWorkspaceMembership(params.workspaceSlug);
  if (!uuidSchema.safeParse(params.serviceId).success) notFound();

  const supabase = getGrowthHubServerClient();
  const service = await getWorkspaceService(
    supabase,
    ctx.workspace.id,
    params.serviceId,
  );
  if (!service) notFound();

  const milestones = await listServiceMilestones(
    supabase,
    ctx.workspace.id,
    service.id,
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const displayName = user?.email?.split("@")[0] || ctx.workspace.name;
  const status = service.status as GrowthHubServiceStatus;
  const waiting = status === "waiting_on_client";

  return (
    <PortalChrome
      workspace={{
        name: ctx.workspace.name,
        slug: ctx.workspace.slug,
        logo_url: ctx.workspace.logo_url,
      }}
      user={{ name: displayName, role: ctx.membership.role }}
      activeSegment="services"
    >
      <ServiceViewedBeacon serviceId={service.id} workspaceId={ctx.workspace.id} />

      <header className={styles.pageHeader}>
        <div>
          <p className={styles.pageDescription}>
            <Link href={`/app/${ctx.workspace.slug}/services`}>← خدمات</Link>
          </p>
          <h1 className={styles.pageTitle}>{service.title}</h1>
          <p className={styles.pageDescription}>
            {service.template?.title ? `${service.template.title} · ` : ""}
            {SERVICE_STATUS_LABELS_FA[status]} · پیشرفت {service.progress}٪
          </p>
        </div>
      </header>

      {waiting ? (
        <section className={styles.waitingBanner} aria-labelledby="waiting-title">
          <h2 className={styles.waitingBannerTitle} id="waiting-title">
            اقدام مورد نیاز از شما
          </h2>
          <p className={styles.waitingBannerText}>
            {service.next_action}
            {service.waiting_reason ? (
              <>
                <br />
                دلیل: {service.waiting_reason}
              </>
            ) : null}
          </p>
        </section>
      ) : null}

      <section className={`${styles.statusPanel} ${styles.toneProgress}`}>
        <div className={styles.statusLabel}>
          <span className={styles.statusDot} aria-hidden="true" />
          {SERVICE_STATUS_LABELS_FA[status]}
        </div>
        <h2 className={styles.statusTitle}>
          {status === "completed"
            ? "این خدمت تکمیل شده است"
            : status === "cancelled"
              ? "این خدمت لغو شده است"
              : service.latest_update || "خلاصه وضعیت خدمت"}
        </h2>
        <p className={styles.statusDescription}>
          {service.latest_update
            ? service.latest_update
            : "هنوز به‌روزرسانی متنی ثبت نشده است."}
        </p>
        <div className={styles.progressTrack} aria-hidden="true">
          <div className={styles.progressBar} style={{ width: `${service.progress}%` }} />
        </div>
        <p className={styles.pageDescription} style={{ marginTop: 10 }}>
          {service.start_date ? `شروع: ${service.start_date}` : null}
          {service.start_date && service.due_date ? " · " : null}
          {service.due_date ? `سررسید: ${service.due_date}` : null}
          {(service.start_date || service.due_date) && service.renewal_date
            ? " · "
            : null}
          {service.renewal_date ? `تمدید: ${service.renewal_date}` : null}
        </p>
        {!waiting && service.next_action && status !== "completed" ? (
          <p className={styles.listRowAction} style={{ marginTop: 10 }}>
            اقدام بعدی: {service.next_action}
          </p>
        ) : null}
      </section>

      <section style={{ marginTop: 22 }}>
        <h2 className={styles.sectionTitle}>مراحل</h2>
        {!milestones.length ? (
          <p className={styles.emptyMessage}>مراحل به‌زودی ثبت می‌شود.</p>
        ) : (
          <ol className={styles.milestoneList}>
            {milestones.map((m) => {
              const ms = m.status as GrowthHubMilestoneStatus;
              const done = ms === "completed";
              return (
                <li key={m.id} className={styles.milestoneItem}>
                  <span
                    className={`${styles.milestoneDot} ${done ? styles.milestoneDotDone : ""}`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className={styles.milestoneTitle}>{m.title}</p>
                    <p className={styles.milestoneMeta}>
                      {MILESTONE_STATUS_LABELS_FA[ms]}
                      {m.due_date ? ` · سررسید ${formatJalaliDate(m.due_date)}` : ""}
                      {m.completed_at
                        ? ` · انجام‌شده ${formatJalaliDate(m.completed_at)}`
                        : ""}
                    </p>
                  </div>
                  <span className={styles.itemMeta}>{m.sort_order}</span>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </PortalChrome>
  );
}

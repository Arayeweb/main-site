import type { Metadata } from "next";
import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { requireWorkspaceMembership } from "@/lib/growth-hub/auth";
import { getGrowthHubServerClient } from "@/lib/growth-hub/supabase/server";
import { PortalChrome } from "@/components/growth-hub/portal/PortalChrome";
import { listWorkspaceServices } from "@/lib/growth-hub/services/queries";
import { SERVICE_STATUS_LABELS_FA } from "@/lib/growth-hub/services/status";
import type { GrowthHubServiceStatus } from "@/lib/growth-hub/database.types";
import styles from "@/components/growth-hub/growth-hub.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "خدمات",
  robots: { index: false, follow: false },
};

export default async function ServicesListPage({
  params,
}: {
  params: { workspaceSlug: string };
}) {
  const ctx = await requireWorkspaceMembership(params.workspaceSlug);
  const supabase = getGrowthHubServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const displayName =
    user?.email?.split("@")[0] || ctx.workspace.name;

  const services = await listWorkspaceServices(supabase, ctx.workspace.id);

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
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>خدمات</h1>
          <p className={styles.pageDescription}>
            وضعیت و پیشرفت خدمات فعال فضای کاری «{ctx.workspace.name}»
          </p>
        </div>
      </header>

      {!services.length ? (
        <div className={styles.emptyState}>
          <div>
            <span className={styles.emptyIcon} aria-hidden="true">
              <BriefcaseBusiness size={19} />
            </span>
            <h3 className={styles.emptyTitle}>خدمتی ثبت نشده است</h3>
            <p className={styles.emptyMessage}>
              به‌محض تخصیص خدمت توسط تیم آرایه، فهرست و جزئیات اینجا نمایش داده
              می‌شود.
            </p>
          </div>
        </div>
      ) : (
        <ul className={styles.listStack}>
          {services.map((s) => (
            <li key={s.id}>
              <Link
                href={`/app/${ctx.workspace.slug}/services/${s.id}`}
                className={styles.listRow}
              >
                <div className={styles.listRowBody}>
                  <p className={styles.listRowTitle}>{s.title}</p>
                  <p className={styles.listRowMeta}>
                    {s.template?.title ? `${s.template.title} · ` : ""}
                    {SERVICE_STATUS_LABELS_FA[s.status as GrowthHubServiceStatus]}
                    {" · "}
                    {s.progress}٪
                  </p>
                  {s.next_action ? (
                    <p className={styles.listRowAction}>اقدام بعدی: {s.next_action}</p>
                  ) : null}
                  {s.due_date || s.renewal_date ? (
                    <p className={styles.listRowMeta}>
                      {s.due_date ? `سررسید: ${s.due_date}` : null}
                      {s.due_date && s.renewal_date ? " · " : null}
                      {s.renewal_date ? `تمدید: ${s.renewal_date}` : null}
                    </p>
                  ) : null}
                  {s.latest_update ? (
                    <p className={styles.listRowMeta}>آخرین به‌روزرسانی: {s.latest_update}</p>
                  ) : null}
                </div>
                <span className={styles.progressChip} aria-label={`پیشرفت ${s.progress} درصد`}>
                  {s.progress}٪
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PortalChrome>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  requirePortalSession,
  listAccessibleWorkspaces,
} from "@/lib/growth-hub/auth";
import { ROLE_LABELS_FA } from "@/lib/growth-hub/permissions";
import { LogoutButton } from "@/components/growth-hub/portal/LogoutButton";
import styles from "@/components/growth-hub/portal/auth.module.css";
import "@/components/growth-hub/theme/portal-tokens.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "انتخاب فضای کاری",
  robots: { index: false, follow: false },
};

export default async function SelectWorkspacePage() {
  await requirePortalSession("/app/select-workspace");
  const workspaces = await listAccessibleWorkspaces();

  // Documented UX: exactly one workspace → go straight in.
  if (workspaces.length === 1) {
    redirect(`/app/${workspaces[0].slug}/home`);
  }

  return (
    <div className={`gh-root ${styles.screen}`}>
      <div className={`${styles.card} ${styles.wide}`}>
        <div className={styles.brand}>
          <img className={styles.brandMark} src="/assets/logo-icon.svg" alt="" />
          <div>
            <p className={styles.brandTitle}>مرکز رشد آرایه</p>
            <p className={styles.brandSubtitle}>پنل مشتریان آرایه</p>
          </div>
        </div>

        <h1 className={styles.title}>انتخاب فضای کاری</h1>
        <p className={styles.meta}>
          {workspaces.length
            ? "برای ادامه، فضای کاری موردنظر را انتخاب کنید."
            : "هنوز به هیچ فضای کاری دعوت نشده‌اید."}
        </p>

        {workspaces.length ? (
          <div className={styles.wsList}>
            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/app/${ws.slug}/home`}
                className={styles.wsItem}
              >
                <span className={styles.wsAvatar} aria-hidden="true">
                  {ws.name.trim()[0] ?? "؟"}
                </span>
                <span className={styles.wsBody}>
                  <span className={styles.wsName}>{ws.name}</span>
                  <span className={styles.wsRole}>{ROLE_LABELS_FA[ws.role]}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyBox}>
            <p className={styles.emptyTitle}>دسترسی فعالی ندارید</p>
            <p className={styles.emptyText}>
              اگر منتظر دعوت هستید، پس از تأیید تیم آرایه، فضای کاری شما اینجا نمایش
              داده می‌شود. برای پیگیری با پشتیبانی آرایه در تماس باشید.
            </p>
          </div>
        )}

        <p className={styles.hint}>
          <LogoutButton />
        </p>
      </div>
    </div>
  );
}

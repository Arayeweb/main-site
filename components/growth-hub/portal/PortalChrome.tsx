import Link from "next/link";
import {
  BriefcaseBusiness,
  FileText,
  FolderOpen,
  Home,
  MessageSquareText,
} from "lucide-react";
import type { GrowthHubMemberRole } from "@/lib/growth-hub/database.types";
import { ROLE_LABELS_FA } from "@/lib/growth-hub/permissions";
import styles from "../growth-hub.module.css";
import { LogoutButton } from "./LogoutButton";
import "../theme/portal-tokens.css";

// Production portal shell. Reuses the approved Sprint 1A visual language
// (growth-hub.module.css + portal tokens) with real workspace/user data.
// Only "خانه" is live in Sprint 1B; later sections render as calm placeholders
// (no dead links, no fabricated data) until their modules ship.

type NavSegment = "home" | "services" | "requests" | "reports" | "files";

const NAV_ITEMS: Array<{
  segment: NavSegment;
  label: string;
  icon: typeof Home;
  live: boolean;
}> = [
  { segment: "home", label: "خانه", icon: Home, live: true },
  { segment: "services", label: "خدمات", icon: BriefcaseBusiness, live: true },
  { segment: "requests", label: "درخواست‌ها", icon: MessageSquareText, live: false },
  { segment: "reports", label: "گزارش‌ها", icon: FileText, live: false },
  { segment: "files", label: "فایل‌ها و مالی", icon: FolderOpen, live: false },
];

export interface PortalChromeProps {
  workspace: {
    name: string;
    slug: string;
    logo_url: string | null;
  };
  user: {
    name: string;
    role: GrowthHubMemberRole;
  };
  activeSegment: NavSegment;
  children: React.ReactNode;
}

function initials(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed[0] : "؟";
}

export function PortalChrome({
  workspace,
  user,
  activeSegment,
  children,
}: PortalChromeProps) {
  return (
    <div className={`gh-root ${styles.shell}`}>
      <aside className={styles.sidebar} aria-label="ناوبری مرکز رشد">
        <div className={styles.brand}>
          <img
            className={styles.brandMark}
            src="/assets/logo-icon.svg"
            alt=""
            width={38}
            height={38}
          />
          <div>
            <p className={styles.brandTitle}>مرکز رشد آرایه</p>
            <p className={styles.brandSubtitle}>پنل مشتریان آرایه</p>
          </div>
        </div>

        <div className={styles.workspaceIdentity}>
          <Link className={styles.workspaceButton} href="/app/select-workspace">
            <span className={styles.workspaceAvatar} aria-hidden="true">
              {workspace.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={workspace.logo_url}
                  alt=""
                  width={34}
                  height={34}
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                initials(workspace.name)
              )}
            </span>
            <span className={styles.workspaceText}>
              <span className={styles.workspaceLabel}>فضای کاری</span>
              <span className={styles.workspaceName}>{workspace.name}</span>
            </span>
          </Link>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ segment, label, icon: Icon, live }) => {
            const active = segment === activeSegment;
            const className = `${styles.navItem} ${active ? styles.navItemActive : ""}`;
            if (live) {
              return (
                <Link
                  key={segment}
                  className={className}
                  href={`/app/${workspace.slug}/${segment}`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            }
            return (
              <span
                key={segment}
                className={`${className} ${styles.navItemDisabled}`}
                aria-disabled="true"
                title="به‌زودی"
              >
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                <span>{label}</span>
              </span>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <p className={styles.userName}>{user.name}</p>
          <p className={styles.userRole}>{ROLE_LABELS_FA[user.role]}</p>
          <LogoutButton />
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.mobileWorkspace}>
            <span className={styles.workspaceAvatar} aria-hidden="true">
              {initials(workspace.name)}
            </span>
            <span className={styles.mobileWorkspaceName}>{workspace.name}</span>
          </div>
        </header>
        <main className={styles.content} id="main-content">
          {children}
        </main>
      </div>

      <nav className={styles.mobileNav} aria-label="ناوبری موبایل">
        {NAV_ITEMS.map(({ segment, label, icon: Icon, live }) => {
          const active = segment === activeSegment;
          const className = `${styles.mobileNavItem} ${active ? styles.mobileNavActive : ""}`;
          if (live) {
            return (
              <Link
                key={segment}
                className={className}
                href={`/app/${workspace.slug}/${segment}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          }
          return (
            <span
              key={segment}
              className={`${className} ${styles.navItemDisabled}`}
              aria-disabled="true"
            >
              <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
            </span>
          );
        })}
      </nav>
    </div>
  );
}

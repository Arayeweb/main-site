import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import type { CampaignPageStatus } from "@/lib/adready";
import styles from "./dashboard.module.css";

const STATUS_LABELS: Record<CampaignPageStatus, string> = {
  draft: "پیش‌نویس",
  preview: "پیش‌نمایش",
  published: "منتشرشده",
  archived: "بایگانی‌شده",
};

const STATUS_CLASSES: Record<CampaignPageStatus, string> = {
  draft: styles.statusDraft,
  preview: styles.statusPreview,
  published: styles.statusPublished,
  archived: styles.statusArchived,
};

export function AdReadyDashboardFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell} dir="rtl">
      <header className={styles.topbar}>
        <Link href="/dashboard/adready/pages" className={styles.brand}>
          <span><Sparkles size={18} /></span>
          <div>
            <strong>کمپین‌ساز آرایه</strong>
            <small>مدیریت صفحه‌های کمپین</small>
          </div>
        </Link>
        <div className={styles.topActions}>
          <Link href="/dashboard/adready/new" className={styles.primaryButton}>
            <Plus size={16} />
            صفحه جدید
          </Link>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

export function CampaignStatusBadge({ status }: { status: CampaignPageStatus }) {
  return (
    <span className={`${styles.status} ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function formatCampaignDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export { styles as adReadyDashboardStyles };

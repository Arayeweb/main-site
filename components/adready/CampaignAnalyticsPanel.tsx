"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Loader2, Users } from "lucide-react";
import type { CampaignLead } from "@/lib/adready";
import type { CampaignAnalytics } from "@/lib/adreadyAnalytics";
import styles from "./dashboard.module.css";

type CampaignAnalyticsPanelProps = {
  campaignId: string;
};

function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}٪`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function CampaignAnalyticsPanel({
  campaignId,
}: CampaignAnalyticsPanelProps) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState("loading");

    fetch(`/api/adready/campaigns/${campaignId}/analytics`, {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as {
          ok?: boolean;
          analytics?: CampaignAnalytics;
        } | null;
        if (cancelled) return;
        if (!res.ok || !data?.ok || !data.analytics) {
          setState("error");
          return;
        }
        setAnalytics(data.analytics);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  if (state === "loading") {
    return (
      <section className={styles.analyticsPanel} aria-busy="true">
        <div className={styles.analyticsLoading}>
          <Loader2 className={styles.spin} size={22} />
          <span>در حال بارگذاری آمار...</span>
        </div>
      </section>
    );
  }

  if (state === "error" || !analytics) {
    return (
      <section className={styles.analyticsPanel}>
        <p className={styles.analyticsError}>بارگذاری آمار انجام نشد.</p>
      </section>
    );
  }

  const metrics = [
    { label: "بازدید", value: analytics.views },
    { label: "بازدید یکتا", value: analytics.uniqueViews },
    { label: "لید", value: analytics.leads },
    { label: "نرخ تبدیل", value: formatPercent(analytics.conversionRate) },
    { label: "کلیک CTA", value: analytics.ctaClicks },
    { label: "واتساپ", value: analytics.whatsappClicks },
    { label: "تلگرام", value: analytics.telegramClicks },
    { label: "تماس", value: analytics.callClicks },
  ];

  return (
    <section className={styles.analyticsPanel} aria-label="آمار کمپین">
      <div className={styles.analyticsHead}>
        <span className={styles.analyticsIcon}><BarChart3 size={18} /></span>
        <div>
          <h2>آمار کمپین</h2>
          <p>
            {analytics.topUtmSource
              ? `برترین منبع UTM: ${analytics.topUtmSource}`
              : "هنوز منبع UTM ثبت نشده"}
          </p>
        </div>
        <Link href={`/dashboard/adready/pages/${campaignId}/leads`} className={styles.secondaryButton}>
          <Users size={15} />
          همه لیدها
        </Link>
      </div>

      <div className={styles.analyticsGrid}>
        {metrics.map((item) => (
          <article key={item.label} className={styles.analyticsCard}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>

      <div className={styles.latestLeads}>
        <h3>آخرین لیدها</h3>
        {analytics.latestLeads.length === 0 ? (
          <p className={styles.analyticsEmpty}>هنوز لیدی ثبت نشده.</p>
        ) : (
          <ul>
            {analytics.latestLeads.map((lead: CampaignLead) => (
              <li key={lead.id}>
                <strong>{lead.fullName}</strong>
                <span dir="ltr">{lead.phone}</span>
                <small>{formatDate(lead.createdAt)}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

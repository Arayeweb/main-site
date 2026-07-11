"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, Loader2, Users } from "lucide-react";
import type { CampaignLead, CampaignLeadStatus, CampaignPlan } from "@/lib/adready";
import { CAMPAIGN_LEAD_STATUSES } from "@/lib/adready";
import { canExportLeads } from "@/lib/adreadyCsv";
import styles from "./dashboard.module.css";

const STATUS_LABELS: Record<CampaignLeadStatus, string> = {
  new: "جدید",
  contacted: "تماس گرفته",
  qualified: "واجد شرایط",
  won: "موفق",
  lost: "از دست رفته",
};

type CampaignLeadsInboxProps = {
  campaignId: string;
  campaignTitle: string;
  plan: CampaignPlan;
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function CampaignLeadsInbox({
  campaignId,
  campaignTitle,
  plan,
}: CampaignLeadsInboxProps) {
  const [leads, setLeads] = useState<CampaignLead[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [exportBusy, setExportBusy] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch(`/api/adready/campaigns/${campaignId}/leads`, {
        credentials: "same-origin",
        cache: "no-store",
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        leads?: CampaignLead[];
      } | null;
      if (!res.ok || !data?.ok) {
        setState("error");
        return;
      }
      setLeads(data.leads || []);
      setState("ready");
    } catch {
      setState("error");
    }
  }, [campaignId]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  async function updateStatus(leadId: string, status: CampaignLeadStatus) {
    setSavingId(leadId);
    setMessage("");
    try {
      const res = await fetch(
        `/api/adready/campaigns/${campaignId}/leads/${leadId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ status }),
        }
      );
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        lead?: CampaignLead;
        error?: string;
      } | null;
      if (!res.ok || !data?.ok || !data.lead) {
        setMessage("به‌روزرسانی وضعیت انجام نشد.");
        return;
      }
      setLeads((current) =>
        current.map((lead) => (lead.id === leadId ? data.lead! : lead))
      );
      setMessage("وضعیت لید ذخیره شد.");
    } catch {
      setMessage("به‌روزرسانی وضعیت انجام نشد.");
    } finally {
      setSavingId(null);
    }
  }

  async function exportCsv() {
    setExportBusy(true);
    setMessage("");
    try {
      const res = await fetch(
        `/api/adready/campaigns/${campaignId}/leads/export`,
        { credentials: "same-origin" }
      );
      if (res.status === 403) {
        setMessage("خروجی CSV فقط برای پلن Pro و Business فعال است.");
        return;
      }
      if (!res.ok) {
        setMessage("خروجی CSV انجام نشد.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `leads-${campaignId}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage("فایل CSV دانلود شد.");
    } catch {
      setMessage("خروجی CSV انجام نشد.");
    } finally {
      setExportBusy(false);
    }
  }

  return (
    <section className={styles.leadsInbox}>
      <div className={styles.detailHead}>
        <Link
          href={`/dashboard/adready/pages/${campaignId}`}
          className={styles.backLink}
        >
          <ArrowRight size={15} />
          بازگشت به کمپین
        </Link>
        <div className={styles.detailTitle}>
          <span className={styles.eyebrow}>مدیریت لیدها</span>
          <h1>{campaignTitle}</h1>
        </div>
        <div className={styles.detailActions}>
          <button
            type="button"
            className={styles.exportButton}
            onClick={() => void exportCsv()}
            disabled={exportBusy}
          >
            {exportBusy ? <Loader2 className={styles.spin} size={15} /> : <Download size={15} />}
            خروجی CSV
          </button>
        </div>
      </div>

      {!canExportLeads(plan) && (
        <p className={styles.exportHint}>
          خروجی CSV برای پلن‌های Pro و Business در دسترس است.
        </p>
      )}

      {message && <p className={styles.saveMessage}>{message}</p>}

      {state === "loading" && (
        <div className={styles.analyticsLoading}>
          <Loader2 className={styles.spin} size={22} />
          <span>در حال بارگذاری لیدها...</span>
        </div>
      )}

      {state === "error" && (
        <div className={styles.empty}>
          <p>بارگذاری لیدها انجام نشد.</p>
          <button type="button" className={styles.secondaryButton} onClick={() => void loadLeads()}>
            تلاش دوباره
          </button>
        </div>
      )}

      {state === "ready" && leads.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}><Users size={28} /></span>
          <h2>هنوز لیدی ثبت نشده</h2>
          <p>بعد از انتشار صفحه و ثبت فرم توسط مخاطبان، لیدها اینجا نمایش داده می‌شوند.</p>
        </div>
      )}

      {state === "ready" && leads.length > 0 && (
        <div className={styles.leadsTableWrap}>
          <table className={styles.leadsTable}>
            <thead>
              <tr>
                <th>نام</th>
                <th>موبایل</th>
                <th>پیام</th>
                <th>UTM</th>
                <th>تاریخ</th>
                <th>وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.fullName}</td>
                  <td dir="ltr">{lead.phone}</td>
                  <td>{lead.message || "—"}</td>
                  <td>
                    <small>
                      {[lead.utmSource, lead.utmMedium, lead.utmCampaign]
                        .filter(Boolean)
                        .join(" / ") || "—"}
                    </small>
                  </td>
                  <td><small>{formatDate(lead.createdAt)}</small></td>
                  <td>
                    <select
                      className={styles.statusSelect}
                      value={lead.status}
                      disabled={savingId === lead.id}
                      onChange={(event) =>
                        void updateStatus(
                          lead.id,
                          event.target.value as CampaignLeadStatus
                        )
                      }
                    >
                      {CAMPAIGN_LEAD_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

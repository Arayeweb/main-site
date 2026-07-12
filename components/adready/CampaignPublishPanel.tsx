"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Check,
  Crown,
  ExternalLink,
  Loader2,
  Rocket,
} from "lucide-react";
import {
  ADREADY_PACKAGES,
  formatToman,
  type AdReadyPackageKey,
} from "@/lib/adreadyPackages";
import styles from "./campaignPublish.module.css";

export default function CampaignPublishPanel({
  campaignId,
  status,
  paymentStatus,
  activePackage,
  expiresAt,
  publicSlug,
  paid = false,
  paymentResult,
}: {
  campaignId: string;
  status: string;
  paymentStatus: string;
  activePackage?: string | null;
  expiresAt?: string | null;
  publicSlug?: string;
  paid?: boolean;
  paymentResult?: string;
}) {
  const [selected, setSelected] = useState<AdReadyPackageKey>(
    activePackage === "monthly" ? "monthly" : "lifetime"
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const expiry = expiresAt ? new Date(expiresAt) : null;
  const expired =
    activePackage === "monthly" &&
    (!expiry || Number.isNaN(expiry.getTime()) || expiry <= new Date());
  const lifetimeActive =
    status === "published" &&
    paymentStatus === "paid" &&
    activePackage === "lifetime";
  const published =
    status === "published" && paymentStatus === "paid" && !expired;

  async function checkout() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/adready/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, package: selected }),
      });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; redirectUrl?: string; error?: string }
        | null;
      if (!response.ok || !data?.ok || !data.redirectUrl) {
        throw new Error(data?.error || "checkout_failed");
      }
      window.location.assign(data.redirectUrl);
    } catch {
      setError("شروع پرداخت ممکن نشد. چند لحظه دیگر دوباره تلاش کنید.");
      setBusy(false);
    }
  }

  return (
    <section className={styles.panel} aria-labelledby={`publish-${campaignId}`}>
      <div className={styles.heading}>
        <span className={styles.icon}><Rocket size={23} /></span>
        <div>
          <small>{published ? "صفحه آنلاین است" : expired ? "نیاز به تمدید" : "مرحله نهایی"}</small>
          <h2 id={`publish-${campaignId}`}>
            {published ? "انتشار صفحه مدیریت می‌شود" : "صفحه را عمومی منتشر کنید"}
          </h2>
          <p>
            {lifetimeActive
              ? "این صفحه با پلن مادام‌العمر فعال است."
              : published
                ? "برای تمدید یا ارتقا می‌توانید یک پلن جدید انتخاب کنید."
                : "پیش‌نمایش رایگان می‌ماند؛ پرداخت فقط برای لینک عمومی است."}
          </p>
        </div>
        {published && publicSlug && (
          <a
            className={styles.liveLink}
            href={`/campaign/${encodeURIComponent(publicSlug)}`}
            target="_blank"
            rel="noreferrer"
          >
            مشاهده صفحه
            <ExternalLink size={15} />
          </a>
        )}
      </div>

      {(paid || paymentResult === "success") && (
        <div className={styles.success} role="status">
          <BadgeCheck size={19} />
          پرداخت موفق بود و صفحه شما منتشر شد.
        </div>
      )}
      {(paymentResult === "failed" || paymentResult === "error") && (
        <div className={styles.failure} role="alert">
          پرداخت کامل نشد. پلن را انتخاب کنید و دوباره تلاش کنید.
        </div>
      )}

      {!lifetimeActive && (
        <>
          <div className={styles.plans}>
            {(Object.keys(ADREADY_PACKAGES) as AdReadyPackageKey[]).map(
              (key) => {
                const pkg = ADREADY_PACKAGES[key];
                const isSelected = selected === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.plan} ${isSelected ? styles.selected : ""}`}
                    onClick={() => setSelected(key)}
                    aria-pressed={isSelected}
                  >
                    <span className={styles.planCheck}>
                      {isSelected ? <Check size={15} /> : null}
                    </span>
                    {key === "lifetime" && (
                      <span className={styles.badge}><Crown size={13} />پیشنهاد ویژه</span>
                    )}
                    <strong>{pkg.name}</strong>
                    <div className={styles.price}>
                      {pkg.listPriceToman > pkg.priceToman && (
                        <del>{formatToman(pkg.listPriceToman)}</del>
                      )}
                      <b>{formatToman(pkg.priceToman)}</b>
                      <span>تومان</span>
                    </div>
                    <small>
                      {key === "monthly"
                        ? "۳۰ روز انتشار و امکان تمدید"
                        : "یک‌بار پرداخت، بدون تاریخ انقضا"}
                    </small>
                  </button>
                );
              }
            )}
          </div>

          <button
            type="button"
            className={styles.checkout}
            onClick={checkout}
            disabled={busy}
          >
            {busy ? <Loader2 className={styles.spin} size={18} /> : <Rocket size={18} />}
            {busy
              ? "در حال اتصال به زیبال..."
              : `${published ? "تمدید یا ارتقا" : "پرداخت و انتشار"} — ${formatToman(
                  ADREADY_PACKAGES[selected].priceToman
                )} تومان`}
          </button>
        </>
      )}

      {paymentStatus === "pending" && !published && (
        <p className={styles.pending}>یک پرداخت در انتظار تأیید است.</p>
      )}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </section>
  );
}

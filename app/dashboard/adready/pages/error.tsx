"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import {
  AdReadyDashboardFrame,
  adReadyDashboardStyles as styles,
} from "@/components/adready/AdReadyDashboardChrome";

export default function AdReadyPagesError({ reset }: { reset: () => void }) {
  return (
    <AdReadyDashboardFrame>
      <section className={styles.empty}>
        <span className={styles.emptyIcon}><AlertTriangle size={28} /></span>
        <h2>بارگذاری صفحه‌ها انجام نشد.</h2>
        <p>اتصال را بررسی کنید و دوباره تلاش کنید.</p>
        <button type="button" className={styles.primaryButton} onClick={reset}>
          <RefreshCw size={16} />
          تلاش دوباره
        </button>
      </section>
    </AdReadyDashboardFrame>
  );
}

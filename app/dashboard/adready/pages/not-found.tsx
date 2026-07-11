import Link from "next/link";
import { FileQuestion } from "lucide-react";
import {
  AdReadyDashboardFrame,
  adReadyDashboardStyles as styles,
} from "@/components/adready/AdReadyDashboardChrome";

export default function AdReadyPageNotFound() {
  return (
    <AdReadyDashboardFrame>
      <section className={styles.empty}>
        <span className={styles.emptyIcon}><FileQuestion size={28} /></span>
        <h2>صفحه کمپین پیدا نشد.</h2>
        <p>ممکن است صفحه حذف شده باشد یا به حساب دیگری تعلق داشته باشد.</p>
        <Link href="/dashboard/adready/pages" className={styles.primaryButton}>
          بازگشت به صفحه‌ها
        </Link>
      </section>
    </AdReadyDashboardFrame>
  );
}

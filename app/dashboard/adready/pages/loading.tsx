import {
  AdReadyDashboardFrame,
  adReadyDashboardStyles as styles,
} from "@/components/adready/AdReadyDashboardChrome";

export default function AdReadyPagesLoading() {
  return (
    <AdReadyDashboardFrame>
      <div className={styles.pageHead}>
        <div className={styles.pageHeadCopy}>
          <span className={styles.eyebrow}>داشبورد کمپین</span>
          <h1>در حال بارگذاری صفحه‌ها...</h1>
        </div>
      </div>
      <div className={styles.loadingCards} aria-busy="true" aria-label="در حال بارگذاری">
        <div className={styles.skeleton} />
        <div className={styles.skeleton} />
        <div className={styles.skeleton} />
      </div>
    </AdReadyDashboardFrame>
  );
}

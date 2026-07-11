const REPORT_ROWS = [
  { label: "نمایش در نقشه", status: "مناسب", tone: "ok" },
  { label: "ساعات کاری", status: "نیاز به تکمیل", tone: "partial" },
  { label: "صفحه خدمات", status: "وجود ندارد", tone: "missing" },
  { label: "دکمه تماس", status: "مناسب", tone: "ok" },
] as const;

function StatusBadge({ tone, status }: { tone: "ok" | "partial" | "missing"; status: string }) {
  return <span className={`seo-audit-badge seo-audit-badge--${tone}`}>{status}</span>;
}

export default function SeoHeroMockup() {
  return (
    <div className="seo-hero-mockup" aria-label="نمونه گزارش بررسی حضور در گوگل">
      <div className="seo-serp-shell">
        <div className="seo-serp-main">
          <div className="seo-serp-searchbar">
            <span className="seo-serp-logo" aria-hidden="true">
              G
            </span>
            <span className="seo-serp-query">کلینیک پوست در سعادت‌آباد</span>
            <span className="seo-serp-search-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
          </div>

          <div className="seo-serp-map-pack">
            <div className="seo-serp-map-layout">
              <div className="seo-serp-map-tiles" aria-hidden="true">
                <span />
                <span />
                <span className="seo-serp-map-pin" />
              </div>
              <div className="seo-serp-map-listing">
                <p className="seo-serp-listing-name">کلینیک پوست آبتین</p>
                <p className="seo-serp-listing-meta">سعادت‌آباد، تهران · تماس · مسیر</p>
                <p className="seo-serp-listing-hours">شنبه تا پنجشنبه · ۱۰:۰۰ تا ۲۰:۰۰</p>
              </div>
            </div>
            <div className="seo-serp-result">
              <p className="seo-serp-result-url">clinic-abtin.ir</p>
              <p className="seo-serp-result-title">کلینیک پوست آبتین — نوبت آنلاین</p>
            </div>
          </div>
        </div>

        <aside className="seo-audit-panel">
          <span className="seo-audit-panel-badge">نمونه گزارش</span>
          <p className="seo-audit-panel-sub">نمونه‌ای از مواردی که بررسی می‌کنیم</p>
          <ul className="seo-audit-list">
            {REPORT_ROWS.map((row) => (
              <li key={row.label}>
                <span className="seo-audit-label">{row.label}</span>
                <StatusBadge tone={row.tone} status={row.status} />
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

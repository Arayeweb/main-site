export default function SeoHeroMockup() {
  return (
    <div className="seo-mockup" aria-hidden>
      <div className="seo-mockup-inner">
        <div className="seo-mockup-header">
          <span>مسیر واقعی مشتری</span>
          <span className="seo-mockup-live">زنده</span>
        </div>

        <div className="seo-mockup-flow">
          <div className="seo-mockup-card seo-mockup-card--search">
            <div className="seo-mockup-label seo-mockup-label--teal">۱ — جستجو</div>
            <div className="seo-mockup-search-bar">
              <span>دکتر پوست در سعادت‌آباد</span>
            </div>
            <div className="seo-mockup-result">
              <div className="seo-mockup-result-title">کلینیک پوست — نوبت آنلاین</div>
              <div className="seo-mockup-result-url">clinic-example.ir/dermatology/saadat</div>
            </div>
          </div>

          <div className="seo-mockup-connector" />

          <div className="seo-mockup-card">
            <div className="seo-mockup-label">۲ — لندینگ‌پیج</div>
            <div className="seo-mockup-lp-preview">
              <div className="seo-mockup-lp-block seo-mockup-lp-block--wide" />
              <div className="seo-mockup-lp-block" />
              <div className="seo-mockup-lp-block seo-mockup-lp-block--cta" />
            </div>
            <div className="seo-mockup-form">
              <input type="text" readOnly value="شماره تماس" tabIndex={-1} />
              <button type="button" tabIndex={-1}>
                درخواست نوبت
              </button>
            </div>
          </div>

          <div className="seo-mockup-connector" />

          <div className="seo-mockup-row">
            <div className="seo-mockup-card seo-mockup-card--lead">
              <div className="seo-mockup-label seo-mockup-label--blue">۳ — لید</div>
              <div className="seo-mockup-crm-name">سارا — درخواست مشاوره</div>
              <div className="seo-mockup-crm-meta">منبع: گوگل</div>
            </div>
            <div className="seo-mockup-card seo-mockup-card--crm">
              <div className="seo-mockup-label seo-mockup-label--teal">۴ — CRM</div>
              <div className="seo-mockup-crm-name">پیگیری — فردا ۱۰:۰۰</div>
              <div className="seo-mockup-crm-meta">وضعیت: در انتظار تماس</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

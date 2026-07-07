import { seoReportMetrics } from "@/lib/seoData";

export default function SeoProof() {
  return (
    <section id="proof" className="seo-report section-py scroll-mt-24">
      <div className="container-mx container-px">
        <div className="seo-report-layout">
          <div className="seo-report-copy">
            <span className="seo-section-tag">گزارش‌دهی</span>
            <h2>گزارشی که می‌فهمید — نه گزارشی که فقط سئوکار می‌فهمد</h2>
            <p>
              بعد از شروع پروژه، گزارش ماهانه به جای اعداد پیچیده سئو، این‌ها را نشان
              می‌دهد: چند لید، چند تماس، کدام صفحه کار کرده.
            </p>
            <p className="seo-report-honest">
              اعداد واقعی پس از اتصال سیستم تحلیل — نه قبل از شروع پروژه.
            </p>
          </div>

          <div className="seo-report-preview" aria-hidden>
            <div className="seo-report-preview-head">
              <span>گزارش ماهانه — نمونه ساختار</span>
              <span className="seo-report-preview-tag">پس از شروع پروژه</span>
            </div>
            <div className="seo-report-metrics">
              {seoReportMetrics.map((m) => (
                <div key={m.label} className="seo-report-metric">
                  <span className="seo-report-metric-label">{m.label}</span>
                  <span className="seo-report-metric-value">{m.value}</span>
                </div>
              ))}
            </div>
            <div className="seo-report-rows">
              <div className="seo-report-row">
                <span>صفحه «دکتر پوست سعادت‌آباد»</span>
                <span className="seo-report-row-val">—</span>
              </div>
              <div className="seo-report-row">
                <span>فرم مشاوره از گوگل</span>
                <span className="seo-report-row-val">—</span>
              </div>
              <div className="seo-report-row">
                <span>تماس مستقیم از جستجو</span>
                <span className="seo-report-row-val">—</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

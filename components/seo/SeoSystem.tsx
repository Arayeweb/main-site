import { seoSystemSteps } from "@/lib/seoData";

export default function SeoSystem() {
  return (
    <section id="system" className="seo-system-section section-py bg-navy-50/40 scroll-mt-24">
      <div className="container-mx container-px">
        <div className="seo-system-header">
          <span className="seo-section-tag">سیستم عملیاتی</span>
          <h2>پنج مرحله‌ای که سئو را به فروش وصل می‌کند</h2>
          <p>نه یک چک‌لیست مقاله — یک مسیر اجرایی با خروجی لید.</p>
        </div>

        <div className="seo-system-pipeline">
          {seoSystemSteps.map((step) => (
            <article key={step.num} className="seo-system-card">
              <span className="seo-system-num">{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

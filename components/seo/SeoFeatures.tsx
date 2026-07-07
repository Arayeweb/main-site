import { seoOutcomes } from "@/lib/seoData";

export default function SeoFeatures() {
  return (
    <section id="features" className="seo-outcomes section-py scroll-mt-24">
      <div className="container-mx container-px">
        <div className="seo-outcomes-header">
          <span className="seo-section-tag">خروجی واقعی</span>
          <h2>چه چیزی بعد از همکاری با آرایه عوض می‌شود</h2>
        </div>

        <div className="seo-outcomes-grid">
          {seoOutcomes.map((o, i) => (
            <article key={o.title} className="seo-outcome-card">
              <span className="seo-outcome-num">۰{ i + 1}</span>
              <h3>{o.title}</h3>
              <p className="seo-outcome-result">{o.result}</p>
              <p className="seo-outcome-detail">{o.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

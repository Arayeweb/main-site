import { seoCompareRows } from "@/lib/seoData";

export default function SeoCompareTable() {
  return (
    <section className="seo-compare-section section-py">
      <div className="container-mx container-px">
        <div className="seo-compare-header">
          <span className="seo-section-tag">تفاوت روشن</span>
          <h2>آژانس سئو در برابر سیستم سرچ تا لید آرایه</h2>
        </div>

        <div className="seo-compare-cards">
          <div className="seo-compare-col seo-compare-col--generic">
            <h3>آژانس سئوی معمولی</h3>
            <ul>
              {seoCompareRows.map((row) => (
                <li key={row.label}>
                  <span className="seo-compare-key">{row.label}</span>
                  <span>{row.generic}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="seo-compare-col seo-compare-col--araaye">
            <h3>سئوی آرایه</h3>
            <ul>
              {seoCompareRows.map((row) => (
                <li key={row.label}>
                  <span className="seo-compare-key">{row.label}</span>
                  <span>{row.araaye}</span>
                </li>
              ))}
            </ul>
            <a href="#lead-form" className="seo-btn-primary seo-compare-cta">
              مشاوره رایگان بگیرید
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

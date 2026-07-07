import { seoNiches } from "@/lib/seoData";

export default function SeoNiches() {
  return (
    <section id="niches" className="seo-niches section-py scroll-mt-24">
      <div className="container-mx container-px">
        <div className="seo-niches-header">
          <span className="seo-section-tag">مناسب چه کسب‌وکارهایی</span>
          <h2>هر جا مشتری در گوگل جستجو می‌کند</h2>
        </div>

        <div className="seo-niche-grid">
          {seoNiches.map((niche) => (
            <article key={niche.title} className="seo-niche-card">
              <h3>{niche.title}</h3>
              <p className="seo-niche-search">«{niche.exampleSearch}»</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

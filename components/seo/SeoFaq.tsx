import { seoFaq } from "@/lib/seoData";

export default function SeoFaq() {
  return (
    <section id="faq" className="seo-faq section-py scroll-mt-24">
      <div className="container-mx container-px">
        <div className="seo-faq-header">
          <span className="seo-section-tag">سؤالات قبل از شروع</span>
          <h2>قبل از شروع چه چیزهایی باید بدانید؟</h2>
        </div>

        <div className="seo-faq-list">
          {seoFaq.map((item) => (
            <details
              key={item.q}
              className="seo-faq-item"
              open={item.openByDefault || undefined}
            >
              <summary className="seo-faq-question">{item.q}</summary>
              <p className="seo-faq-answer">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

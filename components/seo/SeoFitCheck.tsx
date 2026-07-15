import { seoSuitableFor, seoNotSuitableFor } from "@/lib/seoData";
import { IconCheck } from "@/components/icons";

export default function SeoFitCheck() {
  return (
    <section className="seo-fit section-py" aria-label="مناسب بودن سئو آرایه">
      <div className="container-mx container-px">
        <div className="seo-fit-header">
          <span className="seo-section-tag">مناسب بودن</span>
          <h2>آیا سئو آرایه برای شما مناسب است؟</h2>
        </div>

        <div className="seo-fit-grid">
          <article className="seo-fit-card seo-fit-card--yes">
            <h3>مناسب است اگر…</h3>
            <ul>
              {seoSuitableFor.map((item) => (
                <li key={item}>
                  <IconCheck size={14} aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="seo-fit-card seo-fit-card--no">
            <h3>مناسب نیست اگر…</h3>
            <ul>
              {seoNotSuitableFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

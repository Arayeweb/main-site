import { seoFlowSteps } from "@/lib/seoData";

export default function SeoFlow() {
  return (
    <section id="flow" className="seo-flow section-py scroll-mt-24">
      <div className="container-mx container-px">
        <div className="seo-flow-header">
          <span className="seo-section-tag seo-section-tag--light">تمایز آرایه</span>
          <h2>مسیر سرچ تا لید — آنچه آژانس سئو انجام نمی‌دهد</h2>
          <p>
            سئوی درست فقط کاربر را وارد سایت نمی‌کند. مسیر بعد از ورود را هم طراحی
            می‌کند: لندینگ، لید، CRM، فروش.
          </p>
        </div>

        <div className="seo-flow-pipeline">
          {seoFlowSteps.map((step, i) => (
            <article key={step.label} className="seo-flow-card">
              <div className="seo-flow-card-top">
                <span className="seo-flow-label">{step.label}</span>
                <span className="seo-flow-num">{i + 1}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {i < seoFlowSteps.length - 1 && (
                <span className="seo-flow-card-arrow" aria-hidden>
                  ←
                </span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import { seoProblems } from "@/lib/seoData";

export default function SeoProblem() {
  return (
    <section className="seo-problem section-py" aria-label="مشکلاتی که آرایه شناسایی می‌کند">
      <div className="container-mx container-px">
        <div className="seo-problem-layout">
          <div className="seo-problem-intro">
            <span className="seo-section-tag">مشکلات رایج</span>
            <h2>وقتی سئو فقط به رتبه فکر کند، مشتری گم می‌شود</h2>
            <p>
              آرایه قبل از اجرا مشخص می‌کند کدام جست‌وجوها واقعاً می‌توانند به تماس،
              درخواست یا فروش منجر شوند — و کجا مسیر تبدیل شکسته است.
            </p>
          </div>

          <div className="seo-problem-list">
            {seoProblems.map((p, i) => (
              <article key={p.title} className="seo-problem-item">
                <span className="seo-problem-index">{i + 1}</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

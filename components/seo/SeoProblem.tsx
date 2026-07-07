import { seoProblems } from "@/lib/seoData";

export default function SeoProblem() {
  return (
    <section className="seo-problem section-py">
      <div className="container-mx container-px">
        <div className="seo-problem-layout">
          <div className="seo-problem-intro">
            <span className="seo-section-tag">چرا سئوی معمولی جواب نمی‌دهد</span>
            <h2>
              بازدید از گوگل می‌آید.
              <br />
              <em>مشتری نمی‌آید.</em>
            </h2>
            <p>
              مشکل اکثر کسب‌وکارها رتبه پایین نیست — مسیر بعد از ورود کاربر طراحی نشده:
              صفحه درست، فرم درست، CRM درست.
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

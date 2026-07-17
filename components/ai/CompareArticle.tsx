import Link from "next/link";
import {
  type ComparePageDef,
  compareTryHref,
  formatCompareLastUpdated,
  getComparePage,
  getComparePagePath,
} from "@/lib/aiComparePageData";
import CompareLiveWidget from "./CompareLiveWidget";

function ScoreBar({ score }: { score: number }) {
  return (
    <span className="ar-compare-score" aria-label={`${score} از ۵`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`ar-compare-score-dot${i < score ? " is-on" : ""}`}
          aria-hidden
        />
      ))}
    </span>
  );
}

export default function CompareArticle({ page }: { page: ComparePageDef }) {
  const tryHref = compareTryHref(page.modelAId, page.modelBId);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <article className="ar-compare-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <nav className="ar-compare-breadcrumb" aria-label="مسیر صفحه">
        <Link href="/ai">هوش مصنوعی آرایه</Link>
        <span aria-hidden> / </span>
        <Link href="/ai/compare">مقایسه هوش مصنوعی</Link>
        <span aria-hidden> / </span>
        <span>{page.modelALabel.split(" ")[0]} vs {page.modelBLabel.split(" ")[0]}</span>
      </nav>

      <header className="ar-compare-hero">
        <p className="ar-compare-eyebrow">مقایسه هوش مصنوعی</p>
        <h1>{page.h1}</h1>
        <p className="ar-compare-lead">{page.description}</p>
        <p className="ar-compare-updated">
          آخرین به‌روزرسانی: {formatCompareLastUpdated(page.lastUpdated)}
        </p>
        <div className="ar-compare-hero-cta">
          <Link href={tryHref} className="ar-btn ar-btn-primary">
            امتحان زنده در آرایه
          </Link>
          <Link href="/ai/compare" className="ar-btn ar-btn-ghost">
            همه مقایسه‌ها
          </Link>
        </div>
      </header>

      <section className="ar-compare-section" aria-labelledby="compare-table-title">
        <h2 id="compare-table-title">جدول مقایسه ابعاد</h2>
        <p className="ar-compare-disclaimer">
          امتیازها ویرایشی و نسبی‌اند (۱ تا ۵) و جایگزین بنچمارک رسمی نیستند — برای تصمیم
          نهایی از مقایسه زنده استفاده کنید.
        </p>
        <div className="ar-compare-table-wrap">
          <table className="ar-compare-table">
            <thead>
              <tr>
                <th scope="col">بُعد</th>
                <th scope="col">{page.modelALabel}</th>
                <th scope="col">{page.modelBLabel}</th>
              </tr>
            </thead>
            <tbody>
              {page.dimensions.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>
                    <ScoreBar score={row.scores[0]} />
                  </td>
                  <td>
                    <ScoreBar score={row.scores[1]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ar-compare-section" aria-labelledby="compare-best-title">
        <h2 id="compare-best-title">کدام مدل برای چه کاری؟</h2>
        <ul className="ar-compare-best-list">
          {page.bestFor.map((item) => (
            <li key={item.useCase}>
              <strong>{item.model === "A" ? page.modelALabel : page.modelBLabel}:</strong>{" "}
              {item.useCase}
            </li>
          ))}
        </ul>
      </section>

      <section className="ar-compare-section" aria-labelledby="compare-sample-title">
        <h2 id="compare-sample-title">نمونه پاسخ</h2>
        <p className="ar-compare-sample-prompt">
          <strong>پرامپت:</strong> {page.samplePrompt}
        </p>
        <div className="ar-compare-sample-grid">
          {page.sampleAnswers.map((ans) => (
            <figure key={ans.label} className="ar-compare-sample-card">
              <figcaption>{ans.label}</figcaption>
              <blockquote>{ans.text}</blockquote>
            </figure>
          ))}
        </div>
      </section>

      <section className="ar-compare-section" aria-labelledby="compare-live-title">
        <h2 id="compare-live-title">مقایسه زنده</h2>
        <p>
          همان پرامپت را به {page.modelALabel} و {page.modelBLabel} بدهید و پاسخ واقعی را
          ببینید.
        </p>
        <CompareLiveWidget
          modelAId={page.modelAId}
          modelBId={page.modelBId}
          samplePrompt={page.samplePrompt}
          tryHref={tryHref}
        />
      </section>

      {page.faq.length > 0 && (
        <section className="ar-compare-section" aria-labelledby="compare-faq-title">
          <h2 id="compare-faq-title">سؤالات متداول</h2>
          <dl className="ar-compare-faq">
            {page.faq.map((item) => (
              <div key={item.q}>
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="ar-compare-section" aria-labelledby="compare-related-title">
        <h2 id="compare-related-title">مقایسه‌های مرتبط</h2>
        <ul className="ar-compare-related">
          {page.relatedSlugs.map((slug) => {
            const related = getComparePage(slug);
            if (!related) return null;
            return (
              <li key={slug}>
                <Link href={getComparePagePath(slug)}>{related.h1}</Link>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="ar-compare-footer-cta">
        <Link href={tryHref} className="ar-btn ar-btn-primary">
          شروع مقایسه در هوش مصنوعی آرایه
        </Link>
        <Link href="/ai/pricing" className="ar-btn ar-btn-ghost">
          مشاهده قیمت‌ها
        </Link>
      </footer>
    </article>
  );
}

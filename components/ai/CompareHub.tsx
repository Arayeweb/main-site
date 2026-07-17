import Link from "next/link";
import {
  COMPARE_HUB,
  COMPARE_PAGES,
  FEATURED_COMPARE_FOR_HUB,
  getComparePagePath,
} from "@/lib/aiComparePageData";

export default function CompareHub() {
  const pairs = COMPARE_PAGES.filter((p) => p.kind === "pair");
  const usecases = COMPARE_PAGES.filter((p) => p.kind === "usecase");

  return (
    <div className="ar-compare-hub">
      <nav className="ar-compare-breadcrumb" aria-label="مسیر صفحه">
        <Link href="/ai">هوش مصنوعی آرایه</Link>
        <span aria-hidden> / </span>
        <span>مقایسه هوش مصنوعی</span>
      </nav>

      <header className="ar-compare-hero">
        <p className="ar-compare-eyebrow">کلاستر مقایسه</p>
        <h1>{COMPARE_HUB.h1}</h1>
        <p className="ar-compare-lead">{COMPARE_HUB.description}</p>
        <div className="ar-compare-hero-cta">
          <Link href="/ai?mode=compare" className="ar-btn ar-btn-primary">
            شروع مقایسه در آرایه
          </Link>
          <Link href="/ai/features#models" className="ar-btn ar-btn-ghost">
            دیدن مدل‌ها
          </Link>
        </div>
      </header>

      <section className="ar-compare-section" aria-labelledby="hub-models-title">
        <h2 id="hub-models-title">مدل‌های اصلی</h2>
        <ul className="ar-compare-model-grid">
          {FEATURED_COMPARE_FOR_HUB.map((m) => (
            <li key={m.id} className="ar-compare-model-card">
              <span
                className="ar-compare-model-swatch"
                style={{ background: m.color }}
                aria-hidden
              />
              <strong>{m.name}</strong>
              <span>{m.blurb}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ar-compare-section" aria-labelledby="hub-pairs-title">
        <h2 id="hub-pairs-title">مقایسه‌های دوتایی</h2>
        <ul className="ar-compare-card-grid">
          {pairs.map((p) => (
            <li key={p.slug}>
              <Link href={getComparePagePath(p.slug)} className="ar-compare-card">
                <strong>{p.modelALabel.split("(")[0].trim()} در برابر {p.modelBLabel.split("(")[0].trim()}</strong>
                <span>{p.cardBlurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="ar-compare-section" aria-labelledby="hub-use-title">
        <h2 id="hub-use-title">بهترین مدل برای هر کاربرد</h2>
        <ul className="ar-compare-card-grid">
          {usecases.map((p) => (
            <li key={p.slug}>
              <Link href={getComparePagePath(p.slug)} className="ar-compare-card">
                <strong>{p.h1.replace(" کدام است؟", "")}</strong>
                <span>{p.cardBlurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="ar-compare-footer-cta">
        <Link href="/ai" className="ar-btn ar-btn-primary">
          ورود به هوش مصنوعی آرایه
        </Link>
        <Link href="/ai/pricing" className="ar-btn ar-btn-ghost">
          قیمت‌گذاری
        </Link>
      </footer>
    </div>
  );
}

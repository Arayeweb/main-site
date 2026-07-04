import Link from "next/link";

type FaqItem = { q: string; a: string };

export default function FeatureLearnLayout({
  title,
  subtitle,
  ctaHref,
  ctaLabel,
  children,
  faq,
}: {
  title: string;
  subtitle: string;
  ctaHref: string;
  ctaLabel: string;
  children: React.ReactNode;
  faq?: FaqItem[];
}) {
  const jsonLd = faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      }
    : null;

  return (
    <main className="ar-container ar-learn-page">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <header className="ar-learn-hero">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <Link href={ctaHref} className="ar-btn ar-btn-primary">
          {ctaLabel}
        </Link>
      </header>
      <div className="ar-learn-body">{children}</div>
      {faq && faq.length > 0 && (
        <section className="ar-learn-faq" aria-labelledby="learn-faq-title">
          <h2 id="learn-faq-title">سؤالات متداول</h2>
          <dl>
            {faq.map((item) => (
              <div key={item.q}>
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </main>
  );
}

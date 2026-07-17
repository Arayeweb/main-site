import Link from "next/link";
import type { IntentLandingDef } from "@/lib/aiIntentLandings";
import { buildAiIntentJsonLd } from "@/lib/aiIntentLandings";
import AiMarketingNav from "./AiMarketingNav";
import AiIntentAnalytics from "./AiIntentAnalytics";
import AiIntentStickyCta from "./AiIntentStickyCta";
import AiIntentMockup from "./AiIntentMockup";
import AiCompareDemo from "./AiCompareDemo";
import AiIntentCtaLink from "./AiIntentCtaLink";
import AiIntentPromptList from "./AiIntentPromptList";

export default function AiIntentLanding({ def }: { def: IntentLandingDef }) {
  const jsonLd = buildAiIntentJsonLd(def);
  const mockCards = def.mockup.cards ?? [];

  return (
    <div className="ail-root">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AiIntentAnalytics landingType={def.landingType} />
      <AiMarketingNav landingType={def.landingType} />

      <main className="ail-main" id="ail-main">
        <nav className="ail-breadcrumb" aria-label="مسیر صفحه">
          <Link href="/ai">هوش مصنوعی آرایه</Link>
          <span aria-hidden> / </span>
          <span>{def.breadcrumbLabel}</span>
        </nav>

        <header className="ail-hero">
          <p className="ail-eyebrow">{def.hero.eyebrow}</p>
          <h1>{def.hero.h1}</h1>
          <p className="ail-hero-sub">{def.hero.sub}</p>
          <div className="ail-cta-row">
            <AiIntentCtaLink
              landingType={def.landingType}
              cta="primary"
              href={def.hero.primaryCta.href}
              className="ar-btn ar-btn-primary"
            >
              {def.hero.primaryCta.label}
            </AiIntentCtaLink>
            <AiIntentCtaLink
              landingType={def.landingType}
              cta="secondary"
              href={def.hero.secondaryCta.href}
              className="ar-btn ar-btn-ghost"
            >
              {def.hero.secondaryCta.label}
            </AiIntentCtaLink>
          </div>
        </header>

        <section className="ail-section" aria-labelledby="ail-problem">
          <h2 id="ail-problem">{def.problem.title}</h2>
          <p className="ail-lead">{def.problem.body}</p>
        </section>

        <section className="ail-section" aria-labelledby="ail-usecases">
          <h2 id="ail-usecases">{def.useCases.title}</h2>
          <ul className="ail-usecase-grid">
            {def.useCases.items.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.desc}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="ail-section" aria-labelledby="ail-mockup">
          <h2 id="ail-mockup">نمونه خروجی</h2>
          <AiIntentMockup caption={def.mockup.caption} cards={mockCards} />
        </section>

        {def.compareDemo && (
          <section className="ail-section" aria-labelledby="ail-demo">
            <h2 id="ail-demo">دموی مقایسه</h2>
            <p className="ail-lead">
              یک پرامپت نمونه و سه پاسخ متفاوت — برای حس واقعی اختلاف مدل‌ها.
            </p>
            <AiCompareDemo
              landingType={def.landingType}
              prompt={def.compareDemo.prompt}
              answers={def.compareDemo.answers}
            />
          </section>
        )}

        <section className="ail-section" aria-labelledby="ail-modes">
          <h2 id="ail-modes">{def.modes.title}</h2>
          <div className="ail-modes">
            <article>
              <h3>Direct</h3>
              <p>{def.modes.direct}</p>
            </article>
            <article>
              <h3>Compare</h3>
              <p>{def.modes.compare}</p>
            </article>
            <article>
              <h3>Council</h3>
              <p>{def.modes.council}</p>
            </article>
          </div>
        </section>

        {def.beforeAfter && (
          <section className="ail-section" aria-labelledby="ail-ba">
            <h2 id="ail-ba">{def.beforeAfter.title}</h2>
            <div className="ail-before-after">
              <div>
                <span>قبل</span>
                <strong>{def.beforeAfter.before}</strong>
              </div>
              <div className="is-after">
                <span>بعد</span>
                <strong>{def.beforeAfter.after}</strong>
              </div>
            </div>
          </section>
        )}

        <section className="ail-section" aria-labelledby="ail-prompts">
          <h2 id="ail-prompts">{def.prompts.title}</h2>
          <AiIntentPromptList
            landingType={def.landingType}
            items={def.prompts.items}
          />
        </section>

        <section className="ail-section" aria-labelledby="ail-vs">
          <h2 id="ail-vs">{def.vsTable.title}</h2>
          <div className="ail-table-wrap">
            <table className="ail-table">
              <thead>
                <tr>
                  {def.vsTable.headers.map((h) => (
                    <th key={h} scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {def.vsTable.rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell) => (
                      <td key={cell}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="ail-section" aria-labelledby="ail-steps">
          <h2 id="ail-steps">{def.steps.title}</h2>
          <ol className="ail-steps">
            {def.steps.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="ail-section" aria-labelledby="ail-faq">
          <h2 id="ail-faq">سؤالات متداول</h2>
          <dl className="ail-faq">
            {def.faq.map((item) => (
              <div key={item.q}>
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
          {def.disclaimer && <p className="ail-disclaimer">{def.disclaimer}</p>}
        </section>

        <section className="ail-section" aria-labelledby="ail-related">
          <h2 id="ail-related">صفحه‌های مرتبط</h2>
          <ul className="ail-related">
            {def.related.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            {def.blogLink && (
              <li>
                <Link href={def.blogLink.href}>{def.blogLink.label}</Link>
              </li>
            )}
          </ul>
        </section>

        {def.pairLinks && def.pairLinks.length > 0 && (
          <section className="ail-section" aria-labelledby="ail-pairs">
            <h2 id="ail-pairs">مقایسه‌های جزئی‌تر</h2>
            <ul className="ail-pair-grid">
              {def.pairLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="ail-final" aria-labelledby="ail-final-title">
          <h2 id="ail-final-title">همین حالا شروع کن</h2>
          <p>با اعتبار اولیه وارد شو و اولین سؤال را امتحان کن.</p>
          <div className="ail-cta-row" style={{ justifyContent: "center" }}>
            <AiIntentCtaLink
              landingType={def.landingType}
              cta="primary"
              href={def.hero.primaryCta.href}
              className="ar-btn ar-btn-primary"
              placement="footer"
            >
              {def.hero.primaryCta.label}
            </AiIntentCtaLink>
            <AiIntentCtaLink
              landingType={def.landingType}
              cta="secondary"
              href={def.hero.secondaryCta.href}
              className="ar-btn ar-btn-ghost"
              placement="footer"
            >
              {def.hero.secondaryCta.label}
            </AiIntentCtaLink>
          </div>
        </section>
      </main>

      <AiIntentStickyCta
        landingType={def.landingType}
        primaryHref={def.hero.primaryCta.href}
        secondaryHref={def.hero.secondaryCta.href}
      />
    </div>
  );
}

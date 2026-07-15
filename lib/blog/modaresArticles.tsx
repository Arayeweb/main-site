import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { canonicalUrl } from "@/lib/siteUrl";

export type ModaresBlogSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type ModaresBlogArticle = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: ModaresBlogSection[];
  ctaLabel: string;
  relatedLinks?: { href: string; label: string }[];
  datePublished: string;
};

export function modaresArticleMetadata(article: ModaresBlogArticle): Metadata {
  const path = `/blog/${article.slug}`;
  const url = canonicalUrl(path);
  return {
    title: { absolute: article.title },
    description: article.description,
    alternates: { canonical: path },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: "article",
      locale: "fa_IR",
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export function modaresArticleJsonLd(article: ModaresBlogArticle) {
  const url = canonicalUrl(`/blog/${article.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: article.title,
        description: article.description,
        inLanguage: "fa-IR",
        datePublished: article.datePublished,
        dateModified: article.datePublished,
        author: { "@type": "Organization", name: "آرایه" },
        publisher: {
          "@type": "Organization",
          name: "آرایه",
          logo: { "@type": "ImageObject", url: canonicalUrl("/assets/og-cover.svg") },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "آرایه", item: canonicalUrl("/") },
          { "@type": "ListItem", position: 2, name: "بلاگ", item: canonicalUrl("/blog") },
          { "@type": "ListItem", position: 3, name: article.h1, item: url },
        ],
      },
    ],
  };
}

export function ModaresBlogArticlePage({ article }: { article: ModaresBlogArticle }) {
  const jsonLd = modaresArticleJsonLd(article);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar ctaHref="/modares" ctaLabel={article.ctaLabel} />
      <main className="pb-16">
        <article className="container-mx container-px mx-auto pt-12">
          <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8">
            <nav className="text-sm text-navy-500" aria-label="مسیر صفحه">
              <Link href="/" className="hover:text-navy-900">
                آرایه
              </Link>
              <span className="px-2">/</span>
              <Link href="/blog" className="hover:text-navy-900">
                بلاگ
              </Link>
              <span className="px-2">/</span>
              <span>{article.h1}</span>
            </nav>

            <h1 className="mt-4 text-balance text-2xl font-extrabold text-navy-900 sm:text-3xl">
              {article.h1}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-navy-600 sm:text-base">{article.intro}</p>

            {article.sections.map((section) => (
              <section key={section.title} className="mt-8">
                <h2 className="text-lg font-extrabold text-navy-900">{section.title}</h2>
                {section.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)} className="mt-3 text-sm leading-relaxed text-navy-600">
                    {p}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="mt-3 list-disc space-y-2 pr-5 text-sm text-navy-600">
                    {section.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <div className="mt-10 rounded-2xl border border-teal-100 bg-teal-50/40 p-5">
              <p className="text-sm font-bold text-navy-900">{article.ctaLabel}</p>
              <Link href="/modares" className="btn-primary mt-3 inline-flex px-5 py-2.5">
                مشاهده نمونه سایت مستقل مدرس
              </Link>
            </div>

            {article.relatedLinks && article.relatedLinks.length > 0 ? (
              <section className="mt-8">
                <h2 className="text-sm font-extrabold text-navy-900">مطالب مرتبط</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {article.relatedLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="font-bold text-teal-700 hover:text-teal-800">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

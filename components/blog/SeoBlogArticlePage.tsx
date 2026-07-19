import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  DEFAULT_ARTICLE_AUTHOR,
  type SeoBlogArticle,
} from "@/lib/blog/seoArticleTypes";
import { getBlogCluster } from "@/lib/blog/clusters";
import { canonicalUrl } from "@/lib/siteUrl";
import {
  ORGANIZATION_ID,
  SITE_LOGO_URL,
  SITE_NAME,
} from "@/lib/seo/siteIdentity";

export function seoBlogArticleMetadata(article: SeoBlogArticle): Metadata {
  const path = `/blog/${article.slug}`;
  const url = canonicalUrl(path);
  const title = article.metaTitle ?? article.title;
  const description = article.metaDescription ?? article.description;
  const indexable = article.indexStatus !== "noindex";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      locale: "fa_IR",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: article.featuredImage
        ? [{ url: canonicalUrl(article.featuredImage) }]
        : [{ url: canonicalUrl("/assets/og-cover.svg") }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: indexable,
      follow: true,
      googleBot: { index: indexable, follow: true },
    },
  };
}

export function seoBlogArticleJsonLd(article: SeoBlogArticle) {
  const url = canonicalUrl(`/blog/${article.slug}`);
  const image = article.featuredImage
    ? canonicalUrl(article.featuredImage)
    : canonicalUrl("/assets/og-cover.svg");
  const author = article.author ?? DEFAULT_ARTICLE_AUTHOR;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "BlogPosting",
      headline: article.h1,
      description: article.description,
      inLanguage: "fa-IR",
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      author: {
        "@type": "Person",
        name: author.name,
      },
      publisher: {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: SITE_NAME,
        logo: {
          "@type": "ImageObject",
          url: SITE_LOGO_URL,
        },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      image,
      ...(article.primaryKeyword ? { keywords: article.primaryKeyword } : {}),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: buildBreadcrumbList(article, url),
    },
  ];

  if (article.faq && article.faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: article.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

function buildBreadcrumbList(article: SeoBlogArticle, url: string) {
  const items: { "@type": "ListItem"; position: number; name: string; item: string }[] = [
    { "@type": "ListItem", position: 1, name: "آرایه", item: canonicalUrl("/") },
    { "@type": "ListItem", position: 2, name: "بلاگ", item: canonicalUrl("/blog") },
  ];

  if (article.clusterHub) {
    const hub = getBlogCluster(article.clusterHub);
    items.push({
      "@type": "ListItem",
      position: 3,
      name: article.clusterHub === "doctors" ? "پزشکان" : "هوش مصنوعی",
      item: canonicalUrl(hub.path),
    });
    items.push({
      "@type": "ListItem",
      position: 4,
      name: article.h1,
      item: url,
    });
  } else {
    items.push({
      "@type": "ListItem",
      position: 3,
      name: article.h1,
      item: url,
    });
  }

  return items;
}

function formatIsoDateFa(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function SeoBlogArticlePage({ article }: { article: SeoBlogArticle }) {
  const jsonLd = seoBlogArticleJsonLd(article);
  const author = article.author ?? DEFAULT_ARTICLE_AUTHOR;
  const publishedLabel = article.publishedLabel ?? formatIsoDateFa(article.publishedAt);
  const updatedLabel = article.updatedLabel ?? formatIsoDateFa(article.updatedAt);
  const ctaHref = article.primaryCTA.href;
  const hub = article.clusterHub ? getBlogCluster(article.clusterHub) : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar
        ctaHref={article.primaryLandingPage ?? ctaHref}
        ctaLabel={article.primaryCTA.label}
      />
      <main className="pb-16">
        <article className="container-mx container-px mx-auto pt-12">
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-10">
            <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8">
              <nav className="text-sm text-navy-500" aria-label="مسیر صفحه">
                <Link href="/" className="hover:text-navy-900">
                  آرایه
                </Link>
                <span className="px-2">/</span>
                <Link href="/blog" className="hover:text-navy-900">
                  بلاگ
                </Link>
                {hub ? (
                  <>
                    <span className="px-2">/</span>
                    <Link href={hub.path} className="hover:text-navy-900">
                      {article.clusterHub === "doctors" ? "پزشکان" : "هوش مصنوعی"}
                    </Link>
                  </>
                ) : null}
                <span className="px-2">/</span>
                <span>{article.h1}</span>
              </nav>

              <p className="mt-4 inline-flex rounded-lg bg-navy-50 px-2.5 py-1 text-xs font-bold text-navy-700">
                {article.category}
              </p>

              <h1 className="mt-3 text-balance text-2xl font-extrabold text-navy-900 sm:text-3xl">
                {article.h1}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-navy-600 sm:text-base">
                {article.excerpt}
              </p>

              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-y border-navy-100 py-4 text-xs text-navy-500 sm:text-sm">
                <span>
                  نویسنده: <strong className="font-bold text-navy-800">{author.name}</strong>
                </span>
                {article.reviewer ? (
                  <span>
                    بازبین:{" "}
                    <strong className="font-bold text-navy-800">{article.reviewer.name}</strong>
                  </span>
                ) : null}
                <span>انتشار: {publishedLabel}</span>
                <span>به‌روزرسانی: {updatedLabel}</span>
                <span>{article.readTime}</span>
              </div>

              {article.featuredImage ? (
                <div className="relative mt-6 aspect-[1280/560] overflow-hidden rounded-2xl bg-navy-50">
                  <Image
                    src={article.featuredImage}
                    alt={article.featuredImageAlt ?? article.h1}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 760px"
                    priority
                  />
                </div>
              ) : null}

              <div
                className="legacy-article-body mt-8"
                dangerouslySetInnerHTML={{ __html: article.contentHtml }}
              />

              {article.sources && article.sources.length > 0 ? (
                <section className="mt-10 border-t border-navy-100 pt-8" aria-labelledby="sources-heading">
                  <h2 id="sources-heading" className="text-lg font-extrabold text-navy-900">
                    منابع
                  </h2>
                  <ul className="mt-4 list-disc space-y-2 pr-5 text-sm text-navy-600">
                    {article.sources.map((source) => (
                      <li key={source.label}>
                        {source.href ? (
                          <a
                            href={source.href}
                            className="font-bold text-teal-700 hover:text-teal-800"
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {source.label}
                          </a>
                        ) : (
                          source.label
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {article.faq && article.faq.length > 0 ? (
                <section className="mt-10 border-t border-navy-100 pt-8" aria-labelledby="faq-heading">
                  <h2 id="faq-heading" className="text-lg font-extrabold text-navy-900">
                    سؤالات متداول
                  </h2>
                  <div className="mt-4 space-y-4">
                    {article.faq.map((item) => (
                      <div key={item.question}>
                        <h3 className="text-base font-extrabold text-navy-900">{item.question}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-navy-600">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="mt-10 rounded-2xl bg-navy-900 p-6 text-white sm:p-8">
                <h2 className="text-xl font-extrabold sm:text-2xl">{article.primaryCTA.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  {article.primaryCTA.description}
                </p>
                <Link
                  href={article.primaryCTA.href}
                  className="mt-5 inline-flex rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-400"
                >
                  {article.primaryCTA.label}
                </Link>
              </section>

              {article.relatedPosts && article.relatedPosts.length > 0 ? (
                <section className="mt-10 border-t border-navy-100 pt-8" aria-labelledby="related-heading">
                  <h2 id="related-heading" className="text-lg font-extrabold text-navy-900">
                    مقالات مرتبط
                  </h2>
                  <ul className="mt-4 space-y-2 text-sm">
                    {article.relatedPosts.map((link) => (
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

            {article.tableOfContents.length > 0 ? (
              <aside className="mt-8 hidden lg:mt-0 lg:block">
                <div className="sticky top-24 rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
                  <p className="text-xs font-bold tracking-wide text-navy-400">فهرست مطالب</p>
                  <nav className="mt-3 space-y-2" aria-label="فهرست مطالب">
                    {article.tableOfContents.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="block text-sm leading-snug text-navy-600 transition-colors hover:text-brand-700"
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                  {hub ? (
                    <Link
                      href={hub.path}
                      className="mt-5 block border-t border-navy-100 pt-4 text-sm font-bold text-brand-700 hover:text-brand-600"
                    >
                      بازگشت به {hub.h1}
                    </Link>
                  ) : null}
                </div>
              </aside>
            ) : null}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

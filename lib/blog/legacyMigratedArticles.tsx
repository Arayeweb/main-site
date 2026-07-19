import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { canonicalUrl } from "@/lib/siteUrl";
import { getBlogCluster } from "@/lib/blog/clusters";

export type LegacyMigratedArticle = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  datePublished: string;
  dateModified?: string;
  coverSrc?: string;
  coverAlt?: string;
  authorName?: string;
  reviewerName?: string;
  readTime?: string;
  category?: string;
  clusterHub?: "doctors" | "ai";
  faq?: { question: string; answer: string }[];
  sources?: { label: string; href?: string }[];
  tableOfContents?: { id: string; label: string }[];
  primaryCTA?: { title: string; description: string; href: string; label: string };
  relatedLinks?: { href: string; label: string }[];
  bodyHtml: string;
};

export function legacyMigratedArticleMetadata(article: LegacyMigratedArticle): Metadata {
  const path = `/blog/${article.slug}`;
  const url = canonicalUrl(path);
  return {
    title: { absolute: article.title },
    description: article.description,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: "article",
      locale: "fa_IR",
      images: article.coverSrc
        ? [{ url: canonicalUrl(article.coverSrc) }]
        : [{ url: canonicalUrl("/assets/og-cover.svg") }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

function legacyBreadcrumbItems(article: LegacyMigratedArticle, url: string) {
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
    items.push({ "@type": "ListItem", position: 4, name: article.h1, item: url });
  } else {
    items.push({ "@type": "ListItem", position: 3, name: article.h1, item: url });
  }
  return items;
}

export function legacyMigratedArticleJsonLd(article: LegacyMigratedArticle) {
  const url = canonicalUrl(`/blog/${article.slug}`);
  const image = article.coverSrc
    ? canonicalUrl(article.coverSrc)
    : canonicalUrl("/assets/og-cover.svg");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: article.title,
        description: article.description,
        inLanguage: "fa-IR",
        datePublished: article.datePublished,
        dateModified: article.dateModified ?? article.datePublished,
        author: article.authorName
          ? { "@type": "Person", name: article.authorName }
          : { "@type": "Organization", name: "آرایه" },
        publisher: {
          "@type": "Organization",
          name: "آرایه",
          logo: { "@type": "ImageObject", url: canonicalUrl("/assets/og-cover.svg") },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        image,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: legacyBreadcrumbItems(article, url),
      },
    ],
  };
}

export function LegacyMigratedBlogArticlePage({ article }: { article: LegacyMigratedArticle }) {
  const jsonLd = legacyMigratedArticleJsonLd(article);
  const hub = article.clusterHub ? getBlogCluster(article.clusterHub) : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar ctaHref="/free-seo-audit" ctaLabel="تحلیل رایگان سایت" />
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

            <h1 className="mt-4 text-balance text-2xl font-extrabold text-navy-900 sm:text-3xl">
              {article.h1}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-navy-600 sm:text-base">{article.intro}</p>

            {article.coverSrc ? (
              <div className="relative mt-6 aspect-[1280/560] overflow-hidden rounded-2xl bg-navy-50">
                <Image
                  src={article.coverSrc}
                  alt={article.coverAlt ?? ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 760px"
                  priority
                />
              </div>
            ) : null}

            <div
              className="legacy-article-body mt-8"
              dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
            />

            {article.relatedLinks && article.relatedLinks.length > 0 ? (
              <section className="mt-10 border-t border-navy-100 pt-8">
                <h2 className="text-lg font-extrabold text-navy-900">مطالب مرتبط</h2>
                <ul className="mt-4 space-y-2 text-sm">
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

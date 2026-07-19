import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { CmsArticleRow } from '@/lib/cms/types';
import { canonicalUrl } from '@/lib/siteUrl';
import { ORGANIZATION_ID, SITE_LOGO_URL, SITE_NAME } from '@/lib/seo/siteIdentity';

export type CmsArticleView = CmsArticleRow & {
  author?: { display_name: string; slug: string; job_title?: string } | null;
  featured_image?: { url: string; alt_text: string } | null;
  category?: { name: string; slug: string } | null;
};

export function cmsArticleMetadata(article: CmsArticleView): Metadata {
  const path = `/blog/${article.slug}`;
  const url = article.canonical_url || canonicalUrl(path);
  const title = article.seo_title || article.title;
  const description = article.seo_description || article.excerpt;
  const indexable = article.robots_index;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: article.og_title || title,
      description: article.og_description || description,
      url,
      type: 'article',
      locale: 'fa_IR',
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at,
      images: article.featured_image?.url
        ? [{ url: canonicalUrl(article.featured_image.url) }]
        : [{ url: canonicalUrl('/assets/og-cover.svg') }],
    },
    robots: {
      index: indexable,
      follow: article.robots_follow,
      googleBot: { index: indexable, follow: article.robots_follow },
    },
  };
}

export function cmsArticleJsonLd(article: CmsArticleView) {
  const url = canonicalUrl(`/blog/${article.slug}`);
  const image = article.featured_image?.url
    ? canonicalUrl(article.featured_image.url)
    : canonicalUrl('/assets/og-cover.svg');
  const authorName = article.author?.display_name ?? 'تیم آرایه';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': article.schema_type || 'BlogPosting',
        headline: article.title,
        description: article.excerpt,
        inLanguage: 'fa-IR',
        datePublished: article.published_at,
        dateModified: article.updated_at,
        author: { '@type': 'Person', name: authorName },
        publisher: {
          '@type': 'Organization',
          '@id': ORGANIZATION_ID,
          name: SITE_NAME,
          logo: { '@type': 'ImageObject', url: SITE_LOGO_URL },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        image,
        ...(article.primary_keyword ? { keywords: article.primary_keyword } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'آرایه', item: canonicalUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'بلاگ', item: canonicalUrl('/blog') },
          { '@type': 'ListItem', position: 3, name: article.title, item: url },
        ],
      },
    ],
  };
}

type Props = {
  article: CmsArticleView;
  preview?: boolean;
};

export function CmsBlogArticlePage({ article, preview }: Props) {
  const jsonLd = cmsArticleJsonLd(article);
  const html = article.rendered_html ?? '';

  return (
    <>
      {preview && <meta name="robots" content="noindex, nofollow" />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar
        ctaHref={article.primary_landing_page || article.primary_cta_url || '/contact'}
        ctaLabel={article.primary_cta_label || 'مشاوره رایگان'}
      />
      <main className="pb-16">
        {preview && (
          <div className="bg-amber-100 text-amber-900 text-center text-sm py-2">
            پیش‌نمایش — این صفحه index نمی‌شود
          </div>
        )}
        <article className="container-mx container-px mx-auto pt-12">
          <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8">
            <nav className="text-sm text-navy-500" aria-label="مسیر صفحه">
              <Link href="/">آرایه</Link>
              <span className="px-2">/</span>
              <Link href="/blog">بلاگ</Link>
              <span className="px-2">/</span>
              <span>{article.title}</span>
            </nav>

            {article.category?.name && (
              <p className="mt-4 inline-flex rounded-lg bg-navy-50 px-2.5 py-1 text-xs font-bold text-navy-700">
                {article.category.name}
              </p>
            )}

            <h1 className="mt-3 text-balance text-2xl font-extrabold text-navy-900 sm:text-3xl">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="mt-3 text-sm leading-relaxed text-navy-600 sm:text-base">{article.excerpt}</p>
            )}

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-y border-navy-100 py-4 text-xs text-navy-500 sm:text-sm">
              <span>
                نویسنده: <strong className="font-bold text-navy-800">{article.author?.display_name ?? 'تیم آرایه'}</strong>
              </span>
              {article.published_at && (
                <span>
                  انتشار:{' '}
                  {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date(article.published_at))}
                </span>
              )}
              {article.reading_time > 0 && <span>{article.reading_time} دقیقه مطالعه</span>}
            </div>

            {article.featured_image?.url && (
              <img
                src={article.featured_image.url}
                alt={article.featured_image.alt_text || article.title}
                className="mt-6 w-full rounded-2xl object-cover max-h-[420px]"
              />
            )}

            <div
              className="cms-article-body mt-8 prose prose-navy max-w-none text-right"
              dir="rtl"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {article.primary_cta_url && (
              <div className="mt-10 text-center">
                <Link
                  href={article.primary_cta_url}
                  className="inline-flex rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-white hover:bg-navy-800"
                >
                  {article.primary_cta_label || 'بیشتر بدانید'}
                </Link>
              </div>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

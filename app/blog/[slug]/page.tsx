import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getPublishedArticleBySlug, getSlugRedirect } from '@/lib/cms/queries/articles';
import { CmsBlogArticlePage, cmsArticleMetadata } from '@/components/blog/CmsBlogArticlePage';
import { blogArticlePath } from '@/lib/cms/slugUtils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getPublishedArticleBySlug(params.slug);
  if (!article) return {};
  return cmsArticleMetadata(article);
}

export default async function DynamicBlogArticlePage({ params }: Props) {
  const redirectRow = await getSlugRedirect(blogArticlePath(params.slug));
  if (redirectRow) {
    redirect(redirectRow.destination_path);
  }

  const article = await getPublishedArticleBySlug(params.slug);
  if (!article) notFound();

  return <CmsBlogArticlePage article={article} />;
}

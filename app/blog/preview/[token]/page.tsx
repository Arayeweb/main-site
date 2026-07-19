import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { verifyPreviewToken } from '@/lib/cms/previewToken';
import { getArticleByIdForPreview } from '@/lib/cms/queries/articles';
import { CmsBlogArticlePage, cmsArticleMetadata } from '@/components/blog/CmsBlogArticlePage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = { params: { token: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const payload = verifyPreviewToken(params.token);
  if (!payload) return { robots: { index: false, follow: false } };
  const article = await getArticleByIdForPreview(payload.articleId);
  if (!article) return {};
  const meta = cmsArticleMetadata(article);
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function BlogPreviewPage({ params }: Props) {
  const payload = verifyPreviewToken(params.token);
  if (!payload) notFound();

  const article = await getArticleByIdForPreview(payload.articleId);
  if (!article) notFound();

  return <CmsBlogArticlePage article={article} preview />;
}

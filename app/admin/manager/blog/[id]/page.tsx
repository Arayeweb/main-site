'use client';

import { BlogArticleEditorPage } from '@/components/admin/blog/BlogArticleEditorPage';

export default function EditBlogArticlePage({ params }: { params: { id: string } }) {
  return <BlogArticleEditorPage articleId={params.id} />;
}

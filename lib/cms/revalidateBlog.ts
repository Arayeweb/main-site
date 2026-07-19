import { revalidatePath, revalidateTag } from 'next/cache';

export async function revalidateArticle(slug: string, hubPath?: string | null) {
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');
  if (hubPath) revalidatePath(hubPath);
  revalidateTag(`blog-article-${slug}`);
  revalidateTag('blog-index');
}

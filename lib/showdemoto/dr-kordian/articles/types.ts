export type ArticleStatus = "draft" | "published";

export interface KordianArticle {
  id: string;
  slug: string;
  status: ArticleStatus;
  title: { en: string; ru: string };
  excerpt: { en: string; ru: string };
  content: { en: string; ru: string };
  coverImageUrl: string;
  author: string;
  category: string;
  publishDate: string;
  updatedAt: string;
}

export type KordianArticleInput = Omit<KordianArticle, "id" | "updatedAt"> & {
  id?: string;
  updatedAt?: string;
};

export const KORDIAN_ARTICLES_STORAGE_KEY = "showdemoto-dr-kordian-articles";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getLanguageCoverage(article: KordianArticle): "both" | "en" | "ru" {
  const hasEn = Boolean(article.title.en.trim() && article.content.en.trim());
  const hasRu = Boolean(article.title.ru.trim() && article.content.ru.trim());
  if (hasEn && hasRu) return "both";
  if (hasEn) return "en";
  return "ru";
}

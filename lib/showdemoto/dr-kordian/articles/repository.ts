import { SEED_ARTICLES } from "./seed";
import type { KordianArticle, KordianArticleInput } from "./types";
import { KORDIAN_ARTICLES_STORAGE_KEY } from "./types";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadArticlesFromStorage(): KordianArticle[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(KORDIAN_ARTICLES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as KordianArticle[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveArticlesToStorage(articles: KordianArticle[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(KORDIAN_ARTICLES_STORAGE_KEY, JSON.stringify(articles));
  window.dispatchEvent(new CustomEvent("kordian-articles-updated"));
}

/** Repository abstraction — swap implementation for Sanity/WordPress/Supabase later. */
export function getAllArticles(): KordianArticle[] {
  const stored = loadArticlesFromStorage();
  if (stored) return stored;
  return SEED_ARTICLES;
}

export function getPublishedArticles(): KordianArticle[] {
  return getAllArticles()
    .filter((a) => a.status === "published")
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}

export function getArticleBySlug(slug: string): KordianArticle | undefined {
  return getAllArticles().find((a) => a.slug === slug);
}

export function upsertArticle(input: KordianArticleInput): KordianArticle {
  const articles = getAllArticles();
  const now = new Date().toISOString();
  const existingIndex = input.id ? articles.findIndex((a) => a.id === input.id) : -1;

  const article: KordianArticle = {
    id: input.id ?? `article-${Date.now()}`,
    slug: input.slug,
    status: input.status,
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    coverImageUrl: input.coverImageUrl,
    author: input.author,
    category: input.category,
    publishDate: input.publishDate,
    updatedAt: now,
  };

  const next =
    existingIndex >= 0
      ? articles.map((a, i) => (i === existingIndex ? article : a))
      : [...articles, article];

  saveArticlesToStorage(next);
  return article;
}

export function deleteArticle(id: string): void {
  const next = getAllArticles().filter((a) => a.id !== id);
  saveArticlesToStorage(next);
}

export function resetArticlesToSeed(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(KORDIAN_ARTICLES_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("kordian-articles-updated"));
}

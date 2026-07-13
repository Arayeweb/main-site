"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  deleteArticle as repoDelete,
  getAllArticles,
  getArticleBySlug,
  getPublishedArticles,
  upsertArticle,
} from "@/lib/showdemoto/dr-kordian/articles/repository";
import type { KordianArticle, KordianArticleInput } from "@/lib/showdemoto/dr-kordian/articles/types";

interface ArticlesContextValue {
  articles: KordianArticle[];
  publishedArticles: KordianArticle[];
  ready: boolean;
  refresh: () => void;
  getBySlug: (slug: string) => KordianArticle | undefined;
  save: (input: KordianArticleInput) => KordianArticle;
  remove: (id: string) => void;
}

const ArticlesContext = createContext<ArticlesContextValue | null>(null);

export function KordianArticlesProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<KordianArticle[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setArticles(getAllArticles());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("kordian-articles-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("kordian-articles-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);

  const value = useMemo<ArticlesContextValue>(
    () => ({
      articles,
      publishedArticles: articles.filter((a) => a.status === "published").sort((a, b) => b.publishDate.localeCompare(a.publishDate)),
      ready,
      refresh,
      getBySlug: (slug) => articles.find((a) => a.slug === slug) ?? getArticleBySlug(slug),
      save: (input) => {
        const saved = upsertArticle(input);
        refresh();
        return saved;
      },
      remove: (id) => {
        repoDelete(id);
        refresh();
      },
    }),
    [articles, ready, refresh]
  );

  return <ArticlesContext.Provider value={value}>{children}</ArticlesContext.Provider>;
}

export function useKordianArticles() {
  const ctx = useContext(ArticlesContext);
  if (!ctx) throw new Error("useKordianArticles must be used within KordianArticlesProvider");
  return ctx;
}

/** Safe hook for pages that may render before provider hydrates */
export function useKordianPublishedArticles() {
  const ctx = useContext(ArticlesContext);
  if (!ctx || !ctx.ready) {
    return getPublishedArticles();
  }
  return ctx.publishedArticles;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KordianArticlePage from "@/components/showdemoto/dr-kordian/KordianArticlePage";
import { getArticleBySlug } from "@/lib/showdemoto/dr-kordian/articles/repository";
import { buildKordianMetadata } from "@/lib/showdemoto/dr-kordian/metadata";
import { isKordianLocale, type KordianLocale } from "@/lib/showdemoto/dr-kordian/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isKordianLocale(locale)) return {};
  const article = getArticleBySlug(slug);
  const title = article?.title[locale as KordianLocale] || article?.title.en;
  return buildKordianMetadata(locale, "articles", slug, title);
}

export default async function DrKordianArticle({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { locale, slug } = await params;
  const { preview } = await searchParams;
  if (!isKordianLocale(locale)) notFound();

  return (
    <KordianArticlePage
      locale={locale as KordianLocale}
      slug={slug}
      preview={preview === "1"}
    />
  );
}

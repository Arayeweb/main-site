import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KordianArticlesPage from "@/components/showdemoto/dr-kordian/KordianArticlesPage";
import { buildKordianMetadata } from "@/lib/showdemoto/dr-kordian/metadata";
import { isKordianLocale, type KordianLocale } from "@/lib/showdemoto/dr-kordian/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isKordianLocale(locale)) return {};
  return buildKordianMetadata(locale, "articles");
}

export default async function DrKordianArticles({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isKordianLocale(locale)) notFound();
  return <KordianArticlesPage locale={locale as KordianLocale} />;
}

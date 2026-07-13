import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KordianHomePage from "@/components/showdemoto/dr-kordian/KordianHomePage";
import { buildKordianMetadata } from "@/lib/showdemoto/dr-kordian/metadata";
import { isKordianLocale, type KordianLocale } from "@/lib/showdemoto/dr-kordian/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isKordianLocale(locale)) return {};
  return buildKordianMetadata(locale, "home");
}

export default async function DrKordianHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isKordianLocale(locale)) notFound();
  return <KordianHomePage locale={locale as KordianLocale} />;
}
